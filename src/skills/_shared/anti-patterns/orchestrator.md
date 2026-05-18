# Orchestrator Anti-Patterns

Anti-patterns specific to orchestrator skills (`fur-init`, `fur-status`, `fur-done`).

## 1. Dumping Everything

**Bad**:
```markdown
## Status
Here is every task ever created...
[50 tasks listed]
```

**Good**:
```markdown
## Summary
3 ready, 1 in progress, 12 done.
```

## 2. No Next Action

**Bad**:
```markdown
## Status
You have 5 tasks.
```

**Good**:
```markdown
## Next Action
`fur-do` on `tasks/ready/20260115-1000-add-dark-mode.md`.
```

## 3. Updating Trackers Without Permission

**Bad**:
```markdown
## Done
Closed Jira issue NAF-11.
```

Without explicit user approval or workspace config.

**Good**:
```markdown
## Done
Task moved to `tasks/done/`.
Tracker sync: skipped (no write permission in workspace config).
```

## 4. Missing Snapshot

**Bad**:
```markdown
## Done
Task complete.
```

Without creating a progress snapshot.

**Good**:
```markdown
## Done
Task moved to `tasks/done/`.
Snapshot: `progress/20260115-1000-dark-mode.md`
```
