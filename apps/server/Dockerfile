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
RUN pnpm install --frozen-lockfile

FROM deps AS runtime
ENV NODE_ENV=production
COPY packages/core packages/core
COPY apps/server apps/server
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @streamer-kit/core exec drizzle-kit migrate && pnpm --filter @streamer-kit/core run db:seed && pnpm run start"]
