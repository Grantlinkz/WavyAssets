# ==============================================================================
# WavyAssets Global User Dashboard Backend — Multi-Stage Production Image
# ==============================================================================

# --- Stage 1: Dependencies & Compilation ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install native build tools for compiling native C++ bindings (e.g. argon2)
RUN apk add --no-cache python3 make g++

# Copy dependency manifests & database schema
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy application source & config
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Generate Prisma Client & compile NestJS
RUN npx prisma generate
RUN npm run build

# Prune development dependencies while retaining prisma CLI for runtime migrations
RUN npm prune --production && npm install prisma@^6.4.1 --omit=dev --no-save

# --- Stage 2: Hardened Production Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime utilities & tini for PID 1 process supervision
RUN apk add --no-cache curl tini

ENV NODE_ENV=production
ENV PORT=4000

# Copy application files and runtime dependencies with unprivileged ownership
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

USER node

EXPOSE 4000
EXPOSE 4001

# Integrated Health Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Launch with tini signal management and exec replacement for graceful shutdown
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma db push --skip-generate && exec node dist/src/main.js"]
