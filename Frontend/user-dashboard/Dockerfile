# ==============================================================================
# WavyAssets Global Institutional User Dashboard — Multi-Stage Production Image
# ==============================================================================

# --- Stage 1: Build & Compilation ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Vite build-time environment arguments
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_BACKEND_ORIGIN=""

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BACKEND_ORIGIN=$VITE_BACKEND_ORIGIN

# Copy source code and project configuration
COPY tsconfig*.json vite.config.ts postcss.config.mjs index.html ./
COPY public ./public/
COPY src ./src/

# Compile TypeScript and build production bundle
RUN npm run build

# --- Stage 2: Hardened Nginx Production Web Server ---
FROM nginx:alpine AS runner

# Install curl for container health check
RUN apk add --no-cache curl

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy dynamic Nginx configuration template (processed by envsubst on startup)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default runtime configuration
ENV PORT=80
ENV BACKEND_HOST=wavyassets-backend-user-dashboard
ENV BACKEND_PORT=4000

# Expose HTTP port
EXPOSE 80

# Integrated Health Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/healthz || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
