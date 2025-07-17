# syntax=docker/dockerfile:1
ARG VOLTO_VERSION
FROM plone/frontend-builder:${VOLTO_VERSION} AS builder

COPY --chown=node packages/volto-lunasites /app/packages/volto-lunasites
COPY --chown=node volto.config.js /app/
COPY --chown=node package.json /app/package.json.temp
COPY --chown=node mrs.developer.json /app/
COPY --chown=node pnpm-workspace.yaml /app/

RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 <<EOT
    set -e
    # Merge package.json files
    python3 -c "import json; orig_data = json.load(open('package.json.temp')); orig_deps = orig_data['dependencies']; data = json.load(open('package.json')); data['dependencies'].update(orig_deps); json.dump(data, open('package.json', 'w'), indent=2)"
    rm package.json.temp

    # Install all dependencies, including addons from package.json
    pnpm install --silent

    # Build dependencies
    pnpm --silent --filter @plone/registry --filter @plone/components build

    # Build the project
    pnpm build

    # Install production dependencies
    pnpm install --prod --silent
EOT

FROM plone/frontend-prod-config:${VOLTO_VERSION}

LABEL maintainer="LunaSites <dobriceanionut@luna-sites.com>" \
      org.label-schema.name="lunasites-frontend" \
      org.label-schema.description="LunaSites frontend image." \
      org.label-schema.vendor="LunaSites"

COPY --from=builder /app/ /app/

RUN <<EOT
    set -e
    npm i -g corepack@latest && corepack enable pnpm
    corepack use pnpm@9.1.1
    corepack prepare pnpm@9.1.1 --activate
EOT
