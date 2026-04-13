# Phase 4: 3D Cube Core (`CubePieces`)

## Implemented

- `src/lib/CubePieces.tsx`
  - Generates 26 logical pieces (face/edge/corner).
  - Preserves metadata per piece: `id`, `type`, `coord`, `label`.
  - Supports independent hover state with per-piece material instances.
  - Handles click vs drag via configurable threshold.

- `createCubePieceDefs(...)` helper exported for deterministic piece generation checks.

## Memory Strategy

- Shared geometries are memoized once per component lifecycle.
- Base materials are memoized and cloned per piece.
- Face label textures are memoized once from piece labels.
- Explicit cleanup disposes geometries, materials, and textures on unmount.

## Automated Tests

- `tests/cubePieces.test.tsx`
  - render count + metadata integrity (26 meshes)
  - hover enter/leave behavior
  - click emission and drag-threshold suppression
  - rerender identity stability of geometry/material references

## Manual Test Guidance

1. Hover each face/edge/corner and verify highlight is isolated.
2. Click each face and verify emitted metadata maps to expected orientation.
3. Drag slowly and quickly to confirm click does not misfire after drag.
4. Run repeated mount/unmount cycles and monitor memory in browser devtools.
5. Check visual line/edge clarity at normal and high DPR displays.
