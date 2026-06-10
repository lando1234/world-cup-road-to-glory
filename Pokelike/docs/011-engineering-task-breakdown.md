# SPEC 011 — Engineering Task Breakdown

**Status:** Authoritative Phase 1 implementation tickets  
**Authority:** Breaks down [010-vertical-slice-implementation-plan.md](./010-vertical-slice-implementation-plan.md) Phase 1 only  
**Inputs:** [001](./001-codebase-discovery.md), [006B](./006B-technical-blueprint-revised.md), [007](./007-football-data-pack.md), [008](./008-meta-progression.md), [009](./009-gameplay-loop-node-system.md)  
**Version:** v1.1  
**Date:** 2026-06-10  
**Last sync:** `main` @ this commit — Squad Registration swap UX (T26)
**Assumptions:** Single developer · existing Pokelike vanilla JS · browser game · no React · no backend changes

---

## Progress Summary

| Metric | Count |
|--------|------:|
| **Done** | 39 |
| **Partial** | 7 |
| **Not started** | 6 |
| **Total tickets** | 52 |

**Legend:** ✅ Done · 🟡 Partial (shipped subset; acceptance not fully met) · ⬜ Not started

### Execution Protocol Addendum

Before continuing gameplay implementation, T0 establishes the repeatable validation baseline for the rest of Phase 1.

| ID | Status | Notes / commit |
|----|--------|----------------|
| T0-001 | ✅ | Node project baseline, validation harness, static server, Phase 2 visual frictions registry — `feb8f94` |
| T1-001 | ✅ | Boot gate, slice node gates, and cloud-save shutdown — `db538b3` |
| T2-001 | ✅ | Host city boss catalog, loader, boot gate, and Node boss-team validation — `b75e23c` |
| T3-001 | ✅ | Phase 1 `album_layout.json` and Node layout/profile validation — `73523ba` |
| T4-001 | ✅ | `DomainAlbum` `game_album` seen/signed API and monotonic storage validation — `495ef23` |
| T5-001 | ✅ | Save v3 album-only migration, cloud schema bump, and idempotency validation — `94d3326` |
| T6-001 | ✅ | Boot-time `migrateSaveV2toV3()` call before run reads and fresh-account validation — `011a3fa` |
| T7-001 | ✅ | `DomainScout` pool loader/report builder, `scout_pools.json`, and Node report validation — `220747a` |
| T8-001 | ✅ | Map 0 layer-1 catch forced scout override and Node validation — `65ec43b` |
| T9-001 | ✅ | `DomainRecruit` contract offer/pass API, ledger append, duplicate detection, and Node validation — `e3b1145` |
| T10-001 | ✅ | `doCatchNode` football branch uses Scout Report, Contract Offer, album seen, and no catch RNG — `e13362b` |
| T11-001 | ✅ | `doBossNode` football branch uses `DomainBosses.getHostCity()` and `buildBossTeam()` without `GYM_LEADERS` — `1edb6f0` |
| T12-001 | ✅ | `startMap()` caps football slice maps at `FEATURES.maxMapIndex` and map HUD/tooltips use Host City boss data — `0aa0e18` |
| T13-001 | ✅ | Third stamp routes to a minimal slice-complete screen and lightweight `settleRunLite()` before returning to title — `752d108` |
| T14-001 | ✅ | `badge-screen` football branch renders City Stamp flag/copy/counts without legacy badge sprites — `1e39698` |
| T15-001 | ✅ | Football question nodes resolve only to battle/trainer, with slice-safe weights/gates validated — `e0da8e5` |
| T16-001 | ✅ | Football collection opens World Cup Album modal with layout pages and unknown/seen/signed states — `f20e5d4` |
| T17-001 | ✅ | `DomainAlbum` owns album layout fetch/cache plus ordered slot profile IDs — `83e8b8a` |
| T18-001 | ✅ | Football `markPokedexSeen/Caught` facades route to `DomainAlbum` before `poke_dex` writes — `2c9931a` |
| T19-001 | ✅ | `DomainSave.settleRunLite()` + `applyAccountPatch()` feed settlement modal before returning to title — `959079b` |
| T20-001 | ✅ | Game-over settlement path documents and validates patch-before-clear ordering — `2525cc8` |
| T21-001 | ✅ | Cloud save stays disabled for football Phase 1, with no `game_album` cloud key or disabled-mode fetch — `387895a` |
| T22-001 | ✅ | New and loaded runs normalize `runId` plus minimal recruitment ledger shape — `fd70d35` |
| T23-001 | ✅ | Current-run persistence preserves `runId` and `ledger` through `poke_current_run` save/load — `4c01f0a` |
| T24-001 | ✅ | `applyAccountPatch()` merges `game_album` monotonically and leaves active runs untouched — `c09b5ad` |
| T25-001 | ✅ | Catch screen is reskinned as Scout Report with contract confirmation, duplicate hints, and stamp animation hook — `6826e6a` |
| T26-001 | ✅ | Swap screen is reskinned as Squad Registration for football full-squad signings — this commit |

**Per-task Definition of Done from this point forward:**

1. Mini-plan before edits
2. Implementation
3. Technical validation
4. Test specific to the developed behavior
5. Browser or HTTP smoke validation when UI/gameplay is touched; automated screenshots are optional and only taken when explicitly requested
6. Update this task breakdown
7. Update `012-phase-1-assumptions-tradeoffs-report.html`
8. Update `013-phase-2-visual-frictions.html` when visual debt, sprite gaps, image issues, or UX friction are found
9. Review diff
10. One atomic commit, with validation evidence in the commit message

**Default validation commands:**

```bash
rtk npm run validate
```

Domain tasks should extend `Pokelike/scripts/validate-football-domain.mjs` instead of relying only on manual browser playtests. Documentation or registry tasks should extend `Pokelike/scripts/validate-docs.mjs` when they add durable project docs.

### Task Status Registry

| ID | Status | Notes / commit |
|----|--------|----------------|
| P1-001 | ✅ | `features.js` + load order — `8af1c73` |
| P1-002 | ✅ | Domain module shells — `923f225` |
| P1-003 | ✅ | `STYLE_CHART` + labels — `8c6b2a2` |
| P1-004 | ✅ | `getTypeEffectiveness` football path — `f9ece79` |
| P1-005 | ✅ | `GAME_THEME` object — `22e8632`, extended in battle/title passes |
| P1-006 | ✅ | Title-screen hide + map trade/legendary gates + cloud-save no-op — `db538b3` |
| P1-007 | ✅ | `DomainProfiles.initCatalog()` and `DomainBosses.initHostCityBosses()` both gate campaign start — `b75e23c` |
| P1-008 | ✅ | `player_profiles.json` — 20 slice roster — `94adb62` |
| P1-009 | ✅ | Catalog loader + `getProfile()` — `eef0f66`; `isFootballProfileId` now catalog-backed |
| P1-010 | ✅ | `createPlayerInstance()` — `9085c97` |
| P1-011 | ✅ | `host_city_bosses.json` authored for maps 0–2 with spec rosters — `b75e23c` |
| P1-012 | ✅ | `DomainBosses` loader, validation, lookup, and `buildBossTeam()` — `b75e23c` |
| P1-013 | ✅ | `album_layout.json` authored for marquee + favorites slice pages — `73523ba` |
| P1-014 | ✅ | PokeAPI guard + football `getFootballCatchChoices` — `f20ff1e`, `a098829` |
| P1-015 | ✅ | `STARTER_IDS = [1, 2, 3]` — `c430a36` |
| P1-016 | ✅ | `domain/scout.js` + `scout_pools.json` build 3-choice reports for maps 0–2 — `220747a` |
| P1-017 | ✅ | Map 0 layer-1 catch report forces Pedri/Ramos/Alisson — `65ec43b` |
| P1-018 | ✅ | `DomainRecruit.offerContract()` / `passOnReport()` ledger + album semantics — `e3b1145` |
| P1-019 | ✅ | Football `doCatchNode` uses `DomainScout` + `DomainRecruit`; legacy catch retained for non-football — `e13362b` |
| P1-020 | ✅ | New runs receive `runId` and minimal recruitment ledger; loaded legacy saves normalize missing fields — this commit |
| P1-021 | ✅ | `checkAndEvolveTeam` + Moon Stone guards — `da6a262` |
| P1-022 | ✅ | Football `doBossNode` uses `DomainBosses.getHostCity()` + `buildBossTeam()`; legacy `GYM_LEADERS` path retained outside football — `1edb6f0` |
| P1-023 | ✅ | `startMap()` normalizes maps above `FEATURES.maxMapIndex`; football HUD/tooltips show Host City names — `0aa0e18` |
| P1-024 | ✅ | Third stamp shows `slice-complete-screen` instead of advancing to map 3 — `752d108` |
| P1-025 | ✅ | `badge-screen` football branch shows City Stamp display name, host city, nation flag, and stamp counts — `1e39698` |
| P1-026 | ✅ | Football slice gates trade/legendary, validates L1 scout weight, uses GAME_THEME labels, and restricts question nodes to battle/trainer — `e0da8e5` |
| P1-027 | ✅ | `DomainAlbum` `game_album` API implemented for seen/signed/count — `495ef23` |
| P1-028 | ✅ | `migrateSaveV2toV3()` copies `poke_dex` to `game_album`, sets save v3, and preserves active runs — `94d3326` |
| P1-029 | ✅ | Football profile writes through `markPokedexSeen/Caught` route to `DomainAlbum` and return before `poke_dex` writes — `2c9931a` |
| P1-030 | ✅ | Football collection opens World Cup Album modal with Marquee/Favorites pages and unknown/seen/signed states — `f20e5d4` |
| P1-031 | ✅ | `DomainAlbum` loads/caches `album_layout.json`, exposes pages and ordered slot profile IDs, and boot gate initializes layout — `83e8b8a` |
| P1-032 | 🟡 | Marquee Signing reskin — `5c2b3d8`; **Core Six style triangle tooltip missing** |
| P1-033 | ✅ | Scout Report screen has football copy, host-city subtitle, duplicate hints, contract confirmation, and animation hook — this commit |
| P1-034 | ✅ | Football full-squad flow uses Squad Registration copy, decline contract action, and DomainRecruit force-add — this commit |
| P1-035 | 🟡 | Minimal `slice-complete-screen` shell exists — this commit; full squad snapshot/album presentation polish pending |
| P1-036 | ✅ | `DomainSave.settleRunLite()` returns album patch + summary; settlement modal renders on slice complete and football game over — `959079b` |
| P1-037 | 🟡 | `renderPlayerCard()` — `edabaa7`; **not all screens / stat labels unified** |
| P1-038 | 🟡 | Title reskin + hide deferred modes — `ec5e717`; **map HUD still opens Pokédex modal** |
| P1-039 | 🟡 | Battle **field** copy only (Transfer Target, Form N) — `a098829`; **battle log strings untouched** |
| P1-040 | 🟡 | Portrait fallback in cards + battle — `a098829`; **T0 silhouette spec incomplete** |
| P1-041 | ✅ | `initGame()` calls `migrateSaveV2toV3()` before Continue Run reads — `011a3fa` |
| P1-042 | ✅ | `saveRun()` serializes full state with `runId`/`ledger`; `loadRun()` restores and normalizes them — this commit |
| P1-043 | ✅ | `applyAccountPatch()` monotonic merge implemented; returns boolean and does not touch `poke_current_run` — this commit |
| P1-044 | ✅ | Football game over runs settlement/applyAccountPatch before `clearSavedRun()` with order invariant test — `2525cc8` |
| P1-045 | ✅ | Cloud save remains feature-gated off; validation proves no `game_album` cloud key, no disabled-mode fetch, no boot auth modal — this commit |
| P1-046 | ⬜ | QA — happy path |
| P1-047 | ⬜ | QA — album persistence |
| P1-048 | ⬜ | QA — game over settlement |
| P1-049 | ⬜ | QA — terminology grep |
| P1-050 | ⬜ | QA — battle regression |
| P1-051 | ⬜ | QA — Map 0 scout script |
| P1-052 | ⬜ | Phase 1 sign-off |

---

## Recommended Execution Flow

Single-developer order from **current state** after T2. Finish partial tickets before starting dependents. Do **not** skip album/save foundation before recruitment UI.

### Wave 0 — Validation baseline ✅

```
T0-001 → Node baseline + validation harness + static server + Phase 2 visual frictions registry
```

**Exit:** Every later task has a stable place for scripted tests, assumptions, task status, and deferred visual debt.

### Wave 1 — Boot & gating ✅

```
P1-007  (finish) → bosses JSON fetch in boot sequence
P1-011  → host_city_bosses.json
P1-012  → domain/bosses.js loader + buildBossTeam
```

**Exit:** Catalogs fully loaded before New Run; deferred modes unreachable in engine + UI. Completed by T1 + T2.

### Wave 2 — Album & run ledger (save foundation)

```
P1-013  → album_layout.json
P1-027  → domain/album.js API
P1-028  → migrateSaveV2toV3
P1-041  → call migration on initGame boot
P1-020  → runId + ledger on state init ✅
P1-042  → persist ledger in poke_current_run ✅
P1-043  → applyAccountPatch ✅
```

**Current:** P1-013, P1-027, P1-028, P1-041, P1-016, P1-017, P1-018, P1-019, P1-020, P1-022, P1-023, P1-024, P1-025, P1-026, P1-029, P1-030, P1-031, P1-033, P1-034, P1-036, P1-042, P1-043, P1-044, and P1-045 complete. Next implementation step is P1-046 run loop QA and release checklist alignment.

**Exit:** `game_album` read/write path exists; mid-run reload preserves ledger shape.

### Wave 3 — Recruitment loop (core slice gameplay)

```
P1-016  → domain/scout.js + scout_pools.json
P1-017  → Map 0 layer-1 forced pool
P1-018  → domain/recruit.js
P1-019  → rewire doCatchNode
P1-029  → route dex writes → album facades
P1-033  → Scout Report / Contract Offer UI ✅
P1-034  → Squad Registration reskin ✅
```

**Exit:** Catch nodes are football scout reports; album seen/signed updates on display/sign.

### Wave 4 — Host city progression

```
P1-022  → doBossNode → getHostCity ✅
P1-023  → cap maps at maxMapIndex 2 ✅
P1-024  → slice-complete at badges === 3 ✅
P1-025  → City Stamp ceremony ✅
P1-026  → football node weights + GAME_THEME tooltips ✅
P1-035  → slice-complete screen
P1-036  → settleRunLite + summary modal
P1-044  → game over settlement before clearSavedRun ✅
P1-045  → cloud save suppress (finish P1-006 cloud slice) ✅
```

**Exit:** 3-map campaign ends cleanly; settlement lite on win and loss.

### Wave 5 — UI polish (close partials)

```
P1-037  (finish) → unify all card call sites + football stat labels
P1-038  (finish) → map HUD Album button + hide remaining Pokémon chrome
P1-039  (finish) → battle log faint/win/loss strings
P1-040  (finish) → T0 silhouette pipeline everywhere
P1-031  → album_layout loader ✅
P1-030  → album modal (marquee + favorites pages) ✅
P1-032  (finish) → Core Six style triangle on marquee
```

**Exit:** Grep gate (P1-049) likely passable on slice screens.

### Wave 6 — QA & sign-off

```
P1-050 → P1-051 → P1-046 → P1-047 → P1-048 → P1-049 → P1-052
```

**Exit:** SPEC 010 §13 checklist green; handoff-ready vertical slice.

### Parallel shortcuts (only if blocked)

| If blocked on | Can prep in parallel |
|---------------|---------------------|
| P1-019 | P1-013 layout JSON, P1-033 HTML/CSS mock |
| P1-022 | P1-011 boss JSON authoring |
| P1-030 | P1-031 layout loader after P1-013 exists |

---

## Overview

Phase 1 delivers a **vertical slice**: Marquee Signing → 3 host city legs → 3 City Stamps → slice-complete settlement. No knockout, no Football Credits, no legend fragments, no named events.

**Ticket prefix:** `P1-###`  
**Effort key:** XS (<2h) · S (2–4h) · M (0.5–1 day) · L (1–2 days) · XL (2+ days)

---

## EPIC A — Foundation

---

### P1-001

**Title:** Create `domain/features.js` with Phase 1 flags

**Objective:** Centralize feature gates so slice, football mode, and deferred systems are toggled from one module.

**Files Touched:**
- `js/domain/features.js` (new)
- `index.html`

**Dependencies:** None

**Acceptance Criteria:**
- Exports `FEATURES` object with at minimum: `footballMode: true`, `sliceMode: true`, `maxMapIndex: 2`, `continentalCup: false`, `cloudSave: false`, `nuzlocke: false`, `trade: false`
- `index.html` loads `domain/features.js` before all other domain scripts and before `data.js`
- `typeof FEATURES` is available globally after script load (matches existing global-namespace pattern)

**Estimated Effort:** XS

**Risk Level:** LOW — isolated new file; no behavior change until consumers read flags.

---

### P1-002

**Title:** Scaffold remaining `js/domain/` module shells

**Objective:** Establish the portable domain layer folder structure per 006B §3.1 before filling implementations.

**Files Touched:**
- `js/domain/styles.js` (new — stub)
- `js/domain/profiles.js` (new — stub)
- `js/domain/album.js` (new — stub)
- `js/domain/bosses.js` (new — stub)
- `js/domain/save.js` (new — stub)
- `js/domain/combat-adapter.js` (new — stub)
- `js/domain/recruit.js` (new — stub)
- `index.html`

**Dependencies:** P1-001

**Acceptance Criteria:**
- All 8 domain files exist with JSDoc module headers and empty/no-op exports where not yet implemented
- Script load order in `index.html` matches SPEC 010 §12: `features → styles → profiles → album → bosses → combat-adapter → save → recruit → data.js → …`
- `initGame()` does not throw when domain stubs are loaded

**Estimated Effort:** S

**Risk Level:** LOW — scaffolding only; load-order mistakes are the main failure mode (caught immediately on boot).

---

### P1-003

**Title:** Implement `StyleId` enum and `STYLE_CHART` in `domain/styles.js`

**Objective:** Replace Pokémon type keys with native `StyleId` keys while preserving identical 18×18 balance matrix from `TYPE_CHART`.

**Files Touched:**
- `js/domain/styles.js`
- `js/data.js` (read `TYPE_CHART` for parity reference)

**Dependencies:** P1-002

**Acceptance Criteria:**
- `STYLE_CHART` contains all 18 `StyleId` keys from 006B §4.1
- `STYLE_LABELS` maps each `StyleId` to display label (e.g. `high_press` → "High Press")
- `styleCssClass(styleId)` returns `data-style` attribute value and legacy `.type-*` alias for transition
- `styleToLegacyType(styleId)` maps to capitalized keys battle.js currently expects (combat boundary only)
- Matrix numeric values are identical to `TYPE_CHART` for every cell (manual or script parity check)

**Estimated Effort:** M

**Risk Level:** MEDIUM — incorrect matrix values break combat balance; must verify parity before wiring battle.

---

### P1-004

**Title:** Re-export style system from `data.js` and wire `getTypeEffectiveness` to `STYLE_CHART`

**Objective:** Make `data.js` consume domain styles for football mode without rewriting `battle.js` math.

**Files Touched:**
- `js/data.js`
- `js/domain/styles.js`

**Dependencies:** P1-003

**Acceptance Criteria:**
- When `FEATURES.footballMode === true`, `getTypeEffectiveness(attackerType, defenderType)` resolves via `styleToLegacyType()` or direct `STYLE_CHART` lookup
- `TYPE_CHART` remains in `data.js` for non-football paths but is not used when `FEATURES.footballMode`
- `MOVE_POOL` keys unchanged in slice (style labels applied at display layer only in Phase 1)

**Estimated Effort:** S

**Risk Level:** MEDIUM — dual-path logic; wrong branch silently uses Pokémon types in football mode.

---

### P1-005

**Title:** Create `GAME_THEME` terminology object

**Objective:** Centralize all football-facing copy so slice screens never hardcode Pokémon strings.

**Files Touched:**
- `js/data.js`

**Dependencies:** P1-001

**Acceptance Criteria:**
- `GAME_THEME` object includes at minimum: `title`, `subtitle`, `collectionLabel` ("World Cup Album"), `managerLabel`, `starterScreenTitle` ("Marquee Signing"), `catchScreenTitle` ("Contract Offer"), `scoutReportTitle`, `swapScreenTitle` ("Squad Registration"), `recoveryCenterLabel`, `cityStampLabel`, `battle.faint` ("injured off"), `battle.win` ("duel won"), `sliceCompleteTitle`
- All keys documented in JSDoc for future React port
- No Pokémon terms in `GAME_THEME` values

**Estimated Effort:** S

**Risk Level:** LOW — data-only; missed keys surface during UI reskin tasks.

---

### P1-006

**Title:** Gate deferred mode entry points behind `FEATURES`

**Objective:** Prevent slice players from reaching Nuzlocke, Battle Tower, trade nodes, or cloud save UI.

**Files Touched:**
- `js/game.js`
- `js/map.js`
- `js/cloud-save.js`
- `index.html` (conditional visibility via `ui.js` init)

**Dependencies:** P1-001, P1-005

**Acceptance Criteria:**
- When `FEATURES.nuzlocke === false`, Nuzlocke button hidden on title screen
- When `FEATURES.continentalCup === false`, Battle Tower button hidden
- When `FEATURES.trade === false`, trade node weight is 0 in map generation
- When `FEATURES.cloudSave === false`, cloud save button hidden; `initCloudSave()` skipped or no-op
- `legendary` node weight is 0 in slice (per SPEC 010 §3.3)

**Estimated Effort:** S

**Risk Level:** LOW — UI hide + weight zero; legacy code paths remain but unreachable.

---

### P1-007

**Title:** Add `initCatalog()` async boot gate on title screen

**Objective:** Load football JSON catalogs before first run without blocking HTML parse.

**Files Touched:**
- `js/domain/profiles.js`
- `js/domain/bosses.js`
- `js/game.js`
- `js/ui.js`

**Dependencies:** P1-002

**Acceptance Criteria:**
- `initCatalog()` fetches `data/football/player_profiles.json` and `data/football/host_city_bosses.json`
- Title screen "New Run" disabled until `initCatalog()` resolves or shows loading state
- Failed fetch displays user-visible error; does not crash `initGame()`
- Catalog cached in memory; subsequent runs do not re-fetch

**Estimated Effort:** M

**Risk Level:** MEDIUM — async race with `runGeneration` pattern; must not start run before catalog ready.

---

## EPIC B — Football Data

---

### P1-008

**Title:** Author `player_profiles.json` — 20-player slice roster

**Objective:** Create canonical player catalog with authored stats per SPEC 010 Appendix A and 007 §4.2.

**Files Touched:**
- `data/football/player_profiles.json` (new)

**Dependencies:** None (content task; can start Day 1 parallel to P1-003)

**Acceptance Criteria:**
- Contains exactly 20 profiles: IDs 1–3, 4, 6, 7, 9, 10, 12, 14, 15, 17, 18, 28, 29, 30, 31, 16, 22, 26
- Starters are Mbappé (1), Messi (2), Van Dijk (3) — not Modrić
- Each entry includes: `profileId`, `slug`, `displayName`, `commonName`, `nation`, `position`, `primaryStyle`, `secondaryStyle`, `baseStats`, `rarity`, `portrait`, `flavorText`, `flags`, `album`
- Stats match 007 §4.2 table for listed IDs
- `schemaVersion: 1` at root

**Estimated Effort:** M

**Risk Level:** LOW — content authoring; errors caught when `getProfile()` validation runs.

---

### P1-009

**Title:** Implement `domain/profiles.js` catalog loader and `getProfile()`

**Objective:** Provide single gateway for player definitions; eliminate PokeAPI for football IDs.

**Files Touched:**
- `js/domain/profiles.js`
- `data/football/player_profiles.json`

**Dependencies:** P1-007, P1-008

**Acceptance Criteria:**
- `loadCatalog(json)` parses and indexes profiles by `profileId`
- `getProfile(id)` returns profile or `null` for unknown ID
- `getProfileOrThrow(id)` used internally for slice roster IDs
- `isFootballProfileId(id)` returns true for `id >= 1 && id <= 50`
- Throws descriptive error if catalog not loaded

**Estimated Effort:** M

**Risk Level:** LOW — straightforward JSON index; high impact as dependency for most tasks.

---

### P1-010

**Title:** Implement `createPlayerInstance()` in `domain/combat-adapter.js`

**Objective:** Create battle-ready instances from catalog profiles with `speciesId === profileId` invariant.

**Files Touched:**
- `js/domain/combat-adapter.js`
- `js/domain/profiles.js`
- `js/domain/styles.js`

**Dependencies:** P1-009, P1-003

**Acceptance Criteria:**
- `createPlayerInstance(profileId, formLevel, opts)` returns object matching existing instance shape: `speciesId`, `name`, `level`, `types` (from styles via `styleToLegacyType`), `baseStats`, `currentHp`, `maxHp`, `moveTier`, `isShiny: false`, `heldItem: null`
- `profileId` and `speciesId` always equal
- `name` comes from `displayName`; never mutated after creation
- `calcHp` compatible values set on `currentHp`/`maxHp`
- No `fetchPokemonById` or PokeAPI call for `profileId <= 50`

**Estimated Effort:** M

**Risk Level:** HIGH — wrong instance shape breaks battle.js, save restore, and UI cards simultaneously.

---

### P1-011

**Title:** Author `host_city_bosses.json` — maps 0–2

**Objective:** Data-drive São Paulo, Berlin, and Tokyo host city challenges per 007 §7.1.

**Files Touched:**
- `data/football/host_city_bosses.json` (new)

**Dependencies:** P1-008 (profile IDs must exist in catalog)

**Acceptance Criteria:**
- 3 boss entries with `mapIndex` 0, 1, 2
- Map 0 roster: Casemiro (29) L14, Cafu (22) L12, Alisson (17) L13
- Map 1 roster: Kroos (30) L20, Neuer (16) L18, Beckenbauer (26) L19
- Map 2 roster: Kubo (31) L25, Robben (28) L23, Salah (7) L24
- Each entry includes `hostCity`, `nation`, `label`, `primaryStyle`, `stamp`, `roster[]`
- `schemaVersion: 1`

**Estimated Effort:** S

**Risk Level:** LOW — JSON authoring; validated when boss loader runs.

---

### P1-012

**Title:** Implement `domain/bosses.js` host city loader

**Objective:** Load and query host city boss data for `doBossNode` replacement.

**Files Touched:**
- `js/domain/bosses.js`
- `data/football/host_city_bosses.json`

**Dependencies:** P1-007, P1-011, P1-010

**Acceptance Criteria:**
- `loadHostCityBosses(json)` indexes by `mapIndex`
- `getHostCity(mapIndex)` returns boss config or `null`
- `buildBossTeam(bossConfig)` returns array of instances via `createPlayerInstance()` with roster `formLevel` and `skillTier`
- Respects `FEATURES.maxMapIndex` — no boss loaded for mapIndex > 2 in slice

**Estimated Effort:** M

**Risk Level:** MEDIUM — incorrect form levels affect slice difficulty targets (Map 0 boss 85%+ win rate).

---

### P1-013

**Title:** Author `album_layout.json` — slice pages

**Objective:** Define album page structure for marquee and favorites (slice IDs only).

**Files Touched:**
- `data/football/album_layout.json` (new)

**Dependencies:** P1-008

**Acceptance Criteria:**
- `volumeTitle`: "Road to the Trophy — Vol. 1"
- Page `marquee`: slots profileIds 1, 2, 3 with labels
- Page `favorites`: slots 4, 6, 7, 9, 10, 12, 14, 15, 17, 18, 28 (slice scout pool)
- `schemaVersion: 1`
- No host_city or legends pages in slice (deferred Phase 2)

**Estimated Effort:** XS

**Risk Level:** LOW — static layout data.

---

### P1-014

**Title:** Guard PokeAPI path for football profile IDs in `data.js`

**Objective:** Ensure `createInstance()` and `fetchPokemonById()` never hit network for slice roster.

**Files Touched:**
- `js/data.js`
- `js/domain/profiles.js`
- `js/domain/combat-adapter.js`

**Dependencies:** P1-010, P1-009

**Acceptance Criteria:**
- `createInstance(speciesId, …)` delegates to `createPlayerInstance()` when `FEATURES.footballMode && isFootballProfileId(speciesId)`
- `fetchPokemonById(id)` returns early with catalog profile for football IDs
- Network tab shows zero PokeAPI requests during a full slice run
- Pokémon IDs > 50 (if any legacy path) still use existing behavior when football mode off

**Estimated Effort:** S

**Risk Level:** HIGH — missed guard causes blank cards, async stalls, and CDN dependency in demo.

---

### P1-015

**Title:** Update `STARTER_IDS` to `[1, 2, 3]` in `data.js`

**Objective:** Wire Mbappé / Messi / Van Dijk marquee triangle per 007 §2.

**Files Touched:**
- `js/data.js`
- `js/game.js`

**Dependencies:** P1-008, P1-010

**Acceptance Criteria:**
- `STARTER_IDS = [1, 2, 3]`
- `showStarterScreen()` renders 3 football profiles via `getProfile()`, not PokeAPI sprites
- Starters excluded from scout pools (enforced in P1-016)
- Gen2 starter path unreachable when `FEATURES.footballMode`

**Estimated Effort:** S

**Risk Level:** LOW — constant change; UI reskin in P1-032 depends on this.

---

## EPIC C — Recruitment

---

### P1-016

**Title:** Implement `domain/scout.js` — `buildSliceReport()` for maps 0–2

**Objective:** Roll 3-player scout reports from slice stage pools with exclusion rules.

**Files Touched:**
- `js/domain/scout.js` (new)
- `data/football/scout_pools.json` (new — slice subset)
- `js/domain/profiles.js`

**Dependencies:** P1-009, P1-015

**Acceptance Criteria:**
- `buildSliceReport(mapIndex, runState)` returns exactly 3 unique `profileId`s
- Excludes starters `{1,2,3}`
- Excludes IDs not in slice catalog
- Map band pools: early (0–1) per 007 §6.2 high-weight IDs present in slice roster; mid (2) expands pool
- Max 1 Brazil player per report (nation cap)
- Pads to 3 if pool exhausted (should not happen with slice roster size)
- Sets form level via existing `getLevelForNode(node)` caller

**Estimated Effort:** M

**Risk Level:** MEDIUM — wrong pool breaks onboarding balance and Map 0 script.

---

### P1-017

**Title:** Implement Map 0 layer-1 forced scout override

**Objective:** Guarantee Pedri/Ramos/Alisson on first-run second node per 009 §2.4.

**Files Touched:**
- `js/domain/scout.js`
- `js/map.js`
- `js/game.js`

**Dependencies:** P1-016

**Acceptance Criteria:**
- When `mapIndex === 0` and node `layer === 1` and node `type === 'catch'`, scout pool forced to `{12, 15, 17}` shuffled
- No legend or elite breaker in pool
- Override fires once per qualifying node (not all catch nodes on map 0)
- Playtest: second node on Map 0 always shows Pedri, Ramos, Alisson

**Estimated Effort:** S

**Risk Level:** MEDIUM — layer index must match `map.js` `CONTENT_SIZES` layout; wrong layer = script never fires.

---

### P1-018

**Title:** Implement `domain/recruit.js` — contract offer and ledger append

**Objective:** Encapsulate sign/skip/duplicate semantics separate from `doCatchNode` monolith.

**Files Touched:**
- `js/domain/recruit.js`
- `js/domain/album.js` (called by recruit)

**Dependencies:** P1-027 (album mark functions)

**Acceptance Criteria:**
- `offerContract(profileId, runState)` appends to `runState.ledger.signedProfileIds`
- If `game_album[profileId] === 1` before sign, appends to `duplicateSignProfileIds` (for Phase 3; tracked in slice)
- `passOnReport()` completes node without sign
- 100% accept on player pick — no RNG reject
- Returns `{ added: boolean, needsSwap: boolean }`

**Estimated Effort:** S

**Risk Level:** LOW — thin wrapper; ledger correctness matters for settlement lite.

---

### P1-019

**Title:** Rewire `doCatchNode` to scout report + Contract Offer flow

**Objective:** Replace Pokémon catch logic with football recruitment in `game.js`.

**Files Touched:**
- `js/game.js`
- `js/domain/scout.js`
- `js/domain/recruit.js`
- `js/domain/album.js`

**Dependencies:** P1-016, P1-017, P1-018, P1-027

**Acceptance Criteria:**
- `doCatchNode` calls `buildSliceReport()` instead of BST bucket roll
- Creates instances via `createPlayerInstance()` at node form level
- Calls `markAlbumSeen()` for each displayed profileId before player choice
- On pick: `offerContract()` → add to squad or `showSwapScreen()`
- Skip label "Pass on report" advances node without sign
- No capture RNG, no Pokéball UI

**Estimated Effort:** L

**Risk Level:** HIGH — `doCatchNode` is complex (~100+ lines); regression risks soft-lock and dex writes to wrong key.

---

### P1-020

**Title:** Add `runId` and minimal `ledger` to run state init

**Objective:** Prepare run snapshot shape for `settleRunLite` and Phase 3 dedupe.

**Files Touched:**
- `js/game.js`

**Dependencies:** P1-001

**Acceptance Criteria:**
- New run sets `state.runId = crypto.randomUUID()` (or equivalent unique string)
- `state.ledger = { seenProfileIds: [], signedProfileIds: [], duplicateSignProfileIds: [] }`
- Ledger and `runId` persist in `poke_current_run` via existing `saveRun()`
- Reload mid-run restores ledger arrays

**Estimated Effort:** S

**Risk Level:** LOW — additive fields; breaking save shape if arrays not initialized on load of old saves.

---

### P1-021 ✅

**Title:** Bypass `checkAndEvolveTeam` rename for football profiles

**Status:** ✅ Done — `da6a262` (`shouldSkipFootballEvolution` in `ui.js`; `isFootballEvolutionBlocked` in `game.js` for Moon Stone)

**Objective:** Prevent evolution name-swap on form level thresholds for MVP roster.

**Files Touched:**
- `js/ui.js`
- `js/domain/profiles.js`

**Dependencies:** P1-009, P1-010

**Acceptance Criteria:**
- `checkAndEvolveTeam()` skips any team member where `isFootballProfileId(speciesId)`
- Form level still increases via `applyLevelGain` / battle wins
- Optional cosmetic toast at L16/L32 using `GAME_THEME` (can defer copy to P1-037)
- No `EVOLUTIONS` lookup for profileId 1–50

**Estimated Effort:** S

**Risk Level:** MEDIUM — failure causes Messi to morph into a different species name mid-run.

---

## EPIC D — Host City Progression

---

### P1-022

**Title:** Rewire `doBossNode` to `domain/bosses.getHostCity()`

**Objective:** Replace hardcoded `GYM_LEADERS[mapIndex]` with JSON-driven boss teams.

**Files Touched:**
- `js/game.js`
- `js/domain/bosses.js`

**Dependencies:** P1-012

**Acceptance Criteria:**
- When `FEATURES.footballMode`, `doBossNode` loads boss via `getHostCity(state.currentMapIndex)`
- Enemy team built via `buildBossTeam()` — no `GYM_LEADERS` read
- Boss battle uses existing `runBattleScreen` flow unchanged
- Win awards +2 form level (existing boss behavior)
- Loss triggers game over (unchanged)

**Estimated Effort:** M

**Risk Level:** HIGH — boss node is run-progression gate; wrong team or null boss soft-locks campaign.

---

### P1-023

**Title:** Cap map generation at `FEATURES.maxMapIndex = 2`

**Objective:** Prevent maps 3–7 from generating in vertical slice.

**Files Touched:**
- `js/map.js`
- `js/game.js`

**Dependencies:** P1-001

**Acceptance Criteria:**
- `startMap(mapIndex)` rejects or redirects `mapIndex > 2` when `FEATURES.sliceMode`
- After Map 2 boss win, campaign triggers slice complete (P1-024) instead of `startMap(3)`
- `MAP_NAMES` or HUD shows football host city names for indices 0–2

**Estimated Effort:** S

**Risk Level:** LOW — explicit guard; easy to verify.

---

### P1-024

**Title:** Implement slice-complete trigger at `badges === 3`

**Objective:** End campaign after Tokyo stamp instead of continuing to map 3 or knockout.

**Files Touched:**
- `js/game.js`
- `js/ui.js`

**Dependencies:** P1-022, P1-023, P1-046

**Acceptance Criteria:**
- On third boss win, `state.badges === 3` triggers `showSliceCompleteScreen()` instead of `startMap(3)` or elite transition
- `ELITE_4` / `doEliteBattle` never called in slice
- Slice complete flows to `settleRunLite()` then title screen
- Message includes honest label: "Vertical Slice — 3 of 8 host cities"

**Estimated Effort:** S

**Risk Level:** LOW — single conditional branch after boss win handler.

---

### P1-025

**Title:** Reskin `badge-screen` to City Stamp ceremony

**Objective:** Replace gym badge fantasy with host city stamp presentation.

**Files Touched:**
- `js/ui.js`
- `js/game.js`
- `css/style.css`
- `data/football/host_city_bosses.json` (read `stamp` field)

**Dependencies:** P1-005, P1-012

**Acceptance Criteria:**
- Badge screen shows `stamp.displayName` (e.g. "São Paulo Stamp") and nation flag
- No Pokémon badge sprites or "Gym Leader" copy
- `state.badges` still increments (engine unchanged); UI labels as city stamps
- Host city name displayed from boss config

**Estimated Effort:** M

**Risk Level:** LOW — cosmetic reskin; CSS-only risk for layout break.

---

### P1-026

**Title:** Apply football node weights and labels in `map.js`

**Objective:** Tune slice map pacing — scout bias L1, disabled trade/legendary, question → battle/trainer only.

**Files Touched:**
- `js/map.js`

**Dependencies:** P1-001, P1-006

**Acceptance Criteria:**
- `catch` weight on L1 bumped per 009 §3.1 (L1:30) when `FEATURES.footballMode`
- `trade` weight 0; `legendary` weight 0 in slice
- `resolveQuestionMark()` when football mode: rolls only battle or trainer (no shiny, no named events)
- Node tooltips use `GAME_THEME` labels: Scout Report, Friendly Match, Recovery Center, etc.
- Forced Recovery Center on last content layer preserved (unchanged engine behavior)

**Estimated Effort:** M

**Risk Level:** MEDIUM — weight normalization in `generateMap` can silently zero-out node types if sum logic wrong.

---

## EPIC E — Album

---

### P1-027

**Title:** Implement `domain/album.js` — seen/signed state API

**Objective:** Replace `getPokedex` / `markDex` semantics with `game_album` for football mode.

**Files Touched:**
- `js/domain/album.js`
- `js/data.js` (read fallback during migration grace)

**Dependencies:** P1-002

**Acceptance Criteria:**
- `getAlbum()` returns `Record<string, 0|1>` from `game_album` key
- `getEntryState(profileId)` returns `'unknown' | 'seen' | 'signed'`
- `markAlbumSeen(profileId)` sets `0` if absent; never downgrades `1` → `0`
- `markAlbumSigned(profileId)` sets `1`
- `countSigned()` returns integer count for slice roster IDs
- Single write path to `localStorage` key `game_album` only (no dual-write `poke_dex`)

**Estimated Effort:** M

**Risk Level:** HIGH — album is retention hook; dual-write or wrong key loses player progress.

---

### P1-028

**Title:** Implement `domain/save.js` — v3 album-only migration

**Objective:** Migrate `poke_dex` → `game_album` on boot per 006B §10 and 008 §17 (album fields only).

**Files Touched:**
- `js/domain/save.js`
- `js/cloud-save.js` (`SAVE_SCHEMA_VERSION`)
- `js/data.js`

**Dependencies:** P1-027

**Acceptance Criteria:**
- `SAVE_SCHEMA_VERSION = 3`
- `migrateSaveV2toV3()` copies `poke_dex` → `game_album` if absent; idempotent on second call
- Does **not** initialize `footballCredits`, `legendFragments` (Phase 3)
- Sets `saveVersion` / `save.v = 3` in localStorage
- `poke_dex` retained read-only fallback one release; gameplay writes only `game_album`
- Active `poke_current_run` not mutated during migration

**Estimated Effort:** M

**Risk Level:** HIGH — migration bugs corrupt existing player saves; must test idempotency.

---

### P1-029

**Title:** Route slice dex writes through album facades in `game.js`

**Objective:** Eliminate direct `markDex` / `getPokedex` calls in football recruitment and battle paths.

**Files Touched:**
- `js/game.js`
- `js/ui.js`

**Dependencies:** P1-027, P1-028

**Acceptance Criteria:**
- All slice paths call `markAlbumSeen` / `markAlbumSigned` instead of `markDex` / `markCaught`
- `grep -r "markDex\|getPokedex" js/game.js` shows zero hits in football-guarded branches
- Album state updates on scout display (seen) and contract sign (signed)

**Estimated Effort:** S

**Risk Level:** MEDIUM — missed call site leaves album empty despite gameplay signs.

---

### P1-030

**Title:** Build album modal — marquee + favorites pages

**Objective:** Replace Pokédex modal with World Cup Album for slice.

**Files Touched:**
- `js/ui.js`
- `css/style.css`
- `data/football/album_layout.json`

**Dependencies:** P1-013, P1-027, P1-037

**Acceptance Criteria:**
- `openAlbumModal()` (or reskinned `openPokedexModal`) renders 2 pages from `album_layout.json`
- Unknown: `???` hidden silhouette; Seen: silhouette + nation flag + initial; Signed: portrait + name + style chips
- Page tabs: Marquee Signings, Fan Favorites
- Footer note: "Vol. 1 complete in full campaign" for locked slots beyond slice
- Opened from map HUD button labeled per `GAME_THEME.collectionLabel`

**Estimated Effort:** L

**Risk Level:** MEDIUM — `ui.js` monolith; modal complexity risk without domain data separation.

---

### P1-031

**Title:** Load and cache `album_layout.json` in domain layer

**Objective:** Keep page/slot definitions data-driven for Phase 2 expansion.

**Files Touched:**
- `js/domain/album.js`
- `data/football/album_layout.json`
- `js/domain/profiles.js` or `initCatalog()` in `game.js`

**Dependencies:** P1-013, P1-007

**Acceptance Criteria:**
- `getAlbumLayout()` returns pages array after catalog init
- `getSlotProfileIds(pageId)` returns ordered profileIds for page
- Layout fetch included in `initCatalog()` promise chain

**Estimated Effort:** S

**Risk Level:** LOW — read-only config loader.

---

## EPIC F — UI Reskin

---

### P1-032

**Title:** Reskin starter screen to Marquee Signing

**Objective:** Present Mbappé / Messi / Van Dijk choice with style triangle hint.

**Files Touched:**
- `js/ui.js`
- `index.html` (`starter-screen` copy)
- `css/style.css`

**Dependencies:** P1-005, P1-015, P1-037

**Acceptance Criteria:**
- Screen title uses `GAME_THEME.starterScreenTitle`
- 3 cards show real names, nations, positions, primary/secondary style chips
- Collapsible Core Six style triangle tooltip (High Press, Possession Build-up, Compact Block)
- No Pokémon starter sprites or type icons without football labels
- Selection calls `createPlayerInstance(id, 5)` for form level 5

**Estimated Effort:** M

**Risk Level:** LOW — cosmetic; marquee is first impression for playtest gate.

---

### P1-033

**Title:** Reskin `catch-screen` to Scout Report / Contract Offer

**Objective:** Football recruitment UX for 3-player reports.

**Files Touched:**
- `js/ui.js`
- `index.html` (`catch-screen`)
- `css/style.css`

**Dependencies:** P1-005, P1-019, P1-037

**Acceptance Criteria:**
- H2: "Scout Report"; subtitle shows host city flavor
- 3 player cards with portrait, name, nation, position, styles, rarity border, form level
- Duplicate hint when `getEntryState(id) === 'signed'`
- Confirm modal: "Offer contract to {Name}?"
- Accept triggers contract stamp animation hook (1.2s CSS or minimal JS)
- "Pass on report" skip button visible

**Estimated Effort:** L

**Risk Level:** MEDIUM — catch screen is high-traffic; layout break affects every scout node.

---

### P1-034

**Title:** Reskin `swap-screen` to Squad Registration

**Objective:** Football-themed squad full flow when signing 7th player.

**Files Touched:**
- `js/ui.js`
- `index.html` (`swap-screen`)
- `css/style.css`

**Dependencies:** P1-005, P1-037

**Acceptance Criteria:**
- Title: "Squad Registration"
- Copy: release player to sign incoming or decline contract
- Shows incoming player card and 6 squad slots
- Decline completes node without adding player
- No "PC Box" or Pokémon terminology

**Estimated Effort:** M

**Risk Level:** LOW — reskin of existing swap logic.

---

### P1-035

**Title:** Create slice-complete screen

**Objective:** Dedicated end-of-slice presentation distinct from championship win screen.

**Files Touched:**
- `js/ui.js`
- `index.html` (new `#slice-complete-screen` or fork `#win-screen`)
- `css/style.css`

**Dependencies:** P1-024, P1-005

**Acceptance Criteria:**
- Shows squad snapshot, 3 stamps earned, album % for slice roster
- CTA: "Continue" → settlement lite → title
- Not reachable via knockout win path
- No Elite Four or Hall of Fame copy

**Estimated Effort:** M

**Risk Level:** LOW — new screen shell; isolated from full campaign win flow.

---

### P1-036

**Title:** Implement settlement lite summary modal

**Objective:** Show run results without Football Credits or fragments (Phase 3).

**Files Touched:**
- `js/domain/save.js` (`settleRunLite`)
- `js/ui.js`
- `js/game.js`

**Dependencies:** P1-020, P1-027

**Acceptance Criteria:**
- `settleRunLite(runSnapshot, accountState)` returns `{ patch, summary }` with album patches only
- Summary shows: new signs list, album signed count / slice total, stamps earned, run stats (battles, scouts)
- No credits line, or explicit "Meta rewards coming soon" footer
- Modal renders on slice complete and game over
- `applyAccountPatch(patch)` writes `game_album` then `clearSavedRun()`

**Estimated Effort:** M

**Risk Level:** MEDIUM — must run before `clearSavedRun()` or album updates lost.

---

### P1-037

**Title:** Render player cards via `domain/profiles` in `ui.js`

**Objective:** Centralize football card rendering; replace `renderPokemonCard` data source for football instances.

**Files Touched:**
- `js/ui.js`
- `js/domain/profiles.js`
- `js/domain/styles.js`
- `css/style.css`

**Dependencies:** P1-009, P1-003

**Acceptance Criteria:**
- `renderPlayerCard(instance)` (or football branch in existing renderer) shows: portrait, `displayName`, nation flag, position, style chips, form level, skill tier bar
- Stat labels: Stamina / Power / Defense / Technique / Vision / Pace (not HP/ATK/DEF/SP.A)
- T0 portrait `onerror` → nation silhouette fallback (jersey number + flag colors)
- Used in marquee, scout, swap, battle HUD, slice complete

**Estimated Effort:** L

**Risk Level:** MEDIUM — touches many UI call sites; inconsistent card data if mixed Pokémon/football render paths.

---

### P1-038

**Title:** Hide Pokémon-only title and map HUD controls

**Objective:** Football-only demo surface per SPEC 010 §3.5.

**Files Touched:**
- `js/ui.js`
- `index.html`
- `js/game.js` (map HUD init)

**Dependencies:** P1-001, P1-005, P1-006

**Acceptance Criteria:**
- Hidden when `FEATURES.footballMode`: gen toggle, Nuzlocke, Battle Tower, Pokédex button, Achievements, Hall of Fame, cloud save
- Visible: New Run / Continue, Album button, Settings
- Title shows `GAME_THEME.title` and `GAME_THEME.subtitle`
- Map HUD Pokédex icon replaced with Album icon

**Estimated Effort:** S

**Risk Level:** LOW — display:none guards; verify Continue Run still works mid-slice.

---

### P1-039

**Title:** Apply `GAME_THEME` battle log strings

**Objective:** Remove Pokémon battle copy from combat log and result banners.

**Files Touched:**
- `js/battle.js`
- `js/ui.js`
- `js/data.js` (`GAME_THEME.battle`)

**Dependencies:** P1-005

**Acceptance Criteria:**
- Faint message uses `GAME_THEME.battle.faint` not "fainted"
- Win/loss banners use football terminology
- `battle.js` damage math untouched
- No move name changes required in slice (optional display pass)

**Estimated Effort:** XS

**Risk Level:** LOW — string substitution only.

---

### P1-040

**Title:** Add T0 portrait asset fallback pipeline

**Objective:** Legal-safe placeholders until T1 illustrated portraits ship.

**Files Touched:**
- `js/ui.js`
- `css/style.css`
- `data/football/player_profiles.json` (`portrait` paths)

**Dependencies:** P1-037

**Acceptance Criteria:**
- `portrait` path pattern `/assets/players/{slug}.png` documented
- Missing image renders CSS silhouette: nation colors + squad number placeholder
- No broken image icons visible in scout or battle
- Works offline without CDN

**Estimated Effort:** S

**Risk Level:** LOW — CSS fallback; no legal risk for T0 tier.

---

## EPIC G — Save System

---

### P1-041

**Title:** Call `migrateSaveV2toV3()` on `initGame()` boot

**Objective:** Ensure album migration runs before any album read or run load.

**Files Touched:**
- `js/game.js`
- `js/domain/save.js`

**Dependencies:** P1-028

**Acceptance Criteria:**
- First line of account init (before `loadSavedRun`) calls migration
- Fresh localStorage gets `game_album: {}` and `saveVersion: 3`
- Existing `poke_dex` data appears in album after migration
- Console/log no errors on repeat boot (idempotent)

**Estimated Effort:** XS

**Risk Level:** HIGH — wrong ordering migrates after reads → stale empty album displayed.

---

### P1-042

**Title:** Persist `runId` and `ledger` in `poke_current_run` save shape

**Objective:** Ensure mid-run reload preserves recruitment ledger for settlement lite.

**Files Touched:**
- `js/game.js`
- `js/data.js` (if `saveRun`/`loadRun` helpers live there)

**Dependencies:** P1-020

**Acceptance Criteria:**
- `saveRun()` serializes `runId` and `ledger` objects
- `loadSavedRun()` restores them; missing fields default to empty ledger + new `runId` only for new runs
- Continue Run mid-slice preserves seen/signed ledger arrays

**Estimated Effort:** S

**Risk Level:** MEDIUM — old save blobs without ledger must not crash load.

---

### P1-043

**Title:** Implement `applyAccountPatch()` in `domain/save.js`

**Objective:** Single write path for account-level album updates from settlement lite.

**Files Touched:**
- `js/domain/save.js`

**Dependencies:** P1-027, P1-028

**Acceptance Criteria:**
- `applyAccountPatch(patch)` merges `game_album` keys monotonically (1 wins over 0)
- Writes `localStorage` atomically per key
- Does not touch `poke_current_run`
- Returns success boolean; logs key count written

**Estimated Effort:** S

**Risk Level:** MEDIUM — patch merge bug causes album regression across runs.

---

### P1-044

**Title:** Wire `settleRunLite` on game over before `clearSavedRun()`

**Objective:** Failed runs still update album per SPEC 010 §3.3 and 008 P1 principle.

**Files Touched:**
- `js/game.js`

**Dependencies:** P1-036, P1-041

**Acceptance Criteria:**
- Game over path builds `runSnapshot` from `state` + `ledger`
- Calls `settleRunLite()` → `applyAccountPatch()` → then `clearSavedRun()`
- Album signs from failed run persist to next run
- Order invariant enforced in code comments

**Estimated Effort:** S

**Risk Level:** HIGH — reversing order wipes ledger before settlement applies.

---

### P1-045

**Title:** Suppress cloud save sync for slice demo

**Objective:** Prevent v2 cloud schema from conflicting with v3 local album during slice.

**Files Touched:**
- `js/cloud-save.js`

**Dependencies:** P1-006, P1-028

**Acceptance Criteria:**
- When `FEATURES.cloudSave === false`, `syncToCloud()` no-op
- `localStorage.setItem` patch from cloud-save.js does not overwrite `game_album`
- No auth modal on boot

**Estimated Effort:** XS

**Risk Level:** MEDIUM — cloud-save.js patches `localStorage.setItem`; must not clobber v3 keys.

---

## EPIC H — QA

---

### P1-046

**Title:** Manual QA — marquee to 3 stamps happy path

**Objective:** Validate full slice completion once per starter choice.

**Files Touched:**
- None (test execution only)
- Reference: `docs/011-engineering-task-breakdown.md` §Definition of Done

**Dependencies:** P1-024, P1-033, P1-036 (all gameplay tasks complete)

**Acceptance Criteria:**
- 3 playthroughs complete (Mbappé, Messi, Van Dijk start) — each earns 3 stamps
- Each run: ≥3 scout signings beyond marquee
- Time to first stamp ≤8 minutes per SPEC 010 §10.1
- Zero crashes or soft-locks
- Results recorded in QA log (date, build, pass/fail per starter)

**Estimated Effort:** M

**Risk Level:** LOW — validation task; failures drive bugfix tickets.

---

### P1-047

**Title:** Manual QA — album persistence across runs and reload

**Objective:** Verify `game_album` retention is the collection hook.

**Files Touched:**
- None (test execution)

**Dependencies:** P1-030, P1-041, P1-044

**Acceptance Criteria:**
- Run 1: sign 2 new players → album shows 2 signed + marquee starter
- Reload browser → album state identical
- Run 2: sign 1 new player → album increments; no regression on prior entries
- `localStorage` key `game_album` matches UI state
- `poke_dex` not written during football runs

**Estimated Effort:** S

**Risk Level:** LOW — catches save migration and dual-write bugs.

---

### P1-048

**Title:** Manual QA — game over before stamp 3 still settles

**Objective:** Validate failure path per SPEC 010 §14 decision #4.

**Files Touched:**
- None (test execution)

**Dependencies:** P1-044

**Acceptance Criteria:**
- Deliberately lose on Map 0 or Map 1 boss
- Settlement lite modal appears
- Album seen marks from that run persist
- Title screen → new run starts fresh squad; album retained
- No soft-lock on game over screen

**Estimated Effort:** XS

**Risk Level:** LOW — failure path often missed in dev testing.

---

### P1-049

**Title:** Pokémon terminology grep gate on slice screens

**Objective:** Automated string audit for football identity gate.

**Files Touched:**
- None (verification)
- Scope paths: `index.html`, `js/ui.js`, `js/game.js`, `js/map.js`, `GAME_THEME` usage

**Dependencies:** P1-038, P1-039, P1-033

**Acceptance Criteria:**
- Zero matches in player-facing slice strings for: `Pokémon`, `Pokemon`, `Pokédex`, `Gym`, `Elite Four`, `badge` (as label, not `state.badges` var), `starter` (as UI label), `catch`, `fainted`, `Poké`
- `GAME_THEME` covers all title screen and node tooltip strings
- Document any intentional exceptions (e.g. code comments) in QA log

**Estimated Effort:** XS

**Risk Level:** LOW — grep pass; manual spot-check for HTML hardcoded strings.

---

### P1-050

**Title:** Battle engine regression smoke test

**Objective:** Confirm domain adapter did not alter damage or level math.

**Files Touched:**
- None (test execution)
- Reference: `js/battle.js`, `js/domain/combat-adapter.js`

**Dependencies:** P1-010, P1-022

**Acceptance Criteria:**
- Mbappé (1) vs Map 0 boss: win within expected ~85% over 10 seeded runs (manual tally)
- Form level +1 after friendly win unchanged
- `calcDamage` output identical for same stats pre/post adapter (spot-check 3 matchups in console)
- No NaN HP or zero-damage soft-lock

**Estimated Effort:** S

**Risk Level:** MEDIUM — adapter bugs can skew entire difficulty curve undetected until playtest.

---

### P1-051

**Title:** Map 0 forced scout script verification (G11)

**Objective:** Validate onboarding script from 009 §15 golden test G11.

**Files Touched:**
- None (test execution)

**Dependencies:** P1-017

**Acceptance Criteria:**
- Fresh account, first run, Map 0 layer-1 catch node shows only Pedri (12), Ramos (15), Alisson (17)
- No Haaland, Messi duplicate scout, or legend in pool
- Test passes 3 consecutive fresh-run attempts

**Estimated Effort:** XS

**Risk Level:** LOW — targeted script verification.

---

### P1-052

**Title:** Phase 1 acceptance checklist sign-off

**Objective:** Formal gate before Phase 2 per SPEC 010 §13.

**Files Touched:**
- `docs/010-vertical-slice-implementation-plan.md` §13 (checklist reference)

**Dependencies:** P1-046 through P1-051

**Acceptance Criteria:**
- All 18 items in SPEC 010 §13 marked pass
- Slice completion rate ≥70% across internal playtests
- Zero blocker bugs open
- Sign-off recorded with date and commit hash

**Estimated Effort:** S

**Risk Level:** LOW — process gate; prevents premature Phase 2 scope creep.

---

## Dependency Graph

### Critical Path (original — Day 1 plan)

Historical sequential order from v1.0. **Superseded for remaining work** by [Recommended Execution Flow](#recommended-execution-flow) above, which reflects shipped progress after T2.

```
P1-001 → P1-002 → P1-003 → P1-004 → P1-005 → P1-007 → P1-008 → P1-009 → P1-010
→ P1-014 → P1-015 → P1-027 → P1-028 → P1-041 → P1-011 → P1-012 → P1-016 → P1-017
→ P1-018 → P1-019 → P1-020 → P1-022 → P1-023 → P1-024 → P1-037 → P1-032 → P1-033
→ P1-034 → P1-036 → P1-044 → P1-046 → P1-052
```

**Already merged off critical path:** P1-021 ✅ · P1-032 🟡 · P1-037 🟡 · P1-038 🟡 · P1-039 🟡 (battle field) · P1-040 🟡

### Remaining critical spine (from current state)

```
P1-046 → P1-052
```

### Parallelizable Tasks

These can run concurrently with critical path segments when a second pass or content-first workflow is used:

| Task | Can parallel with | Notes |
|------|-------------------|-------|
| P1-008 | P1-001–P1-005 | JSON authoring before loader exists |
| P1-011 | P1-008 | Boss JSON after profile IDs fixed |
| P1-013 | P1-008 | Album layout independent of code |
| P1-006 | P1-005 | Feature gating UI |
| P1-021 | P1-010 | Evolution bypass after instances exist |
| P1-025 | P1-012 | City stamp UI after boss JSON defined |
| P1-026 | P1-006 | Map weights after flags |
| P1-029 | P1-027 | Dex call replacement after album API |
| P1-031 | P1-013 | Layout loader |
| P1-035 | P1-024 | Slice screen design |
| P1-038 | P1-005 | Hide Pokémon UI |
| P1-039 | P1-005 | Battle strings |
| P1-040 | P1-037 | Portrait fallback after card renderer |
| P1-042 | P1-020 | Save shape |
| P1-043 | P1-028 | Patch applier after migration |
| P1-045 | P1-006 | Cloud suppress |
| P1-030 | P1-037 + P1-031 | Album modal after card renderer |
| P1-047–P1-051 | P1-046 | QA sub-tests after happy path |

---

## Milestones

### Milestone 1 — First football player can be loaded ✅

**Status:** Complete for catalog and boot readiness. Optional UI polish remains tracked outside this milestone.

**Completion criteria:**
- [x] `initCatalog()` succeeds; `getProfile(2)` returns Messi
- [x] `createPlayerInstance(2, 5)` returns valid battle instance with `speciesId: 2`
- [x] Marquee screen renders 3 football cards without PokeAPI fetch
- [x] Title screen blocks New Run until catalog ready (P1-007)
- [x] `DomainBosses.getHostCity(0)` and `buildBossTeam()` validate host city boss readiness

**Blocked by:** None for catalog readiness. Optional P1-032 polish (style triangle) remains in UI work.

**Expected effort:** 0 for milestone scope

---

### Milestone 2 — Scout Report works ⬜

**Completion criteria:**
- [x] Scout Report node shows 3 real players with form levels
- [x] Map 0 layer-1 forced pool verified (G11 domain-level)
- [x] Contract Offer adds player to squad; Pass on report skips
- [ ] `markAlbumSeen` fires on display; `markAlbumSigned` on accept

**Blocked by:** Milestone 1 finish + P1-016, P1-017, P1-018, P1-019, P1-027, P1-033

**Expected effort:** 2–3 days

---

### Milestone 3 — Host City boss works ✅

**Completion criteria:**
- [x] `doBossNode` loads JSON roster for maps 0–2
- [x] Boss win increments stamp; City Stamp ceremony displays
- [x] Map 2 win triggers slice complete (not map 3)
- [x] No `GYM_LEADERS` reference in football path

**Blocked by:** None for milestone scope. P1-035/P1-036 still need full presentation and settlement passes.

**Expected effort:** 1–2 days

---

### Milestone 4 — Album persists ⬜

**Completion criteria:**
- [ ] `game_album` survives page reload and second run
- [x] Album modal shows seen/signed states for slice pages
- [x] `migrateSaveV2toV3` idempotent; `poke_dex` not written in football runs
- [x] Game over settlement applies album patch before run clear

**Blocked by:** Milestone 2 + P1-028, P1-029, P1-030, P1-036, P1-041, P1-043, P1-044

**Expected effort:** 2 days

---

### Milestone 5 — Vertical Slice complete ⬜

**Completion criteria:**
- [ ] Full loop: Title → Marquee → 3 maps → 3 stamps → slice complete → settlement → title
- [ ] Pokémon UI hidden; grep gate passes
- [ ] QA P1-046–P1-052 green; SPEC 010 §13 checklist complete
- [ ] Ready for external playtest handoff

**Blocked by:** Milestone 3 + Milestone 4 + P1-038 (finish), P1-046–P1-052

**Estimated remaining:** ~7–9 working days after T2

---

## Definition of Done

Can we hand this build to a tester? All boxes must pass.

### Gameplay checks

- [ ] Pick marquee signing: Mbappé, Messi, or Van Dijk enters squad at form level 5
- [x] Scout Report shows exactly 3 players; 100% sign on pick; skip works
- [x] Map 0 second node forced pool: Pedri, Ramos, Alisson
- [ ] Squad cap 6; Squad Registration swap when full
- [ ] Friendly, trainer, boss battles resolve without crash
- [ ] 3 Host City bosses winnable at target difficulty (Map 0 boss ~85% dev win rate)
- [ ] Campaign ends at 3rd stamp with slice-complete screen
- [ ] Game over before stamp 3 still shows settlement lite
- [x] `checkAndEvolveTeam` does not rename football players (P1-021 ✅)
- [ ] Trade, legendary, CCC, Nuzlocke unreachable in slice build

### Save checks

- [x] `SAVE_SCHEMA_VERSION = 3`; `migrateSaveV2toV3()` idempotent on double boot
- [x] Migration runs before Continue Run reads on `initGame()` boot
- [ ] `game_album` persists across browser reload
- [ ] Album from run 1 visible in run 2
- [ ] `runId` + `ledger` persist in Continue Run mid-slice
- [ ] Settlement applies album patch **before** `clearSavedRun()`
- [ ] No `poke_dex` writes during football gameplay
- [ ] Cloud save UI hidden; sync does not overwrite `game_album`

### UI checks

- [ ] Zero Pokémon terminology in slice player-facing screens (grep gate P1-049)
- [ ] Title, marquee, scout, swap, stamp, slice-complete use `GAME_THEME`
- [ ] Player cards show real names, nations, styles, football stat labels
- [ ] T0 portrait fallback renders when PNG missing
- [x] Album modal: seen = silhouette; signed = full entry
- [ ] Gen toggle, Pokédex, Achievements, Battle Tower, cloud save hidden

### Content checks

- [ ] `player_profiles.json` — 20 players, Messi starter ID 2, stats match 007 §4.2
- [x] `host_city_bosses.json` — 3 entries maps 0–2, rosters match 007 §7.1
- [x] `album_layout.json` — marquee + favorites slice slots
- [ ] `STARTER_IDS = [1, 2, 3]`
- [ ] PokeAPI not called for `profileId <= 50` (network tab clean)
- [ ] `STYLE_CHART` matrix parity with `TYPE_CHART` values

---

*End of SPEC 011 — Engineering Task Breakdown (v1.1).*
