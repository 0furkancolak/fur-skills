#!/usr/bin/env bash
# Idempotent one-time setup: ensures repo files are executable and git root exists.
# The full skeleton is defined by the files already in this repo.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

mkdir -p bin scripts references skills

chmod +x bin/fur 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true

if [ ! -d .git ]; then
  git init
fi

echo ""
echo "fur-skills repo setup complete."
echo ""
echo "Next commands:"
echo "  ./scripts/install.sh"
echo "  ./scripts/doctor.sh"
echo ""