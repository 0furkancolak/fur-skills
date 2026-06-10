# Golden Output 2: Needs Changes

## Done

- Task moved: not moved
- Progress snapshot: not created
- State: `docs/ai/state.json` updated: no
- Tracker sync: skipped (task failed internal check)

## Verification Summary

Internal check gate failed: one acceptance criterion is still unmet and the verification command reported a failing assertion.

| AC | Status | Evidence |
|---|---|---|
| Failing behavior fixed | not met | failing assertion in verification output |

## Risks and Follow-ups

Fix the failing behavior in `fur-do`, then run `fur-done` again.

```yaml
status: blocked
next_skill: fur-do
internal_check: needs-changes
scope_respected: true
verification_state: partial
risk_level: medium
```
