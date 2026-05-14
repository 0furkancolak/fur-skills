---
description: "Reverse-engineer and clone public website pages as pixel-perfect replicas"
---

# Clone Website

Use the `fur-ui-clone` workflow for `$ARGUMENTS`.

Clone exactly what is visible at the target URL(s). Use browser automation, write auditable specs, download real assets, build section-by-section, and run visual QA before completion.

## Required Flow

1. Validate URL(s), access, rights, and browser automation.
2. Verify the base app builds.
3. Create research/reference folders.
4. Capture desktop/tablet/mobile screenshots.
5. Extract global tokens, assets, metadata, fonts, and global interactions.
6. Write `BEHAVIORS.md` and `PAGE_TOPOLOGY.md`.
7. Build foundation: fonts, globals, icons, assets, shared types.
8. For each section: extract exact CSS/states/assets/text, write `docs/research/components/<name>.spec.md`, then dispatch/build the component.
9. Assemble the page.
10. Compare original and clone at desktop and mobile; fix discrepancies.

## Non-Negotiables

- Pixel-perfect first; no personal redesign.
- Real content and assets; no placeholders unless documented.
- Every builder gets exact spec contents inline.
- Specs before builders.
- Capture every state and interaction model.
- Verify typecheck/build after builder work and after assembly.

Report URL(s), sections, specs, assets, build result, visual QA result, and known gaps.
