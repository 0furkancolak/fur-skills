# Gate Anti-Patterns

Anti-patterns specific to gate skills (`fur-check`, `fur-ui-review`).

## 1. False Optimism

**Bad**:
```markdown
## Check Result
Ready

## Findings
None.

## Gaps
None.
```

When verification steps were skipped.

**Good**:
```markdown
## Check Result
Ready

## Findings
Minor: missing aria-label on toggle.

## Gaps
- Accessibility scan not run (risk: low).
```

## 2. Vague Findings Without Evidence

**Bad**:
```markdown
## Findings
The code looks okay but could be cleaner.
```

**Good**:
```markdown
## Findings
| Severity | Finding | Evidence | Suggested Fix |
|---|---|---|---|
| Minor | `ThemeToggle.tsx` missing `aria-label` | `ThemeToggle.tsx:14` | Add `aria-label="Toggle dark mode"` |
```

## 3. Rewriting Instead of Reviewing

**Bad**:
```markdown
## Implemented
I rewrote the component using a better pattern.
```

In a `fur-check` output.

**Good**:
```markdown
## Findings
| Severity | Finding | Evidence | Suggested Fix |
|---|---|---|---|
| Major | Component uses inline styles instead of CSS variables | `ThemeProvider.tsx:22` | Refactor to use CSS variables for maintainability |
```

## 4. Missing Severity

**Bad**:
```markdown
## Findings
- Missing tests
- Hardcoded color values
```

**Good**:
```markdown
## Findings
| Severity | Finding | Evidence |
|---|---|---|
| Medium | Missing tests for edge cases | `ThemeProvider.test.ts` does not cover private browsing |
| Minor | Hardcoded color values | `variables.css:12` |
```
