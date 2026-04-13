# CI/CD and Release Reference

This document is the operational reference for maintaining and releasing `@geo-mpy/viewcube-react`.

## 1) Current CI Pipeline

Workflow file: `.github/workflows/ci.yml`

### Trigger

- On every `push`
- On every `pull_request`

### Job matrix

- Node `20.x`
- Node `22.x`

### Steps executed

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck:all`
4. `npm run test`
5. `npm run smoke:sample`
6. `npm run check:readme`
7. Node `22.x` only: `npm run phase11:check`

## 2) What Each Gate Validates

### `verify:qa`

- Lint quality gate
- Library + app TypeScript checks
- Unit/component tests
- Sample app wiring smoke test

### `phase11:check`

Release-grade pipeline:

1. Clean build output
2. Full QA verification
3. Build package
4. Enforce ESM-only output
5. Validate tarball contents
6. Install packed tarball in temporary consumer and run import/typecheck smoke

## 3) Release Flow After Code Changes

Run from package root (`viewcube-react`):

1. Sync dependencies and lockfile if needed:

```bash
npm install
```

2. Run full release checks:

```bash
npm run phase11:check
```

3. Bump version:

```bash
npm version patch
```

Use `minor` or `major` when needed.

4. Update `CHANGELOG.md` for new version.

5. Commit and push:

```bash
git add .
git commit -m "release: vX.Y.Z"
git push origin HEAD --follow-tags
```

6. Publish:

```bash
npm publish --access public
```

7. Verify published version:

```bash
npm view @geo-mpy/viewcube-react version
```

## 4) NPM Auth and Publishing Notes

Package is scoped:

- `@geo-mpy/viewcube-react`

If org policy enforces stronger auth, use a granular token with publish + 2FA bypass.

Set token:

```bash
npm config set //registry.npmjs.org/:_authToken "YOUR_TOKEN"
```

Validate auth:

```bash
npm whoami
```

Optional cleanup after publish:

```bash
npm config delete //registry.npmjs.org/:_authToken
```

## 5) Common Failures and Fixes

### A) CI fails on `npm ci` with lock mismatch

Symptom:

- `npm ci` says `package.json` and `package-lock.json` are out of sync.

Fix:

```bash
npm install
npm ci
git add package-lock.json
git commit -m "chore: sync lockfile"
git push
```

### B) Publish fails with `E403` requiring 2FA/token bypass

Symptom:

- `npm publish` returns 403 and mentions 2FA or granular token.

Fix:

- Use granular access token configured for publish.
- Ensure token has access to org scope/package.
- Re-run publish.

### C) Publish name/scope mismatch

Symptom:

- Cannot publish where expected in org packages page.

Fix:

- Ensure `package.json` has scoped name:
  - `@geo-mpy/viewcube-react`

## 6) Quick Command Checklist

```bash
npm ci
npm run phase11:check
npm version patch
npm publish --access public
npm view @geo-mpy/viewcube-react version
```

## 7) Ownership / Repo Transfer Reminder

If repository ownership changes (personal -> org):

- Update local git remote URL to org repo.
- Recheck GitHub Actions permissions/secrets.
- Reconfirm npm org publish access.
