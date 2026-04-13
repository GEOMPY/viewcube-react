# Phase 2: Constants and Math Extraction

## Implemented Modules

- `src/lib/constants.ts`
  - cube geometry dimensions
  - color tokens
  - default labels
  - drag/snap thresholds and lerp defaults

- `src/lib/math/snapMath.ts`
  - `keyFromCoord`
  - `labelFromCoord`
  - `snapFromCoord`
  - canonical direction + up-vector resolution for snapping

- `src/lib/math/cameraMath.ts`
  - `zoomCameraRelativeToTarget`
  - `fitDistanceForFov`
  - `computeHomePosition`
  - `rotateCameraAroundTarget`
  - `panCameraAndTarget`

All helpers are side-effect-free and return computed values without mutating inputs.

## Automated Tests

- `tests/snapMath.test.ts`
  - coord -> direction correctness
  - coord -> up-vector correctness
  - label mapping
  - degenerate input checks

- `tests/cameraMath.test.ts`
  - zoom in/out relative behavior
  - fit distance finite and positive
  - rotate keeps radius around target
  - pan preserves camera-target semantics
  - invalid numeric input checks

## Manual Test Guidance (for Phase 2 verification)

In a sandbox scene:

1. Trigger each helper using temporary debug buttons.
2. Validate TOP/FRONT/LEFT canonical views align with expected orientation.
3. Verify zoom in/out remains smooth near target and does not invert unexpectedly.
4. Verify fit on tiny and very large models still frames the scene reliably.
