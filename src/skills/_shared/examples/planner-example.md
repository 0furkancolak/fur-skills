# Planner Skill Example: fur-task

This example demonstrates a high-quality `fur-task` output at `responseDepth: standard` with `evidenceStyle: inline`.

## Input

User says: "We need to add dark mode to the app."

## Good Output (Standard)

```markdown
## Task Result

- Mode: split
- Local task(s): `.fur.planning/tasks/ready/20260115-1000-add-dark-mode.md`
- Plan: `.fur.planning/plans/dark-mode.md`
- Tracker: local
- questionLevel / projectMaturity: high / new

## Plan summary

**Dark mode** · `dark-mode`

| Field | Value |
|-------|-------|
| Completion | **0%** (0/4 done) |
| Next up | **T1** — Core toggle + persistence (`ready`) |

```
[░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```

| ID | Status | Est | Phase | Task |
|----|--------|-----|-------|------|
| T1 | ready | M | phase-1 | `20260115-1000-add-dark-mode.md` |
| T2 | planned | S | phase-1 | — |
| T3 | planned | M | phase-2 | — |
| T4 | planned | S | phase-2 | — |

_Source: `.fur.planning/plans/dark-mode.md`_

## Clarifications

1. Should dark mode auto-detect system preference? (User: no, manual toggle only.)
2. Should it persist across sessions? (User: yes.)
3. Are animated transitions in scope? (User: no.)

## Risks

Phase 2 (auto-detect) deferred until Phase 1 ships.

## Next

`fur-do` on `tasks/ready/20260115-1000-add-dark-mode.md`.
```

## Why This Output Is Good

- Input is classified (split / local new).
- **`## Plan summary` is shown in chat** — user does not need to run CLI.
- Completion %, ASCII bar, and manifest table are visible.
- Clarifications are concrete and tied to `questionLevel`.
- Next step is deterministic.
