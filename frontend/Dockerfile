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
    pnpm dlx mrs-developer missdev --no-config --fetch-https \
    && ls -la /app/packages/

# Instalează deps cu memorie maximă și concurență minimă
RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store,uid=1000 \
    pnpm install

# Set production environment pentru build
ENV NODE_ENV=production

# Build Volto cu RAZZLE_API_PATH setat explicit
RUN RAZZLE_API_PATH=https://luna.luna-sites.com pnpm build

# Imaginea finală
FROM node:18-bullseye-slim

LABEL maintainer="LunaSites <dobriceanionut@luna-sites.com>" \
      org.label-schema.name="lunasites-frontend" \
      org.label-schema.description="LunaSites frontend image." \
      org.label-schema.vendor="LunaSites"

COPY --from=builder /app/ /app/
COPY entrypoint.sh /app/
WORKDIR /app/

# Update apt packages
RUN runDeps="openssl ca-certificates patch gosu git make tmux locales-all" \
 && apt-get update \
 && apt-get install -y --no-install-recommends $runDeps \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g mrs-developer \
 && mkdir -p /app/src/addons \
 && rm -rf /app/src/addons/* \
 && find /app/ -not -user node -exec chown node {} \+ \
 && corepack enable

USER node

ARG MAX_OLD_SPACE_SIZE=16384
ENV NODE_OPTIONS=--max_old_space_size=$MAX_OLD_SPACE_SIZE

RUN rm -rf /home/node/.cache \
 && rm -rf /home/node/.yarn \
 && rm -rf /home/node/.npm

USER root

EXPOSE 3000 3001

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["pnpm", "start:prod"]