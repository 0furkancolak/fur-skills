# Orchestrator Skill Example: fur-status

This example demonstrates a high-quality `fur-status` output at `responseDepth: concise`.

## Input

User says: "What's the status?"

## Good Output (Concise)

```markdown
## Summary

3 tasks ready, 1 in progress, 12 done.

## Latest Snapshot

`progress/latest.md` — last updated 2026-01-15 09:30.
Dark mode toggle implementation in progress (`fur-do`).

## Next Action

`fur-check` on `tasks/ready/20260115-1000-add-dark-mode.md` once implementation completes.

## Control Plane

```yaml
status: orienting
next_skill: fur-check
scope_respected: true
verification_state: not-run
risk_level: none
```
```

## Why This Output Is Good

- Under 30 seconds to read.
- Counts are clear.
- One concrete next action.
- Control plane is present even in concise mode.
