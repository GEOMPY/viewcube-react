# Changelog

All notable changes to this project are documented in this file.

## 0.1.0

Initial beta release of `viewcube-react`.

### Added

- TypeScript-first public package surface with exported API types.
- 26-piece interactive ViewCube rendered in HUD.
- Desktop-parity action controls: `+`, `-`, `Rotate`, `Pan`.
- Controls-first navigation engine with camera fallback behavior.
- Target resolution precedence: `focusRef` -> `target` -> `controls.target` -> origin.
- Imperative API via `viewCubeRef.current.snapTo(coord)`.
- Development guard warnings for invalid/unsupported runtime conditions.
- Automated QA and verification scripts:
  - lint + typecheck + test + sample smoke
  - README checks
  - pack contents checks
  - ESM-only output checks
  - packed tarball consumer smoke test

### Notes

- Output format is ESM-only for v1.
- `showFit` remains a guarded compatibility prop (warning-oriented behavior).
