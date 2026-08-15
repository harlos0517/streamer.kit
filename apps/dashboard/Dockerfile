# Build context is the repo root (needed for the pnpm workspace).
# docker compose build dashboard   /   docker build -f apps/dashboard/Dockerfile .
#
# VITE_API_URL is baked into the static bundle at BUILD time (Vite client env
# vars aren't readable at container runtime), so it must be passed as a build
# arg, not a runtime `environment:` entry.

FROM node:24-alpine AS base
# npm install (not corepack) - this node:24-alpine's bundled corepack rejects
# the semver-range `devEngines.packageManager.version` in the root package.json.
RUN npm install -g pnpm@11
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/dashboard/package.json apps/dashboard/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/dashboard apps/dashboard
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @streamer-kit/dashboard run build

FROM nginx:alpine AS runtime
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
