# Phase 5: HUD Layer (`ViewCubeHud`)

## Implemented

- `src/lib/ViewCubeHud.tsx`
  - Renders `CubePieces` inside `<Hud>`.
  - Uses `<OrthographicCamera makeDefault ... />` for consistent cube presentation.
  - Adds ambient + directional lighting for visual consistency.

- `src/lib/NavigationEngine.ts`
  - `startSnap(...)` initializes snap transition from clicked cube coord.
  - `update(...)` advances camera/controls toward target each frame until epsilon.
  - `syncCubeQuaternion(...)` keeps cube synced inversely to main camera rotation.

## Runtime flow

1. User clicks a cube piece.
2. `ViewCubeHud` resolves target via `resolveTarget(...)`.
3. `NavigationEngine.startSnap(...)` stores transition state.
4. In `useFrame`, engine updates camera/controls toward snap target.
5. On convergence, transition completes and end callback fires.
6. Every frame, cube quaternion is synchronized from main camera (inverse).
7. When `focusRef` is provided and controls are available, controls target is auto-centered to model bounds center.

## Tests

- `tests/navigationEngine.test.ts`
  - camera -> cube inverse synchronization correctness
  - snap completion reaches epsilon and emits end callback
  - idle update does not mutate camera (regression guard)
- `tests/viewCubeHudCentering.test.ts`
  - applies focus bounds center to controls target
  - ignores invalid controls safely
  - warns on empty focus bounds and avoids target mutation
