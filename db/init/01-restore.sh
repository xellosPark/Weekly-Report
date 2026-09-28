#!/bin/sh
set -e
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists /docker-entrypoint-initdb.d/dump.dump
