FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY apps/api/ apps/api/
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build
RUN pnpm --filter api deploy --prod /app/pruned

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
USER node
WORKDIR /app
COPY --from=builder --chown=node:node /app/pruned/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./prisma
COPY --from=builder --chown=node:node /app/apps/api/package.json ./
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/v1/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
