# ==============================================================================
# WavyAssets Landing Page Backend — Multi-Stage Institutional Production Image
# ==============================================================================

# --- Stage 1: Dependencies & Compilation ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools if required by native crypto modules (argon2)
RUN apk add --no-cache python3 make g++

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for build
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source and configurations
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compile TypeScript to dist/
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# --- Stage 2: Hardened Production Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

# Set non-root execution environment
ENV NODE_ENV=production
ENV PORT=4000

# Install curl for Docker health check
RUN apk add --no-cache curl

# Create unprivileged application user
USER node

# Copy compiled application and production dependencies from builder
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Expose standard gateway port
EXPOSE 4000

# Integrated Health Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/health/live || exit 1

# Launch institutional NestJS API Gateway
CMD ["node", "dist/main.js"]
