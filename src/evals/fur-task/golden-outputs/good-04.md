# Golden Output 4: Multiple Active Plans

## Task Result

- Mode: selected
- Task size: n/a
- Local task(s): none
- Plan: none selected
- Tracker: local
- questionLevel / projectMaturity: normal / established

| AC | Status | Evidence |
|---|---|---|
| Avoid cross-conversation jump | met | multiple active plans detected |
| Explicit plan selection required | met | no ready task auto-selected |

## Clarifications

Which active plan should this conversation lock to? I found multiple active plans and will not choose the first ready task automatically.

## Next

Select or set a plan lock, then rerun `fur-task` or `fur-do` for that plan.

```yaml
status: blocked
next_skill: fur-status
plan_lock:
  active_plan: null
  source: ambiguous
```
