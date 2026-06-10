# Golden Output 1: Dark Mode Toggle (Happy Path, Deep)

## Input

Implement a dark mode toggle in the settings page.

**Active task**: `tasks/ready/20260115-1000-add-dark-mode.md`

```markdown
# Add dark mode toggle

## Type
feature

## Context
Users requested dark mode support in the settings panel.

## Goal
A toggle in the settings panel switches the app between light and dark themes.

## Non-goals
- No system-preference auto-detect in this task.
- No animation transitions.

## Acceptance Criteria
- [ ] A toggle exists in `/settings/appearance`.
- [ ] Toggle state persists across sessions (localStorage).
- [ ] Theme change applies immediately without reload.
- [ ] Existing light mode remains the default.

## Implementation Notes
- Use existing `ThemeProvider` in `src/components/ThemeProvider.tsx`.
- Add `theme` state: `"light" | "dark"`.
- Use CSS variables for colors.

## Suggested Files
- `src/components/ThemeProvider.tsx`
- `src/app/settings/appearance/page.tsx`
- `src/styles/variables.css`

## Verification
- `npm run typecheck`
- `npm run test:unit ThemeProvider`
- Manual: open /settings/appearance, toggle, verify theme changes.

## Risks
- Theme flash on page load if not handled during SSR.
```

## Expected Output (Deep)

```markdown
## Task Understanding

- **Goal**: Add a dark mode toggle to `/settings/appearance` that persists and applies immediately.
- **Scope boundaries**: No auto-detect, no animations, default stays light.
- **Assumptions**: `ThemeProvider` exists and wraps the app root; localStorage is available; CSS variables are the source of truth.
- **Non-goals**: System-preference detection, animated transitions.

## Acceptance Criteria Coverage

| AC | Status | Evidence | Notes |
|---|---|---|---|
| Toggle in `/settings/appearance` | met | `src/app/settings/appearance/page.tsx:23-28` | Added `<ThemeToggle />` component |
| State persists across sessions | met | `src/components/ThemeProvider.tsx:15-19` | `localStorage.setItem('theme', ...)` on change |
| Immediate application | met | `src/components/ThemeProvider.tsx:22` | `document.documentElement.setAttribute('data-theme', theme)` |
| Default remains light | met | `src/components/ThemeProvider.tsx:12` | Default state initialized to `"light"` |

## Implementation Details

I chose to store the theme preference in `localStorage` with key `theme` because it is the simplest persistence mechanism that works across all browsers. The alternative was a server-side cookie, but that would require a backend change and is out of scope.

To prevent a flash of unstyled content on SSR, I added a small inline script in `src/app/layout.tsx` that reads `localStorage` before React hydrates. This is a known pattern and is documented in the task risks.

```tsx
// src/app/layout.tsx:8-14
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
      })();
    `
  }}
/>
```

## Files Changed

- `src/components/ThemeProvider.tsx` — added `theme` state, localStorage sync, and data-theme attribute setter
- `src/app/settings/appearance/page.tsx` — added `<ThemeToggle />` import and usage
- `src/components/ThemeToggle.tsx` — new file; toggle UI with `<Switch />`
- `src/app/layout.tsx` — added inline script to prevent FOUC on SSR
- `src/styles/variables.css` — added `[data-theme="dark"]` overrides for color tokens

## Verification

| Command | Result | Proves | Does Not Prove |
|---|---|---|---|
| `npm run typecheck` | pass | No TypeScript errors in touched files | Runtime behavior |
| `npm run test:unit ThemeProvider` | pass | State updates and localStorage mock work | Actual browser localStorage |
| Manual check | pass | Toggle works, theme persists, no reload needed | Cross-browser compatibility |

## Self-Check

Before finalizing, I verified:
- [x] Did I cover every acceptance criterion individually? Yes — all 4 ACs mapped.
- [x] Did I explain why the chosen implementation is correct? Yes — trade-offs documented.
- [x] Did I identify edge cases, not only the happy path? Yes — SSR FOUC, private browsing.
- [x] Did I separate facts from assumptions? Yes — assumptions labeled explicitly.
- [x] Did I report checks and residual risk honestly? Yes — verification table includes gaps.

## Risks and Follow-ups

- SSR theme flash was mitigated with an inline pre-hydration script. Risk level: **low**.

## Control Plane

```yaml
status: implemented
next_skill: fur-done
scope_respected: true
verification_state: complete
risk_level: low
```

```

## Rubric Scores

| Dimension | Score | Notes |
|---|---|---|
| Depth | 16/16 | Full restatement, all assumptions labeled, trade-offs discussed, edge cases covered, explicit self-check list visible, full file list with rationale, verification with coverage gaps, risk with severity and mitigation. |
| Quality | 10/10 | Every AC mapped to evidence, every claim has source, routing is correct, format matches spec, no invented results. |
| Evidence | 3/3 | Full inline snippets + permanent file paths (inline-plus-paths). |
| Risk | low | Appropriate for the scope. |
