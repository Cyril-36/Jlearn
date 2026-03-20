#!/usr/bin/env bash
# restore.sh — restore a JLearn backup created by backup.sh
#
# Usage:
#   ./scripts/restore.sh /var/backups/jlearn/jlearn_20240101_120000.dump
#
# WARNING: This drops and recreates the target database. Make a fresh backup first.

set -euo pipefail

DUMP_FILE="${1:-}"
if [[ -z "$DUMP_FILE" || ! -f "$DUMP_FILE" ]]; then
  echo "Usage: $0 <path-to-.dump-file>" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a; source "$ENV_FILE"; set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

PG_URL="${DATABASE_URL/postgres:\/\//postgresql://}"

echo "Restoring from: $DUMP_FILE"
echo "Target:         $PG_URL"
read -rp "Are you sure? This will ERASE the current database. [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

pg_restore --clean --if-exists --no-owner --no-privileges \
  --format=custom --dbname="$PG_URL" "$DUMP_FILE"

echo "Restore complete."
