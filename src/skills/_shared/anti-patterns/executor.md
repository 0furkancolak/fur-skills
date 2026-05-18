# Executor Anti-Patterns

Anti-patterns specific to executor skills (`fur-do`, `fur-ui-clone`).

## 1. Scope Creep

**Bad**:
```markdown
## Implemented
Added dark mode toggle. Also refactored the entire settings page layout and updated the navigation bar.
```

**Good**:
```markdown
## Implemented
Added dark mode toggle to `/settings/appearance`. No other pages modified.
```

## 2. Missing Assumption Labels

**Bad**:
```markdown
## Implementation Details
Used localStorage because it is the best option.
```

**Good**:
```markdown
## Implementation Details
**Assumption**: localStorage is available in all target browsers. Alternative (cookie) would require backend changes, which is out of scope.
```

## 3. Happy Path Only

**Bad**:
```markdown
## Verification
Toggle works when clicked.
```

**Good**:
```markdown
## Verification
| Scenario | Result |
|---|---|
| Toggle on | ✅ works |
| Toggle off | ✅ works |
| Refresh after toggle | ✅ persists |
| Private browsing | ⚠️ not tested |
```

## 4. No User-Facing Explanation

**Bad**:
```markdown
## Implemented
See diff.
```

**Good**:
```markdown
## Executive Summary
Added a `<ThemeToggle>` component to the appearance settings page. The toggle state is stored in `localStorage` and applied immediately via a `data-theme` attribute on `<html>`. An inline script prevents FOUC during SSR.
```
