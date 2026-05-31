# Failure Modes: fur-do

| Failure mode | Symptom | Detection | Mitigation |
|---|---|---|---|
| Scope creep | Task dışı dosyalar değişir | Files Changed + git diff | Non-goals zorunlu, scope_respected false |
| Missing AC mapping | "Done" denir ama AC yoktur | Required heading + AC table check | AC coverage section zorunlu |
| Fabricated verification | Test koşmadan passed yazar | Grader heuristic | Command + result + what it proves zorunlu |
| Wrong routing | fur-do direkt fur-done önerir | next_skill enum check | success_next fur-check |
| Happy path only | Edge case ve failure path yoktur | Verification table check | What it does not prove zorunlu |
| No assumption labels | Varsayımlar açıkça belirtilmemiş | Assumption check | Assumptions section zorunlu |
| External methodology delegation | Implementation selects an external methodology from inside Fur | Output contains external skill routing | Use fur-skills execution for the selected task |
| Fur state skipped | Execution omits task/progress handoff | Missing Fur state notes | Fur state management remains mandatory |
