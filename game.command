#!/usr/bin/env sh
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found - opening SOLO mode. For co-op install Node.js from https://nodejs.org"
  open index.html 2>/dev/null || xdg-open index.html
  exit 0
fi
echo "Starting Cursed Night... keep this window open while you play."
( sleep 1; open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 ) &
node server.js
