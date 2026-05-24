# Superpowers Bridge

Fur is the primary workflow and router. Superpowers is an optional methodology bridge for heavier work.

Do not copy Superpowers skill content into this repo. Do not fork, vendor, install, or require Superpowers from Fur. Only require Superpowers when project config explicitly sets `methodology.superpowers.mode` to `required`; the default is optional.

If Superpowers is unavailable and mode is `optional`, continue with Fur native behavior and record the fallback in the control plane.

## Config

Default `.fur.planning/config.json`:

```json
{
  "methodology": {
    "superpowers": {
      "enabled": true,
      "mode": "optional",
      "fallback": "fur-native"
    }
  }
}
```

- `enabled: true` means the bridge may be considered.
- `mode: optional` means use Superpowers only when available and appropriate.
- `fallback: fur-native` means never fail only because Superpowers is missing.

## When to use Fur native flow

Use Fur native flow when:

- The task is tiny, clear, or low risk.
- No production behavior changes are involved.
- Root cause is already known.
- No multi-step plan execution is needed.
- No strict verification or independent review is needed.

## When to delegate to Superpowers

Delegate only when the task benefits from heavier methodology:

- Ambiguous feature, design, product, or architecture work.
- Approved spec/design needs implementation planning.
- Unknown root-cause debugging.
- Risky production behavior changes or critical flows.
- Multi-step plan execution.
- Strict verification or independent code review.
- Branch/worktree finishing decisions.

## Routing

| Fur skill | Optional Superpowers delegation |
|---|---|
| `fur-task` | `superpowers:brainstorming` for ambiguous/product/architecture/design-heavy work; `superpowers:writing-plans` for approved specs/designs that need implementation plans. |
| `fur-do` | `superpowers:using-git-worktrees` when implementation should not happen on the current branch; `superpowers:test-driven-development` for production behavior changes, critical flows, or bugfixes needing acceptance tests; `superpowers:subagent-driven-development` for approved multi-task plans when subagents are available; `superpowers:executing-plans` for approved multi-task plans without subagents. |
| `fur-debug` | `superpowers:systematic-debugging` when root cause is unknown; `superpowers:verification-before-completion` after a fix must be verified. |
| `fur-check` | `superpowers:verification-before-completion` when `verificationStrictness` is strict or critical production behavior changed; `superpowers:requesting-code-review` when independent review is required; `superpowers:receiving-code-review` when review feedback must be processed. |
| `fur-done` | `superpowers:finishing-a-development-branch` when work happened on a branch/worktree and merge/PR/keep/discard cleanup matters. |
| `fur-status` | No delegation. Report bridge status only when config contains it. |

## Control Plane

When a bridge decision is made, include:

```yaml
control_plane:
  methodology_bridge:
    provider: superpowers
    selected_skill: superpowers:brainstorming
    used: true
    mode: optional
    fallback: fur-native
    fallback_used: false
    reason: "Task is ambiguous and needs design clarification before implementation planning."
```

For native flow:

```yaml
control_plane:
  methodology_bridge:
    provider: superpowers
    selected_skill: null
    used: false
    mode: optional
    fallback: fur-native
    fallback_used: false
    reason: "Task is small and clear; Fur native task flow is sufficient."
```

If Superpowers is unavailable in optional mode, set `used: false`, `fallback_used: true`, and continue with Fur native flow.
