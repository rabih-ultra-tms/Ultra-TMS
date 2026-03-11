# Ultra TMS Database Backup

Scripts for backing up and restoring the Ultra TMS PostgreSQL database.

## Quick Start

```bash
# Set your database connection
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ultra_tms"

# Run a daily backup
./scripts/backup/pg-backup.sh daily

# Run a weekly backup
./scripts/backup/pg-backup.sh weekly

# Run a monthly backup
./scripts/backup/pg-backup.sh monthly
```

Backups are saved to `./backups/{daily|weekly|monthly}/` as gzipped SQL files.

## Scripts

| Script          | Purpose                               |
| --------------- | ------------------------------------- |
| `pg-backup.sh`  | Create a compressed database backup   |
| `pg-restore.sh` | Restore a database from a backup file |
| `pg-verify.sh`  | Verify a backup file's integrity      |

## Retention Policy

| Type    | Schedule       | Retained |
| ------- | -------------- | -------- |
| Daily   | Every day      | Last 7   |
| Weekly  | Once per week  | Last 4   |
| Monthly | Once per month | Last 12  |

Old backups beyond the retention count are automatically deleted when a new backup runs.

## Automated Backups with Cron

Add these entries to your crontab (`crontab -e`):

```cron
# Daily backup at 2:00 AM
0 2 * * * DATABASE_URL="postgresql://..." /path/to/scripts/backup/pg-backup.sh daily >> /var/log/ultra-tms-backup.log 2>&1

# Weekly backup at 3:00 AM on Sundays
0 3 * * 0 DATABASE_URL="postgresql://..." /path/to/scripts/backup/pg-backup.sh weekly >> /var/log/ultra-tms-backup.log 2>&1

# Monthly backup at 4:00 AM on the 1st
0 4 1 * * DATABASE_URL="postgresql://..." /path/to/scripts/backup/pg-backup.sh monthly >> /var/log/ultra-tms-backup.log 2>&1
```

## Restoring from Backup

```bash
# List available backups
ls -la backups/daily/

# Verify a backup before restoring
./scripts/backup/pg-verify.sh backups/daily/ultra_tms_daily_20260311_020000.sql.gz

# Restore (will prompt for confirmation)
./scripts/backup/pg-restore.sh backups/daily/ultra_tms_daily_20260311_020000.sql.gz

# Regenerate Prisma client after restore
pnpm --filter api prisma:generate
```

## Uploading to S3

To store backups offsite, upload after each backup:

```bash
# Install AWS CLI if needed
# pip install awscli

# Upload a single backup
aws s3 cp backups/daily/ultra_tms_daily_20260311_020000.sql.gz \
  s3://your-bucket/ultra-tms-backups/daily/

# Sync all backups
aws s3 sync backups/ s3://your-bucket/ultra-tms-backups/

# Download a backup from S3 for restore
aws s3 cp s3://your-bucket/ultra-tms-backups/daily/ultra_tms_daily_20260311_020000.sql.gz ./
```

For automated S3 uploads, add to the cron job:

```cron
0 2 * * * DATABASE_URL="..." /path/to/pg-backup.sh daily && aws s3 sync /path/to/backups/daily/ s3://bucket/daily/
```

## Verifying Backup Integrity

The `pg-verify.sh` script checks:

1. File exists and is not empty
2. Gzip compression is valid (can decompress without errors)
3. Contents look like a PostgreSQL dump (SQL statements present)
4. Reports table count and uncompressed size

```bash
./scripts/backup/pg-verify.sh backups/daily/ultra_tms_daily_20260311_020000.sql.gz
```

For periodic verification of all backups:

```bash
for f in backups/**/*.sql.gz; do
  echo "--- $f ---"
  ./scripts/backup/pg-verify.sh "$f"
  echo ""
done
```

## Environment Variables

| Variable       | Required | Default     | Description                     |
| -------------- | -------- | ----------- | ------------------------------- |
| `DATABASE_URL` | Yes      | -           | PostgreSQL connection string    |
| `BACKUP_DIR`   | No       | `./backups` | Base directory for backup files |

## Troubleshooting

**"pg_dump: command not found"** — Install PostgreSQL client tools or ensure they're on your PATH.

**"backup file is suspiciously small"** — The database connection may have failed silently. Check `DATABASE_URL` and database connectivity.

**"permission denied"** — Make scripts executable: `chmod +x scripts/backup/*.sh`

**Restore fails with transaction errors** — The restore uses `--single-transaction`. If the backup contains errors, the entire restore will roll back. Verify the backup first with `pg-verify.sh`.
