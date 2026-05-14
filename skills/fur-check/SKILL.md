---
name: fur-check
description: Quality gate for completed Fur work: verify acceptance criteria, run relevant checks, review changed code for correctness/security/maintainability, and report blockers before task closure.
---

# fur-check

Use this skill after implementation and before marking work done.

## Goal

Confirm the task is correct, verified, maintainable, and safe to close.

## When to Use

- After `fur-do`
- Before `fur-done`
- When the user asks for review, verification, or acceptance checking
- When changes are risky, cross-cutting, or tracker-linked

## When NOT to Use

- Nothing has been implemented yet — use `fur-task` or `fur-do`
- The failure root cause is unknown — use `fur-debug`
- The task is already verified and only needs closure — use `fur-done`
- The request is purely visual UI review — use `fur-ui-review`

## Workflow

1. Read the task acceptance criteria and verification section.
2. Inspect changed files and relevant diffs.
3. Run targeted tests, lint, typecheck, or manual checks when available.
4. Review for correctness, regressions, security, validation, type safety, edge cases, and missing tests.
5. Report findings first by severity.
6. State whether the task is ready for `fur-done`.

## Rules

- Do not rewrite code unless explicitly asked.
- Do not invent issues; every finding needs concrete evidence.
- Blockers must include impact and a fix direction.
- If verification is partial, say exactly what was not checked.
- Do not close local or external tasks.
- UI fidelity concerns belong to `fur-ui-review`; include only correctness/a11y blockers here.

## Output

```md
## Check Result

Ready | Needs changes | Needs verification

## Findings

[ordered by severity, or "No findings"]

## Acceptance Criteria

[met/unmet summary]

## Verification

[commands/manual checks/results]

## Gaps

[unverified areas]
```

## Suggested Next Step

If ready: `fur-done`. If changes are needed: `fur-do`. If the cause is unknown: `fur-debug`.
