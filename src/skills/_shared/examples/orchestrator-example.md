# Orchestrator Skill Example: fur-status

Concise `fur-status` output. Plain text only — no YAML footer.

## Input

User says: "What's the status?"

## Good Output (Concise)

```markdown
## Summary

- Backlog: 0 · Ready: 3 · Done: 12
- Plans: 1 active

## Plan summary

`auth-refactor`: 25% (2/8 done) · next: T3 unit tests

## Latest Snapshot

- Last refresh: 2026-01-15 09:30
- In progress: dark mode toggle

## Next Action

CI yeşil olunca merge; sonra Epic 7 audit veya Epic 9.
```

## Why This Output Is Good

- Under 30 seconds to read.
- Counts and one plan line are clear.
- **Next Action** is plain prose — no `status:` / `next_skill:` block.
- Caveman OK here because `responseDepth: concise` and user prefers terse Turkish.
