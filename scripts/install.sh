#!/usr/bin/env bash
# Install fur skills and CLI by symlinking to user directories.
# Removes obsolete skill symlinks from previous versions.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$HOME/.claude/skills"
mkdir -p "$HOME/.agents/skills"
mkdir -p "$HOME/.cursor/skills"
mkdir -p "$HOME/.config/opencode/commands"
mkdir -p "$HOME/bin"

# Remove obsolete skill symlinks from previous installations
for obsolete in \
  fur-parallel \
  fur-quick \
  fur-task-write \
  fur-task-import \
  fur-task-external-write \
  fur-task-pick \
  fur-implement \
  fur-review \
  fur-task-done \
  fur-refresh \
  fur-progress \
  fur-grill \
  fur-simplify; do
  for d in "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.cursor/skills"; do
    if [ -L "$d/$obsolete" ]; then
      rm -f "$d/$obsolete"
    fi
  done
done

for skill in "$ROOT"/skills/fur-*; do
  [ -d "$skill" ] || continue

  name="$(basename "$skill")"

  if [[ "$name" != fur-* ]]; then
    echo "Skipping non-fur skill: $name"
    continue
  fi

  ln -sfn "$skill" "$HOME/.claude/skills/$name"
  ln -sfn "$skill" "$HOME/.agents/skills/$name"
  ln -sfn "$skill" "$HOME/.cursor/skills/$name"

  echo "Installed skill: $name"
done

ln -sfn "$ROOT/bin/fur" "$HOME/bin/fur"

if [ -f "$ROOT/.opencode/commands/clone-website.md" ]; then
  ln -sfn "$ROOT/.opencode/commands/clone-website.md" "$HOME/.config/opencode/commands/clone-website.md"
  echo "Installed OpenCode command: clone-website"
fi

echo ""
echo "Installed fur CLI:"
echo "$HOME/bin/fur"
echo ""

if [[ ":$PATH:" != *":$HOME/bin:"* ]]; then
  echo "Add this to your shell config:"
  echo 'export PATH="$HOME/bin:$PATH"'
fi

echo ""
echo "Done."
