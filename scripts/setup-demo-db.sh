#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${FACADEFLOW_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd)}"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:3000/api}"

run_step() {
  local label="$1"
  shift
  echo
  echo "==> $label"
  if ! "$@"; then
    echo "Failed step: $label" >&2
    exit 1
  fi
}

require_command() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Missing required command: $name" >&2
    echo "Install it, then rerun: npm run setup:demo-db" >&2
    exit 1
  fi
}

require_owner_id() {
  local owner_id="${FACADEFLOW_MVP_OWNER_ID:-${MVP_OWNER_ID:-${PROJECTS_CREATED_BY:-}}}"

  if [[ -z "$owner_id" && -f "$PROJECT_DIR/backend/.env" ]]; then
    owner_id="$(
      grep -E '^(FACADEFLOW_MVP_OWNER_ID|MVP_OWNER_ID|PROJECTS_CREATED_BY)=' "$PROJECT_DIR/backend/.env" \
        | head -n 1 \
        | cut -d '=' -f 2- \
        | tr -d "\"'" \
        | xargs || true
    )"
  fi

  if [[ ! "$owner_id" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$ ]]; then
    echo "FACADEFLOW_MVP_OWNER_ID is required before seeding the client demo." >&2
    echo "Set backend/.env FACADEFLOW_MVP_OWNER_ID to an existing Supabase users.id UUID, then restart the backend." >&2
    exit 1
  fi
}

cd "$PROJECT_DIR"

require_command supabase
require_owner_id

run_step "Apply Supabase migrations" supabase db push
run_step "Load Supabase base seed" supabase db seed
run_step "Check local API health" curl -fsS "$API_BASE_URL/system/health"
run_step "Reset and verify client demo data" npm run seed:client-demo

echo
echo "FacadeFlow demo database setup complete."
