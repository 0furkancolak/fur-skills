---
name: fur-ui-review
description: Review implemented UI for visual hierarchy, consistency, responsive behavior, accessibility, motion, and empty/loading/error states. Complements code-focused fur-check.
---

# fur-ui-review

Use after UI changes or before merge when **look & feel** matters.

## Goal

Give actionable UI/UX feedback beyond correctness-only code review.

## When to Use

- After implementing UI changes
- Before merging UI-heavy features
- When the user asks for a visual/UX review
- Alongside `fur-check` for comprehensive review of UI changes

## When NOT to Use

- No UI changes were made — use `fur-check` only
- You need to design UI direction — use `fur-ui-design`
- You need to clone a reference — use `fur-ui-clone`
- Code hasn't been implemented yet — use `fur-do` first

## Workflow

1. Identify the changed UI surface and relevant files.
2. Run or inspect the app when feasible, including desktop and mobile widths.
3. Check visual hierarchy, consistency, responsive behavior, accessibility, states, and polish.
4. Report blockers before suggestions and nits.
5. Provide concrete verification steps for clicking, resizing, and keyboard navigation.

## Checklist

- **Visual hierarchy**: Scan path, contrast, primary vs secondary actions, information density.
- **Consistency**: Spacing rhythm, type scale, colors vs design tokens, component reuse.
- **Responsive**: Breakpoints, overflow, tap targets, readable line length, image scaling.
- **Accessibility**: Semantic HTML, ARIA labels, focus order, keyboard paths, motion reduction where relevant.
- **States**: Loading, empty, error, disabled; skeleton vs spinner choice.
- **Polish**: Alignment, jitter, z-index stacking, image aspect ratio, scroll behavior.

## Rules

- Tie findings to **specific components or files** when possible (include file paths and line numbers).
- Separate **Blocker** (a11y break, unreadable contrast, broken layout) vs **Suggestion** vs **Nit**.
- If no design system exists, judge internal consistency of the change itself.
- Do not rewrite the whole UI unless the user asks; prefer ordered, targeted fixes.
- Consider both desktop and mobile viewports.
- Every Blocker must include a concrete suggestion for how to fix it.

## Output

```md
## UI Summary

[1–3 sentence overview of the UI change and its quality]

## Blockers

[must-fix before merge: a11y breaks, unreadable contrast, broken layout]

## Suggestions

[improvements to hierarchy, consistency, or UX]

## Nits

[minor polish items]

## A11y Notes

[specific accessibility concerns and recommendations]

## Responsive Notes

[breakpoint issues, overflow, tap target concerns]

## Verification (What to Click / Resize / Keyboard-Test)

[step-by-step manual verification instructions]
```

## Suggested Next Step

If no blockers: `fur-check` for general code/acceptance review, then `fur-done`. If blockers exist: fix with `fur-do`, then re-run `fur-ui-review`.
