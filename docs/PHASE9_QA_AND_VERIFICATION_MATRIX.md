# Phase 9: QA and Verification Matrix

## Deliverable

Pass/fail QA checklist with reproducible notes for:

- functional behavior
- layout behavior
- interaction behavior
- runtime performance and stability

---

## 9.1 Functional Matrix (Manual)

Record each row as `PASS` / `FAIL` with notes and screenshot links.

| Scenario | Setup | Expected |
|---|---|---|
| OrbitControls + `controlsRef` | Demo app with `OrbitControls ref={controlsRef}` and `ViewCube controlsRef={controlsRef}` | All actions and snaps route through controls; no direct-camera jitter |
| Camera-only fallback | Remove `controlsRef` prop from `ViewCube` | Zoom/snap still work via camera fallback; dev warning is informational only |
| Perspective camera | Default `<Canvas camera={{ fov: 50 }}>` | Snap and zoom are visually correct and stable |
| Orthographic camera | Swap to ortho setup in sandbox | No crashes; snap and alignment remain deterministic |
| Model at origin | Primary demo model at `[0,0,0]` | Face snaps align to expected canonical directions |
| Model offset far from origin | Translate model group by large offset (example `[250, 80, -120]`) | Resolver centers navigation on focused model; no drifting to world origin |

---

## 9.2 Layout Matrix (Manual)

Validate for each `placement`: `top-left`, `top-right`, `bottom-left`, `bottom-right`.

| Layout | Expected |
|---|---|
| Flex container | Cube and action controls stay anchored in selected corner |
| Modal container | Overlay remains within modal canvas bounds; no bleed to page |
| Split pane | Anchor is stable while pane is resized |
| Window resize + DPR changes | Cube remains pinned; controls remain below cube for top placements |

Manual viewport sweep:

- Desktop width (>= 1280px)
- Tablet width (~768px)
- Mobile width (~390px)

---

## 9.3 Interaction Matrix (Manual)

| Interaction | Expected |
|---|---|
| Hover piece | Only hovered piece highlights |
| Click face | `onFaceClick` payload matches coord/label; snap starts and converges |
| Drag cube | Drag threshold prevents click misfire after movement |
| Action buttons | `+`, `-`, `Rotate`, `Pan` respond immediately and mode highlight updates |

For each action, log expected camera pose and observed pose after completion.

---

## 9.4 Performance and Stability (Manual)

### Performance sanity

- Run scene for 10+ minutes with periodic cube clicks and action presses.
- Sample FPS at start / mid / end (browser performance panel).
- Expected: no sustained degradation under normal scene load.

### Memory leak checks

- Take memory snapshots at start / mid / end.
- Execute repeated face interactions and mode toggles.
- Expected: no monotonic growth from undisposed textures/materials/geometries.

### Mount/unmount stress

- Run 50 mount/unmount cycles in dev route.
- Expected:
  - no console errors
  - no detached DOM accumulation
  - no unreleased texture/material artifacts

---

## Automated Gate (Phase 9)

`npm run phase9:check`

This runs:

- `npm run lint`
- `npm run typecheck:all`
- `npm run test`
- `npm run smoke:sample`

### CI Matrix

Workflow: `.github/workflows/ci.yml`

- Node 20.x
- Node 22.x

Each version runs lint, full typecheck, tests, and sample smoke check.

---

## Repro Notes Template

Use this template for each failing case:

- Scenario:
- Environment (OS, browser, DPR, viewport):
- Steps to reproduce:
- Expected:
- Actual:
- Console/runtime errors:
- Screenshot/video:
- Suspected module (`ViewCube`, `ViewCubeHud`, `ViewCubeOverlay`, `NavigationEngine`):
