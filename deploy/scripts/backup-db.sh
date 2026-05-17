#!/bin/bash
# ──────────────────────────────────────────────
# Suprfly PostgreSQL Backup Script
# Add to crontab: 0 2 * * * /home/suprfly/scripts/backup-db.sh
# ──────────────────────────────────────────────
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/suprfly/backups/postgres"
DB_NAME="suprfly"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Create compressed backup
pg_dump -U suprfly -h localhost "$DB_NAME" | gzip > "$BACKUP_DIR/suprfly_$TIMESTAMP.sql.gz"

# Delete backups older than retention period
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

BACKUP_SIZE=$(du -h "$BACKUP_DIR/suprfly_$TIMESTAMP.sql.gz" | cut -f1)
echo "[$(date)] Backup completed: suprfly_$TIMESTAMP.sql.gz ($BACKUP_SIZE)"

# Optional: Upload to S3-compatible storage
# aws s3 cp "$BACKUP_DIR/suprfly_$TIMESTAMP.sql.gz" s3://suprfly-backups/postgres/
