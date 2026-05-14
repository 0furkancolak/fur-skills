#!/usr/bin/env bash
# Verify fur-skills installation: source skills, installed symlinks, and CLI status.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "fur-skills doctor"
echo "================="
echo ""

echo "Repo: $ROOT"
echo ""

echo "Source skills:"
find "$ROOT/skills" -maxdepth 2 -name SKILL.md | sort | sed "s#^$ROOT/##"
echo ""

echo "Installed skills:"
for d in "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.cursor/skills"; do
  echo "## $d"
  find -L "$d" -maxdepth 2 -name SKILL.md 2>/dev/null | sort || true
  echo ""
done

echo "Non-fur skills:"
find "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.cursor/skills" \
  -mindepth 1 -maxdepth 1 -type d ! -name 'fur-*' 2>/dev/null | sort || true

echo ""
echo "GSD leftovers:"
find "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.cursor/skills" "$HOME/.codex/skills" \
  -maxdepth 2 -type d -name 'gsd-*' 2>/dev/null | sort || true

echo ""
echo "OpenCode commands:"
if [ -d "$HOME/.config/opencode/commands" ]; then
  find -L "$HOME/.config/opencode/commands" -maxdepth 1 -type f -name '*.md' 2>/dev/null | sort || true
else
  echo "missing: $HOME/.config/opencode/commands"
fi

echo ""
if command -v fur >/dev/null 2>&1; then
  echo "fur CLI: $(command -v fur)"
else
  echo "fur CLI not found in PATH"
fi
