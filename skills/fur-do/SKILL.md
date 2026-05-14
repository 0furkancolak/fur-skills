---
name: fur-do
description: Implement one selected Fur task or clearly scoped mini fix with minimal, complete code changes; includes small behavior-preserving cleanup but does not perform broad review or task planning.
---

# fur-do

Use this skill to execute a ready task.

## Goal

Make the smallest complete implementation that satisfies the task acceptance criteria.

## When to Use

- A task in `.fur.planning/tasks/ready/` or `.fur.planning/tasks/backlog/` is selected
- The user gives a tiny unambiguous fix
- Recent code needs behavior-preserving cleanup directly related to the selected task

## When NOT to Use

- Requirements are unclear — use `fur-task`
- Root cause is unknown — use `fur-debug`
- The change needs a quality gate — use `fur-check`
- Work is complete and ready to close — use `fur-done`

## Workflow

1. Read the selected task and relevant plan/context only.
2. Inspect existing code patterns before editing.
3. Implement the narrowest complete change.
4. Keep cleanup limited to touched code and preserve behavior.
5. Run targeted checks when obvious and cheap.
6. Summarize changed files, checks, and remaining risk.

## Rules

- Do not broaden scope or redesign unrelated code.
- Do not make tracker updates.
- Do not mark tasks done.
- Do not use `any` or weaken types unless unavoidable and explained.
- If scope grows or requirements become unclear, stop and return to `fur-task`.
- If a failure needs diagnosis, switch to `fur-debug`.

## Output

```md
## Implemented

[summary]

## Files Changed

- `path` — [what changed]

## Checks

[commands/results]

## Risks

[remaining risk or "none known"]
```

## Suggested Next Step

`fur-check` for review and verification, or `fur-debug` if verification exposes an unknown root cause.
