# ==============================================================================
# WavyAssets Supreme Institutional Admin Panel Backend — Production Container
# ==============================================================================

# --- Stage 1: Dependencies & Compilation ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native compilation
RUN apk add --no-cache python3 make g++

# Copy package manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install full dependencies for building
RUN npm ci

# Copy TypeScript and Nest configuration
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Generate Prisma Client & compile NestJS application
RUN npx prisma generate
RUN npm run build

# Prune development dependencies while retaining prisma CLI for runtime migrations
RUN npm prune --production && npm install prisma@^6.4.1 --omit=dev --no-save

# --- Stage 2: Hardened Production Runtime ---
FROM node:22-alpine AS runner

# Install runtime utilities & tini for PID 1 process supervision
RUN apk add --no-cache curl tini

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4002

# Copy package manifests and production dependencies with unprivileged ownership
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

USER node

EXPOSE 4002

# Integrated Health Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/v1/overview/summary || exit 1

# Launch with tini signal management and exec replacement for graceful shutdown
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma db push --skip-generate && exec node dist/src/main.js"]
