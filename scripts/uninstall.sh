#!/usr/bin/env bash
# Remove all fur skill symlinks and fur CLI symlink.
set -euo pipefail

for d in "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.cursor/skills"; do
  [ -d "$d" ] || continue
  shopt -s nullglob
  for item in "$d"/fur-*; do
    rm -rf "$item"
  done
  shopt -u nullglob
done

if [ -L "$HOME/bin/fur" ]; then
  rm "$HOME/bin/fur"
fi

echo "Uninstalled fur skills and fur CLI symlink."