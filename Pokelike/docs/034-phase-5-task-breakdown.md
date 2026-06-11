# SPEC 015A — Phase 5 Execution Plan and Task Breakdown

**Status:** Waves 1–5 implemented — manual QA pending (P5-070)  
**Authority:** Executes [033 — SPEC 015 Phase 5 Plan](./033-phase-5-knockout-and-meta-plan.md)  
**Date:** 2026-06-11  
**Mode:** One task, one validation pass, one commit  
**Governance HTML:** [035-phase-5-assumptions-tradeoffs.html](./035-phase-5-assumptions-tradeoffs.html)  
**Manual QA:** [036-phase-5-manual-qa.md](./036-phase-5-manual-qa.md)  
**Last sync:** P5-017 (knockout enabled) + Waves 1–5 implementation

---

## Progress Summary

| Metric | Count |
|--------|------:|
| **Done** | 44 |
| **In progress** | 0 |
| **Not started** | 8 |
| **Total** | 52 |

**Legend:** ✅ Done · 🟡 Partial · ⬜ Not started

---

## 1. Operating Principle

Phase 5 delivers knockout, meta progression, economy, and legends while preserving RC release invariants until explicit gate commits. The game must remain playable after every commit.

```text
1. Pre-flight — read this ledger; confirm dependency + stop condition
2. Implementation — smallest scoped change
3. Validation — rtk npm run validate (+ smoke:http when runtime/assets touched)
4. Manual QA — when listed in task or 036 runbook
5. Docs — update this ledger + 035 + 037 as needed
6. Commit — atomic with evidence per 033 §17 template
```

**Hard rules (ongoing):** `maxMapIndex: 7` · `cloudSave: false` · no live APIs · save v3 · no battle math changes.

**P5-017 complete:** `knockoutEnabled: true` — harnesses updated in same wave.

---

## 2. Execution Waves

| Wave | Goal | Tasks | Exit gate |
|------|------|-------|-----------|
| Wave 0 | Planning foundation | P5-001–P5-006 | Docs + harness wired |
| Wave 1 | Knockout framework | P5-010–P5-018 | Runner + ceremony; flag false |
| Wave 2 | Knockout opponents | P5-020–P5-025 | Full JSON + trophy UI |
| Wave 3 | Meta progression | P5-030–P5-036 | meta.js + trophy room |
| Wave 4 | Economy | P5-040–P5-044 | Credits + full settlement |
| Wave 5 | Legends | P5-050–P5-053 | Fragments + unlock |
| Wave 6 | Save evolution | P5-060–P5-064 | v4 only if needed |
| Wave 7 | QA + release | P5-070–P5-072 | 037 GO sign-off |

---

## 3. Task Registry

| Task | Status | Wave | Dependencies |
|------|--------|------|--------------|
| P5-001 | ✅ | 0 | RC sign-off |
| P5-002 | ✅ | 0 | P5-001 |
| P5-003 | ✅ | 0 | P5-001 |
| P5-004 | ✅ | 0 | P5-001 |
| P5-005 | ✅ | 0 | P5-001 |
| P5-006 | ✅ | 0 | P5-002 |
| P5-010 | ✅ | 1 | P5-006 |
| P5-011 | ✅ | 1 | P5-010 |
| P5-012 | ✅ | 1 | P5-011 |
| P5-013 | ✅ | 1 | P5-012 |
| P5-014 | ✅ | 1 | P5-013 |
| P5-015 | ✅ | 1 | P5-014 |
| P5-016 | ✅ | 1 | P5-014 |
| P5-017 | ✅ | 1 | P5-020–P5-025, P5-018 |
| P5-018 | ✅ | 1 | P5-011 |
| P5-020 | ✅ | 2 | P5-010 |
| P5-021 | ✅ | 2 | P5-020 |
| P5-022 | ✅ | 2 | P5-021 |
| P5-023 | ✅ | 2 | P5-012 |
| P5-024 | ✅ | 2 | P5-014 |
| P5-025 | ✅ | 2 | P5-024 |
| P5-030 | ✅ | 3 | P5-017 |
| P5-031 | ✅ | 3 | P5-030 |
| P5-032 | ✅ | 3 | P5-030 |
| P5-033 | ✅ | 3 | P5-030 |
| P5-034 | ✅ | 3 | P5-031 |
| P5-035 | ✅ | 3 | P5-032 |
| P5-036 | ✅ | 3 | P5-030 |
| P5-040 | ✅ | 4 | P5-030 |
| P5-041 | ✅ | 4 | P5-040 |
| P5-042 | ✅ | 4 | P5-041 |
| P5-043 | ✅ | 4 | P5-040 |
| P5-044 | ✅ | 4 | P5-041 |
| P5-050 | ✅ | 5 | P5-040 |
| P5-051 | ✅ | 5 | P5-050 |
| P5-052 | ✅ | 5 | P5-051 |
| P5-053 | ✅ | 5 | P5-052 |
| P5-060 | ⏭ | 6 | P5-041 |
| P5-061 | ⏭ | 6 | P5-060 |
| P5-062 | ⏭ | 6 | P5-061 |
| P5-063 | ⏭ | 6 | P5-062 |
| P5-064 | ⏭ | 6 | P5-063 |
| P5-070 | 🔄 | 7 | P5-042, P5-053 |
| P5-071 | ⬜ | 7 | P5-070 |
| P5-072 | ⬜ | 7 | P5-071 |

---

## 4. Wave 0 — Planning and documentation

### P5-001 ✅

**Title:** SPEC 015 Phase 5 master plan  
**Objective:** Publish `033-phase-5-knockout-and-meta-plan.md` with all 15 plan sections.  
**Files:** `docs/033-phase-5-knockout-and-meta-plan.md`  
**Dependencies:** RC sign-off ([032](./032-release-candidate-validation-report.md))  
**Implementation notes:** Knockout = linear gates, not map 8 DAG. Reference 007 §8, 008 §18, 009 §10.  
**Acceptance criteria:** Executive summary through deferred Phase 6 present; dependency graph included.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-002 ✅

**Title:** Phase 5 task breakdown ledger  
**Objective:** Publish this file with P5-001–P5-072 registry.  
**Files:** `docs/034-phase-5-task-breakdown.md`  
**Dependencies:** P5-001  
**Acceptance criteria:** Progress summary, waves, full task specs, commit template.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-003 ✅

**Title:** Phase 5 assumptions and tradeoffs report  
**Objective:** Publish `035-phase-5-assumptions-tradeoffs.html`.  
**Files:** `docs/035-phase-5-assumptions-tradeoffs.html`  
**Dependencies:** P5-001  
**Acceptance criteria:** Assumptions, tradeoffs, risks, go/no-go section, P5-GOV note.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-004 ✅

**Title:** Phase 5 manual QA runbook  
**Objective:** Publish `036-phase-5-manual-qa.md`.  
**Files:** `docs/036-phase-5-manual-qa.md`  
**Dependencies:** P5-001  
**Acceptance criteria:** Covers 8-city, knockout, settlement, reload, meta, album per user spec.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-005 ✅

**Title:** Phase 5 validation report template  
**Objective:** Publish `037-phase-5-validation-report.md` in planning NO-GO state.  
**Files:** `docs/037-phase-5-validation-report.md`  
**Dependencies:** P5-001  
**Acceptance criteria:** All status sections present; verdict NO-GO until P5-072.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-006 ✅

**Title:** Phase 5 validation harness + docs wiring  
**Objective:** Add `validate-phase5-qa.mjs`; extend `validate-docs.mjs` and `package.json`.  
**Files:** `scripts/validate-phase5-qa.mjs`, `scripts/validate-docs.mjs`, `package.json`, `check:syntax` list  
**Dependencies:** P5-002–P5-005  
**Implementation notes:** Assert Phase 5 docs exist; `knockoutEnabled: false` default; plan sections referenced.  
**Acceptance criteria:** `rtk npm run validate` passes; harness fails if 033 missing.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** Stop if harness duplicates phase3 checks without additive value.

---

## 5. Wave 1 — Knockout framework

### P5-010

**Title:** Knockout teams JSON schema (stub)  
**Objective:** Create `data/football/knockout_teams.json` with 5 gate stubs matching 007 §8 shape.  
**Files:** `data/football/knockout_teams.json`  
**Dependencies:** P5-006  
**Implementation notes:** `schemaVersion`, `gates[]` with `gateIndex`, `gateName`, `historicalTeam`, `roster[]`, `kitColors`, `primaryStyle`, `signatureProfileId`. Stub form levels OK.  
**Acceptance criteria:** JSON loads; offline schema validator passes (P5-018 precursor).  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-011

**Title:** DomainKnockout loader module  
**Objective:** Add `js/domain/knockout.js` with `loadGates()`, `getGate(index)`, `buildGateTeam(gate)`.  
**Files:** `js/domain/knockout.js`, `index.html` script tag  
**Dependencies:** P5-010  
**Implementation notes:** Delegate team build to `DomainCombatAdapter` / `createInstance` patterns from bosses. Dependency-free fetch like bosses.  
**Acceptance criteria:** `window.DomainKnockout.getGate(0)` returns gate object in browser boot.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** DevTools: `DomainKnockout.getGate(0)`  
**Risk:** Medium — catalog ID resolution  
**Stop condition:** Stop if gate build requires battle math changes.

### P5-012

**Title:** Knockout Draw Ceremony screen  
**Objective:** Football-native draw ceremony using `transition-screen` or dedicated overlay.  
**Files:** `js/ui.js`, `js/game.js`, `css/style.css`, `js/data.js` (`GAME_THEME.knockout`)  
**Dependencies:** P5-011  
**Implementation notes:** 3s skippable; sets `state.knockoutPhase = true`; no map navigation.  
**Acceptance criteria:** Callable from `enterKnockoutStage()` without enabling feature flag.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** DevTools invoke ceremony  
**Risk:** Low  
**Stop condition:** N/A

### P5-013

**Title:** Stamp-8 routing branch (knockout vs slice complete)  
**Objective:** Update `showBadgeScreen` advance: when knockout enabled + 8 stamps → ceremony, not slice complete.  
**Files:** `js/game.js`  
**Dependencies:** P5-012  
**Implementation notes:** Keep `isFootballSliceComplete()` behavior when `knockoutEnabled === false`. Add `enterKnockoutStage()`.  
**Acceptance criteria:** With flag false, stamp 8 still shows slice complete. With flag true (dev override), ceremony fires.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Knockout Guard (flag false regression)  
**Risk:** **High** — wrong branch breaks RC path  
**Stop condition:** Stop if slice-complete regression fails.

### P5-014

**Title:** Linear knockout gate runner  
**Objective:** Implement `doKnockoutGate()` / `runKnockoutChain()` — prep → battle → transition loop.  
**Files:** `js/game.js`  
**Dependencies:** P5-013  
**Implementation notes:** **Do not** call `startMap(8)`. Reuse `eliteIndex` 0–4. Win Gate 4 → trophy flow (P5-024).  
**Acceptance criteria:** Dev-only flag true: can fight gate 0 and advance index on win.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Gate 0 battle  
**Risk:** **High**  
**Stop condition:** Stop if map-8 DAG invoked in football path.

### P5-015

**Title:** Football-native elite prep screen  
**Objective:** Reskin `showElitePrepScreen` for football — portraits, styles, gate copy.  
**Files:** `js/game.js`, `js/ui.js`, `css/style.css`  
**Dependencies:** P5-014  
**Implementation notes:** Remove PokeAPI sprite URLs on football path; use `DomainPortrait` / manifest.  
**Acceptance criteria:** Prep shows historical team name + signature + Core Six hint.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Matchday prep  
**Risk:** Medium  
**Stop condition:** N/A

### P5-016

**Title:** Knockout run persistence  
**Objective:** Persist `knockoutPhase`, `eliteIndex`, `knockoutGatesCleared` in run save.  
**Files:** `js/game.js` (saveRun/loadRun)  
**Dependencies:** P5-014  
**Implementation notes:** Resume skips prep on same gate index per Gen2 pattern.  
**Acceptance criteria:** Reload mid-knockout restores gate index.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Reload persistence  
**Risk:** Medium  
**Stop condition:** N/A

### P5-018

**Title:** Knockout data validation harness  
**Objective:** Add `scripts/validate-knockout-data.mjs`; wire to validate script.  
**Files:** `scripts/validate-knockout-data.mjs`, `package.json`  
**Dependencies:** P5-011  
**Acceptance criteria:** 5 gates; roster profileIds exist in catalog (or documented stand-ins); form levels in band.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-017

**Title:** Enable knockout feature flag (explicit gate)  
**Objective:** Set `FEATURES.knockoutEnabled = true`; update phase3/identity/phase5 harness expectations.  
**Files:** `js/domain/features.js`, `scripts/validate-phase3-qa.mjs`, `scripts/validate-identity-cleanup.mjs`, `scripts/validate-phase5-qa.mjs`  
**Dependencies:** P5-014–P5-016, P5-018, P5-020–P5-025  
**Implementation notes:** Single-purpose commit. Update 025/031 runbooks notes.  
**Acceptance criteria:** Harness expects `knockoutEnabled: true`; 8-stamp path enters knockout not slice complete.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Knockout entry  
**Risk:** **High**  
**Stop condition:** Stop if knockout data or runner incomplete.

---

## 6. Wave 2 — Knockout opponents

### P5-020

**Title:** Author full knockout gate rosters  
**Objective:** Replace stubs with 007 §8 final rosters and copy for gates 0–4.  
**Files:** `data/football/knockout_teams.json`  
**Dependencies:** P5-010  
**Acceptance criteria:** `validate-knockout-data.mjs` green; signature players match 007.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Medium  
**Stop condition:** N/A

### P5-021

**Title:** Knockout catalog profiles 37–41  
**Objective:** Add missing knockout-only profiles to `player_profiles.json` + portrait manifest entries.  
**Files:** `data/football/player_profiles.json`, `data/football/portrait_manifest.json`, `data/football/player_asset_manifest.json`  
**Dependencies:** P5-020  
**Acceptance criteria:** All gate roster IDs resolve; T1 portrait or fallback per profile.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** N/A  
**Risk:** Medium  
**Stop condition:** N/A

### P5-022

**Title:** Gate team builder hardening  
**Objective:** `DomainKnockout.buildGateTeam` — held items, move tiers, style hints.  
**Files:** `js/domain/knockout.js`, `js/domain/combat-adapter.js`  
**Dependencies:** P5-021  
**Acceptance criteria:** Gate 4 Messi team loads with tier-2 moves per 007.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Gate 4 preview in prep  
**Risk:** Low  
**Stop condition:** No battle math edits.

### P5-023

**Title:** Seeded bracket presentation  
**Objective:** Draw ceremony shows bracket slots / gate order from JSON seed metadata.  
**Files:** `knockout_teams.json`, `js/ui.js`, `js/game.js`  
**Dependencies:** P5-012  
**Acceptance criteria:** Player sees 5-round bracket outline before gate 0.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Draw ceremony  
**Risk:** Low  
**Stop condition:** N/A

### P5-024

**Title:** World Cup win screen  
**Objective:** Trophy win flow after Gate 4; triggers full settlement hook (lite until P5-041).  
**Files:** `js/game.js`, `js/ui.js`, `index.html`, `css/style.css`  
**Dependencies:** P5-014  
**Acceptance criteria:** Win sets `wonWorldCup` on run snapshot; shows trophy copy.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Trophy ceremony  
**Risk:** Medium  
**Stop condition:** N/A

### P5-025

**Title:** World Cup trophy asset  
**Objective:** Add trophy SVG to UI manifest; hook win screen.  
**Files:** `assets/ui/world-cup-trophy.svg`, `data/football/ui_asset_manifest.json`, `scripts/validate-asset-manifests.mjs`  
**Dependencies:** P5-024  
**Acceptance criteria:** Asset manifest validates; local path only.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** Visual check win screen  
**Risk:** Low  
**Stop condition:** N/A

---

## 7. Wave 3 — Meta progression

### P5-030

**Title:** domain/meta.js scaffold  
**Objective:** Create `settleRun()` per 008 §18 with step 0–12 pipeline (credits may be 0 until P5-040).  
**Files:** `js/domain/meta.js`, `index.html`  
**Dependencies:** P5-017  
**Implementation notes:** Start with album + flags + dedupe; expand in P5-041.  
**Acceptance criteria:** `DomainMeta.settleRun` returns patch + summary; unit-testable pure functions.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Medium  
**Stop condition:** N/A

### P5-031

**Title:** Account flags persistence  
**Objective:** Persist `accountFlags` keys: `reachedKnockout`, `reachedFinal`, `wonWorldCup`.  
**Files:** `js/domain/save.js`, `js/domain/meta.js`  
**Dependencies:** P5-030  
**Acceptance criteria:** Flags OR-merge on settlement; survive reload.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Meta unlocks  
**Risk:** Low  
**Stop condition:** N/A

### P5-032

**Title:** Run history log  
**Objective:** Append compact run summary to `runHistory` (cap 50) on settlement.  
**Files:** `js/domain/meta.js`, `js/domain/save.js`, `js/ui.js`  
**Dependencies:** P5-030  
**Acceptance criteria:** Title screen shows last 3 runs after settlement.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Run history  
**Risk:** Low  
**Stop condition:** N/A

### P5-033

**Title:** Football achievements evaluation  
**Objective:** Map knockout achievements; evaluate on settlement.  
**Files:** `js/domain/meta.js`, `js/game.js`, achievement definitions  
**Dependencies:** P5-030  
**Acceptance criteria:** `reached_knockout`, `world_cup_win` (or mapped IDs) unlock once.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Achievements  
**Risk:** Low  
**Stop condition:** N/A

### P5-034

**Title:** Trophy room panel  
**Objective:** Title-screen trophy room: wins, best gate, album %.  
**Files:** `js/ui.js`, `index.html`, `css/style.css`  
**Dependencies:** P5-031  
**Acceptance criteria:** Opens from title; reads account flags + `campaignWins`.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Trophy room  
**Risk:** Low  
**Stop condition:** N/A

### P5-035

**Title:** Profile statistics summary  
**Objective:** Account-level stats: runs started, completed, lost, knockout reaches.  
**Files:** `js/domain/meta.js`, `js/ui.js`  
**Dependencies:** P5-032  
**Acceptance criteria:** Counters increment on settlement; visible in trophy room.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Profile statistics  
**Risk:** Low  
**Stop condition:** N/A

### P5-036

**Title:** Knockout album page merge  
**Objective:** Merge knockout page from expansion layout; unlock on knockout entry.  
**Files:** `data/football/album_layout.json`, `js/domain/album.js`, `js/ui.js`  
**Dependencies:** P5-030  
**Acceptance criteria:** Knockout page hidden until gate reached; slots match 007.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Album knockout page  
**Risk:** Medium  
**Stop condition:** N/A

---

## 8. Wave 4 — Economy

### P5-040

**Title:** Football Credits storage  
**Objective:** Add `footballCredits` localStorage key + `DomainSave` read/write.  
**Files:** `js/domain/save.js`, `data/football/run_economy.json`  
**Dependencies:** P5-030  
**Acceptance criteria:** `validateAccountModel` accepts credits; default 0.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-041

**Title:** Full settlement replaces lite  
**Objective:** Wire `DomainMeta.settleRun` on win/game-over/knockout loss; deprecate lite for football ends.  
**Files:** `js/domain/meta.js`, `js/game.js`, `js/domain/save.js`  
**Dependencies:** P5-040  
**Acceptance criteria:** Settlement shows credits breakdown; dedupe guard holds.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Settlement  
**Risk:** **High**  
**Stop condition:** Stop if double-settlement on reload.

### P5-042

**Title:** Settlement UI credits breakdown  
**Objective:** Expand settlement modal with credits, duplicates, milestones sections.  
**Files:** `js/ui.js`, `css/style.css`  
**Dependencies:** P5-041  
**Acceptance criteria:** Each credit line item labeled per 008 §18.3.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Settlement  
**Risk:** Low  
**Stop condition:** N/A

### P5-043

**Title:** Run economy config  
**Objective:** Author `run_economy.json` — bands, duplicate payouts, per-run cap.  
**Files:** `data/football/run_economy.json`, `js/domain/meta.js`  
**Dependencies:** P5-040  
**Acceptance criteria:** Config loaded at settlement; values match 008 tables.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Medium — economy tuning  
**Stop condition:** N/A

### P5-044

**Title:** Duplicate sign → credits  
**Objective:** Implement duplicate conversion in settlement step 2.  
**Files:** `js/domain/meta.js`, `js/game.js` (ledger tracking)  
**Dependencies:** P5-041  
**Acceptance criteria:** Re-signing profile grants credits not album downgrade.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Scout duplicate scenario  
**Risk:** Medium  
**Stop condition:** N/A

---

## 9. Wave 5 — Legends

### P5-050

**Title:** Legend fragments storage  
**Objective:** `legendFragments` + `unlockedLegends` keys and validation.  
**Files:** `js/domain/save.js`, `js/domain/meta.js`  
**Dependencies:** P5-040  
**Acceptance criteria:** Fragment grants persist; cap per 008.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-051

**Title:** Legends album page  
**Objective:** Merge legends page; unlock rules from 008.  
**Files:** `data/football/album_layout.json`, `js/domain/album.js`  
**Dependencies:** P5-050  
**Acceptance criteria:** Page hidden until first fragment or legend sign.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** 036 §Legends album  
**Risk:** Low  
**Stop condition:** N/A

### P5-052

**Title:** Legend unlock flow  
**Objective:** ≥20 fragments → `unlockedLegends` append; settlement notification.  
**Files:** `js/domain/meta.js`, `js/ui.js`  
**Dependencies:** P5-051  
**Acceptance criteria:** Pelé (42) unlock simulation works in harness fixture.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Legend unlock  
**Risk:** Medium  
**Stop condition:** N/A

### P5-053

**Title:** Legend roster selection hook  
**Objective:** Unlocked legends appear in future run recruit pool or marquee bonus (minimal: album + trophy room display).  
**Files:** `js/domain/recruit.js` or `js/ui.js`  
**Dependencies:** P5-052  
**Acceptance criteria:** Unlocked legend visible in album as owned; documented if recruit defer.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Legends  
**Risk:** Low  
**Stop condition:** Stop if scope expands to legend map nodes — defer P5-053b to Phase 6.

---

## 10. Wave 6 — Save evolution (conditional)

### P5-060

**Title:** Save v4 design decision record  
**Objective:** Document v4 blob shape in 033/035; GO/NO-GO for migration in 037.  
**Files:** `docs/033-phase-5-knockout-and-meta-plan.md`, `docs/037-phase-5-validation-report.md`  
**Dependencies:** P5-041  
**Acceptance criteria:** Decision: v3 flat keys sufficient OR v4 required with explicit field list.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** Skip Wave 6 if v3 flat keys meet cut line.

### P5-061

**Title:** migrateSaveV3toV4 implementation  
**Objective:** Add migration in `domain/save.js` with report object.  
**Files:** `js/domain/save.js`  
**Dependencies:** P5-060 (GO decision)  
**Acceptance criteria:** v3 saves upgrade once; idempotent; `saveVersion = 4`.  
**Validation:** `rtk npm run validate`  
**Manual QA:** 036 §Save compatibility  
**Risk:** **High**  
**Stop condition:** Stop if migration loses album data in fixture test.

### P5-062

**Title:** poke_* key retirement (read path)  
**Objective:** Stop writing `poke_dex`; read-only fallback one release.  
**Files:** `js/domain/save.js`, `js/game.js`  
**Dependencies:** P5-061  
**Acceptance criteria:** New sessions use v4 keys only; old keys still load.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Load old save fixture  
**Risk:** **High**  
**Stop condition:** Per 030 audit classification.

### P5-063

**Title:** speciesId bridge strategy  
**Objective:** Dual-read `profileId` / `speciesId` in run team instances; write `profileId` on new runs.  
**Files:** `js/domain/combat-adapter.js`, `js/game.js`  
**Dependencies:** P5-062  
**Acceptance criteria:** Active runs with speciesId still battle correctly.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Reload old run  
**Risk:** Medium  
**Stop condition:** N/A

### P5-064

**Title:** Save migration validation harness  
**Objective:** `scripts/validate-save-migration.mjs` with fixtures.  
**Files:** `scripts/validate-save-migration.mjs`, `package.json`  
**Dependencies:** P5-063  
**Acceptance criteria:** Round-trip v3→v4→read passes; rollback reader passes.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Medium  
**Stop condition:** N/A

---

## 11. Wave 7 — QA and release

### P5-070

**Title:** Execute Phase 5 manual QA runbook  
**Objective:** Run [036](./036-phase-5-manual-qa.md) Attempt 1; file defects as P5-070a… tasks.  
**Files:** `docs/036-phase-5-manual-qa.md`  
**Dependencies:** P5-042, P5-053  
**Acceptance criteria:** All sections attempted; blockers listed in 037.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** Full 036 runbook  
**Risk:** Medium  
**Stop condition:** Blockers become fix tasks before P5-072.

### P5-071

**Title:** Phase 5 validation report update  
**Objective:** Update 037 with harness results, manual QA verdict, subsystem status.  
**Files:** `docs/037-phase-5-validation-report.md`  
**Dependencies:** P5-070  
**Acceptance criteria:** Knockout, economy, legend, save sections filled.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### P5-072

**Title:** Phase 5 sign-off  
**Objective:** GO/NO-GO in 037; update this ledger; sync 035 post-sign-off.  
**Files:** `docs/037-phase-5-validation-report.md`, `docs/034-phase-5-task-breakdown.md`, `docs/035-phase-5-assumptions-tradeoffs.html`  
**Dependencies:** P5-071  
**Acceptance criteria:** GO only if validate green, manual QA PASS, cut line met.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Sign-off checklist in 036  
**Risk:** Low  
**Stop condition:** NO-GO if knockout or settlement blockers open.

---

## 12. Commit Message Template

```text
<Phase 5 task summary>

Implementation:
<what changed and why it completes the task>

Validation:
rtk npm run validate
(+ smoke:http if applicable)

Test:
<evidence>

Docs:
<updated docs>
```

---

## 13. Stop Conditions (global)

1. `rtk npm run validate` fails — fix before next task.  
2. Knockout enabled before P5-017 gate — revert.  
3. Save migration loses album or run data — halt Wave 6.  
4. Battle math change required — escalate to explicit combat task; not Phase 5 default.  
5. Scope exceeds cut line (033 §14) — defer to Phase 6 and document in 035.

---

*End of SPEC 015A Task Breakdown.*
