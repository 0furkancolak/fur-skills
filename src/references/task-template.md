# Task Template

Use this template when creating task files under `docs/ai/tasks/backlog/` or `docs/ai/tasks/ready/`.

## Filename Format

```
YYYYMMDD-HHMM-short-title.md
```

Example: `20250114-0930-add-dark-mode.md`

## Template

```md
# Task Title

## Type

feature | bug | refactor | chore | docs | test | investigation

## Task size

micro | standard | major

## Context

Why this task exists. What triggered it? What problem does it solve?

## Goal

What should be true when this is done. Concrete, measurable outcome.

## Non-goals

What should NOT be changed or affected by this task. Scope boundaries.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes

Technical notes, affected files, constraints, approach suggestions.

When the task belongs to a multi-task plan, include:

```md
Plan: plans/<slug>.md
Plan task ID: T1
Plan lock: <slug>
Execution slice: A
Batch group: <slug>-wave-1
Batch dependencies: none
```

## Suggested Files

- `path/to/file1`
- `path/to/file2`

## Verification

How to check this task is done. Commands to run, manual steps to verify.

## Risks

Possible regressions, open questions, or areas of uncertainty.

## Open Questions

Required only when the task is not ready. A task with open blocking questions stays in `tasks/backlog/`.

## Optional: Slices

If independent streams exist, name slices (A/B/...) here or in `plans/`. Do not duplicate long plans across chat and files.

For plan-linked work, include the slice name from the plan and any constraints needed to keep this conversation isolated from other active plans.

## Optional: Batch Execution

For independent tasks in the same ready wave, include the same `Batch group`. `Batch dependencies` lists completed blocker IDs, or `none`.

## Tracker Sync

- Source: local | jira | github
- External ID:
- External URL:
- Workspace Repo ID:
- Local file:
- Sync status: unsynced | imported | drafted | created | updated | closed
```

## Tips

- Keep tasks small enough to complete in a single focused session.
- Every task must have at least one acceptance criterion.
- Every task must have a verification section.
- If a task feels too big, split it into multiple smaller tasks.
- Use `plans/` for detailed implementation plans that don't fit in the task file.
