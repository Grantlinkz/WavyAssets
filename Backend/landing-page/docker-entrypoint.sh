#!/bin/sh
set -e

# ==============================================================================
# WavyAssets Landing Page Backend — Container Entrypoint Script
# ==============================================================================

# Automatically push database schema if in SQLite environment
if [ -f "/app/prisma/schema.prisma" ]; then
  npx prisma db push --skip-generate
fi

# Ensure correct permissions for the unprivileged node user
if [ "$(id -u)" = "0" ]; then
  exec su-exec node "$@"
else
  exec "$@"
fi
