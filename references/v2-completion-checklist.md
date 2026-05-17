# fur-skills v2 Completion Checklist

## Runtime Contract

- [x] `fur init` writes `responseDepth`
- [x] `fur init` writes `evidenceStyle`
- [x] `fur init` writes `verificationStrictness`

## Skill Contract

- [x] Every skill has `skill_version: 2`
- [x] Every skill has `quality_contract`
- [x] Every skill has `handoff`
- [x] Every skill has `## Examples`
- [x] Every skill has control plane output
- [x] Every skill has `## Identity`
- [x] Every skill has `## Context Loading Contract`
- [x] Every skill has `## Anti-patterns`
- [x] Every skill has `## Self-review` phase in Workflow

## Shared Resources

- [x] `_shared/overlays/claude.md`
- [x] `_shared/overlays/openai-reasoning.md`
- [x] `_shared/overlays/generic.md`
- [x] `_shared/examples/executor-example.md`
- [x] `_shared/examples/gate-example.md`
- [x] `_shared/examples/diagnostic-example.md`
- [x] `_shared/examples/planner-example.md`
- [x] `_shared/examples/orchestrator-example.md`
- [x] `_shared/anti-patterns/global.md`
- [x] `_shared/anti-patterns/executor.md`
- [x] `_shared/anti-patterns/gate.md`
- [x] `_shared/anti-patterns/diagnostic.md`
- [x] `_shared/anti-patterns/planner.md`
- [x] `_shared/anti-patterns/orchestrator.md`

## Eval

- [x] `fur-task` eval fixtures present
- [x] `fur-do` eval fixtures present
- [x] `fur-check` eval fixtures present
- [x] `fur-debug` eval fixtures present
- [x] all other skills eval skeleton present

## Automation

- [x] `scripts/doctor.sh` — frontmatter + sections + Examples + _shared + eval readiness
- [x] `scripts/run-eval.sh` — eval metadata validation
- [x] GitHub Actions quality workflow

## Documentation

- [x] `README.md` updated with v2 architecture summary
- [x] `docs/tr/README.md` updated with v2 concepts
- [x] `AGENTS.md` contains v2 Quality Constitution
- [x] `references/skill-spec-v2.md` defines mandatory contract
- [x] `references/output-rubrics.md` defines grading rubrics
- [x] `references/eval-design.md` defines eval methodology
- [x] `references/context-pack-rules.md` defines context loading rules
- [x] `references/v2-completion-checklist.md` exists (this file)

## Final Verification Commands

```bash
./scripts/install.sh
./scripts/doctor.sh

# Verify fur init writes v2 config
tmpdir="$(mktemp -d)"
cd "$tmpdir"
~/bin/fur init --gitignore --project-maturity new --question-level high
cat .fur.planning/config.json
# should contain: responseDepth, evidenceStyle, verificationStrictness

cd /path/to/fur-skills
./scripts/run-eval.sh fur-task
./scripts/run-eval.sh fur-do
./scripts/run-eval.sh fur-check
./scripts/run-eval.sh fur-debug
```

Expected result: all pass.
