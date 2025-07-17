# syntax=docker/dockerfile:1
ARG VOLTO_VERSION
FROM plone/frontend-builder:${VOLTO_VERSION} AS builder

COPY --chown=node packages/volto-lunasites /app/packages/volto-lunasites
COPY --chown=node packages/lunasites-advanced-styling /app/packages/lunasites-advanced-styling
COPY --chown=node volto.config.js /app/
COPY --chown=node package.json /app/package.json.temp
COPY --chown=node mrs.developer.json /app/
COPY --chown=node pnpm-workspace.yaml /app/

RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 <<EOT
    set -e
    python3 -c "import json; data = json.load(open('package.json.temp')); deps = data['dependencies']; data = json.load(open('package.json')); data['dependencies'].update(deps); json.dump(data, open('package.json', 'w'), indent=2)"
    rm package.json.temp
    cat package.json | grep -A5 -B5 "volto-accordion-block"
    pnpm dlx mrs-developer missdev --no-config --fetch-https
    pnpm install && pnpm build:deps
    echo "Checking if accordion block is installed:"
    ls -la node_modules/@eeacms/ | grep accordion || echo "NOT FOUND"
    pnpm build
    pnpm install --prod
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