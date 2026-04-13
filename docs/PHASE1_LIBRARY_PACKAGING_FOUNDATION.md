# Phase 1: Library Packaging Foundation

## Build Configuration

- Vite configured for library mode
- ESM-only output
- Entry point: `src/index.ts`
- Peer dependencies externalized in Rollup config

## Type Declaration Flow

- Source is TypeScript-first (`.ts/.tsx`)
- Public types defined in `src/lib/types.ts`
- Public exports routed through `src/index.ts`
- Declarations generated to `dist` using TS build config + `vite-plugin-dts`
- Strict compiler settings enabled:
  - `strict`
  - `noImplicitAny`
  - `exactOptionalPropertyTypes`

## Package Metadata

- `exports` map configured for package root
- `types` path points to generated `dist/index.d.ts`
- `sideEffects: false` declared (safe currently: no import-time runtime side effects)

## Automated Validation Commands

- `npm run typecheck`
- `npm run build`
- `npm run check:exports`
- `npm run check:dts`
- `npm run phase1:check`

## Manual Validation Checklist

1. Install local package output in a tiny consumer app and import `ViewCube` with no path hacks.
2. Verify IntelliSense shows `ViewCubeProps` and callback payload types.
3. Inspect bundle output to confirm peer deps are externalized (not bundled into package output).
4. Import package in a blank module and verify no runtime side effects happen on import.
