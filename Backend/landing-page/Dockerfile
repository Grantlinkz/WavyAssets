# ==============================================================================
# WavyAssets Landing Page Backend — Multi-Stage Institutional Production Image
# ==============================================================================

# --- Stage 1: Dependencies & Compilation ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install native build tools for compiling native dependencies (e.g. argon2)
RUN apk add --no-cache python3 make g++ curl

# Copy dependency manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install full dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source and configurations
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compile TypeScript to dist/
RUN npm run build

# Prune development dependencies while retaining prisma CLI for runtime migrations
RUN npm prune --production && npm install prisma@^6.4.1 --omit=dev --no-save

# --- Stage 2: Hardened Production Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime utilities, su-exec, and tini for PID 1 signal forwarding
RUN apk add --no-cache curl su-exec tini

ENV NODE_ENV=production
ENV PORT=4000

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy compiled application and production dependencies with unprivileged ownership
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

USER node

EXPOSE 4000

# Integrated Health Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/health/live || exit 1

# Launch institutional NestJS API Gateway via tini and entrypoint
ENTRYPOINT ["/sbin/tini", "--", "docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
