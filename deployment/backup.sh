#!/bin/bash

# MATLAB Mobile Dataset Backup Script
# Usage: ./backup.sh [--full]

# Configuration
PROJECT_DIR="${PROJECT_DIR:-/var/www/matlab-mobile-dataset}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/matlab-mobile-dataset}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30  # Keep backups for 30 days

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Full or incremental backup
FULL_BACKUP=false
if [ "$1" = "--full" ]; then
    FULL_BACKUP=true
fi

echo "====================================="
echo "MATLAB Mobile Dataset - Backup"
echo "====================================="
echo "Timestamp: $TIMESTAMP"
echo "Type: $([ "$FULL_BACKUP" = true ] && echo 'Full' || echo 'Incremental')"
echo "====================================="

# Backup trained models
if [ -d "$PROJECT_DIR/python_api/trained_models" ]; then
    log_info "Backing up trained models..."
    tar -czf "$BACKUP_DIR/models_$TIMESTAMP.tar.gz" \
        -C "$PROJECT_DIR/python_api" \
        trained_models
    log_info "✓ Models backup: models_$TIMESTAMP.tar.gz"
else
    log_warn "No trained models directory found"
fi

# Backup dataset
if [ -f "$PROJECT_DIR/data/Mobiles Dataset (2025).csv" ]; then
    log_info "Backing up dataset..."
    cp "$PROJECT_DIR/data/Mobiles Dataset (2025).csv" \
        "$BACKUP_DIR/dataset_$TIMESTAMP.csv"
    log_info "✓ Dataset backup: dataset_$TIMESTAMP.csv"
else
    log_warn "No dataset file found"
fi

# Backup MATLAB preprocessed data
if [ -d "$PROJECT_DIR/mobiles-dataset-docs/preprocessed" ]; then
    log_info "Backing up MATLAB preprocessed data..."
    tar -czf "$BACKUP_DIR/matlab_preprocessed_$TIMESTAMP.tar.gz" \
        -C "$PROJECT_DIR/mobiles-dataset-docs" \
        preprocessed
    log_info "✓ MATLAB preprocessed backup: matlab_preprocessed_$TIMESTAMP.tar.gz"
fi

# Backup configuration files
if [ "$FULL_BACKUP" = true ]; then
    log_info "Backing up configuration files..."
    tar -czf "$BACKUP_DIR/config_$TIMESTAMP.tar.gz" \
        -C "$PROJECT_DIR" \
        .env.production \
        nuxt.config.ts \
        python_api/api.py \
        deployment/ \
        2>/dev/null || log_warn "Some config files may not exist"
    log_info "✓ Config backup: config_$TIMESTAMP.tar.gz"
fi

# Backup analytics results
if [ -f "$PROJECT_DIR/data/dataset_analysis_results.json" ]; then
    log_info "Backing up analytics results..."
    cp "$PROJECT_DIR/data/dataset_analysis_results.json" \
        "$BACKUP_DIR/analytics_results_$TIMESTAMP.json"
    log_info "✓ Analytics backup: analytics_results_$TIMESTAMP.json"
fi

# Clean old backups
log_info "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
REMOVED=$(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
log_info "✓ Removed $REMOVED old backup(s)"

# Show backup summary
echo ""
echo "====================================="
log_info "Backup complete!"
echo "====================================="
echo "Backup location: $BACKUP_DIR"
ls -lh "$BACKUP_DIR" | grep "$TIMESTAMP"
echo "====================================="

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Total backup size: $TOTAL_SIZE"
echo "====================================="
