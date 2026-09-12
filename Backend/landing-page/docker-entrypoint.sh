#!/bin/sh
set -e

# ==============================================================================
# WavyAssets Landing Page Backend — Container Entrypoint Script
# ==============================================================================

# Ensure /app/prisma directory exists
mkdir -p /app/prisma

# If dev.db does not exist in /app/prisma, copy from pre-built template
if [ ! -f "/app/prisma/dev.db" ]; then
  if [ -f "/app/prisma/dev.db.template" ]; then
    echo "[WavyAssets Gateway] Initializing SQLite database from pre-built schema template..."
    cp /app/prisma/dev.db.template /app/prisma/dev.db
  else
    echo "[WavyAssets Gateway] Creating new SQLite database file..."
    touch /app/prisma/dev.db
  fi
fi

# Ensure correct permissions for the unprivileged node user
if [ "$(id -u)" = "0" ]; then
  chown -R node:node /app/prisma
  exec su-exec node "$@"
else
  exec "$@"
fi
