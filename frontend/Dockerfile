# syntax=docker/dockerfile:1
ARG VOLTO_VERSION=undefined
FROM plone/frontend-builder:18.22.0 AS builder

COPY --chown=node packages/volto-lunasites /app/packages/volto-lunasites
COPY --chown=node packages/lunasites-advanced-styling /app/packages/lunasites-advanced-styling
COPY --chown=node volto.config.js /app/
COPY --chown=node package.json /app/package.json.temp
COPY --chown=node mrs.developer.json /app/
COPY --chown=node pnpm-workspace.yaml /app/

RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 <<EOT
     set -e
     python3 -c "import json; data = json.load(open('package.json.temp')); deps = data['dependencies']; data['dependencies'].update(deps); json.dump(data, open('package.json', 'w'), indent=2)"
     rm package.json.temp
     pnpm install
     pnpm build:deps
     pnpm build
EOT

FROM plone/frontend-prod-config:18.22.0

LABEL maintainer="Plone Foundation <collective@plone.org>" \
      org.label-schema.name="adfsdf-frontend" \
      org.label-schema.description="adfsdf frontend image." \
      org.label-schema.vendor="Plone Foundation"

COPY --from=builder /app/ /app/