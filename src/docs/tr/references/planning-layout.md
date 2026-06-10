# Fur Planlama Yapısı

`fur init` repo-local planlama durumunu oluşturur:

```txt
docs/ai/
  README.md
  config.json
  tasks/
    backlog/
    ready/
    done/
  plans/
  state.json
  progress/
    archive/
  context/
    archive/
    issue-tracker.md
    mcp.md
    verification.md
```

## Repo-Local Config

`docs/ai/config.json` local ajan davranışını yönetir:

```json
{
  "version": 1,
  "planningDir": "docs/ai",
  "gitignore": true,
  "localTaskMode": "local-markdown",
  "questionLevel": "high",
  "projectMaturity": "new",
  "responseDepth": "standard",
  "evidenceStyle": "inline",
  "verificationStrictness": "normal",
  "automationMode": "guided",
  "planning": {
    "planLock": "enabled"
  },
  "questionPolicy": {
    "askBeforeSplittingLargeTasks": true,
    "askWhenAcceptanceCriteriaMissing": true,
    "askWhenTrackerConfigAmbiguous": true,
    "askWhenRiskIsHigh": true
  },
  "createdAt": "2026-05-14T09:30:00Z"
}
```

`planning.planLock` aynı projedeki farklı conversation'ların birbirinin aktif planına atlamasını engeller.

Tracker yönlendirmesi burada değil, workspace config içindedir.

## Workspace Config

Çoklu repo tracker yönlendirmesi:

```txt
.fur.workspace/config.json
```

```bash
fur workspace init
fur workspace doctor
```

`NAF-11` gibi Jira key'leri `jira.projectKeys`, `#56` gibi GitHub referansları aktif repo path'i üzerinden çözülür.
