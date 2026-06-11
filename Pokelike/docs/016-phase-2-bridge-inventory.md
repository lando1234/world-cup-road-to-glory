# Phase 2 Bridge Inventory

**Status:** Baseline inventory for P2-003  
**Date:** 2026-06-10  
**Scope:** Legacy bridges that still support the football slice after Phase 1  
**Rule:** This document does not authorize deletion by itself. Each bridge retirement needs its own implementation task, validation, and commit.

---

## 1. Classification Key

| Classification | Meaning |
|----------------|---------|
| Keep | Required for vanilla runtime or legacy mode; do not change in Phase 2 without a dedicated task. |
| Alias | Add football-native names while retaining legacy names as compatibility aliases. |
| Retire now | Safe to update in upcoming Phase 2 tasks with focused tests. |
| Retire later | Known debt, but too risky or out of scope for current Phase 2 sequence. |

---

## 2. Bridge Summary

| Bridge | Classification | Current owner | Representative files | Retirement task |
|--------|----------------|---------------|----------------------|-----------------|
| `markPokedexSeen` / `markPokedexCaught` football write facades | Alias, then retire football call sites | Data/album boundary | `js/data.js`, `js/game.js`, `scripts/validate-phase1-qa.mjs` | P2-004, P2-005 |
| `getPokedex()` read compatibility | Keep for legacy mode; avoid in football UI | Data/save compatibility | `js/data.js`, `js/game.js`, `js/cloud-save.js` | Later bridge cleanup |
| `poke_dex` localStorage key | Keep as migration fallback only | Save migration | `js/domain/save.js`, `js/data.js`, `js/cloud-save.js` | Phase 3 or save v4 |
| `speciesId` overloaded as football `profileId` | Keep for battle/save runtime | Combat adapter/save shape | `js/domain/combat-adapter.js`, `js/game.js`, `js/ui.js` | Phase 3 typed model |
| `catch-screen` container for Scout Report | Reduced by P2-011; retire remaining handler IDs later | Recruitment UI | `index.html`, `js/game.js`, `css/style.css` | P2-011 |
| `swap-screen` container for Squad Registration | Retire player-facing structure gradually | Squad UI | `index.html`, `js/game.js`, `css/style.css` | P2-013 |
| `badge-screen` and `badge-*` selectors for City Stamp | Alias first, then retire football usage | Stamp ceremony | `index.html`, `js/game.js`, `css/style.css` | P2-014, P2-015 |
| Legacy node icons | Retire now through registry, keep fallback | Map UI | `js/map.js`, `js/ui.js`, `css/style.css` | P2-010 |
| `TYPE_CHART` / style projection | Keep until explicit combat task | Battle compatibility | `js/domain/styles.js`, `js/data.js`, `js/game.js` | Defer unless balance task approved |
| `GYM_LEADERS` references | Keep for non-football branches; no football hot path | Legacy boss compatibility | `js/game.js`, `js/map.js`, `js/data.js` | Later cleanup |
| TheSportsDB portrait shortcut | Retire from critical runtime path | Asset strategy | `js/domain/features.js`, `js/domain/portrait-source.js`, `data/football/thesportsdb_portraits.json` | P2-009, P2-021 |
| Cloud save loaded but inert | Keep disabled | Save/account boundary | `js/cloud-save.js`, `js/domain/features.js` | Phase 3 cloud plan |

---

## 3. Immediate Retirement Candidates

### Album write names

The safest first bridge retirement is naming, not behavior:

- Add football-native APIs such as `markAlbumSeen` and `markAlbumSigned`.
- Keep `markPokedexSeen` and `markPokedexCaught` as compatibility aliases.
- Move football-specific call sites to album-named APIs.
- Validate that football gameplay still does not write `poke_dex`.

This maps directly to P2-004 and P2-005.

### UI container semantics

Scout Report, Contract Offer, Squad Registration, and City Stamp are already behaviorally football-native but still include legacy compatibility anchors. P2-011 adds Scout Report wrapper classes while keeping the old IDs for event handlers. P2-012 adds Contract Offer state classes while keeping the existing overlay base. Phase 2 should improve player-facing structure first and only remove selector aliases after tests prove handlers remain stable.

---

## 4. Bridges To Keep For Now

### `speciesId`

`speciesId` is still the combat/save field that keeps the vanilla battle engine and active run serialization working. It should remain as the runtime compatibility field until a typed domain model or save v4 migration exists.

### `TYPE_CHART`

Style projection is debt, but changing it risks battle math. Phase 2 should not touch it unless a scoped combat task is approved.

### Cloud save module

The module may remain loaded as long as `FEATURES.cloudSave === false` keeps it inert. Reactivating cloud save is explicitly out of scope.

---

## 5. Validation Hooks

Current and planned checks:

- Phase 1 QA confirms football album writes avoid `poke_dex`.
- Phase 2 QA should assert this inventory exists before P2-004 starts.
- P2-004 should add album-named API tests.
- P2-005 should add grep/source checks proving football branches prefer album-named APIs.
- P2-021 should assert no live API dependency remains in public-critical runtime paths.

---

## 6. Stop Conditions

Stop a bridge-retirement task if:

- The change requires battle math updates.
- The change requires save v4.
- The change breaks legacy mode without an explicit decision to remove it.
- The change makes cloud save active.
- The change needs live TheSportsDB/PokeAPI availability.
- The change mixes UI polish with persistence semantics.

---

*End of Phase 2 Bridge Inventory.*
