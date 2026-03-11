#!/bin/bash
# Ultra TMS PostgreSQL Backup Script
# Usage: ./pg-backup.sh [daily|weekly|monthly]
#
# Environment variables:
#   DATABASE_URL  - Required. PostgreSQL connection string.
#   BACKUP_DIR    - Optional. Base directory for backups (default: ./backups)

set -euo pipefail

BACKUP_TYPE="${1:-daily}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_URL="${DATABASE_URL:?DATABASE_URL is required}"

# Validate backup type
case "$BACKUP_TYPE" in
  daily|weekly|monthly) ;;
  *)
    echo "Error: Invalid backup type '$BACKUP_TYPE'. Must be daily, weekly, or monthly."
    exit 1
    ;;
esac

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_TYPE}/ultra_tms_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}/${BACKUP_TYPE}"

echo "=== Ultra TMS PostgreSQL Backup ==="
echo "Type:      ${BACKUP_TYPE}"
echo "Timestamp: ${TIMESTAMP}"
echo "Target:    ${BACKUP_FILE}"
echo ""

echo "Starting ${BACKUP_TYPE} backup..."
pg_dump "$DB_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --format=plain \
  | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup saved to ${BACKUP_FILE} (${BACKUP_SIZE})"

# Verify backup is not empty
BACKUP_BYTES=$(stat --printf="%s" "$BACKUP_FILE" 2>/dev/null || stat -f "%z" "$BACKUP_FILE" 2>/dev/null || echo "0")
if [ "$BACKUP_BYTES" -lt 100 ]; then
  echo "ERROR: Backup file is suspiciously small (${BACKUP_BYTES} bytes). Backup may have failed."
  exit 1
fi

# Retention policy
case "$BACKUP_TYPE" in
  daily)   KEEP=7 ;;
  weekly)  KEEP=4 ;;
  monthly) KEEP=12 ;;
esac

# Delete old backups beyond retention count
OLD_COUNT=$(ls -t "${BACKUP_DIR}/${BACKUP_TYPE}/"*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | wc -l)
if [ "$OLD_COUNT" -gt 0 ]; then
  ls -t "${BACKUP_DIR}/${BACKUP_TYPE}/"*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
  echo "Cleaned up ${OLD_COUNT} old backup(s)."
fi
echo "Retention: keeping ${KEEP} ${BACKUP_TYPE} backups"

echo ""
echo "=== Backup complete ==="
