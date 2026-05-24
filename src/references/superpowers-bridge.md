# Superpowers Bridge

Fur is the primary workflow and router. Superpowers is an optional methodology bridge for heavier work.

Do not copy Superpowers skill content into this repo. Do not fork, vendor, install, or require Superpowers from Fur. Only require Superpowers when project config explicitly sets `methodology.superpowers.mode` to `required`; the default is optional.

If Superpowers is unavailable and mode is `optional`, continue with `fur-skills` behavior and record the fallback only when it matters for routing.

## Config

Default `.fur.planning/config.json`:

```json
{
  "methodology": {
    "superpowers": {
      "enabled": true,
      "mode": "optional",
      "fallback": "fur-skills"
    }
  }
}
```

- `enabled: true` means the bridge may be considered.
- `mode: optional` means use Superpowers only when available and appropriate.
- `fallback: fur-skills` means never fail only because Superpowers is missing.

## When to use fur-skills flow

Use `fur-skills` flow when:

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

Keep the default control plane small:

```yaml
status: created
next_skill: fur-do
```

Add `methodology_bridge` only when the bridge materially affects routing:

```yaml
methodology_bridge:
  provider: superpowers
  selected_skill: superpowers:brainstorming
  fallback: fur-skills
```

For ordinary `fur-skills` flow, omit `methodology_bridge` unless the user asked about bridge routing. If Superpowers is unavailable in optional mode, set only `fallback: fur-skills` when reporting the bridge decision.
