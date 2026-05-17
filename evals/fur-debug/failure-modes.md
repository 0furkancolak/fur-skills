# Failure Modes: fur-debug

| Failure mode | Symptom | Detection | Mitigation |
|---|---|---|---|
| Fix before loop | Code changed before repro built | Fix section appears before Feedback Loop | Enforce loop-first rule |
| Single hypothesis | Only one cause considered | Hypotheses count < 3 | Require 3-5 ranked hypotheses |
| No regression guard | Fix applied without test or doc | Verification section lacks regression | Regression test or explicit gap doc |
| Unfalsifiable hypothesis | "Something is wrong with network" | Hypothesis lacks prediction | Falsifiable prediction required |
| Scope creep | Refactors mixed with diagnosis | Files Changed outside symptom area | No unrelated refactors rule |
| Silent artifact gap | User asked for HAR/dump but not mentioned | Ask section missing | Explicitly list tried steps and gaps |
