FROM nginx:alpine

# Install OpenSSL for automated TLS certificate provisioning & curl for healthcheck
RUN apk add --no-cache openssl curl

# Remove default configuration files
RUN rm -rf /etc/nginx/conf.d/*

# Copy master configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy dynamic template (processed by official Nginx 20-envsubst-on-templates.sh)
COPY conf.d/default.conf.template /etc/nginx/templates/default.conf.template

# Copy initialization hook (runs before Nginx starts)
COPY entrypoint.sh /docker-entrypoint.d/15-ssl-init.sh
RUN chmod +x /docker-entrypoint.d/15-ssl-init.sh

# Environment variables for template substitution
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV NGINX_ENVSUBST_FILTER="LANDING_DOMAIN|LANDING_WWW_DOMAIN|DASHBOARD_DOMAIN|DASHBOARD_ALT_DOMAIN|ADMIN_DOMAIN|INGRESS_HTTPS_PORT"

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
    CMD curl -f http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
