# SPEC 014E — Release Candidate Bridge Retirement Plan

**Status:** Active bridge registry for identity cleanup  
**Date:** 2026-06-10  
**Authority:** [026 — Identity Audit](./026-release-candidate-identity-audit.md) · [027 — Task Breakdown](./027-release-candidate-hardening-task-breakdown.md)

---

## 1. Purpose

Document every **internal bridge** that still uses Pokelike/Pokémon naming while the football campaign presents native copy. Bridges stay until save v4 or Classic mode split — never bulk-rename without dual-read.

---

## 2. Bridge Registry

| Bridge | Location | Player-facing impact | Football-native alias / delegate | Retirement phase | Validation |
|--------|----------|----------------------|----------------------------------|------------------|------------|
| `catch-screen` | `index.html`, `ui.js`, `game.js` | None when scout copy applied | `scout-report-screen` CSS class; `doScoutReportNode` | RC-040+ or Classic split | P1-049, manual scout QA |
| `catch-choices` | `index.html` | None | `scout-report-choices` class | With `catch-screen` | Scout flow harness |
| `badge-screen` | `index.html`, `css`, `game.js` | None when stamp ceremony runs | `city-stamp-screen` class; `showBadgeScreen` football branch | RC-041 | Host city boss QA |
| `badge-*` DOM ids | `index.html` | Low — copy overridden at runtime | Stamp labels in `GAME_THEME` | RC-041 | RC-017 |
| `openPokedexModal()` | `data.js`, `ui.js`, `index.html` onclick | Medium — button title/alt fixed RC-013 | `openAlbumModal()` delegate | Save v4 | Album modal QA |
| `markPokedexSeen()` | `data.js` | None on football path | Routes to `markAlbumSeen` for profile IDs | Save v4 | Domain harness |
| `markPokedexCaught()` | `data.js` | None on football path | Routes to `markAlbumSigned` | Save v4 | Album persistence QA |
| `speciesId` on instances | `data.js`, `combat-adapter` | None — mirrors `profileId` | `profileId` authoritative for football | Save v4 | Combat adapter tests |
| `renderPokemonCard()` | `ui.js` | None when entity has `profileId` | Dispatches to `renderPlayerCard()` | RC-043 | Player card QA |
| `fetchPokemonById()` | `data.js` | None on football trainer path (RC-B16 resolved) | `buildFootballNpcTeam` + profile instances | Post-RC Classic split | Trainer + friendly match QA |
| `createInstance()` | `data.js` | High on legacy battle paths | `createPlayerInstance()` for profiles | RC-019 | Battle presentation |
| `NODE_TYPES.CATCH` | `map.js` | None — label = Scout Report | Enum internal only | Phase 4+ enum rename | Map harness |
| `NODE_TYPES.POKECENTER` | `map.js` | None — label = Recovery Center | Enum internal only | Defer | Map labels QA |
| `NODE_TYPES.TRAINER` | `map.js` | None — label = Rival National Team | Enum internal only | Defer | RC-019 |
| `poke_current_run` | `game.js`, `save.js` | None | localStorage key unchanged | Save v4 migration | Save round-trip |
| `poke_dex` / `game_album` | `save.js` | None | Album v3 primary | Save v4 | P1-047 |
| `type-badge` CSS | `ui.js`, `css` | Low — shows style chip | `style-chip` data attribute | Cosmetic RC-050 | Visual QA |
| `swap-screen` | `index.html` | None — Squad Registration copy | Football wrapper classes | RC-040 | Swap UX QA |
| `starter-screen` | `index.html` | Low — fallback fixed RC-015 | Marquee signing presentation | RC-015 | Signing QA |
| `trainer-screen` | `index.html` | None — gated off football boot | Manager select deferred | Phase 4+ | Boot QA |
| `ui/pokedex.png` | `ui/` | Medium until RC-013 | `ui/album.png` or glyph fallback | RC-013 | Title + HUD icons |

---

## 3. Dangerous Renames (never without migration)

| Target | Risk | Safe pattern |
|--------|------|--------------|
| `speciesId` in saves | Breaks load | Dual-read `profileId ?? speciesId` |
| `poke_*` localStorage | Account loss | Migration + dual-write period |
| `catch-screen` element id | Breaks selectors/tests | Add parallel id; migrate handlers one file |
| `runBattle` / `battle.js` types | Battle math regression | **Out of scope** — presentation only |
| `NODE_TYPES` enum strings | Map save shape | Presentation layer first |

---

## 4. Safe Aliases to Add (Wave 2)

| Legacy | Football alias | Action |
|--------|----------------|--------|
| `markPokedexSeen` | `markAlbumSeen` | Export alias on `window` if missing |
| `markPokedexCaught` | `markAlbumSigned` | Same |
| `openPokedexModal` | `openAlbumModal` | Document as canonical for new call sites |
| `getPokedex()` | `getAlbum()` | Defer — read path only |

---

## 5. Retirement Phases

| Phase | Scope | Gate |
|-------|-------|------|
| **RC Wave 1** | Player-facing copy + football NPC battles | No Pokémon visible in 8-city path |
| **RC Wave 2** | Alias exports + call-site migration | Harness green |
| **RC Wave 3** | Asset manifests + T0 placeholders | `validate-asset-manifests` |
| **Save v4** | `poke_*` keys, `speciesId` serialization | Explicit migration spec |
| **Classic split** | Remove gated Classic DOM | Product decision |

---

## 6. Validation per Bridge

- Automated: `validate-football-domain.mjs`, `validate-identity-cleanup.mjs`, P1-049 grep
- Manual: [031 — RC Manual QA Runbook](./031-release-candidate-manual-qa-runbook.md)
- Sign-off: [032 — RC Validation Report](./032-release-candidate-validation-report.md)

---

*End of SPEC 014E — Bridge Retirement Plan.*
