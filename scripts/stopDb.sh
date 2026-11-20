#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONGOD="${MONGOD_BIN:-$(command -v mongod || echo "$HOME/.local/opt/mongodb/bin/mongod")}"
"$MONGOD" --dbpath "$ROOT/.data/db" --shutdown && echo "MongoDB arrêtée"
