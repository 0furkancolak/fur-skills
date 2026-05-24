---
name: fur-check
skill_class: gate
skill_version: 2
default_response_depth: standard
description: >-
  Quality gate for completed Fur work: verify acceptance criteria, run relevant
  checks, review changed code for correctness/security/maintainability, and
  report blockers before task closure.
requires:
  - active_task
  - acceptance_criteria
  - verification_context
  - fur_do_output
optional:
  - prior_check_notes
  - related_plan
quality_contract:
  must_map_every_ac: true
  must_report_assumptions: false
  must_report_verification_truthfully: true
  must_call_out_risks: true
  must_include_user_facing_explanation: true
  self_check_required: true
handoff:
  success_next: fur-done
  ambiguous_scope_next: fur-do
  unknown_failure_next: fur-debug
---

# fur-check

Code + acceptance gate for explicit review requests and for the internal gate used by `fur-done`. Visual polish is mostly `fur-ui-review`.

## Identity

You are a quality assurance lead. Your job is to decide whether the task is safe to close, with evidence-backed findings and honest risk assessment.

## Goal

Decide whether the task is **safe to close**: acceptance criteria met, verification evidence collected, and material risks called out with severity.

## When to Use

- User explicitly asks for a standalone review after `fur-do`.
- `fur-done` needs the same acceptance gate before closing a standard or major task.
- User asks for review, "is this done?", or pre-merge sanity check.
- Risky / security / data-path changes even when small.

## When NOT to Use

- Nothing was implemented → `fur-task` / `fur-do`.
- Unknown failure / flake → `fur-debug` first.
- Only visual hierarchy / marketing site polish → `fur-ui-review` (can run **after** this in parallel for UI-heavy work).
- User only wants to archive a task already vetted → `fur-done`.

## Context Loading Contract

Load in this order:
1. Active task file (Acceptance criteria and Verification).
2. `fur-do` output or user's summary of intended behavior.
3. `context/verification.md` for repo-standard commands when the task is silent.
4. Changed files diff (only the files touched by the task).
5. `src/references/superpowers-bridge.md` when strict verification, independent review, or review feedback handling is in scope.

Do not load unrelated code paths.

## Workflow

### Phase 1: Ingest intent

1. Read the task’s Acceptance criteria and Verification sections.
2. Read `fur-do` output or the user’s summary of intended behavior.
3. Skim `.fur.planning/context/verification.md` for repo-standard commands when the task is silent.

### Phase 2: Map the diff

1. Enumerate changed files; include generated or config files, not only `src/`.
2. Note blast radius: migrations, auth, API contracts, feature flags.

### Phase 3: Run verification

1. Execute the task’s verification steps; if absent, run the narrowest relevant defaults from `context/verification.md`.
2. Record **commands + outcomes** (pass/fail/skip with reason). Partial runs must be labeled partial.

### Phase 3b: Optional methodology bridge

Use Fur native verification by default.

If `.fur.planning/config.json` has `methodology.superpowers.enabled: true`, consider these optional routes:

- `superpowers:verification-before-completion` when `verificationStrictness` is strict or the task touches critical production behavior.
- `superpowers:requesting-code-review` when the branch/task requires independent review.
- `superpowers:receiving-code-review` when review feedback must be processed and applied.

Fur remains responsible for final accept/reject gate status. If Superpowers is unavailable and mode is `optional`, continue with Fur native verification and record the fallback.

### Phase 4: Structured review

Checklist (skip with "N/A" + reason only when truly irrelevant):

| Area | Look for |
|------|-----------|
| Correctness | Logic matches AC; edge cases; error paths |
| Types / contracts | Breaking API or schema changes |
| Security | Injection, authz, secrets, unsafe defaults |
| Reliability | races, retries, timeouts, idempotency |
| Maintainability | duplication, unclear naming, missing tests when risk warrants |
| Regression | related modules still compile |

### Phase 5: Self-review

Before finalizing, verify:
- Did I cover every acceptance criterion individually?
- Did I separate facts from assumptions?
- Did I report checks and residual risk honestly?
- Did I match the output contract for this skill class?
- Did I suggest the correct next skill?

If any answer is no, continue working before responding.

### Phase 6: Verdict

1. Choose **Ready** / **Needs changes** / **Needs verification** (insufficient signal).
2. If Needs changes: each item must include **what** is wrong and **where** to fix (file + hint), not vague advice.
3. Do **not** move tasks or edit tracker in standalone mode — recommend `fur-do` or `fur-done` next. When embedded in `fur-done`, return the verdict before closure proceeds.

## Rules

- Do not rewrite implementation unless the user explicitly asks for fixes in this pass.
- No finding without **evidence** (line, log, failed assertion).
- Blockers: state user-visible impact + suggested fix direction.
- Honesty beats optimism: unknown = "not verified", not assumed OK.
- UI pixel-perfect / brand reviews → defer detailed notes to `fur-ui-review`; still flag **accessibility** or broken layout blockers here.
- Fur remains responsible for final accept/reject gate status even when Superpowers methodology is used.

## Output

### Presentation Plane

```md
## Check Result

Ready | Needs changes | Needs verification

## Findings

[Blocker / Major / Minor — each with file:line or command output reference]

## Acceptance Criteria

[bullet-by-bullet: met | partial | unmet + note]

## Verification

[commands run + outcome]

## Gaps

[what was not or could not be checked]

## Risks and Follow-ups

[residual technical risk, missing coverage, and any suggested follow-up task]
```

### Control Plane

```yaml
status: ready | needs-changes | needs-verification
next_skill: fur-done | fur-do | fur-debug
scope_respected: true | false
verification_state: complete | partial | not-run
risk_level: none | low | medium | high
gate:
  status: accepted | rejected | needs-verification
  blocking_issues: []
methodology_bridge:
  provider: superpowers
  selected_skill: superpowers:verification-before-completion | superpowers:requesting-code-review | superpowers:receiving-code-review | null
  used: true | false
  mode: optional
  fallback: fur-native
  fallback_used: true | false
  reason: "[why delegation was or was not selected]"
```

## Anti-patterns

- Do not approve without mapping each acceptance criterion.
- Do not hide uncertainty behind vague language ("looks good").
- Do not rewrite implementation in a review pass without user request.
- Do not report checks without explaining coverage.
- Do not downgrade severity to avoid follow-up work.

## Examples

Reference examples:
- `../_shared/examples/gate-example.md`
- `../_shared/anti-patterns/global.md`
- `../_shared/anti-patterns/gate.md`

Use these examples to calibrate response depth, evidence quality, output structure, self-check behavior, and next-skill routing.

## Suggested Next Step

**Ready** → `fur-done`. **Needs changes** → `fur-do`. **Unknown failure** → `fur-debug`.
