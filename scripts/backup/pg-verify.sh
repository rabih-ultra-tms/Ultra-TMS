#!/bin/bash
# Ultra TMS PostgreSQL Backup Verification Script
# Usage: ./pg-verify.sh <backup-file.sql.gz>
#
# Verifies a backup file can be decompressed and contains valid SQL.

set -euo pipefail

BACKUP_FILE="${1:?Usage: pg-verify.sh <backup-file.sql.gz>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: File not found: $BACKUP_FILE"
  exit 1
fi

echo "=== Ultra TMS Backup Verification ==="
echo "File: ${BACKUP_FILE}"
echo ""

# Check file size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_BYTES=$(stat --printf="%s" "$BACKUP_FILE" 2>/dev/null || stat -f "%z" "$BACKUP_FILE" 2>/dev/null || echo "0")
echo "Size: ${BACKUP_SIZE} (${BACKUP_BYTES} bytes)"

if [ "$BACKUP_BYTES" -lt 100 ]; then
  echo "FAIL: File is too small to be a valid backup."
  exit 1
fi

# Verify gzip integrity
echo -n "Gzip integrity... "
if gunzip -t "$BACKUP_FILE" 2>/dev/null; then
  echo "OK"
else
  echo "FAIL: File is not valid gzip."
  exit 1
fi

# Check for SQL content
echo -n "SQL content check... "
HEADER=$(gunzip -c "$BACKUP_FILE" | head -20)
if echo "$HEADER" | grep -qi "postgresql\|pg_dump\|CREATE\|SET\|--"; then
  echo "OK"
else
  echo "FAIL: File does not appear to contain PostgreSQL dump output."
  exit 1
fi

# Count tables referenced
TABLE_COUNT=$(gunzip -c "$BACKUP_FILE" | grep -c "CREATE TABLE" 2>/dev/null || echo "0")
echo "Tables found: ${TABLE_COUNT}"

# Estimate uncompressed size
UNCOMPRESSED_SIZE=$(gunzip -c "$BACKUP_FILE" | wc -c 2>/dev/null || echo "unknown")
if [ "$UNCOMPRESSED_SIZE" != "unknown" ]; then
  UNCOMPRESSED_MB=$((UNCOMPRESSED_SIZE / 1024 / 1024))
  echo "Uncompressed size: ~${UNCOMPRESSED_MB} MB"
fi

echo ""
echo "=== Verification passed ==="
