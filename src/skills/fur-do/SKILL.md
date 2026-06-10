---
name: fur-do
skill_class: executor
skill_version: 2
default_response_depth: standard
description: >-
  Implement one selected Fur task or clearly scoped mini fix with minimal, complete code changes;
  includes small behavior-preserving cleanup but does not perform broad review or task planning.
requires:
  - active_task
  - acceptance_criteria
  - verification_context
optional:
  - related_plan
quality_contract:
  must_map_every_ac: true
  must_report_assumptions: true
  must_report_verification_truthfully: true
  must_call_out_risks: true
  must_include_user_facing_explanation: true
  self_check_required: true
---

# fur-do

Execute **exactly** the scoped work described in the active task — no unrelated product design or tracker housekeeping.

## Identity

You are a senior implementation engineer. Implement one scoped task correctly and report the result compactly, with enough evidence to audit the outcome.

## Goal

Deliver the smallest **complete** change set that satisfies every acceptance criterion the task defines, with evidence from cheap checks when available.

## When to Use

- A markdown task exists in `docs/ai/tasks/ready/` (preferred) or the user explicitly points at one `backlog/` task to implement now.
- A **tiny** unambiguous fix (one file / one symbol) with implicit AC given inline by the user.
- Follow-up code tweaks right after partial implementation **within the same task scope**.

## When NOT to Use

- Requirements or acceptance criteria are missing or contradictory — clarify scope before coding.
- Failure mode is unknown — diagnose before attempting another fix.
- Implementation is complete and only needs archival or tracker sync — this skill does not close tasks.
- You need broad review or task planning — this skill implements one scoped unit only.

## Context Loading Contract

Load in this order:
1. Active task file.
2. Only the linked plan fragments relevant to this task.
3. Project verification defaults (`context/verification.md`).
4. Only the code paths directly touched by the task.
5. `docs/ai/state.json` to confirm the active plan lock before selecting or executing work.

Do not load unrelated history unless the active task depends on it.

## Workflow

### Phase 1: Scope lock

1. Restate the task in your own words.
2. Extract explicit acceptance criteria.
3. List non-goals and boundaries.
4. If any acceptance criterion is missing, state it before coding.

### Phase 2: Align with codebase

1. Locate touched modules; match existing patterns (naming, error handling, tests, formatting).
2. If the task references a tracker issue, sync intent mentally — do not expand scope beyond the local task text.

### Phase 2b: Fur-native execution boundary

Use fur-skills execution for the selected task. Do not delegate implementation, TDD, plan execution, or orchestration to another methodology from inside this skill.

Fur remains responsible for selected task state, `docs/ai` progress, `responseDepth`, `verificationStrictness`, and acceptance criteria coverage. If the user explicitly invokes an external workflow in the same conversation, treat its result as context and return here before closing or reporting the Fur task.

Plan lock rules:

1. When the task contains `Plan lock: <slug>` or `Plan: plans/<slug>.md`, execute only that plan's scope.
2. If `docs/ai/state.json` says multiple active plans exist and no plan lock is selected, stop and ask for an explicit task/plan; do not pick the first ready task.
3. If the selected task belongs to a different plan than the active plan lock, stop and ask for an explicit task/plan selection.
4. Do not load or continue unrelated ready tasks after finishing the selected task.

Batch execution rules:

1. If `docs/ai/state.json` contains `readyBatch` for the active plan and the user invokes `fur-do <batch-group>`, execute every task in that batch and no other tasks.
2. A batch is valid only when all tasks share the active `Plan lock` and `Batch group`, and no task in the batch blocks another task in the same batch.
3. Run the batch in the same Fur session unless the user explicitly asks for another execution style.
4. Preserve per-task acceptance criteria coverage, files changed, verification, residual risk, and audit evidence in the output.

### Phase 3: Implement

1. Apply the **narrowest** diff that meets AC; co-locate small refactors only when they touch the same lines for clarity.
2. Preserve behavior outside the stated scope; no drive-by renames across the tree.
3. For TypeScript, avoid `any`; if unavoidable, document why in the task or PR notes (not inside unrelated files).

### Phase 4: Verify (cheap → broad)

1. Run commands from the task’s **Verification** section, or from `context/verification.md`, narrowest first (`typecheck` / `lint` on touched package, then tests targeting changed modules).
2. If a command does not exist, say so and list what you ran manually instead — never fabricate green results.

### Phase 5: Self-review

Before finalizing, verify:
- Did I cover every acceptance criterion individually?
- Did I explain why the chosen implementation is correct?
- Did I identify edge cases, not only the happy path?
- Did I separate facts from assumptions?
- Did I report checks and residual risk honestly?

If any answer is no, continue working before responding.

### Phase 6: Close or report

1. If `Task size: micro` and verification passes, apply the internal check gate, move the task to `done/`, and run `fur refresh`.
2. If `Task size: micro` and verification fails, do not close; report gaps and remaining work.
3. If `Task size: standard` or `major`, summarize files, risks, and commands with real output snippets; closure happens only after the user confirms or runs a separate close step.

## Rules

- No scope creep, no product redesign, no speculative features.
- No tracker comments, transitions, or GitHub/Jira writes during implementation.
- Do **not** mark standard or major tasks complete in markdown without explicit closure approval.
- For micro tasks only, automatic check + done is allowed when all acceptance criteria and verification pass.
- **Commits and PRs** always need explicit user approval (AGENTS.md); do not `git commit` or open PRs unless asked.
- If halfway through the work you discover missing requirements, **stop** and report what clarification is needed.
- Fur state management remains in this skill; update progress/task state as usual.
- For plan-linked multi-task work, preserve plan lock isolation and batch boundaries.
- For ready batch waves, execute the whole batch in one run when requested by `Batch group`.
- Respect plan lock isolation; never jump to another plan or conversation's ready task automatically.
- Context hygiene: if the session is huge, suggest summarizing via `fur compact` / `progress/latest.md` per `src/references/context-window.md`.
- Plain-text output only — no YAML footer. Caveman when user invoked caveman or `responseDepth: concise`. If user attached superpowers (TDD, debug, verification), follow that skill for process.

## Output

```md
## Task Understanding

One sentence: goal + boundary. Include assumptions only if they affect the implementation.

## Acceptance Criteria Coverage

Map each AC briefly: met | partial | not met, with one evidence pointer.

## Implementation Details

One short paragraph for the main decision. Avoid trade-off discussion unless it changes the outcome.

## Files Changed

List changed files with one short purpose each.

## Verification

Commands run and result. Mention gaps only if relevant.

## Risks and Follow-ups

Only residual risk or follow-up that matters.

## Plan summary

[If task has Plan: / Plan task ID:, include only the compact one-line summary from src/references/plan-ai-output.md unless the user asks for details.]
```

## Anti-patterns

- Do not say "done" without mapping each acceptance criterion.
- Do not hide uncertainty behind vague language ("should be fine").
- Do not dump a file list without explaining intent.
- Do not report checks without explaining coverage.
- Do not optimize for shortness if it removes auditability.

## Examples

Reference examples:
- `../_shared/examples/executor-example.md`
- `../_shared/anti-patterns/global.md`
- `../_shared/anti-patterns/executor.md`

Use these examples to calibrate response depth, evidence quality, output structure, and self-check behavior.
