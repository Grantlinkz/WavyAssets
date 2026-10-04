#!/bin/sh
set -e

# Default domain environment fallbacks
export LANDING_DOMAIN="${LANDING_DOMAIN:-wavyassets.com}"
export LANDING_WWW_DOMAIN="${LANDING_WWW_DOMAIN:-www.wavyassets.com}"
export DASHBOARD_DOMAIN="${DASHBOARD_DOMAIN:-dashboard.wavyassets.com}"
export DASHBOARD_ALT_DOMAIN="${DASHBOARD_ALT_DOMAIN:-app.wavyassets.com}"
export ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.wavyassets.com}"
export INGRESS_HTTPS_PORT="${INGRESS_HTTPS_PORT:-443}"
export NODE_ENV="${NODE_ENV:-production}"

SSL_DIR="/etc/nginx/ssl"
CERT_FILE="${SSL_DIR}/cert.pem"
KEY_FILE="${SSL_DIR}/key.pem"

mkdir -p "${SSL_DIR}"

# Check TLS certificate presence
if [ ! -f "${CERT_FILE}" ] || [ ! -f "${KEY_FILE}" ]; then
    if [ "${NODE_ENV}" = "development" ]; then
        echo "[Edge Ingress] [Development Mode] No SSL certificate found at ${CERT_FILE}. Generating self-signed TLS fallback certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "${KEY_FILE}" \
            -out "${CERT_FILE}" \
            -subj "/C=CH/ST=Geneva/L=Geneva/O=WavyAssets Global Wealth AG/OU=Edge Security/CN=${LANDING_DOMAIN}" \
            -addext "subjectAltName=DNS:${LANDING_DOMAIN},DNS:${LANDING_WWW_DOMAIN},DNS:${DASHBOARD_DOMAIN},DNS:${DASHBOARD_ALT_DOMAIN},DNS:${ADMIN_DOMAIN}" \
            2>/dev/null
        chmod 600 "${KEY_FILE}"
        chmod 644 "${CERT_FILE}"
        echo "[Edge Ingress] Fallback self-signed TLS certificate generated successfully for ${LANDING_DOMAIN}, ${LANDING_WWW_DOMAIN}, ${DASHBOARD_DOMAIN}, ${DASHBOARD_ALT_DOMAIN}, ${ADMIN_DOMAIN}."
    else
        echo "[Edge Ingress] FATAL: Missing SSL certificate (${CERT_FILE}) or key (${KEY_FILE}) in production mode (NODE_ENV=${NODE_ENV})." >&2
        echo "[Edge Ingress] Production requires trusted TLS certificates covering configured domains: ${LANDING_DOMAIN}, ${LANDING_WWW_DOMAIN}, ${DASHBOARD_DOMAIN}, ${DASHBOARD_ALT_DOMAIN}, ${ADMIN_DOMAIN}." >&2
        echo "[Edge Ingress] Aborting startup to prevent insecure deployment." >&2
        exit 1
    fi
fi

# Ensure Let's Encrypt / Certbot directory exists
mkdir -p /var/www/certbot
