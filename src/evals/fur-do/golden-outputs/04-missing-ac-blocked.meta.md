# Golden Output 4: Missing Acceptance Criteria (Boundary Trigger)

## Input

Implement the user profile page. The task file says "build the profile page" with no acceptance criteria.

**Active task**: `tasks/ready/20260115-1200-profile-page.md`

```markdown
# Build the profile page

## Type
feature

## Context
Users need a profile page.

## Goal
Build the profile page.
```

## Expected Output (Blocked)

```markdown
## Task Understanding

- **Goal**: Build a user profile page.
- **Scope boundaries**: Undefined — the task lacks acceptance criteria and implementation notes.
- **Assumptions**: None can be safely assumed without clarification.
- **Non-goals**: Cannot be determined without AC.

## Acceptance Criteria Coverage

| AC | Status | Evidence | Notes |
|---|---|---|---|
| (none defined) | not met | N/A | Task file has no acceptance criteria |

## Implementation Details

No implementation attempted. The task lacks the minimum required acceptance criteria for `fur-do`.

## Files Changed

- None.

## Verification

- Not applicable.

## Risks and Follow-ups

- **Blocked by missing AC**: Cannot implement without knowing what "profile page" means. Risk level: **high**.

## Control Plane

```yaml
status: blocked
next_skill: fur-task
scope_respected: true
verification_state: not-run
risk_level: high
```

## Suggested Next Step

Route to `fur-task` to add acceptance criteria before implementation.
```

## Rubric Scores

| Dimension | Score | Notes |
|---|---|---|
| Depth | 6/16 | Brief restatement, assumptions labeled as none, no trade-offs, no edge cases (blocked), self-check implicit, file list empty, no verification, risk stated as high with reason. |
| Quality | 8/10 | Correctly identified missing AC, did not invent scope, routing is correct (fur-task), format matches, honest about block. |
| Evidence | 1/3 | Paths only (task file path). No code to show. |
| Risk | high | Correct: implementing without AC is high risk. |
