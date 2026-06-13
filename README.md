# viewcube-react

`viewcube-react` is a React Three Fiber ViewCube component for CAD-style orientation navigation.

<img width="2749" height="1708" alt="image" src="https://github.com/user-attachments/assets/cf566105-45b0-40b1-a2db-6bd2e91c136c" />

It provides:

- interactive 3D 26-piece orientation cube in a HUD layer
- optional 2D action controls (`+`, `-`, `Rotate`, `Pan`)
- controls-first camera writes with camera fallback
- `focusRef`-based target resolution for offset models
- TypeScript types for API and callback payloads

## Install

```bash
npm install viewcube-react three @react-three/fiber @react-three/drei
```

Peer dependencies expected by this package:

- `react`
- `react-dom`
- `three`
- `@react-three/fiber`
- `@react-three/drei`

## Quick Start

```tsx
import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ViewCube } from "viewcube-react";

function SceneModel({ modelRef }: { modelRef: React.RefObject<Group | null> }) {
  return (
    <group ref={modelRef}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
    </group>
  );
}

export function App() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const modelRef = useRef<Group | null>(null);

  return (
    <Canvas camera={{ position: [6, 6, 8], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <SceneModel modelRef={modelRef} />
      <OrbitControls ref={controlsRef} makeDefault />
      <ViewCube controlsRef={controlsRef} focusRef={modelRef} />
    </Canvas>
  );
}
```

## Required Contract

- **Recommended**: pass `controlsRef` from `OrbitControls` to `ViewCube`.
- **Recommended**: set `makeDefault` on `OrbitControls` for predictable host integration.
- **Optional**: pass `focusRef` (model/group ref) so target resolution centers on your model bounds.

If `controlsRef` is not passed, `ViewCube` still works using direct camera fallback and logs an informational warning in development.

## API Reference

### `ViewCubeProps`

- `controlsRef?: RefObject<unknown>`
- `viewCubeRef?: RefObject<ViewCubeHandle | null>`
- `size?: number` (default `150`)
- `placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right"` (default `"bottom-right"`)
- `offset?: { x?: number; y?: number }`
- `snapSpeed?: number`
- `target?: [number, number, number] | null`
- `focusRef?: RefObject<unknown> | null`
- `labels?: Partial<Record<string, string>>`
- `className?: string`
- `style?: React.CSSProperties`
- `onFaceClick?: (payload: ViewCubeFaceClickPayload) => void`
- `onNavigateStart?: (payload: ViewCubeNavigatePayload) => void`
- `onNavigateEnd?: (payload: ViewCubeNavigatePayload) => void`

### Callback Payloads

- `ViewCubeFaceClickPayload`
  - `coord: [number, number, number]`
  - `label: string`
- `ViewCubeNavigatePayload`
  - `reason: "face-click" | "zoom" | "rotate" | "pan"`

### Imperative Handle

Use `viewCubeRef` to trigger programmatic snap:

```tsx
const viewCubeRef = useRef<ViewCubeHandle | null>(null);

viewCubeRef.current?.snapTo([1, 0, 0]);
```

## Recipes

### Basic

```tsx
<Canvas>
  <OrbitControls ref={controlsRef} makeDefault />
  <ViewCube controlsRef={controlsRef} />
</Canvas>
```

### With `focusRef`

```tsx
<Canvas>
  <MyModel ref={modelRef} />
  <OrbitControls ref={controlsRef} makeDefault />
  <ViewCube controlsRef={controlsRef} focusRef={modelRef} />
</Canvas>
```

### Without Controls

```tsx
<Canvas camera={{ position: [6, 6, 8], fov: 50 }}>
  <MyModel />
  <ViewCube />
</Canvas>
```

`ViewCube` falls back to direct camera operations when controls are absent.

## Example Integration Snippet (Refs Explicit)

```tsx
const controlsRef = useRef();

<Canvas>
  <MyModel ref={modelRef} />
  <OrbitControls ref={controlsRef} makeDefault />
  <ViewCube controlsRef={controlsRef} focusRef={modelRef} />
</Canvas>;
```

## Troubleshooting

### Cube click is not moving the camera

- Confirm `ViewCube` is rendered inside the same `Canvas`.
- Confirm `controlsRef` points to the mounted `OrbitControls`.
- If no controls are used, ensure a valid camera exists on canvas state.

### Camera moves around wrong target

- Pass `focusRef` to your model/group root so bounds center is used.
- Or pass explicit `target={[x, y, z]}`.
- Check for invalid target tuples (`NaN`, non-number values), which trigger fallback.

### Overlay looks misplaced

- Use `placement` and `offset` to anchor corner position.
- Use `className` / `style` to override z-index and host-specific layout needs.
- Ensure the canvas parent is positioned/visible; missing portal parent causes overlay skip warning in development.
