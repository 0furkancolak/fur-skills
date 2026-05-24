# Global Anti-Patterns

These anti-patterns apply to **every** skill in the fur-skills family, regardless of class or provider.

## 1. "Done" Without AC Mapping

**Bad**:
```markdown
## Implemented
Done. Dark mode works.
```

**Why it is bad**: No acceptance criterion is mapped to evidence. The reader cannot verify what was actually completed.

**Good**:
```markdown
## Acceptance Criteria Coverage
| AC | Status | Evidence |
|---|---|---|
| Toggle exists | ✅ met | `page.tsx:23-28` |
```

## 2. Vague Uncertainty

**Bad**:
```markdown
## Risks
Should be fine.
```

**Why it is bad**: Hides uncertainty behind optimistic language. Risks must be stated plainly with severity.

**Good**:
```markdown
## Risks
- SSR FOUC risk: **low**; mitigated by inline script.
```

## 3. File List Without Intent

**Bad**:
```markdown
## Files changed
- src/components/ThemeProvider.tsx
- src/app/settings/appearance/page.tsx
```

**Why it is bad**: The reader cannot infer why each file was touched.

**Good**:
```markdown
## Files changed
- `src/components/ThemeProvider.tsx` — added theme state and localStorage sync
- `src/app/settings/appearance/page.tsx` — added ThemeToggle component
```

## 4. Checks Without Coverage Explanation

**Bad**:
```markdown
## Checks
npm run test
```

**Why it is bad**: No result, no explanation of what the check proves or does not prove.

**Good**:
```markdown
## Verification
| Command | Result | Proves | Does Not Prove |
|---|---|---|---|
| `npm run test:unit ThemeProvider` | ✅ pass | State updates work | Runtime browser behavior |
```

## 5. Optimizing for Shortness Over Auditability

**Bad**:
```markdown
## Implemented
Fixed it. See diff.
```

**Why it is bad**: The diff alone does not explain intent, trade-offs, or risks. The output must be auditable without re-reading the whole chat.

**Good**:
```markdown
## Implementation Details
I chose X over Y because Z. The trade-off is A, which is acceptable because B.
```

## 6. Visible "Think Step by Step" on Reasoning Models

**Bad**:
```markdown
Think step by step and explain your reasoning before giving the answer.
```

**Why it is bad**: Modern reasoning models (o1, Claude 3.5 Sonnet with thinking) already reason internally. Visible CoT prompts can degrade performance or produce verbose, unhelpful output.

**Good**:
Use a structured self-check list instead:
```markdown
Before finalizing, verify:
- [ ] Did I cover every acceptance criterion?
- [ ] Did I separate facts from assumptions?
```

## 7. Wrong Next-Skill Routing

**Bad**:
```markdown
## Suggested Next Step
fur-done
```

When neither `fur-do` micro auto-close nor `fur-done` internal check gate will run.

**Why it is bad**: Bypasses the quality gate. Micro tasks may auto-close from `fur-do`; standard and major tasks must route to `fur-done`, which runs the internal check gate.

**Good**:
```markdown
## Suggested Next Step
Route to `fur-done`; it will run the internal check gate before closing.
```

## 8. Invented Check Results

**Bad**:
```markdown
## Checks
- All tests pass ✅
```

When tests were not actually run.

**Why it is bad**: Fabricated evidence destroys trust and leads to false confidence.

**Good**:
```markdown
## Checks
- `npm run test` — not run (tooling not available in this environment)
- Manual check: verified toggle works in local dev server ✅
```

## 9. Scope Creep in Output

**Bad**:
```markdown
## Implemented
Also refactored the auth module and updated the landing page while I was at it.
```

**Why it is bad**: Changes outside the task scope are not reviewable against acceptance criteria and increase regression risk.

**Good**:
```markdown
## Implemented
Applied the narrowest diff that satisfies the task AC. No unrelated files touched.
```

## 10. Missing Control Plane

**Bad**:
No YAML block at the end.

**Why it is bad**: The output is not machine-parseable for automation, regression testing, or eval grading.

**Good**:
```yaml
status: implemented
next_skill: fur-done
scope_respected: true
verification_state: complete
risk_level: low
```
