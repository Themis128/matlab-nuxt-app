#!/bin/bash
# Backup script (moved to infrastructure/scripts/backup.sh)
set -e

BACKUP_DIR="/var/backups/matlab-mobile-dataset"
PROJECT_DIR="/var/www/matlab-mobile-dataset"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$PROJECT_DIR" python_api/trained_models data .env.production 2>/dev/null || true
echo "Backup completed: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
