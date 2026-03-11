#!/bin/bash
# Ultra TMS PostgreSQL Restore Script
# Usage: ./pg-restore.sh <backup-file.sql.gz>
#
# Environment variables:
#   DATABASE_URL  - Required. PostgreSQL connection string.

set -euo pipefail

BACKUP_FILE="${1:?Usage: pg-restore.sh <backup-file.sql.gz>}"
DB_URL="${DATABASE_URL:?DATABASE_URL is required}"

# Validate backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Validate file extension
if [[ "$BACKUP_FILE" != *.sql.gz ]]; then
  echo "Error: Expected a .sql.gz file, got: $BACKUP_FILE"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "=== Ultra TMS PostgreSQL Restore ==="
echo "File: ${BACKUP_FILE}"
echo "Size: ${BACKUP_SIZE}"
echo ""
echo "WARNING: This will overwrite the current database with the backup contents."
echo "         All existing data will be replaced."
echo ""
read -p "Type 'restore' to confirm: " CONFIRM
[ "$CONFIRM" = "restore" ] || { echo "Aborted."; exit 1; }

echo ""
echo "Restoring database from backup..."
gunzip -c "$BACKUP_FILE" | psql "$DB_URL" --quiet --single-transaction

echo ""
echo "=== Restore complete ==="
echo "Run 'pnpm --filter api prisma:generate' if Prisma client needs regeneration."
