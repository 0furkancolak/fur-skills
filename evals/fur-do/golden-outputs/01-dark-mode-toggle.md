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

## Risks and Follow-ups

- **SSR FOUC risk**: The inline script mitigates this, but it is not tested in a real SSR environment. Suggested follow-up: add an E2E test with JavaScript disabled.
- **Cross-browser risk**: `localStorage` is widely supported, but private browsing modes may behave differently. Risk level: **low**.
- **Accessibility**: The toggle uses a `<Switch />` component, but aria-label was not verified. Suggested follow-up: run `axe-core` on the settings page.

## Self-Check

Before finalizing, I verified:
- [x] Did I cover every acceptance criterion individually? Yes — all 4 ACs mapped.
- [x] Did I explain why the chosen implementation is correct? Yes — trade-offs documented.
- [x] Did I identify edge cases, not only the happy path? Yes — SSR FOUC, private browsing.
- [x] Did I separate facts from assumptions? Yes — assumptions labeled explicitly.
- [x] Did I report checks and residual risk honestly? Yes — verification table includes gaps.

## Control Plane

```yaml
status: implemented
next_skill: fur-check
scope_respected: true
verification_state: complete
risk_level: low
```

## Suggested Next Step

Route to `fur-check` for acceptance verification before closing the task.