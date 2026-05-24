# Failure Modes: fur-task

| Failure mode | Symptom | Detection | Mitigation |
|---|---|---|---|
| Task too big | Single task cannot complete in one session | File size / AC count > 5 | Enforce splitting in skill rules |
| Missing AC | Task has no acceptance criteria | AC section empty or missing | Require AC before ready/ promotion |
| Skips needed clarification | Ready task created from vague product intent with invented AC/scope | `## Clarifications` says none despite missing behavior, verification, or boundary | Ask 1-3 concrete questions, or use `superpowers:brainstorming` when bridge is enabled |
| Invented tracker metadata | Labels, assignees, IDs fabricated | Compare with workspace config | Only write when writeAllowed true |
| Ambiguous routing silent default | Repo ID guessed without asking | Multiple repo match without question | Disambiguation question mandatory |
| No verification section | Task lacks how-to-check | Verification section empty | Verification required before ready/ |
| Wrong next skill | Planner routes to fur-do on blocked task | next_skill check | Blocked tasks route to fur-task |
| Tiny task delegated to Superpowers | Typo or small README task selects `superpowers:*` | `expected_methodology_bridge.used: false` fixtures | Keep fur-skills flow for tiny and clear tasks |
| Missing fallback record | Superpowers unavailable but fallback is not clear when bridge routing was considered | Control plane lacks `fallback: fur-skills` | Record `fallback: fur-skills` only when bridge routing matters |
