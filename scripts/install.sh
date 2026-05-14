#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$HOME/.claude/skills"
mkdir -p "$HOME/.agents/skills"
mkdir -p "$HOME/.cursor/skills"

for skill in "$ROOT"/skills/fur-*; do
  [ -d "$skill" ] || continue

  name="$(basename "$skill")"

  ln -sfn "$skill" "$HOME/.claude/skills/$name"
  ln -sfn "$skill" "$HOME/.agents/skills/$name"
  ln -sfn "$skill" "$HOME/.cursor/skills/$name"

  echo "Installed $name"
done

echo "Done."
echo "Restart Claude Code / Codex / Cursor if needed."
