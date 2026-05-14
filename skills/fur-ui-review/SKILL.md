---
name: fur-ui-review
description: Review implemented UI for visual hierarchy, consistency, responsive behavior, accessibility, motion, and empty/loading/error states. Complements code-focused fur-check.
---

# fur-ui-review

Human-facing quality pass for **implemented** UI — complements `fur-check` (logic/AC), does not replace it.

## Goal

Surface **blocker** UX/a11y issues and ordered improvements with repro steps so `fur-do` can fix without redesign arguments.

## When to Use

- After meaningful UI changes (`fur-do`) or before merge of UI-heavy PRs.
- User asks for visual / UX / responsive critique.
- Pair with `fur-check`: this file covers look-and-feel; `fur-check` covers correctness and tests.

## When NOT to Use

- No UI delta → `fur-check` only.
- Direction not chosen yet → `fur-ui-design`.
- Need DOM-faithful clone of external reference → `fur-ui-clone`.
- Code not written → `fur-do` first.

## Workflow

### Phase 1: Scope the surface

1. Identify routes, stories, or components changed; list primary file paths.
2. Note design source: Figma link, `fur-ui-design` doc, DS tokens, or “consistency with adjacent screens”.

### Phase 2: Environment pass

1. Run the app (or Storybook) if available; otherwise read static markup/CSS carefully and say “not run”.
2. Capture at least **two** widths (e.g. 1280 + 390) for layout regressions; add tablet if navigation changes.

### Phase 3: Checklist sweep

Apply the checklist below in order; note file + element for each finding.

### Phase 4: Severity + verification recipe

1. Tag each item **Blocker** / **Suggestion** / **Nit** with definitions:
   - **Blocker**: breaks usability, WCAG failure on critical path, unreadable contrast, layout collapse, traps focus.
   - **Suggestion**: hurts clarity, inconsistent tokens, missing empty state.
   - **Nit**: alignment, minor motion, copy polish.
2. Blockers must include **how to verify the fix** (click path, keyboard sequence).

## Checklist

- **Visual hierarchy**: scan order, contrast, primary vs secondary actions, density vs whitespace.
- **Consistency**: spacing rhythm, type scale, color vs design tokens, component reuse vs one-offs.
- **Responsive**: breakpoints, overflow-x, image aspect, tap targets (min ~44px where applicable), readable line length.
- **Accessibility**: semantics, labels for icon-only controls, focus order, keyboard traps, skip links where relevant, motion reduction.
- **States**: loading / empty / error / disabled; skeleton vs spinner appropriateness.
- **Polish**: z-index stacking, scroll jank, animation timing, hover vs touch behavior.

## Rules

- Tie notes to **paths** (and line numbers when static review).
- Separate Blocker vs Suggestion vs Nit — never bury a Blocker in a nit list.
- If no design system exists, judge **internal consistency** of the change set.
- Do not rewrite entire screens unless explicitly requested; give ordered, smallest-first fixes.
- If you cannot run the UI, be explicit and rely on code inspection — do not pretend you saw pixels.

## Output

```md
## UI summary

## Blockers

[must-fix + repro steps]

## Suggestions

## Nits

## Accessibility notes

## Responsive notes

## Motion / states notes

## Verification recipe

[numbered manual steps: URLs, clicks, keyboard, resize]
```

## Suggested Next Step

Fix blockers via `fur-do`, then rerun this review. When clean, run `fur-check` for logic/tests and `fur-done` when the whole task is ready to close.
