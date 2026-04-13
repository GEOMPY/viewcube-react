# Phase 11: Release Engineering

## Release version

- Current release signal: `0.1.0` (beta-friendly).
- Can be promoted to `1.0.0` when API/behavior freeze is formally approved.

## Deliverable

Published package with stable install path and validated release artifacts.

---

## Automated prepublish pipeline

Primary command:

```bash
npm run phase11:check
```

Pipeline steps:

1. `clean:dist`
2. `verify:qa` (lint + full typecheck + tests + sample smoke)
3. `build`
4. `check:esm` (assert ESM-only output; no UMD/CJS)
5. `check:pack` (validate tarball includes runtime + `.d.ts`, excludes sources/docs/tests/scripts)
6. `smoke:packed` (install packed tarball into temp consumer and run import + typecheck smoke)

---

## Scripts added for release checks

- `scripts/check-esm-only.mjs`
- `scripts/check-pack-contents.mjs`
- `scripts/smoke-packed-consumer.mjs`

## CI

Workflow (`.github/workflows/ci.yml`) runs lint, typecheck, tests, smoke sample, and README checks on:

- Node 20.x
- Node 22.x

---

## Manual release playbook

### 1) Pre-publish local validation

- Run: `npm run phase11:check`
- Confirm no warnings/errors requiring release blockers.

### 2) Tarball inspection

- Optional human check: `npm pack`
- Inspect generated `.tgz` contents if needed.

### 3) Publish

```bash
npm publish
```

### 4) Tag and changelog

- Ensure `CHANGELOG.md` includes shipped features/limitations.
- Create git tag matching release version.

### 5) Post-publish consumer validation

- Install published package in a real consumer app.
- Verify import resolution, type resolution, and runtime behavior.

### 6) Rollback readiness

Document:

- previous known-good published version
- rollback command path (republish with incremented patch and revert content)
- communication note template for known release regressions
