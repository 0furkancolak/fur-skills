# Fur Planlama Yapısı

`fur init` repo-local planlama durumunu oluşturur:

```txt
.fur.planning/
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

`.fur.planning/config.json` local ajan davranışını yönetir:

```json
{
  "version": 1,
  "planningDir": ".fur.planning",
  "gitignore": true,
  "localTaskMode": "local-markdown",
  "questionLevel": "high",
  "projectMaturity": "new",
  "responseDepth": "standard",
  "evidenceStyle": "inline",
  "verificationStrictness": "normal",
  "automationMode": "guided",
  "methodology": {
    "superpowers": {
      "enabled": true,
      "mode": "optional",
      "fallback": "fur-skills",
      "brainstormingPolicy": "config-mandatory"
    }
  },
  "planning": {
    "planLock": "enabled",
    "defaultExecution": "subagent-driven",
    "batchExecution": "enabled"
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

`methodology.superpowers` opsiyonel metodoloji köprüsünü yönetir. Varsayılan olarak etkindir, `optional` modda çalışır ve Superpowers yoksa `fur-skills` fallback kullanır. `brainstormingPolicy: "config-mandatory"` ile task/plan üretimi varsayılan olarak brainstorming kapısından geçer.

`planning.planLock` aynı projedeki farklı conversation'ların birbirinin aktif planına atlamasını engeller. `planning.defaultExecution: "subagent-driven"` multi-task planlarda varsayılan uygulama yöntemidir. `planning.batchExecution: "enabled"` aynı plan lock içindeki bağımsız ready wave task'larının tek batch olarak yürütülmesini sağlar.

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
