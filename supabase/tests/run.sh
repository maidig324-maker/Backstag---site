#!/usr/bin/env bash
# Executa os testes do banco num Postgres descartável.
# Uso: PGHOST=... PGPORT=... PGUSER=postgres supabase/tests/run.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
DB="${TEST_DB:-backstag_teste}"
dropdb --if-exists "$DB" >/dev/null
createdb "$DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/00_emulacao_supabase.sql"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/../migrations/20261016120000_leads.sql" >/dev/null 2>&1 || psql -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/../migrations/20261016120000_leads.sql"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/leads.test.sql" 2>&1 | sed -n 's/.*NOTICE:  //p; /TODOS_OS/p; /FALHOU/p; /ERROR/p'
bash "$DIR/concorrencia.sh" "$DB"
