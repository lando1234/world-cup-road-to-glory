# SPEC 014B — Release Candidate Hardening Task Breakdown

**Status:** Wave 0–1 complete — Waves 3–6 in progress  
**Last sync:** 2026-06-11 — RC-050 node icon SVG set shipped  
**Authority:** [026 — Identity Audit](./026-release-candidate-identity-audit.md) · [028 — Asset Pipeline](./028-asset-pipeline-and-art-direction.md)  
**Date:** 2026-06-10  
**Mode:** One atomic task per commit · Playable after every commit  
**Governance:** Update [032](./032-release-candidate-validation-report.md) at sign-off · [030](./030-release-candidate-bridge-retirement-plan.md) for bridges

---

## Progress Summary

| Metric | Count |
|--------|------:|
| **Done** | 23 |
| **In progress** | 5 |
| **Not started** | 24 |
| **Total** | 52 |

**Legend:** ✅ Done · 🟡 Partial · ⬜ Not started

---

## Hard Rules (carry from Phase 3)

- No knockout enablement · No cloud save · No battle math changes · No save schema migration
- No live API runtime dependency · No new gameplay mechanics
- No mass search-and-replace without audit classification (026)
- Identity/copy/asset changes only unless explicitly scoped

---

## Wave 0 — RC planning + identity audit

### RC-001

**Title:** SPEC 014 identity audit baseline  
**Objective:** Publish `026-release-candidate-identity-audit.md` with classified findings.  
**Files:** `docs/026-release-candidate-identity-audit.md`, `docs/027-release-candidate-hardening-task-breakdown.md`  
**Dependencies:** Phase 3 sign-off  
**Implementation notes:** Full-repo grep; link blockers to RC IDs.  
**Acceptance criteria:** Audit covers all search terms in SPEC 014; blockers numbered.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-002

**Title:** Asset pipeline and art direction spec  
**Objective:** Publish `028-asset-pipeline-and-art-direction.md`.  
**Files:** `docs/028-asset-pipeline-and-art-direction.md`  
**Dependencies:** RC-001  
**Acceptance criteria:** All asset categories A–F defined with naming and tiers.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-003

**Title:** Asset generation prompts library  
**Objective:** Publish `029-asset-generation-prompts.md`.  
**Files:** `docs/029-asset-generation-prompts.md`  
**Dependencies:** RC-002  
**Acceptance criteria:** Eight prompt templates with legal/style rules.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-004

**Title:** Identity cleanup validation harness  
**Objective:** Add `scripts/validate-identity-cleanup.mjs` wired to `npm run validate`.  
**Files:** `package.json`, `scripts/validate-identity-cleanup.mjs`, `scripts/validate-docs.mjs`  
**Dependencies:** RC-001  
**Implementation notes:** Release invariants + P1-049 surfaces + title tag; track RC-B debt list.  
**Acceptance criteria:** Harness passes on current football surfaces; fails on injected forbidden term in test fixture.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** Stop if harness duplicates P1-049 without adding value.

### RC-005

**Title:** Asset manifest validation harness  
**Objective:** Add `scripts/validate-asset-manifests.mjs`.  
**Files:** `package.json`, `scripts/validate-asset-manifests.mjs`  
**Dependencies:** RC-006–RC-009  
**Acceptance criteria:** Schema + local paths + stamp files exist; no remote URLs.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-006

**Title:** Player asset manifest schema  
**Objective:** Create `data/football/player_asset_manifest.json`.  
**Files:** `data/football/player_asset_manifest.json`  
**Dependencies:** RC-002  
**Implementation notes:** One entry per catalog profile; T0 fallbacks; paths per 028.  
**Acceptance criteria:** All 33 profiles listed; schema validates.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-007

**Title:** Node asset manifest schema  
**Objective:** Create `data/football/node_asset_manifest.json`.  
**Files:** `data/football/node_asset_manifest.json`  
**Dependencies:** RC-002  
**Acceptance criteria:** All football node types mapped with icon fallback.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-008

**Title:** Stamp asset manifest schema  
**Objective:** Create `data/football/stamp_asset_manifest.json`.  
**Files:** `data/football/stamp_asset_manifest.json`  
**Dependencies:** RC-002  
**Acceptance criteria:** Eight host stamps + unsigned/signed states reference existing SVGs.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-009

**Title:** UI asset manifest schema  
**Objective:** Create `data/football/ui_asset_manifest.json`.  
**Files:** `data/football/ui_asset_manifest.json`  
**Dependencies:** RC-002  
**Acceptance criteria:** Title, album, settlement icons defined with fallbacks.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-010

**Title:** RC validation report shell  
**Objective:** Create `030-release-candidate-validation-report.md` template.  
**Files:** `docs/030-release-candidate-validation-report.md`  
**Dependencies:** RC-001  
**Acceptance criteria:** GO/NO-GO sections for external demo.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

---

## Wave 1 — Player-facing terminology cleanup

### RC-011

**Title:** Title screen football-native copy  
**Objective:** Remove `Pokemon Roguelike` from visible title flow; align static HTML + `GAME_THEME`.  
**Files:** `index.html`, `js/data.js`, `js/ui.js`  
**Dependencies:** RC-004  
**Implementation notes:** RC-B01; subtitle = `Build your World Cup squad`.  
**Acceptance criteria:** Tab title + visible subtitle football-native; football boot unchanged.  
**Validation:** `rtk npm run validate` + `rtk npm run smoke:http`  
**Manual QA:** Boot title screen; confirm copy.  
**Risk:** Low  
**Stop condition:** Stop if Classic mode title breaks without gate.

### RC-012

**Title:** Hide or rename Nuzlocke title control in football mode  
**Objective:** Nuzlocke button not visible when `footballMode`.  
**Files:** `index.html`, `js/ui.js`, `js/game.js`  
**Dependencies:** RC-011  
**Acceptance criteria:** Football new campaign does not show Nuzlocke.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Title screen football path.  
**Risk:** Low  
**Stop condition:** N/A

### RC-013

**Title:** World Cup Album collection entry  
**Objective:** Replace Pokédex button label, title, alt text; add `ui/album.png` or reuse with alias.  
**Files:** `index.html`, `ui/`, `js/ui.js`  
**Dependencies:** RC-011  
**Acceptance criteria:** RC-B03 closed; icon owned and local.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Open album from title + map HUD.  
**Risk:** Medium  
**Stop condition:** Stop without approved icon asset.

### RC-014

**Title:** Remove Pokémon disclaimer from football DOM path  
**Objective:** Disclaimer not in DOM for football boot OR permanently removed.  
**Files:** `index.html`, `js/ui.js`  
**Dependencies:** RC-011  
**Acceptance criteria:** RC-B04 closed.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Inspect title DOM in football mode.  
**Risk:** Low  
**Stop condition:** Legal review if disclaimer required for other modes.

### RC-015

**Title:** Marquee signing screen fallback strings  
**Objective:** Replace `Choose Your Starter!` fallback with `Marquee Signing`.  
**Files:** `index.html`, `js/ui.js`  
**Dependencies:** RC-011  
**Acceptance criteria:** RC-B05 closed.  
**Validation:** `rtk npm run validate`  
**Manual QA:** New campaign → signing screen.  
**Risk:** Low  
**Stop condition:** N/A

### RC-016

**Title:** Battle chrome football-native fallbacks  
**Objective:** Replace `Wild Battle!` and legacy intro strings.  
**Files:** `index.html`, `js/ui.js`, `js/data.js` (`GAME_THEME.battle`)  
**Dependencies:** RC-011  
**Acceptance criteria:** RC-B06, RC-B10, RC-B11 closed on football path.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Start friendly match; check battle title + faint log.  
**Risk:** Medium  
**Stop condition:** Do not change `battle.js` math.

### RC-017

**Title:** City Stamp ceremony fallback copy  
**Objective:** Replace `Badge Earned!` / `Badges: n/8` with stamp copy.  
**Files:** `index.html`, `js/ui.js`, `js/game.js`  
**Dependencies:** RC-011  
**Acceptance criteria:** RC-B07 closed; HUD shows City Stamps not Badges.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Win host city boss; ceremony screen.  
**Risk:** Low  
**Stop condition:** Keep `badge-screen` id (bridge).

### RC-018

**Title:** Block football evolution overlay copy  
**Objective:** Ensure evolution overlay never shows in football mode; remove player-facing `evolution` if reachable.  
**Files:** `js/ui.js`, `js/game.js`, `index.html`  
**Dependencies:** RC-011  
**Acceptance criteria:** RC-B08 closed; football profiles skip evolution UI.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Win battles with form-level nodes only.  
**Risk:** Medium  
**Stop condition:** Stop if battle rewards break.

### RC-019

**Title:** Extend identity grep gate (Wave 1 surfaces)  
**Objective:** Add title, battle, stamp, album entry to `validate-identity-cleanup.mjs`.  
**Files:** `scripts/validate-identity-cleanup.mjs`  
**Dependencies:** RC-011–RC-018  
**Acceptance criteria:** CI fails on reintroduced forbidden terms in scoped blocks.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

---

## Wave 2 — Safe internal naming aliases

### RC-020

**Title:** Document bridge alias map in 016 inventory  
**Objective:** Extend bridge inventory with RC policy; no runtime rename.  
**Files:** `docs/016-phase-2-bridge-inventory.md`  
**Dependencies:** RC-001  
**Acceptance criteria:** Each bridge has RC retire task or defer reason.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-021

**Title:** CSS comment and non-player-facing class audit  
**Objective:** Update `style.css` header; document legacy class names.  
**Files:** `css/style.css`, `docs/026-release-candidate-identity-audit.md`  
**Dependencies:** RC-001  
**Acceptance criteria:** RC-B13 closed; no player-visible CSS content change required.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

### RC-022

**Title:** Football path remote URL guard  
**Objective:** Assert no PokeAPI/Showdown fetch on football boot path in identity harness.  
**Files:** `scripts/validate-identity-cleanup.mjs`, `js/ui.js` (only if football branch hits remote URL)  
**Dependencies:** RC-004  
**Acceptance criteria:** RC-B15 mitigated; football cards use local/manifest only.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Network tab off during scout/battle.  
**Risk:** Medium  
**Stop condition:** Stop if fix requires battle engine change.

### RC-023

**Title:** `GAME_THEME` single source of truth audit  
**Objective:** Align `data.js` theme with all football fallbacks; remove duplicate legacy strings in `ui.js`.  
**Files:** `js/data.js`, `js/ui.js`  
**Dependencies:** RC-011–RC-018  
**Acceptance criteria:** Football copy reads from `GAME_THEME` only.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Spot-check 5 screens.  
**Risk:** Low  
**Stop condition:** N/A

### RC-024

**Title:** Map node internal enum documentation  
**Objective:** Document `NODE_TYPES.CATCH` = Scout Report in 028/026; no enum rename.  
**Files:** `docs/028-asset-pipeline-and-art-direction.md`, `js/map.js` (comment only)  
**Dependencies:** RC-002  
**Acceptance criteria:** Node manifest keys match `NODE_TYPES`.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

---

## Wave 3 — Asset manifest and naming conventions

### RC-030

**Title:** Wire player asset manifest loader (read-only)  
**Objective:** Domain helper resolves portrait paths from manifest; no gameplay change.  
**Files:** `js/domain/profiles.js` or new `js/domain/player-assets.js`, manifest JSON  
**Dependencies:** RC-006, RC-005  
**Acceptance criteria:** `getPlayerAsset(profileId, slot)` returns local path or T0 fallback.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Cards still render with jersey fallback.  
**Risk:** Medium  
**Stop condition:** Stop if save shape touched.

### RC-031

**Title:** Stamp manifest runtime hook  
**Objective:** `getFootballStampAsset()` reads `stamp_asset_manifest.json`.  
**Files:** `js/game.js`, `data/football/stamp_asset_manifest.json`  
**Dependencies:** RC-008  
**Acceptance criteria:** All 8 ceremonies resolve manifest path.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Stamp ceremony map 3+.  
**Risk:** Low  
**Stop condition:** N/A

### RC-032

**Title:** Node icon manifest hook (presentation)  
**Objective:** Map tooltips use manifest icon paths when present; keep text labels.  
**Files:** `js/map.js`, `data/football/node_asset_manifest.json`  
**Dependencies:** RC-007  
**Acceptance criteria:** Fallback to emoji/icon codes when asset missing.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Map HUD tooltips.  
**Risk:** Medium  
**Stop condition:** N/A

### RC-033

**Title:** UI manifest hook for title/album icons  
**Objective:** Title collection button reads `ui_asset_manifest.json`.  
**Files:** `js/ui.js`, `data/football/ui_asset_manifest.json`  
**Dependencies:** RC-009, RC-013  
**Acceptance criteria:** Album icon path local and validated.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Title + map HUD album buttons.  
**Risk:** Low  
**Stop condition:** N/A

### RC-034

**Title:** Create `assets/` folder scaffold  
**Objective:** Directories per 028: `assets/players/`, `assets/nodes/`, `assets/ui/`, `.gitkeep` where empty.  
**Files:** `assets/**`  
**Dependencies:** RC-002  
**Acceptance criteria:** Folder structure matches 028 §4.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** N/A

---

## Wave 4 — Player portrait / form asset pipeline

### RC-040

**Title:** Marquee trio portrait batch (T1 placeholders)  
**Objective:** Add `assets/players/{slug}/album.png` for profiles 1–3 or T0 jersey SVG set.  
**Files:** `assets/players/**`, `player_asset_manifest.json`  
**Dependencies:** RC-030, RC-034  
**Acceptance criteria:** Marquee signing shows non-empty local asset or documented T0.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Marquee signing screen.  
**Risk:** Medium  
**Stop condition:** Legal gate for likeness.

### RC-041

**Title:** Host city hero portrait batch (32–36)  
**Objective:** Album/battle slots for Figo–Charlton per manifest.  
**Files:** `assets/players/**`, manifest  
**Dependencies:** RC-040  
**Acceptance criteria:** Manifest entries resolve; T0 fallback if art pending.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Album host_city page.  
**Risk:** Medium  
**Stop condition:** N/A

### RC-042

**Title:** Scout pool portrait coverage batch  
**Objective:** Portrait entries for all 33 catalog profiles.  
**Files:** `assets/players/**`, `portrait_manifest.json`, `player_asset_manifest.json`  
**Dependencies:** RC-040  
**Acceptance criteria:** Every scoutable ID has manifest row + fallback.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Scout report 3 cards.  
**Risk:** Medium  
**Stop condition:** N/A

### RC-043

**Title:** Form level asset naming (Career Form)  
**Objective:** Document and stub `form-1.png` paths; player-facing **Form Level** only.  
**Files:** manifest, `docs/028`, `GAME_THEME` if needed  
**Dependencies:** RC-002  
**Acceptance criteria:** No player-facing “evolution”; form assets optional T0.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Friendly match +2 Form Level node.  
**Risk:** Low  
**Stop condition:** N/A

---

## Wave 5 — Node icon asset pipeline

### RC-050

**Title:** Node icon set v1 (SVG)  
**Objective:** Local SVGs for scout, friendly, rival, recovery, gear, coach, host city, event.  
**Files:** `assets/nodes/*.svg`, `node_asset_manifest.json`  
**Dependencies:** RC-032, RC-034  
**Acceptance criteria:** Manifest paths exist for football node types.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Map tooltips / node legend.  
**Risk:** Medium  
**Stop condition:** N/A

### RC-051

**Title:** Node icon signed/locked states  
**Objective:** Visual for completed vs locked final challenge node.  
**Files:** `assets/nodes/`, manifest  
**Dependencies:** RC-050  
**Acceptance criteria:** Locked state asset defined.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Map 7 boss node.  
**Risk:** Low  
**Stop condition:** N/A

---

## Wave 6 — Stamp / album / UI asset pipeline

### RC-060

**Title:** Stamp unsigned/signed state variants  
**Objective:** SVG or CSS state per 028 for album + HUD.  
**Files:** `assets/stamps/`, `stamp_asset_manifest.json`  
**Dependencies:** RC-031  
**Acceptance criteria:** Eight cities × states documented.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Stamp ceremony + album slots.  
**Risk:** Low  
**Stop condition:** N/A

### RC-061

**Title:** Album slot state artwork  
**Objective:** unknown / scouted / signed slot graphics.  
**Files:** `assets/ui/album/`, `ui_asset_manifest.json`  
**Dependencies:** RC-033  
**Acceptance criteria:** Album modal uses local state art or CSS fallback.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Album unknown vs signed slots.  
**Risk:** Medium  
**Stop condition:** N/A

### RC-062

**Title:** Title logo and primary UI icon set  
**Objective:** `assets/ui/logo.svg`, settlement/trophy icons.  
**Files:** `assets/ui/`, `index.html`, `ui_asset_manifest.json`  
**Dependencies:** RC-033  
**Acceptance criteria:** Title logo local; no text-only hack.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Title + settlement screens.  
**Risk:** Medium  
**Stop condition:** Brand approval.

### RC-063

**Title:** Album frame variants (marquee / favorites / host city)  
**Objective:** Frame assets per album page type.  
**Files:** `assets/ui/album/`, manifest  
**Dependencies:** RC-061  
**Acceptance criteria:** Three page frames defined in manifest.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Album page tabs.  
**Risk:** Low  
**Stop condition:** N/A

---

## Wave 7 — Visual QA and release candidate sign-off

### RC-070

**Title:** RC manual QA runbook  
**Objective:** Create runbook for identity + asset visual pass.  
**Files:** `docs/031-release-candidate-manual-qa-runbook.md` (optional) or section in 030  
**Dependencies:** RC-011–RC-063  
**Acceptance criteria:** Tester can execute without codebase knowledge.  
**Validation:** `rtk npm run validate`  
**Manual QA:** Execute runbook once.  
**Risk:** Low  
**Stop condition:** N/A

### RC-071

**Title:** Full RC validation report  
**Objective:** Complete `030-release-candidate-validation-report.md` with GO/NO-GO.  
**Files:** `docs/030-release-candidate-validation-report.md`  
**Dependencies:** RC-070  
**Acceptance criteria:** External demo verdict recorded.  
**Validation:** `rtk npm run validate` + smoke  
**Manual QA:** Full runbook PASS.  
**Risk:** Low  
**Stop condition:** NO-GO if identity blockers remain.

### RC-072

**Title:** RC sign-off and Phase 4 gate  
**Objective:** Mark SPEC 014 complete; list Phase 4 prerequisites.  
**Files:** `docs/027`, `docs/030`, governance HTML if needed  
**Dependencies:** RC-071  
**Acceptance criteria:** RC GO before Phase 4 kickoff.  
**Validation:** `rtk npm run validate`  
**Manual QA:** N/A  
**Risk:** Low  
**Stop condition:** Any release invariant regression → NO-GO.

---

## Commit Message Template

```text
<imperative summary>

Implementation: <RC task scope>.

Validation: rtk npm run validate. <smoke if run>.

Test: <harness/manual evidence>.

Docs: <026/027/030 updates>.
```

---

*End of SPEC 014B — Release Candidate Hardening Task Breakdown.*
