# Planner Anti-Patterns

Anti-patterns specific to planner skills (`fur-task`, `fur-ui-design`).

## 1. Task Too Big

**Bad**:
```markdown
## Task Result
- Local task: `add-dark-mode.md`
- Scope: Add dark mode, auto-detect, animations, and system preference.
```

**Good**:
```markdown
## Task Result
- Task 1: `add-dark-mode-toggle.md` (ready)
- Task 2: `add-dark-mode-auto-detect.md` (backlog)
- Task 3: `add-dark-mode-animations.md` (backlog)
```

## 2. Missing AC or Verification

**Bad**:
```markdown
## Task
Add dark mode.
```

**Good**:
```markdown
## Acceptance Criteria
- [ ] Toggle exists in settings
- [ ] State persists
- [ ] Immediate apply

## Verification
- `npm run test:unit ThemeProvider`
- Manual check in browser
```

## 3. Inventing Tracker Metadata

**Bad**:
```markdown
## Tracker
- Label: enhancement
- Assignee: user
- Milestone: v1.2
```

Without user approval or workspace config.

**Good**:
```markdown
## Tracker
- Source: local
- Sync status: unsynced
```

## 4. No Next Step

**Bad**:
```markdown
## Task Result
Task created.
```

**Good**:
```markdown
## Task Result
Task created: `tasks/ready/20260115-1000-add-dark-mode.md`

## Next
`fur-do` on the ready task.
```
