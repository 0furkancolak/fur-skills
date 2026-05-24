# Golden Output 3: Unknown Failure

## Done

- Task moved: not moved
- Progress snapshot: not created
- State: `.fur.planning/state.json` updated: no
- Tracker sync: skipped (verification failure is unexplained)

## Verification Summary

Internal check gate could not determine the root cause: the task behavior appears implemented, but the test suite fails in an unrelated setup phase.

## Risks and Follow-ups

Route to `fur-debug` to isolate the unknown failure before closure.

```yaml
status: blocked
next_skill: fur-debug
internal_check: needs-verification
scope_respected: true
verification_state: partial
risk_level: high
```
