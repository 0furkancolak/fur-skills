# Planner Skill Example: fur-task

This example demonstrates a high-quality `fur-task` output at `responseDepth: standard` with `evidenceStyle: inline`.

## Input

User says: "We need to add dark mode to the app."

## Good Output (Standard)

```markdown
## Task Result

- Mode: created
- Local task(s): `.fur.planning/tasks/backlog/20260115-1000-add-dark-mode.md`
- Plan: `.fur.planning/plans/dark-mode.md`
- Tracker: local
- questionLevel / projectMaturity: high / new

## Clarifications

1. Should dark mode auto-detect system preference? (User: no, manual toggle only.)
2. Should it persist across sessions? (User: yes.)
3. Are animated transitions in scope? (User: no.)

## Plan Summary

The work is split into two phases:

**Phase 1**: Core toggle + persistence
- Task: `20260115-1000-add-dark-mode.md` (backlog → ready after clarification)
- Scope: Toggle in settings, localStorage persistence, immediate apply, light default.

**Phase 2**: Auto-detect + animations (future)
- Task: `20260115-1005-dark-mode-auto-detect.md` (backlog)
- Scope: System preference detection, animated transitions.

## Next

`fur-do` on `tasks/ready/20260115-1000-add-dark-mode.md`.
```

## Why This Output Is Good

- Input is classified (local new).
- Clarifications are concrete and tied to `questionLevel`.
- Task is small enough for one `fur-do` session.
- Large work is split into phases with clear boundaries.
- Next step is deterministic.
