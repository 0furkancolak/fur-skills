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
warns = 0
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
      next
    end

    version = data["skill_version"] || data["skillVersion"]
    if version.nil?
      puts "- #{name}: ok (v1, consider migrating to v2)"
      warns += 1
      next
    end

    unless version.to_s == "2"
      puts "- #{name}: ok (v#{version})"
      next
    end

    required = %w[skill_class default_response_depth quality_contract handoff]
    missing = required.reject { |k| data[k] }
    unless missing.empty?
      puts "- #{name}: v2 missing fields: #{missing.join(', ')}"
      errors += 1
      next
    end

    qc = data["quality_contract"]
    qc_required = %w[must_map_every_ac must_report_assumptions must_report_verification_truthfully must_call_out_risks must_include_user_facing_explanation self_check_required]
    qc_missing = qc_required.reject { |k| qc && qc.key?(k) }
    unless qc_missing.empty?
      puts "- #{name}: v2 quality_contract missing: #{qc_missing.join(', ')}"
      errors += 1
      next
    end

    ho = data["handoff"]
    ho_required = %w[success_next ambiguous_scope_next unknown_failure_next]
    ho_missing = ho_required.reject { |k| ho && ho.key?(k) }
    unless ho_missing.empty?
      puts "- #{name}: v2 handoff missing: #{ho_missing.join(', ')}"
      errors += 1
      next
    end

    puts "- #{name}: ok (v2)"
  rescue StandardError => e
    puts "- #{name}: invalid YAML (#{e.message})"
    errors += 1
  end
end
puts ""
puts "Warnings: #{warns}, Errors: #{errors}"
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

echo "Skill lint (v2 sections):"
if command -v ruby >/dev/null 2>&1; then
  ruby -ryaml - "$ROOT/skills" <<'RUBY'
root = ARGV[0]
errors = 0
warns = 0
required_sections = [
  /##\s*Identity/i,
  /##\s*Goal/i,
  /##\s*When to Use/i,
  /##\s*When NOT to Use/i,
  /##\s*Workflow/i,
  /##\s*Rules/i,
  /##\s*Output/i,
  /##\s*Anti-patterns/i,
  /##\s*Suggested Next Step/i
]
Dir.glob(File.join(root, "fur-*/SKILL.md")).sort.each do |path|
  text = File.read(path)
  fm = text[/\A---\n(.*?)\n---\n/m, 1]
  name = File.basename(File.dirname(path))
  unless fm
    puts "- #{name}: skipped (no frontmatter)"
    next
  end
  begin
    data = YAML.safe_load(fm)
    version = data["skill_version"] || data["skillVersion"]
    if version.nil? || version.to_s != "2"
      puts "- #{name}: skipped (not v2)"
      next
    end
    missing = required_sections.reject { |re| text.match?(re) }
    if missing.empty?
      puts "- #{name}: ok (all sections present)"
    else
      section_names = missing.map { |re| re.source.gsub(/\\s\*\?/, ' ').gsub(/##\s*/, '') }
      puts "- #{name}: missing sections: #{section_names.join(', ')}"
      errors += 1
    end
  rescue StandardError => e
    puts "- #{name}: lint error (#{e.message})"
    errors += 1
  end
end
puts ""
puts "Warnings: #{warns}, Errors: #{errors}"
exit(errors.positive? ? 1 : 0)
RUBY
  lint_status=$?
  if [ "$lint_status" -ne 0 ]; then
    echo ""
    echo "Some v2 skills are missing mandatory sections. See references/skill-spec-v2.md for the required list."
  fi
else
  echo "ruby not found; skipping skill lint"
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
