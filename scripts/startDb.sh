#!/usr/bin/env bash
# Lance une MongoDB de développement locale (données dans .data/db, écoute sur 127.0.0.1 seulement).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONGOD="${MONGOD_BIN:-$(command -v mongod || echo "$HOME/.local/opt/mongodb/bin/mongod")}"
DBPATH="$ROOT/.data/db"
mkdir -p "$DBPATH" "$ROOT/.data/log"
if pgrep -f "mongod.*$DBPATH" >/dev/null; then
  echo "MongoDB tourne déjà ($DBPATH)"; exit 0
fi
"$MONGOD" --dbpath "$DBPATH" --bind_ip 127.0.0.1 --port 27017 \
  --logpath "$ROOT/.data/log/mongod.log" --fork >/dev/null
echo "MongoDB démarrée sur mongodb://127.0.0.1:27017 (données : .data/db)"
