---
name: fur-check
description: Quality gate for completed Fur work: verify acceptance criteria, run relevant checks, review changed code for correctness/security/maintainability, and report blockers before task closure.
---

# fur-check

Code + acceptance gate **after** `fur-do` and **before** `fur-done`. Visual polish is mostly `fur-ui-review`.

## Goal

Decide whether the task is **safe to close**: acceptance criteria met, verification evidence collected, and material risks called out with severity.

## When to Use

- Immediately after `fur-do` on a non-trivial change.
- User asks for review, “is this done?”, or pre-merge sanity check.
- Risky / security / data-path changes even when small.

## When NOT to Use

- Nothing was implemented → `fur-task` / `fur-do`.
- Unknown failure / flake → `fur-debug` first.
- Only visual hierarchy / marketing site polish → `fur-ui-review` (can run **after** this in parallel for UI-heavy work).
- User only wants to archive a task already vetted → `fur-done`.

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

### Phase 4: Structured review

Checklist (skip with “N/A” + reason only when truly irrelevant):

| Area | Look for |
|------|-----------|
| Correctness | Logic matches AC; edge cases; error paths |
| Types / contracts | Breaking API or schema changes |
| Security | Injection, authz, secrets, unsafe defaults |
| Reliability | races, retries, timeouts, idempotency |
| Maintainability | duplication, unclear naming, missing tests when risk warrants |
| Regression | related modules still compile |

### Phase 5: Verdict

1. Choose **Ready** / **Needs changes** / **Needs verification** (insufficient signal).
2. If Needs changes: each item must include **what** is wrong and **where** to fix (file + hint), not vague advice.
3. Do **not** move tasks or edit tracker — recommend `fur-do` or `fur-done` next.

## Rules

- Do not rewrite implementation unless the user explicitly asks for fixes in this pass.
- No finding without **evidence** (line, log, failed assertion).
- Blockers: state user-visible impact + suggested fix direction.
- Honesty beats optimism: unknown = “not verified”, not assumed OK.
- UI pixel-perfect / brand reviews → defer detailed notes to `fur-ui-review`; still flag **accessibility** or broken layout blockers here.

## Output

```md
## Check result

Ready | Needs changes | Needs verification

## Findings

[Blocker / Major / Minor — each with file:line or command output reference]

## Acceptance criteria

[bullet-by-bullet: met | partial | unmet + note]

## Verification

[commands run + outcome]

## Gaps

[what was not or could not be checked]
```

## Suggested Next Step

**Ready** → `fur-done`. **Needs changes** → `fur-do`. **Unknown failure** → `fur-debug`.
