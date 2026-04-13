# Phase 0 Manual Test Sheet (Pass/Fail)

Use this sheet before Phase 1 implementation starts.

## A. Scaffold Presence Check

Verify expected baseline files are present:
- [ ] `package.json`
- [ ] `vite.config.js`
- [ ] `index.html`
- [ ] `src/main.jsx`
- [ ] `src/App.jsx`

Result:
- Status: [ ] Pass [ ] Fail
- Notes:

---

## B. Scope Guardrail Review

Confirm v1 backlog does **not** include:
- [ ] auto-detect target/model logic
- [ ] custom slot/plugin API
- [ ] multi-canvas sync

Result:
- Status: [ ] Pass [ ] Fail
- Notes:

---

## C. Success Criteria Measurability Review

Confirm each success criterion has clear evidence and pass condition:

1. Works with only `controlsRef`
- [ ] measurable
- Evidence to collect:

2. Works without `controlsRef`
- [ ] measurable
- Evidence to collect:

3. No memory growth on mount/unmount loops
- [ ] measurable
- Evidence to collect:

4. No overlay misalignment in flex/modal layouts
- [ ] measurable
- Evidence to collect:

Result:
- Status: [ ] Pass [ ] Fail
- Notes:

---

## D. Baseline Behavior Capture (Pre-implementation)

Record baseline behavior before feature coding to avoid shifting targets:
- [ ] baseline app starts successfully
- [ ] baseline build passes
- [ ] baseline lint passes (if currently enforced)

Commands:
- `npm run dev`
- `npm run build`
- `npm run lint`

Result:
- Status: [ ] Pass [ ] Fail
- Notes:

---

## E. Final Phase 0 Sign-off

- [ ] A complete
- [ ] B complete
- [ ] C complete
- [ ] D complete
- [ ] Ready for Phase 1

Approved by:
- Engineer:
- Reviewer:
- Date:

