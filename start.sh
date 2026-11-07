#!/usr/bin/env bash
# Focus Gate Launcher for macOS and Linux
set -e

cd "$(dirname "$0")"

PORT=8899

# Check if port 8899 is already listening
ALREADY_RUNNING=0
if command -v lsof >/dev/null 2>&1; then
  if lsof -i :$PORT >/dev/null 2>&1; then
    ALREADY_RUNNING=1
  fi
fi

if [ "$ALREADY_RUNNING" -eq 0 ]; then
  if command -v node >/dev/null 2>&1; then
    echo "[Focus Gate] Starting local workspace server with Node.js..."
    node server.js &
  elif command -v python3 >/dev/null 2>&1; then
    echo "[Focus Gate] Starting local workspace server with Python 3..."
    python3 server.py &
  elif command -v python >/dev/null 2>&1; then
    echo "[Focus Gate] Starting local workspace server with Python..."
    python server.py &
  else
    echo "[Focus Gate] Warning: Neither Node.js nor Python was found. Opening HTML file directly..."
  fi
  sleep 1
fi

URL="http://localhost:$PORT/"

echo "[Focus Gate] Opening Focus Gate in your browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v sensible-browser >/dev/null 2>&1; then
  sensible-browser "$URL"
else
  echo "[Focus Gate] Please open $URL in your browser."
fi
