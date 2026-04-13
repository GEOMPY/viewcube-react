# Phase 10: Documentation for DX

## Implemented

- Replaced template README with package-specific `README.md`.
- Added required sections:
  - What it is (USP)
  - Install
  - Quick start
  - Required contract (`controlsRef` first, `makeDefault` recommendation)
  - API reference
  - Recipes (basic, with `focusRef`, without controls)
  - Troubleshooting (camera move, target issues, overlay misplacement)
  - Explicit refs-based integration snippet
- Included callback payload and imperative `viewCubeRef.snapTo(...)` documentation.

## Guardrails for documentation correctness

- Added `scripts/check-readme.mjs`
  - validates required README headings
  - validates required integration snippets
  - validates key prop lines in API section
- Added npm script:
  - `npm run check:readme`
- Added Phase 10 check script:
  - `npm run phase10:check`

## CI integration

Updated `.github/workflows/ci.yml` to run:

- lint
- full typecheck
- tests
- sample smoke integration
- README checks

## Validation commands

Run locally:

```bash
npm run check:readme
npm run phase10:check
```

## Notes

- README keeps `showFit` documented as compatibility/guarded behavior to match runtime warning logic.
- API names and defaults match current implementation in `src/lib/types.ts` and `src/lib/ViewCube.tsx`.
