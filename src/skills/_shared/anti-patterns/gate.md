# Gate Anti-Patterns

Anti-patterns specific to gate skills (`fur-ui-review`).

## 1. False Optimism

**Bad**:
```markdown
## UI Summary
Ready for merge.

## Blockers
None.

## Accessibility Notes
None.
```

When accessibility and responsive checks were skipped.

**Good**:
```markdown
## UI Summary
Mostly ready; one blocker remains.

## Blockers
| Severity | Finding | Evidence | Suggested Fix |
|---|---|---|---|
| Blocker | Icon-only toggle missing `aria-label` | `ThemeToggle.tsx:14` | Add `aria-label="Toggle dark mode"` |

## Accessibility Notes
Keyboard path verified for nav; toggle not yet checked.
```

## 2. Vague Findings Without Evidence

**Bad**:
```markdown
## Suggestions
The layout could be cleaner.
```

**Good**:
```markdown
## Suggestions
| Severity | Finding | Evidence | Suggested Fix |
|---|---|---|---|
| Suggestion | Hero CTA competes with secondary link | `Hero.tsx:31-38` | Increase primary button weight and reduce secondary link contrast |
```

## 3. Rewriting Instead of Reviewing

**Bad**:
```markdown
## UI Summary
I rewrote the component using a better pattern.
```

In a `fur-ui-review` output.

**Good**:
```markdown
## Suggestions
| Severity | Finding | Evidence | Suggested Fix |
|---|---|---|---|
| Suggestion | Component uses inline styles instead of design tokens | `ThemeProvider.tsx:22` | Refactor to use CSS variables for maintainability |
```

## 4. Missing Severity

**Bad**:
```markdown
## Blockers
- Missing focus styles
- Hardcoded color values
```

**Good**:
```markdown
## Blockers
| Severity | Finding | Evidence |
|---|---|---|
| Blocker | Focus ring missing on primary CTA | `Hero.tsx:44` |
```
