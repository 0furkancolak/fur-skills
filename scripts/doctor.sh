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

echo "Frontmatter validation:"
if command -v ruby >/dev/null 2>&1; then
  ruby -ryaml - "$ROOT/skills" <<'RUBY'
root = ARGV[0]
errors = 0
Dir.glob(File.join(root, "fur-*/SKILL.md")).sort.each do |path|
  text = File.read(path)
  fm = text[/\A---\n(.*?)\n---\n/m, 1]
  name = File.basename(File.dirname(path))
  unless fm
    puts "- #{name}: missing frontmatter"
    errors += 1
    next
  end
  begin
    data = YAML.safe_load(fm)
    desc = data["description"]
    if desc.nil? || desc.to_s.strip.empty?
      puts "- #{name}: missing description"
      errors += 1
    else
      puts "- #{name}: ok"
    end
  rescue StandardError => e
    puts "- #{name}: invalid YAML (#{e.message})"
    errors += 1
  end
end
exit(errors.positive? ? 1 : 0)
RUBY
  yaml_status=$?
  if [ "$yaml_status" -ne 0 ]; then
    echo ""
    echo "Fix unquoted colons in description with a quoted or folded scalar (description: >-)."
    exit 1
  fi
else
  echo "ruby not found; skipping frontmatter validation"
fi
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
