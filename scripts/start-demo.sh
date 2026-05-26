#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="${FACADEFLOW_PROJECT_DIR:-/home/galin/.openclaw/workspace/FacadeFlow}"
RUN_DIR="${FACADEFLOW_RUN_DIR:-/tmp/facadeflow-run}"
BACKEND_PORT="${FACADEFLOW_BACKEND_PORT:-3000}"
WEB_PORT="${FACADEFLOW_WEB_PORT:-8082}"
PROXY_PORT="${FACADEFLOW_PROXY_PORT:-8081}"
PROXY_HOST="${FACADEFLOW_PROXY_HOST:-0.0.0.0}"
TAILSCALE_IP="${FACADEFLOW_TAILSCALE_IP:-100.66.191.125}"
mkdir -p "$RUN_DIR"
stop_pidfile() {
  local name="$1"
  local pidfile="$RUN_DIR/$name.pid"
  local pid
  if [[ -f "$pidfile" ]]; then
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "Stopping $name pid $pid"
      kill "$pid" 2>/dev/null || true
      for _ in {1..30}; do kill -0 "$pid" 2>/dev/null || break; sleep 0.2; done
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  fi
}
start_service() {
  local name="$1"
  local dir="$2"
  local command="$3"
  local logfile="$RUN_DIR/$name.log"
  echo "Starting $name..."
  (cd "$dir" && bash -lc "$command") > "$logfile" 2>&1 &
  echo $! > "$RUN_DIR/$name.pid"
}
wait_http() {
  local label="$1"
  local url="$2"
  for _ in {1..90}; do
    if curl -fsS "$url" >/dev/null 2>&1; then echo "$label ready: $url"; return 0; fi
    sleep 1
  done
  echo "$label did not become ready: $url" >&2
  tail -80 "$RUN_DIR"/*.log >&2 || true
  return 1
}
[[ -d "$PROJECT_DIR/.git" ]] || { echo "Not FacadeFlow git repo: $PROJECT_DIR" >&2; exit 1; }
stop_pidfile proxy; stop_pidfile expo; stop_pidfile backend
start_service backend "$PROJECT_DIR/backend" "PORT=$BACKEND_PORT npm start"
wait_http "Backend" "http://127.0.0.1:$BACKEND_PORT/api/system/health"
start_service expo "$PROJECT_DIR/facadeflow/mobile-app" "CI=1 BROWSER=none EXPO_NO_TELEMETRY=1 EXPO_PUBLIC_API_URL=/api npx expo start --web --port $WEB_PORT --host localhost"
wait_http "Expo web" "http://127.0.0.1:$WEB_PORT/"
start_service proxy "$PROJECT_DIR" "FACADEFLOW_WEB_PROXY_HOST=$PROXY_HOST FACADEFLOW_WEB_PROXY_PORT=$PROXY_PORT FACADEFLOW_WEB_TARGET_PORT=$WEB_PORT FACADEFLOW_API_TARGET_PORT=$BACKEND_PORT node scripts/web-dev-proxy.js"
wait_http "Tailscale proxy" "http://127.0.0.1:$PROXY_PORT/"
wait_http "Proxy API" "http://127.0.0.1:$PROXY_PORT/api/system/health"
cat <<EOF

FacadeFlow demo is ready.
Open from Windows/Everest: http://$TAILSCALE_IP:$PROXY_PORT/

Logs:
  tail -f $RUN_DIR/backend.log
  tail -f $RUN_DIR/expo.log
  tail -f $RUN_DIR/proxy.log
EOF
