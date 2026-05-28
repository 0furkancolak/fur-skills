# Golden Output 1: Brainstorming Gate

## Task Result

- Mode: created
- Task size: standard
- Local task(s): `tasks/backlog/20260115-1000-add-feature.md`
- Plan: none
- Tracker: local
- questionLevel / projectMaturity: normal / established

| AC | Status | Evidence |
|---|---|---|
| Behavior change identified | partial | brainstorming approval is still required |
| Verification method defined | partial | draft contains proposed command |

## Clarifications

`superpowers:brainstorming` is required by `brainstormingPolicy: config-mandatory`; the task stays in backlog until the user approves the design/spec and confirms acceptance criteria.

## Next

Continue `superpowers:brainstorming`; promote the task to `ready/` only after approval.

```yaml
status: blocked
next_skill: fur-task
methodology_bridge:
  provider: superpowers
  selected_skill: superpowers:brainstorming
plan_lock:
  active_plan: null
  source: none
```
