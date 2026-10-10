# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    MOUNTAIN_ROOT=/data
COPY --from=build /app/.output ./.output
EXPOSE 8080
VOLUME ["/data"]
CMD ["node", ".output/server/index.mjs"]
