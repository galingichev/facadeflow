#!/usr/bin/env bash
set -euo pipefail
RUN_DIR="${FACADEFLOW_RUN_DIR:-/tmp/facadeflow-run}"
for name in proxy expo backend; do
  pidfile="$RUN_DIR/$name.pid"
  if [[ -f "$pidfile" ]]; then
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "Stopping $name pid $pid"
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  fi
done
