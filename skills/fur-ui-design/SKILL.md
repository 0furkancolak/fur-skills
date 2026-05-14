---
name: fur-ui-design
description: Produce or refine UI design direction before coding — layout, typography, color, motion, and copy tone — aligned with existing product or a reference moodboard.
---

# fur-ui-design

Use **before** substantial UI implementation when the user wants a clear visual direction.

## Goal

Deliver a concise **design contract** the implementer can follow without guessing.

## When to Use

- Before coding a new screen or page
- When the visual direction is unclear or undecided
- When the user asks "how should this look?"
- When defining or extending a design system

## When NOT to Use

- The UI is already designed and just needs implementation — use `fur-do`
- You need to clone a reference site — use `fur-ui-clone`
- You need to review implemented UI — use `fur-ui-review`
- You need to review code quality — use `fur-check`

## Inputs

- Product audience and primary job-to-be-done (1–3 sentences).
- Constraints: brand guidelines, design system, dark mode, RTL, platform (web/mobile).
- Optional: reference links or screenshots (respect rights; see `fur-ui-clone` for deep reference breakdown).

## Workflow

1. **Define user flows**: Identify 1–2 hero user flows this UI must support.
2. **Propose layout**: Grid, key sections, navigation pattern, content hierarchy.
3. **Typography**: Define roles (display/title/body/caption), font sizes, max widths, line heights.
4. **Color**: Define semantic roles (bg/surface/text/muted/border/primary/danger), not 50 arbitrary swatches.
5. **Components**: List critical UI blocks and their interaction rules (states, transitions).
6. **Motion**: Define only where it clarifies hierarchy; respect reduced motion preferences.
7. **Copy tone**: Provide examples for headings, buttons, errors, empty states.

## Rules

- Avoid generic "AI slop" aesthetics; pick a **clear** direction (one adjective + one reference vibe is enough).
- Keep the artifact **short**; long rationale goes to `plans/` or `.fur.planning/context/` with a link.
- Do not implement code in this skill unless the user explicitly asks for a spike.
- All color definitions must use semantic roles, not raw hex values with no context.
- Every interactive element must have its states defined (default, hover, focus, active, disabled).

## Output

```md
## Intent & Audience

[1–3 sentences about who this is for and what they need to accomplish]

## Layout

[grid, sections, navigation pattern]

## Typography

[roles, sizes, weights, max widths]

## Color (Semantic)

[semantic color roles with values]

## Key Components

[list of components with interaction rules]

## Motion

[where and why motion is used; reduced-motion fallback]

## Copy Tone

[examples for headings, buttons, errors]

## Open Questions for User

[unresolved design decisions]
```

## Suggested Next Step

`fur-task` (link the design summary to a task) → `fur-do` → `fur-ui-review` → `fur-check`. If detailed reference breakdown from a site is needed first, use `fur-ui-clone`.
