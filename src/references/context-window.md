# Context Window (Token Budget)

Purpose: Keep only **currently relevant** information in the agent or chat context — avoid carrying unnecessary old details.

## Default Reading Order (Read These First)

1. `.fur.planning/progress/latest.md` — short summary; do not load all progress files individually.
2. **Active task** (the target file in `ready/` or the user-provided task).
3. Only the relevant files under `.fur.planning/context/` (e.g., `verification.md`, `mcp.md`); do not dump everything.

## Old Tasks and Topics

- **Completed tasks**: Do not paste the full text into chat; provide a **file path or link** to `tasks/done/`.
- **Backlog items far behind or stale**: Move long bodies to `context/archive/`; leave a 5–10 line **summary + link to archive** in the original file (agents can do this automatically).
- **Plan files**: For parallel or multi-step work, define branches in a single plan file under `plans/`. Do not load the entire plan history each time; summarize the current section.

## Parallel Work (No Separate Skill)

Parallel work is defined **when writing tasks or plans**:

- Independent slices (branch / worktree / owner) are documented clearly in the plan text.
- Example: In the same plan file, use `## Parallel Slice A`, `## Parallel Slice B`, each with `git worktree add ...` suggestions.

## Automatic Compaction (CLI)

To move old progress snapshots to the archive:

```bash
fur compact
```

Default: At most **8** timestamped `.md` snapshots remain in the `progress/` root; older ones are moved to `progress/archive/`. The `latest.md` symlink target is always preserved.

Override:

```bash
export FUR_PROGRESS_KEEP=5
fur compact
```

## Agent Rules (Summary)

- Summarize long history; use `context/archive/` if needed.
- Run `fur refresh` after every meaningful milestone; run `fur compact` when needed.
- When giving status updates, `latest.md` + active task summary is sufficient — do not re-read every old snapshot.
- Never carry the full text of more than 2–3 active tasks in chat context at once.
- Link to files instead of pasting their contents when the content is longer than ~50 lines.