#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd)"
PROJECT_DIR="${FACADEFLOW_PROJECT_DIR:-$(cd "$SCRIPT_DIR/.." ; pwd)}"
RUN_DIR="${FACADEFLOW_RUN_DIR:-/tmp/facadeflow-run}"
BACKEND_PORT="${FACADEFLOW_BACKEND_PORT:-3000}"
WEB_PORT="${FACADEFLOW_WEB_PORT:-8082}"
PROXY_PORT="${FACADEFLOW_PROXY_PORT:-8081}"
DEMO_URL="${FACADEFLOW_DEMO_URL:-http://127.0.0.1:${PROXY_PORT}/}"

mkdir -p "$RUN_DIR"

bash "$PROJECT_DIR/scripts/stop-demo.sh" >/dev/null 2>/dev/null || true

cd "$PROJECT_DIR/backend"
PORT="$BACKEND_PORT" node server.js >"$RUN_DIR/backend.log" 2>"$RUN_DIR/backend.err" &
echo $! >"$RUN_DIR/backend.pid"

cd "$PROJECT_DIR/facadeflow/mobile-app"
CI=1 BROWSER=none EXPO_NO_TELEMETRY=1 EXPO_PUBLIC_API_URL=/api \
  node node_modules/expo/bin/cli start --web --port "$WEB_PORT" --host localhost >"$RUN_DIR/expo.log" 2>"$RUN_DIR/expo.err" &
echo $! >"$RUN_DIR/expo.pid"

cd "$PROJECT_DIR"
FACADEFLOW_WEB_PROXY_HOST=0.0.0.0 \
FACADEFLOW_WEB_PROXY_PORT="$PROXY_PORT" \
FACADEFLOW_WEB_TARGET_PORT="$WEB_PORT" \
FACADEFLOW_API_TARGET_PORT="$BACKEND_PORT" \
node scripts/web-dev-proxy.js >"$RUN_DIR/proxy.log" 2>"$RUN_DIR/proxy.err" &
echo $! >"$RUN_DIR/proxy.pid"

for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${PROXY_PORT}/api/system/health" >/dev/null 2>/dev/null \
    && curl -fsS "http://127.0.0.1:${PROXY_PORT}/" >/dev/null 2>/dev/null; then
    echo "FacadeFlow demo is ready."
    echo "Open: $DEMO_URL"
    echo "Logs: $RUN_DIR"
    exit 0
  fi
  sleep 1
done

echo "FacadeFlow demo did not become ready in time." >&2
echo "Check logs in: $RUN_DIR" >&2
exit 1
