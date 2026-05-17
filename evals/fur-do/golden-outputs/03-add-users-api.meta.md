# Golden Output 3: Add API Endpoint (Medium Scope, Standard)

## Input

Add a new API endpoint `/users` that returns a list of users. No tests exist yet.

**Active task**: `tasks/ready/20260115-1100-add-users-api.md`

```markdown
# Add users API endpoint

## Type
feature

## Goal
`GET /api/users` returns a JSON list of users.

## Acceptance Criteria
- [ ] Endpoint exists at `/api/users`.
- [ ] Returns JSON array of user objects.
- [ ] Handles empty list gracefully.
- [ ] Returns 500 on database error.

## Implementation Notes
- Use existing `db` client from `src/lib/db.ts`.
- Add route in `src/app/api/users/route.ts`.

## Verification
- `npm run typecheck`
- Manual curl: `curl http://localhost:3000/api/users`

## Risks
- No existing tests for API routes.
```

## Expected Output (Standard)

```markdown
## Task Understanding

- **Goal**: Add `GET /api/users` endpoint returning JSON user list.
- **Scope boundaries**: One endpoint, no auth, no pagination.
- **Assumptions**: `db` client from `src/lib/db.ts` is available and working.
- **Non-goals**: Auth, pagination, filtering, write operations.

## Acceptance Criteria Coverage

| AC | Status | Evidence | Notes |
|---|---|---|---|
| Endpoint at `/api/users` | met | `src/app/api/users/route.ts:5-12` | `export async function GET()` |
| Returns JSON array | met | `src/app/api/users/route.ts:8` | `Response.json(users)` |
| Handles empty list | met | `src/app/api/users/route.ts:10` | Returns `[]` when no rows |
| Returns 500 on DB error | met | `src/app/api/users/route.ts:14-16` | Try/catch with `NextResponse.json({error}, {status: 500})` |

## Implementation Details

Created `src/app/api/users/route.ts` with a `GET` handler. Used the existing `db` client to query all users. Wrapped the query in try/catch to return 500 on database errors.

**Assumption**: The `db` client exposes a `.query()` method. If this is incorrect, the route will fail at runtime.

## Files Changed

- `src/app/api/users/route.ts` — new file; `GET` handler with db query and error handling

## Verification

| Command | Result | Proves | Does Not Prove |
|---|---|---|---|
| `npm run typecheck` | pass | Type safety for new route | Runtime API behavior |
| Manual curl `GET /api/users` | pass | Returns JSON array | Error handling under real DB failure |

## Risks and Follow-ups

- **No test coverage**: There are no existing API route tests. Risk level: **medium**. Suggested follow-up: add integration tests for `/api/users` including empty list and error cases.
- **db client assumption**: If `db.query()` does not exist, the route will throw at runtime. Risk level: **low**.

## Control Plane

```yaml
status: implemented
next_skill: fur-check
scope_respected: true
verification_state: partial
risk_level: medium
```

## Suggested Next Step

Route to `fur-check` for verification. Follow-up: create a task for API route tests.
```

## Rubric Scores

| Dimension | Score | Notes |
|---|---|---|
| Depth | 9/16 | Brief restatement, assumptions labeled, no trade-off discussion (scope is clear), happy path + one edge (empty list, DB error), self-check implicit, file list with intent, verification with coverage gaps, risk with severity + mitigation. Standard depth range. |
| Quality | 9/10 | All AC mapped to evidence, claims have sources, routing correct, format matches, honest about partial verification. |
| Evidence | 2/3 | Short inline snippets (≤5 lines) where helpful + paths. No full function body inlined. |
| Risk | medium | Correct: no tests is a meaningful gap for an API endpoint. |
