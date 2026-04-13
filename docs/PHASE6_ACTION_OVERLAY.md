# Phase 6: 2D Action Overlay (`ViewCubeOverlay`)

## Implemented

- `src/lib/ViewCubeOverlay.tsx`
  - Renders through `Html` into `gl.domElement.parentElement`.
  - Enforces wrapper positioning with inline styles.
  - Uses pointer-event layering:
    - wrapper: `pointer-events: none`
    - buttons: `pointer-events: auto`

- `src/lib/ViewCube.tsx`
  - Integrates `ViewCubeOverlay` + `ViewCubeHud`.
  - Wires action callbacks:
    - zoom in/out
    - rotate mode toggle
    - pan mode toggle

## Utility helpers

- `getOverlayWrapperStyle(...)`
- `getActionButtonStyle()`
- `resolvePortalParent(...)` (null-safe)

## Tests

- `tests/viewCubeOverlay.test.tsx`
  - placement style coverage for all four corners
  - pointer-event contract checks
  - portal parent null-safety check
  - action callback interaction checks
