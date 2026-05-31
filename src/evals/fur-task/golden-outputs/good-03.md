# Golden Output 3: Split Plan With Execution Notes

## Task Result

- Mode: split
- Task size: major
- Local task(s): `tasks/ready/20260115-1020-auth-service.md`
- Plan: `plans/auth-refactor.md`
- Tracker: local
- questionLevel / projectMaturity: normal / established

| AC | Status | Evidence |
|---|---|---|
| Plan manifest created | met | `plans/auth-refactor.md` includes every slice |
| Execution notes included | met | plan includes `Execution notes` |
| Batch metadata included | met | ready wave tasks include `Batch group: auth-refactor-wave-1` |

## Plan summary

`auth-refactor`: 0% (0/4 done) · next: T1 Extract auth service (`ready`)

## Clarifications

Plan lock is `auth-refactor`; other active plans are out of scope.

## Next

Run `fur-do` on the ready wave.

```yaml
status: created
next_skill: fur-do
plan_lock:
  active_plan: auth-refactor
  source: single-active-plan
ready_batch:
  group: auth-refactor-wave-1
  task_ids: [T1]
```
