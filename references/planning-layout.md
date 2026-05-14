# Fur Planning Layout

`fur init` creates repo-local planning state:

```txt
.fur.planning/
  README.md
  config.json
  tasks/
    backlog/
    ready/
    done/
  plans/
  progress/
    archive/
  context/
    archive/
    issue-tracker.md
    mcp.md
    verification.md
```

## Repo-Local Config

`.fur.planning/config.json` controls local agent behavior:

```json
{
  "version": 1,
  "planningDir": ".fur.planning",
  "gitignore": true,
  "localTaskMode": "local-markdown",
  "questionLevel": "high",
  "projectMaturity": "new",
  "questionPolicy": {
    "askBeforeSplittingLargeTasks": true,
    "askWhenAcceptanceCriteriaMissing": true,
    "askWhenTrackerConfigAmbiguous": true,
    "askWhenRiskIsHigh": true
  },
  "createdAt": "2026-05-14T09:30:00Z"
}
```

- `questionLevel`: `low`, `normal`, or `high`.
- `projectMaturity`: `new` or `established`.
- New projects default to `high`; established projects usually use `normal`.
- Tracker source selection does not live here; it lives in workspace config.

## Workspace Config

Multi-repo tracker-aware work uses:

```txt
.fur.workspace/config.json
```

Create it from the parent workspace folder:

```bash
fur workspace init
fur workspace doctor
```

Example:

```json
{
  "version": 1,
  "defaultTaskSource": "local",
  "writePolicy": "config-allowed",
  "repositories": [
    {
      "id": "nafru-website",
      "path": "nafru/nafru-website",
      "github": {
        "owner": "OWNER",
        "repo": "REPO",
        "issuePrefix": "#",
        "mcp": "github",
        "writeAllowed": true,
        "closeAllowed": true
      },
      "jira": {
        "projectKeys": ["NAF"],
        "mcp": "atlassian",
        "writeAllowed": true,
        "transitionAllowed": true
      }
    }
  ]
}
```

## Directory Rules

- `tasks/backlog`: draft or not-yet-ready tasks.
- `tasks/ready`: ready-to-implement tasks.
- `tasks/done`: completed tasks.
- `plans`: phase plans and parallel slices.
- `progress`: snapshots from `fur refresh`; old files can move to `progress/archive/`.
- `context`: project-specific notes; archive long digests under `context/archive/`.

## Tracker Rules

- `repositories[].path` is relative to the workspace root.
- Jira short keys such as `NAF-11` resolve through `jira.projectKeys`.
- GitHub shorthand such as `#56` resolves through the current repo path.
- External writes require `writePolicy: "config-allowed"` and the tracker-specific permission flag.
