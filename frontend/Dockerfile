# syntax=docker/dockerfile:1

ARG VOLTO_VERSION
FROM plone/frontend-builder:${VOLTO_VERSION} AS builder

# Optimizează memoria pentru Node.js și pnpm - memorie foarte mare
ENV NODE_OPTIONS="--max-old-space-size=16384"
ENV PNPM_STORE_DIR="/app/.pnpm-store"
# Copiere surse
COPY --chown=node packages/volto-lunasites /app/packages/volto-lunasites
COPY --chown=node packages/lunasites-advanced-styling /app/packages/lunasites-advanced-styling
COPY --chown=node volto.config.js /app/
COPY --chown=node package.json /app/package.json.temp
COPY --chown=node mrs.developer.json /app/
COPY --chown=node pnpm-workspace.yaml /app/

# Combină deps din package.json.temp și package.json (memorie minimă)
RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 \
    python3 -c "import json; data = json.load(open('package.json.temp')); deps = data['dependencies']; data = json.load(open('package.json')); data['dependencies'].update(deps); json.dump(data, open('package.json', 'w'), indent=2)" \
    && rm package.json.temp

# Rulează mrs-developer
RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 \
    pnpm dlx mrs-developer missdev --no-config --fetch-https

# Instalează deps cu memorie maximă și concurență minimă
RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 \
    pnpm install

# Build Volto
RUN  pnpm build

# Instalează doar deps de producție
RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 \
    pnpm install --prod

# Imaginea finală
FROM plone/frontend-prod-config:${VOLTO_VERSION}

LABEL maintainer="LunaSites <dobriceanionut@luna-sites.com>" \
      org.label-schema.name="lunasites-frontend" \
      org.label-schema.description="LunaSites frontend image." \
      org.label-schema.vendor="LunaSites"

COPY --from=builder /app/ /app/

USER root
RUN <<EOT
    set -e
    npm i -g corepack@latest
    corepack enable pnpm
    corepack use pnpm@9.1.1
    corepack prepare pnpm@9.1.1 --activate
EOT
USER node
