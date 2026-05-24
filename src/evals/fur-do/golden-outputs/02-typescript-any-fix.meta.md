# Golden Output 2: TypeScript Type Error (Tiny Fix, Concise)

## Input

Fix a TypeScript type error in `src/utils.ts` where `any` is used on line 42. Change it to the correct type `string`.

## Expected Output (Concise)

```markdown
## Task Understanding

- **Goal**: Replace `any` with `string` on line 42 of `src/utils.ts`.
- **Scope boundaries**: One line, one file.
- **Assumptions**: The variable is confirmed to be a string from its usage.
- **Non-goals**: No broader refactors.

## Acceptance Criteria Coverage

| AC | Status | Evidence | Notes |
|---|---|---|---|
| `any` replaced with `string` | met | `src/utils.ts:42` | Type changed from `any` to `string` |

## Implementation Details

Single-line type annotation change. No behavior change.

## Files Changed

- `src/utils.ts` — line 42: changed `any` to `string`

## Verification

| Command | Result | Proves | Does Not Prove |
|---|---|---|---|
| `npm run typecheck` | pass | No new type errors introduced | Runtime behavior |

## Risks and Follow-ups

- None. Risk level: **none**.

## Control Plane

```yaml
status: implemented
next_skill: fur-done
scope_respected: true
verification_state: complete
risk_level: none
```

## Suggested Next Step

Route to `fur-done` for internal check and closure.
```

## Rubric Scores

| Dimension | Score | Notes |
|---|---|---|
| Depth | 6/16 | Brief restatement, one major assumption noted, no trade-off discussion (not needed for trivial change), happy path only, file list with one-line intent, verification with coverage explanation, risk noted as none. Fits concise+standard boundary. |
| Quality | 8/10 | AC mapped, evidence present, routing correct, format matches, honest about scope. No edge case discussion because change is trivial and type is explicit. |
| Evidence | 2/3 | Short inline snippet (line reference) + path. No full snippet needed for one-line change. |
| Risk | none | Correct for trivial type fix. |
