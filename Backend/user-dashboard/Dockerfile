# ==============================================================================
# WavyAssets Global User Dashboard Backend — Multi-Stage Production Image
# ==============================================================================

# --- Stage 1: Dependencies & Compilation ---
FROM node:22-alpine AS builder

WORKDIR /app

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

# Prune development dependencies
RUN npm prune --production

# --- Stage 2: Hardened Production Runtime ---
FROM node:22-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy application files and runtime dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Secure permissions for unprivileged node user
RUN chown -R node:node /app

USER node

EXPOSE 4000
EXPOSE 4001

# Integrated Health Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health/live || exit 1

# Launch NestJS Global User Dashboard Backend
CMD ["node", "dist/src/main.js"]
