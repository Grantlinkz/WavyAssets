#!/bin/sh
set -e

# Default domain environment fallbacks
export LANDING_DOMAIN="${LANDING_DOMAIN:-wavyassets.com}"
export LANDING_WWW_DOMAIN="${LANDING_WWW_DOMAIN:-www.wavyassets.com}"
export DASHBOARD_DOMAIN="${DASHBOARD_DOMAIN:-dashboard.wavyassets.com}"
export DASHBOARD_ALT_DOMAIN="${DASHBOARD_ALT_DOMAIN:-app.wavyassets.com}"
export ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.wavyassets.com}"

SSL_DIR="/etc/nginx/ssl"
CERT_FILE="${SSL_DIR}/cert.pem"
KEY_FILE="${SSL_DIR}/key.pem"

mkdir -p "${SSL_DIR}"

# Generate self-signed TLS certificate if none provided
if [ ! -f "${CERT_FILE}" ] || [ ! -f "${KEY_FILE}" ]; then
    echo "[Edge Ingress] No SSL certificate found at ${CERT_FILE}. Generating self-signed TLS fallback certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${KEY_FILE}" \
        -out "${CERT_FILE}" \
        -subj "/C=CH/ST=Geneva/L=Geneva/O=WavyAssets Global Wealth AG/OU=Edge Security/CN=wavyassets.com" \
        2>/dev/null
    chmod 600 "${KEY_FILE}"
    chmod 644 "${CERT_FILE}"
    echo "[Edge Ingress] Fallback self-signed TLS certificate generated successfully."
fi

# Ensure Let's Encrypt / Certbot directory exists
mkdir -p /var/www/certbot
