#!/usr/bin/env bash
# backup.sh — dump the JLearn PostgreSQL database and prune old backups.
#
# Usage:
#   ./scripts/backup.sh
#
# Environment variables (can also be set in .env):
#   DATABASE_URL   — postgres://user:pass@host:5432/dbname
#   BACKUP_DIR     — where to store dumps (default: /var/backups/jlearn)
#   KEEP_DAYS      — how many days of backups to keep (default: 14)
#   AWS_S3_BUCKET  — optional: s3://your-bucket/jlearn-backups for offsite copy

set -euo pipefail

# ── Load .env if present ───────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

# ── Config ─────────────────────────────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-/var/backups/jlearn}"
KEEP_DAYS="${KEEP_DAYS:-14}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="jlearn_${TIMESTAMP}.dump"
DEST="${BACKUP_DIR}/${FILENAME}"

# ── Validate ───────────────────────────────────────────────────────────────
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

# pg_dump needs a postgresql:// URL (not postgres://)
PG_URL="${DATABASE_URL/postgres:\/\//postgresql://}"

# ── Create backup dir ──────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

# ── Dump ───────────────────────────────────────────────────────────────────
echo "[$(date -u +%FT%TZ)] Starting backup → $DEST"
pg_dump --format=custom --compress=9 --no-password "$PG_URL" > "$DEST"
echo "[$(date -u +%FT%TZ)] Backup complete ($(du -sh "$DEST" | cut -f1))"

# ── Offsite copy (optional) ────────────────────────────────────────────────
if [[ -n "${AWS_S3_BUCKET:-}" ]]; then
  echo "[$(date -u +%FT%TZ)] Uploading to S3: $AWS_S3_BUCKET"
  aws s3 cp "$DEST" "${AWS_S3_BUCKET}/${FILENAME}" --storage-class STANDARD_IA
  echo "[$(date -u +%FT%TZ)] S3 upload done"
fi

# ── Prune old backups ──────────────────────────────────────────────────────
echo "[$(date -u +%FT%TZ)] Removing backups older than ${KEEP_DAYS} days"
find "$BACKUP_DIR" -name "jlearn_*.dump" -mtime "+${KEEP_DAYS}" -delete

echo "[$(date -u +%FT%TZ)] Done"
