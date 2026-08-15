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
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/database packages/database
COPY apps/server apps/server
RUN pnpm --filter @streamer-kit/database exec prisma generate

FROM build AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @streamer-kit/database exec prisma migrate deploy && pnpm --filter @streamer-kit/database run db:seed && pnpm run start"]
