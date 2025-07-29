FROM node:18-bullseye-slim

WORKDIR /app/

# Install Python and other dependencies needed for the build
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 git ca-certificates make \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable

# Optimizează memoria pentru Node.js și pnpm - memorie foarte mare
ENV NODE_OPTIONS="--max-old-space-size=16384"
ENV PNPM_STORE_DIR="/app/.pnpm-store"

# Copy base package.json first
COPY --chown=node package.json /app/

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
RUN pnpm build

# Create symlink for build directory
RUN ln -sf /app/core/packages/volto/build /app/build

# Create symlinks for @plone packages in node_modules
RUN mkdir -p /app/node_modules/@plone \
 && ln -sf /app/core/packages/volto-slate /app/node_modules/@plone/volto-slate \
 && ln -sf /app/core/packages/volto /app/node_modules/@plone/volto \
 && ln -sf /app/core/packages/registry /app/node_modules/@plone/registry \
 && ln -sf /app/core/packages/client /app/node_modules/@plone/client \
 && ln -sf /app/core/packages/components /app/node_modules/@plone/components \
 && ln -sf /app/core/packages/helpers /app/node_modules/@plone/helpers \
 && ln -sf /app/core/packages/providers /app/node_modules/@plone/providers \
 && ln -sf /app/core/packages/types /app/node_modules/@plone/types

# Copy entrypoint
COPY entrypoint.sh /app/

# Update apt packages and install runtime dependencies
RUN runDeps="openssl ca-certificates patch gosu git make tmux locales-all" \
 && apt-get update \
 && apt-get install -y --no-install-recommends $runDeps \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g mrs-developer \
 && mkdir -p /app/src/addons \
 && rm -rf /app/src/addons/* \
 && find /app/ -not -user node -exec chown node {} \+

USER node

ARG MAX_OLD_SPACE_SIZE=16384
ENV NODE_OPTIONS=--max_old_space_size=$MAX_OLD_SPACE_SIZE

RUN rm -rf /home/node/.cache \
 && rm -rf /home/node/.yarn \
 && rm -rf /home/node/.npm \
 && rm -rf /app/.pnpm-store

USER root

EXPOSE 3000 3001

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["pnpm", "start:prod"]
