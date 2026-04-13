# Phase 0: Baseline and Guardrails

This document freezes the v1 baseline before implementation.

## 1) V1 Scope Freeze

### In Scope (Phase 0 confirmed)
- Explicit `controlsRef`-driven ViewCube integration
- Fallback camera behavior when `controlsRef` is missing
- HUD-based 3D cube + portal-based 2D overlay actions
- Peer dependency contract for R3F ecosystem
- Measurable success criteria and guardrail checks

### Out of Scope for v1
- Auto-detection of model/scene target
- Custom slot/plugin API
- Multi-canvas synchronization

## 2) Peer Dependency Strategy (Confirmed)

The package must declare these as peer dependencies:
- `react`
- `react-dom`
- `three`
- `@react-three/fiber`
- `@react-three/drei`

Reason: avoid duplicate renderer/runtime copies in host apps.

## 3) Success Criteria (Measurable)

Each criterion is binary pass/fail:

1. **Works with only `controlsRef`**  
   - Pass when cube click + action buttons control camera via controls object.

2. **Works without `controlsRef`**  
   - Pass when cube and actions still move camera in fallback mode.

3. **No memory growth on mount/unmount loops**  
   - Pass when repeated mount/unmount does not show sustained growth from cube resources.

4. **No overlay misalignment in flex/modal layouts**  
   - Pass when overlay remains correctly anchored in all target layouts.

## 4) Automated Guardrail Checks

Run:

```bash
npm run phase0:check
```

This executes:
- `check:peers` -> verifies required peer dependencies exist in `package.json`
- `check:entries` -> verifies required scaffold/build entry files exist

## 5) Phase 0 Sign-Off

- [ ] Scope freeze approved
- [ ] Peer dependency strategy approved
- [ ] Success criteria measurable and approved
- [ ] Automated guardrail checks added
- [ ] Manual test plan documented

