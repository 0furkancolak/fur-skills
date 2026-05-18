# Gate Skill Example: fur-check

This example demonstrates a high-quality `fur-check` output at `responseDepth: deep` with `evidenceStyle: inline-plus-paths`.

## Input

Task: `tasks/ready/20260115-1000-add-dark-mode.md` (same as executor example)
`fur-do` output reviewed.

## Good Output (Deep)

```markdown
## Check Result

Ready

## Findings

| Severity | Finding | Evidence | Suggested Fix |
|---|---|---|---|
| Minor | `ThemeToggle.tsx` missing `aria-label` on switch | `src/components/ThemeToggle.tsx:14` | Add `aria-label="Toggle dark mode"` |
| Minor | `localStorage` access not guarded against `undefined` | `src/components/ThemeProvider.tsx:15` | Add `typeof window !== 'undefined'` check |

No blockers or major findings.

## Acceptance Criteria

| AC | Status | Evidence |
|---|---|---|
| Toggle in `/settings/appearance` | ✅ met | `src/app/settings/appearance/page.tsx:23-28` |
| State persists across sessions | ✅ met | `src/components/ThemeProvider.tsx:15-19` |
| Immediate application | ✅ met | `src/components/ThemeProvider.tsx:22` |
| Default remains light | ✅ met | `src/components/ThemeProvider.tsx:12` |

## Verification

| Command | Result | Notes |
|---|---|---|
| `npm run typecheck` | ✅ pass | Touched files only |
| `npm run test:unit ThemeProvider` | ✅ pass | All 4 assertions pass |
| Manual check | ✅ pass | Toggle works as expected |

## Gaps

- No E2E test for the toggle. Risk: **low** (covered by unit + manual).
- No cross-browser test. Risk: **low**.
- Accessibility scan not run. Risk: **medium** (two minor findings already flagged).

## Control Plane

```yaml
status: ready
next_skill: fur-done
scope_respected: true
verification_state: complete
risk_level: low
```

## Suggested Next Step

Route to `fur-done` to close the task. Address minor findings in a follow-up chore.
```

## Why This Output Is Good

- Verdict is clear (Ready / Needs changes / Needs verification).
- Findings include severity, evidence, and suggested fix direction.
- AC coverage is bullet-by-bullet with evidence.
- Verification includes commands + outcomes.
- Gaps are listed with risk levels.
- Control plane is present.
