# Build context is the repo root (needed for the pnpm workspace).
# docker compose build server   /   docker build -f apps/server/Dockerfile .

FROM node:24-alpine AS base
# npm install (not corepack) - this node:24-alpine's bundled corepack rejects
# the semver-range `devEngines.packageManager.version` in the root package.json.
RUN npm install -g pnpm@11
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/plugin-sdk/package.json packages/plugin-sdk/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY plugins/ping/package.json plugins/ping/package.json
COPY plugins/currency/package.json plugins/currency/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS runtime
ENV NODE_ENV=production
COPY packages/core packages/core
COPY packages/plugin-sdk packages/plugin-sdk
COPY packages/shared packages/shared
COPY plugins/ping plugins/ping
COPY plugins/currency plugins/currency
COPY apps/server apps/server
WORKDIR /app/apps/server
EXPOSE 3000
# Only core's schema needs drizzle-kit migrate here - it must exist before
# boot since it holds core.plugin_migration, the table installPlugin() reads
# to apply each plugin's own migrations automatically (4.9). Running
# drizzle-kit migrate for a plugin here too would race installPlugin's own
# migration application and fail on "already exists".
CMD ["sh", "-c", "pnpm --filter @streamer-kit/core exec drizzle-kit migrate && pnpm run start"]
