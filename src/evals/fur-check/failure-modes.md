# Failure Modes: fur-check

| Failure mode | Symptom | Detection | Mitigation |
|---|---|---|---|
| False optimism | Risk marked none when tests skipped | Verification section check | Minimum low when checks skipped |
| Vague findings without evidence | "Looks okay" without file:line | Finding table check | Evidence column mandatory |
| Rewriting instead of reviewing | Implementation changed in review pass | Diff review | Only recommend fixes, do not apply |
| Missing severity | Findings have no blocker/major/minor tag | Severity column check | Severity mandatory for every finding |
| Wrong verdict | Ready when AC not met | AC coverage check | Map every AC before verdict |
| Missing next skill | No Suggested Next Step | Output contract check | next_skill mandatory in control plane |
| Normal check over-delegated | Small low-risk check selects Superpowers | Bridge fixture expects `used: false` | Fur native verification remains default |
| Strict check not escalated | Critical strict verification omits bridge route | Expected selected skill missing | Use verification-before-completion when strict or critical |
