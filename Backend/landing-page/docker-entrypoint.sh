#!/bin/sh
set -e

# ==============================================================================
# WavyAssets Landing Page Backend — Container Entrypoint Script
# ==============================================================================

# Ensure correct permissions for the unprivileged node user
if [ "$(id -u)" = "0" ]; then
  exec su-exec node "$@"
else
  exec "$@"
fi
