---
name: fur-debug
description: Diagnose a failing test, runtime error, stack trace, broken behavior, regression, or production bug when the root cause is unknown.
---

# fur-debug

Use this skill when something is broken and the root cause is unknown.

## Goal

Find the root cause before fixing.

## Workflow

1. Observe the failure.
2. Reproduce or identify the smallest failing path.
3. List likely causes.
4. Inspect targeted files.
5. Apply the smallest root-cause fix.
6. Verify the fix.

## Rules

- No fix before investigation.
- Do not rewrite unrelated code.
- Do not silence errors without explaining why.
- Prefer root-cause fix over workaround.
- If verification cannot be run, explain why.

## Output

```md
## Root cause

## Evidence

## Fix

## Verification

## Remaining risk
```
