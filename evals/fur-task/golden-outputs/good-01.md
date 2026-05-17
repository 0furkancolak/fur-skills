# Golden Output 1: Vague Feature Request

## Task Understanding

- **Goal**: Turn vague user request into a focused, actionable task.
- **Scope boundaries**: Decomposition only; no implementation.
- **Assumptions**: User intent is valid and project context is available.
- **Non-goals**: Writing code, creating tracker issues without permission.

## Acceptance Criteria Coverage

| AC | Status | Evidence | Notes |
|---|---|---|---|
| Task created with AC | met | `tasks/ready/20260115-1000-add-feature.md` | 3 AC defined |
| Verification section added | met | same file | Commands listed |

## Files Changed

- `tasks/ready/20260115-1000-add-feature.md` — new task file

## Verification

- File exists and contains AC + verification.

## Risks and Follow-ups

- None. Risk level: **none**.

## Control Plane

```yaml
status: created
next_skill: fur-do
scope_respected: true
verification_state: not-applicable
risk_level: none
```

## Suggested Next Step

Route to `fur-do` on the ready task.
