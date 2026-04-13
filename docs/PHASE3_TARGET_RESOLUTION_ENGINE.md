# Phase 3: Target Resolution Engine

## Deliverable

Implemented `resolveTarget({ focusRef, target, controlsRef, onWarn })` in:

- `src/lib/TargetResolver.ts`

## Precedence (deterministic)

1. `focusRef.current` bounds center
2. Explicit `target` tuple
3. `controlsRef.current.target`
4. Origin fallback `[0,0,0]`

## Defensive guarantees

- Always returns a new `THREE.Vector3` (no shared mutable vectors returned).
- Empty `focusRef` bounds are detected and warned, then fallback continues.
- Invalid target tuple values are warned, then fallback continues.
- Controls target absence safely falls through to origin fallback.

## Performance note

Bounds computation is only in resolver invocation path (fit/home/face-click use cases) and not tied to `useFrame` loops.

## Automated tests

`tests/targetResolver.test.ts` validates:

- precedence chain correctness
- copy/immutability behavior
- invalid tuple handling
- empty bounds handling
- origin fallback

Run:

```bash
npm run phase3:check
```
