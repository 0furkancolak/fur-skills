# Diagnostic Anti-Patterns

Anti-patterns specific to diagnostic skills (`fur-debug`).

## 1. Fix Before Loop

**Bad**:
```markdown
## Root Cause
I think the server is not starting, so I increased the timeout.
```

Without a reproducible feedback loop.

**Good**:
```markdown
## Feedback Loop
`npx playwright test settings.spec.ts` reproduces the timeout in CI 100% of the time.

## Root Cause
Dev server not ready before tests start.
```

## 2. Single Hypothesis

**Bad**:
```markdown
## Hypotheses Tested
1. Network flake → confirmed
```

Without exploring alternatives.

**Good**:
```markdown
## Hypotheses Tested
1. Network flake → ruled out (5/5 reproduces)
2. Dev server not ready → confirmed
3. Timeout too low → ruled out (60s also fails)
4. Headless difference → ruled out
```

## 3. No Regression Guard

**Bad**:
```markdown
## Fix
Increased timeout.
```

Without a test or prevention plan.

**Good**:
```markdown
## Fix
Changed `reuseExistingServer` to wait in CI.

## Verification
Re-ran CI 3 times: all pass.

## Prevention
Add CI smoke test for server readiness.
```

## 4. Unfalsifiable Hypothesis

**Bad**:
```markdown
## Hypothesis
Something is wrong with the network.
```

Without a prediction that can be tested.

**Good**:
```markdown
## Hypothesis
If the dev server is the cause, then forcing a fresh start in CI should eliminate the timeout.
```
