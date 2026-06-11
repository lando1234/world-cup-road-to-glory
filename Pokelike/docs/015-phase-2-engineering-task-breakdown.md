# SPEC 012A — Phase 2 Execution Plan and Task Breakdown

**Status:** Operational execution plan for Phase 2  
**Authority:** Executes [014 — SPEC 012 Phase 2 Plan](./014-phase-2-polish-debt-retirement-and-football-native-ux-plan.md)  
**Date:** 2026-06-10  
**Mode:** One task, one validation pass, one commit  
**Branch:** `main` unless explicitly changed  
**Screenshots:** Not automated by default
**Last sync:** `main` @ this commit — City Stamp selector cleanup (P2-014)

---

## Progress Summary

| Metric | Count |
|--------|------:|
| **Done** | 15 |
| **Partial** | 0 |
| **Not started** | 15 |
| **Total tickets** | 30 |

**Legend:** ✅ Done · 🟡 Partial · ⬜ Not started

## 1. Operating Principle

Phase 2 should run as a controlled sequence of small commits. Parallelization is allowed only when tasks do not touch the same files or create dependency ambiguity. The game must remain playable after every commit.

The default task loop is:

```text
1. Pre-flight
   - Confirm dependency status.
   - Confirm files likely touched.
   - Confirm stop condition.

2. Implementation
   - Make the smallest scoped change.
   - Do not combine unrelated visual, save, data, or architecture work.

3. Validation
   - Run the task-specific validation.
   - Run `rtk npm run validate` unless the task explicitly says otherwise.
   - Run `rtk npm run smoke:http` when a UI/runtime boot path is touched after P2-007 exists.

4. Manual QA / Test
   - Execute the task-specific manual step when listed.
   - If the task is docs-only, record why no runtime smoke was needed.

5. Docs update
   - Update this ledger.
   - Update `020-phase-2-assumptions-tradeoffs-assets-report.html` when new assumptions, tradeoffs, asset gaps, product risks, or owner notes appear.
   - Update `013-phase-2-visual-frictions.html` when new visual debt, sprite gaps, image issues, or UX friction appears.

6. Commit
   - Stage only files touched by the task.
   - Commit atomically with implementation, validation, test, and smoke/manual QA notes.
```

No task may reactivate cloud save, introduce live runtime API calls, or change battle math unless the task explicitly scopes that work.

---

## 2. Execution Waves

| Wave | Goal | Tasks | Parallelizable? | Exit gate |
|------|------|-------|-----------------|-----------|
| Wave 0 | Execution foundation | P2-001, P2-002, P2-006, P2-007 | P2-006 can run beside P2-002/P2-007 after P2-001 | Phase 2 ledger, harness shell, manual runbook, HTTP smoke exist |
| Wave 1 | Bridge inventory and safe album API cleanup | P2-003, P2-004, P2-005 | Mostly sequential | Football paths use album-named APIs; old aliases preserved |
| Wave 2 | Asset/legal gate and no-live-API strategy | P2-008, P2-009, P2-021 | P2-008 can run beside Wave 1; P2-009/P2-021 sequential | Runtime has local portrait contract and no live API gate |
| Wave 3 | Football-native recruitment UX | P2-011, P2-012, P2-013 | Sequential due shared UI files | Scout, Contract Offer, Squad Registration are football-native |
| Wave 4 | Map/stamp visual language | P2-010, P2-014, P2-015 | P2-010 can run beside P2-011 if CSS ownership is coordinated | Node icons and City Stamp presentation no longer rely on legacy fantasy |
| Wave 5 | Album, completion, settlement polish | P2-016, P2-017, P2-018 | Sequential, UI-heavy | Album, Slice Complete, Settlement Lite are external-playtest ready |
| Wave 6 | Account hardening | P2-019, P2-020 | Sequential | Account shape and settlement dedupe are guarded locally |
| Wave 7 | Manual QA and blocker fixes | P2-022, P2-023 | P2-023 splits per blocker | Manual 3-city slice QA has no blockers |
| Wave 8 | Expansion decision and guards | P2-024, P2-025, P2-026, P2-027, P2-028 | Guards can prepare in parallel after P2-025 if file overlap is managed | 8-city expansion decision recorded; optional enable only if green |
| Wave 9 | Closeout | P2-029, P2-030 | Sequential | Phase 2 validation report and sign-off complete |

---

## 3. Parallel Work Lanes

Use lanes to parallelize without conflicts. Two tasks can run at the same time only when they are in different lanes and their dependencies are satisfied.

| Lane | Ownership | Typical files | Tasks |
|------|-----------|---------------|-------|
| A — Validation & Process | Harnesses, docs, smoke, task ledgers | `package.json`, `scripts/*`, `docs/015*`, `docs/017*`, `docs/019*`, `docs/020*` | P2-001, P2-002, P2-006, P2-007, P2-022, P2-029, P2-030 |
| B — Bridge & Domain Cleanup | Album facades, bridge inventory, domain contracts | `js/domain/*`, `js/data.js`, `js/game.js`, validation scripts | P2-003, P2-004, P2-005, P2-019, P2-020 |
| C — Asset & Release Safety | Portrait strategy, local manifests, no-live-API checks | `data/football/*`, `js/domain/profiles.js`, `docs/018*`, validation scripts | P2-008, P2-009, P2-021 |
| D — Recruitment UX | Scout, Contract Offer, Squad Registration | `index.html`, `js/ui.js`, `style.css` | P2-011, P2-012, P2-013 |
| E — Map & Stamp Visuals | Node icons, stamp selectors, stamp artwork | `js/map.js`, `js/ui.js`, `style.css`, `assets/*` | P2-010, P2-014, P2-015 |
| F — End-of-Run UX | Album, Slice Complete, Settlement Lite | `js/ui.js`, `style.css`, `js/domain/save.js` | P2-016, P2-017, P2-018 |
| G — Expansion Guards | 8 host cities, scout pools, album pages, cap | `data/football/*`, `js/domain/*`, `js/domain/features.js` | P2-024, P2-025, P2-026, P2-027, P2-028 |

Conflict rule: lanes D, E, and F are UI/CSS-heavy. They should not run in parallel unless exact selectors/files are reserved up front.

---

## 4. Recommended First Execution Block

Start with the first 10 tasks from SPEC 012, with one adjustment: run the portrait decision gate early in parallel with process work because it blocks release-safe visual decisions later.

| Order | Task | Lane | Can parallelize with | Why now |
|-------|------|------|----------------------|---------|
| 1 | P2-001 — Phase 2 ledger/protocol | A | None | Unlocks controlled execution |
| 2 | P2-002 — Phase 2 QA harness shell | A | P2-006 after P2-001 | Lets later work add checks safely |
| 3 | P2-006 — Manual QA runbook | A | P2-002, P2-008 | Needed before UI-heavy work |
| 4 | P2-007 — HTTP smoke script | A | P2-008 | Gives non-screenshot runtime smoke |
| 5 | P2-008 — Portrait/legal/art decision gate | C | P2-002/P2-006/P2-007 | Blocks asset strategy; docs-only |
| 6 | P2-003 — Bridge inventory | B | P2-008 | Must precede safe bridge retirement |
| 7 | P2-004 — Album facade names | B | None | Creates clean API without behavior change |
| 8 | P2-005 — Move football writes to album APIs | B | None | Retires high-value dex bridge safely |
| 9 | P2-009 — Local portrait manifest contract | C | After P2-008; avoid UI conflicts | Removes runtime asset dependency |
| 10 | P2-021 — Runtime no-live-API gate | C | After P2-009 | Locks release-safety invariant |

Expected result after block 1:

- Phase 2 execution machinery is live.
- Manual QA is defined.
- HTTP smoke exists.
- First bridge cleanup is done.
- Portrait strategy is decided.
- Runtime no-live-API policy is validated.

---

## 5. Parallelization Plan

### Batch 1 — Foundation

```text
Sequential: P2-001
Parallel after P2-001:
  - Lane A: P2-002 → P2-007
  - Lane A/docs: P2-006
  - Lane C/docs: P2-008
Join gate:
  - P2-002 green
  - P2-006 runbook exists
  - P2-007 smoke exists
  - P2-008 decision recorded
```

Do not begin runtime bridge retirement until P2-002 is green.

### Batch 2 — Safe Bridge Retirement

```text
Sequential:
  P2-003 → P2-004 → P2-005
Parallel allowed:
  P2-009 can run after P2-008 if it does not touch files currently edited by P2-004/P2-005.
Join gate:
  - Football paths prefer album-named APIs.
  - Legacy aliases still pass Phase 1 validation.
  - Local portrait manifest contract exists.
```

Do not remove old dex-named aliases in this batch.

### Batch 3 — Release-Safety Gate

```text
Sequential:
  P2-009 → P2-021
Parallel allowed:
  P2-010 can begin after P2-003 if it avoids portrait/profile files.
Join gate:
  - Runtime no-live-API gate passes.
  - TheSportsDB is not a critical runtime path.
```

Do not start album visual polish before this gate, because album card art depends on the portrait strategy.

### Batch 4 — Recruitment UX

```text
Sequential:
  P2-011 → P2-012 → P2-013
Parallel allowed:
  P2-010 can run before or beside P2-011 only if CSS selectors are separated.
Join gate:
  - Scout Report is not visibly catch UI.
  - Contract Offer states are clear.
  - Squad Registration full-squad swap is clear.
```

These tasks should be one commit each because all touch the highest-risk player decision flow.

### Batch 5 — Stamp and Map Presentation

```text
Sequential:
  P2-010 → P2-014 → P2-015
Parallel allowed:
  P2-016 may begin after P2-009 if it does not touch stamp selectors.
Join gate:
  - Node icon metadata is football-native.
  - City Stamp ceremony uses stamp-specific selectors/assets.
```

Keep map topology unchanged.

### Batch 6 — Completion and Settlement UX

```text
Sequential:
  P2-016 → P2-017 → P2-018
Join gate:
  - Album states are clearer.
  - Slice Complete is product-quality enough for external playtest.
  - Settlement Lite remains patch-before-clear.
```

Do not introduce new reward economy here.

### Batch 7 — Account Hardening

```text
Sequential:
  P2-019 → P2-020
Join gate:
  - Account shape validation exists.
  - Local settlement dedupe is guarded or explicitly deferred.
```

Stop if this becomes save v4 or cloud work.

### Batch 8 — Manual QA and Stabilization

```text
Sequential:
  P2-022
Conditional:
  P2-023A / P2-023B / ... for each blocker
Join gate:
  - Manual QA pass recorded.
  - No blockers remain.
```

Fix blockers in separate atomic commits. Do not combine multiple unrelated QA fixes.

### Batch 9 — Expansion Decision

```text
Sequential:
  P2-024
If decision = prepare only:
  P2-025 → P2-026 and P2-027
If decision = expand now:
  P2-025 → P2-026 → P2-027 → P2-028
If decision = defer:
  skip P2-025 through P2-028 and record rationale
```

The default recommendation is prepare only, not enable maps 3-7, unless manual QA and asset gates are clean.

### Batch 10 — Closeout

```text
Sequential:
  P2-029 → P2-030
```

Closeout requires a validation report, manual QA result, no-cloud assertion, no-live-API assertion, and deferred Phase 3 list.

---

## 6. Task Registry

| Task | Status | Lane | Dependencies | Parallel group | Commit |
|------|--------|------|--------------|----------------|--------|
| P2-001 | ✅ | A | Phase 1 complete | Batch 1 root | `bb8d87c` |
| P2-002 | ✅ | A | P2-001 | Batch 1 | `d64f18b` |
| P2-003 | ✅ | B | P2-002 | Batch 2 root | `47a1d51` |
| P2-004 | ✅ | B | P2-003 | Batch 2 | `6cf74b6` |
| P2-005 | ✅ | B | P2-004 | Batch 2 | `c14f768` |
| P2-006 | ✅ | A | P2-001 | Batch 1 | `5b7f083` |
| P2-007 | ✅ | A | P2-002 | Batch 1 | `231a81f` |
| P2-008 | ✅ | C | P2-001 | Batch 1 | `cad24b2` |
| P2-009 | ✅ | C | P2-008 | Batch 2/3 | `115fb67` |
| P2-010 | ✅ | E | P2-003 | Batch 4/5 | `4571bab` |
| P2-011 | ✅ | D | P2-005, P2-007 | Batch 4 | `209e457` |
| P2-012 | ✅ | D | P2-011 | Batch 4 | `a5b4bd6` |
| P2-013 | ✅ | D | P2-012 | Batch 4 | `739e052` |
| P2-014 | ✅ | E | P2-010 | Batch 5 | this commit |
| P2-015 | ⬜ | E | P2-014 | Batch 5 | |
| P2-016 | ⬜ | F | P2-009 | Batch 6 | |
| P2-017 | ⬜ | F | P2-015, P2-016 | Batch 6 | |
| P2-018 | ⬜ | F | P2-017 | Batch 6 | |
| P2-019 | ⬜ | B | P2-018 | Batch 7 | |
| P2-020 | ⬜ | B | P2-019 | Batch 7 | |
| P2-021 | ✅ | C | P2-009 | Batch 3 | `14ac5cb` |
| P2-022 | ⬜ | A | P2-006, P2-018, P2-021 | Batch 8 | |
| P2-023 | ⬜ | Variable | P2-022 | Batch 8 conditional | |
| P2-024 | ⬜ | G | P2-022, no blockers | Batch 9 | |
| P2-025 | ⬜ | G | P2-024 | Batch 9 conditional | |
| P2-026 | ⬜ | G | P2-025 | Batch 9 conditional | |
| P2-027 | ⬜ | G | P2-016, P2-025 | Batch 9 conditional | |
| P2-028 | ⬜ | G | P2-024, P2-025, P2-026, P2-027, P2-022 pass | Batch 9 optional | |
| P2-029 | ⬜ | A | P2-022, P2-023 if needed, P2-024 | Batch 10 | |
| P2-030 | ⬜ | A | P2-029 | Batch 10 | |

---

## 7. Commit Message Template

Use this structure for every task:

```text
<imperative summary>

Implementation: <what changed and why this task scope is complete>.

Validation: rtk npm run validate. <Add smoke/http command if run>.

Test: <task-specific harness/manual QA evidence>.

Smoke: <runtime smoke result or why not needed>.

Docs: <ledger/assumptions/frictions updates>.
```

Example:

```text
Add phase two QA harness

Implementation: P2-002 adds validate-phase2-qa and wires it into npm run validate without changing runtime code.

Validation: rtk npm run validate.

Test: validate-phase2-qa confirms Phase 2 spec presence, Phase 1 harness continuity, and cloud-save disabled invariant.

Smoke: not run because no runtime UI/gameplay files changed.

Docs: updated Phase 2 task ledger with P2-002 completion.
```

---

## 8. Stop Conditions

Stop and re-plan if any of these happens:

- A task requires changing battle math.
- A task requires reactivating cloud save.
- A task introduces live runtime API calls.
- A task needs unresolved legal/product/art approval.
- A UI task requires save migration changes.
- A save/account task requires visual redesign.
- A bridge removal breaks Classic/legacy behavior unexpectedly.
- Manual QA finds a blocker that cannot be fixed atomically.
- Expansion to maps 3-7 would happen before current 3-city slice manual QA is green.

---

## 9. Recommended Immediate Next Step

Start with **P2-001**:

- Create the formal Phase 2 task ledger sections in this file.
- Add docs validation for P2 task IDs and execution-loop fields.
- Keep `020-phase-2-assumptions-tradeoffs-assets-report.html` current as the Phase 2 assumptions/tradeoffs/assets companion.
- Commit it alone.

After P2-001, run Batch 1 with controlled parallelism:

```text
P2-002 and P2-006 can proceed in parallel.
P2-008 can proceed in parallel because it is a docs/product gate.
P2-007 follows P2-002.
```

Do not begin bridge retirement until P2-002 is complete.

---

*End of SPEC 012A — Phase 2 Execution Plan and Task Breakdown.*
