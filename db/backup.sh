#!/bin/bash
set -e
PROJECT_DIR="/volume1/docker/weekly"
BACKUP_DIR="/volume1/docker/backup/weekly_db"
mkdir -p "$BACKUP_DIR"

cd "$PROJECT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U postgres -Fc postgres > "$BACKUP_DIR/postgres_${TIMESTAMP}.dump"

find "$BACKUP_DIR" -name "postgres_*.dump" -mtime +30 -delete
