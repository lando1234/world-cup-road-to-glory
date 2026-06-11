# SPEC 014A — Release Candidate Identity Audit

**Status:** Baseline audit for Release Candidate Hardening  
**Date:** 2026-06-10  
**Authority:** Phase 3 sign-off ([023](./023-phase-3-validation-report.md))  
**Companion:** [027](./027-release-candidate-hardening-task-breakdown.md) · [028](./028-asset-pipeline-and-art-direction.md)

---

## 1. Scope

Full-repo search for monster-game / Pokémon / Pokelike identity residue. Goal: **football-native player-facing identity** before external demo or Phase 4.

**Release invariants (unchanged):** `maxMapIndex: 7` · `knockoutEnabled: false` · `cloudSave: false` · no-live-API · battle math frozen · save schema v3.

---

## 2. Search Terms Audited

| Term / pattern | Primary surfaces |
|----------------|------------------|
| `Pokelike` | Repo name, docs, package.json, discovery docs |
| `Pokemon` / `Pokémon` | `index.html`, `ui.js`, `css/style.css`, title disclaimer |
| `Pokedex` / `Pokédex` | `index.html`, `ui.js`, `ui/pokedex.png`, `openPokedexModal()` |
| `poke_` | localStorage keys, save keys (`poke_current_run`, `poke_dex`, etc.) |
| `PokeAPI` | `ui.js` remote sprite URLs, `data.js` fetch paths |
| `catch` / `caught` | `catch-screen`, `doCatchNode`, `NODE_TYPES.CATCH`, scout node type |
| `trainer` | `trainer-screen`, battle trainer icons, map trainer sprites |
| `gym` / `badge` | `badge-screen`, HUD badges, gym leader data |
| `elite` | `eliteIndex`, knockout gate (deferred) |
| `monster` | Docs only |
| `species` / `speciesId` | Instance schema, DOM `data-species`, profile bridge |
| `evolution` | Evolution overlay, `checkAndEvolveTeam`, form level confusion |
| `wild` | `Wild Battle!`, battle intros |
| `starter` | `starter-screen`, marquee signing bridge |
| `shiny` | `shiny-screen`, gold card legacy |
| `legendary` | Map node type, legendary encounters (disabled in football slice) |
| `nuzlocke` | Title button, run mode flag |
| `type` / `move` | Style/type badges, move blocks (battle engine) |
| `fainted` | Battle log, CSS classes, faint copy |
| `pokeball` / `safari` / `route` / `rival` | Classic mode, Silver rival, endless |

**Method:** `rg` across `Pokelike/` (js, html, css, data, docs, scripts). Football-mode **active path** validated separately via `validate-phase1-qa.mjs` P1-049 and new `validate-identity-cleanup.mjs`.

---

## 3. Classification Legend

| Code | Meaning |
|------|---------|
| **1** | Player-facing blocker — visible in football campaign |
| **2** | Visible but acceptable only in Classic / internal mode |
| **3** | Internal bridge allowed temporarily — DOM id / function alias with football delegate |
| **4** | Legacy compatibility code — Classic only; hidden when `footballMode` |
| **5** | Save / key compatibility — `poke_*`, `speciesId` serialization |
| **6** | Test / harness terminology — validators reference legacy names intentionally |
| **7** | Historical docs only — Phase 1–3 specs; no runtime effect |
| **8** | Must rename now — blocks external demo |
| **9** | Defer with reason — Phase 4 / save v4 / Classic split |

---

## 4. Player-Facing Blockers (Category 1 / 8)

| ID | Location | Finding | RC task | Status |
|----|----------|---------|---------|--------|
| RC-B01 | `index.html` subtitle | Static subtitle was `Pokemon Roguelike` | RC-011 | **RESOLVED** — `Build your World Cup squad` |
| RC-B02 | `index.html` hard mode | Nuzlocke label + Pokémon tooltip | RC-012 | **RESOLVED** — `football-boot` hides control; label `Hard Mode` |
| RC-B03 | `index.html` collection | Pokédex button / alt | RC-013 | **RESOLVED** — `World Cup Album` + glyph; manifest `album-icon.svg` |
| RC-B04 | `index.html` disclaimer | Pokémon disclaimer in DOM | RC-014 | **RESOLVED** — hidden via `football-boot` + JS gate |
| RC-B05 | `index.html` starter | `Choose Your Starter!` fallback | RC-015 | **RESOLVED** — `Marquee Signing` |
| RC-B06 | `index.html` battle | `Wild Battle!` fallback | RC-016 | **RESOLVED** — `Friendly Match` |
| RC-B07 | `index.html` stamp | `Badge Earned!` / `Badges: n/8` | RC-017 | **RESOLVED** — `City Stamp earned` / `Stamps: n/8` |
| RC-B08 | `index.html` evolution | `Choose its evolution:` overlay | RC-018 | **MITIGATED** — football path blocks evolution UI |
| RC-B09 | `ui.js` legacy theme | `TITLE_SCREEN_LEGACY_COPY` | — | **DEFER** — Classic branch only (cat. 2) |
| RC-B10 | `ui.js` battle intro | `Wild ${name} appeared!` | RC-016 | **MITIGATED** — football uses `GAME_THEME` copy |
| RC-B11 | `ui.js` faint | `fainted!` default | RC-016 | **MITIGATED** — football uses `is exhausted` |
| RC-B12 | `ui/pokedex.png` | Legacy filename | RC-033 | **OPEN** — fallback only; `assets/ui/album-icon.svg` shipped |
| RC-B13 | `css/style.css` header | Old Pokemon theme comment | RC-021 | **RESOLVED** |
| RC-B14 | `assets/players/` | No portrait PNGs on disk | RC-040+ | **OPEN** — T0 jersey fallback active |
| RC-B15 | `ui.js` remote URLs | PokeAPI in legacy paths | RC-022 | **MITIGATED** — football path local/manifest only |
| RC-B16 | `game.js` trainer node | Pokémon trainer teams | RC-016 | **RESOLVED** — `buildFootballNpcTeam` on football path |

**P1-049 green surfaces (already football-native):** Scout Report, Squad Registration, Slice Complete, football `GAME_THEME` branch, `doScoutReportNode` strings.

---

## 5. Internal Bridges Allowed Temporarily (Category 2)

| Bridge | Files | Football behavior | Retire when |
|--------|-------|-------------------|-------------|
| `catch-screen` / `catch-choices` | `index.html`, `ui.js`, `game.js` | Scout Report presentation | RC-040+ or Classic split |
| `badge-screen` / `badge-*` | `index.html`, `css`, `game.js` | City Stamp ceremony | RC-041 |
| `openPokedexModal()` | `data.js`, `ui.js` | Delegates to `openAlbumModal()` | RC-042 |
| `markPokedexSeen/Caught()` | `data.js` | Routes to album for football IDs | Save v4 |
| `speciesId` on instances | `data.js`, `combat-adapter` | Mirrors `profileId` | Save v4 |
| `renderPokemonCard()` | `ui.js` | Dispatches to `renderPlayerCard()` | RC-043 |
| `fetchPokemonById()` / `createInstance()` | `data.js` | Football profile path first | Post-RC refactor |
| `NODE_TYPES.CATCH` | `map.js` | Scout Report node | Internal enum OK |
| `NODE_TYPES.POKECENTER` | `map.js` | Recovery Center label in football | Enum rename defer |
| `poke_current_run` etc. | `game.js`, `save.js` | Active run storage | Save v4 migration |
| `type-badge` CSS class | `ui.js`, `css` | Style chip presentation | Cosmetic rename low priority |

---

## 6. Legacy Compatibility Code (Category 3)

Hidden or inactive when `FEATURES.footballMode === true`:

- `trainer-screen`, Gen 1/2 starter chooser, HoF PC grid copy
- `shiny-screen`, trade screen, endless mode UI
- `nuzlocke` run flag (feature off)
- `legendary` map nodes (weight 0 in football slice)
- `GYM_LEADERS`, National Dex evolution tables in `data.js`
- Gen 2 trainer sprites + Showdown CDN URLs in `map.js`
- Classic battle log / evolution animations using PokeAPI assets

**Policy:** Do not delete until Classic mode decision. Gate visibility and ensure football path never routes here.

---

## 7. Historical Docs Only (Category 4)

`docs/001`–`docs/025`, HTML governance reports, Phase 1–3 plans — retain Pokémon terminology as migration record. **No change required** except cross-links to SPEC 014 when superseded.

---

## 8. Test / Harness Terms (Category 5)

| File | Why allowed |
|------|-------------|
| `validate-phase1-qa.mjs` P1-049 | Prohibited-term grep definition |
| `validate-football-domain.mjs` | Asserts bridge existence (`markPokedexSeen`, `catchPokemon`) |
| `validate-phase2-qa.mjs` | Bridge inventory checks |
| `validate-identity-cleanup.mjs` | Identity gate definitions |

---

## 9. High-Risk Renames (do not bulk-replace)

| Target | Risk | Safe approach |
|--------|------|---------------|
| `speciesId` field | Save/load break | Alias only; document in save v4 |
| `poke_*` localStorage keys | Account loss | Migration script + dual-read |
| `catch-screen` element id | Event handlers / tests | Add football alias id; migrate handlers per RC task |
| `openPokedexModal` global | `index.html` onclick | Keep alias → `openAlbumModal` |
| `NODE_TYPES` enum values | Map save shape | Presentation layer only first |
| `runBattle` / damage types | Battle math | **Out of scope** — presentation only |

---

## 10. Deferred Legacy Terms (Category 7)

| Term | Defer reason | Earliest phase |
|------|--------------|----------------|
| `eliteIndex` / map 8+ | Knockout deferred Phase 4 | Phase 4 with feature flag |
| `poke_dex` read fallback | Save v3 compat | Save v4 |
| `cloud-save.js` dex merge | Cloud off | Formal cloud decision |
| Classic-only screens in `index.html` | Low traffic if gated | RC Wave 1 hide; removal Phase 4+ |
| Repo folder name `Pokelike/` | Tooling paths | Post-RC or monorepo rename |
| `battle.js` `pokemon` in comments | Engine neutral | Comment-only RC-050 |

---

## 11. Files Requiring Rename / Copy Cleanup (priority order)

1. `index.html` — title area, collection, battle, badge, evolution fallbacks  
2. `js/data.js` — `GAME_THEME` legacy fallbacks  
3. `js/ui.js` — title copy, battle intros, legacy card remote URLs  
4. `css/style.css` — header comment; optional class alias docs  
5. `ui/pokedex.png` → `ui/album.png` (with redirect/fallback)  
6. `favicon.svg` — already football-themed ✓  
7. New manifests under `data/football/*_asset_manifest.json`  
8. `assets/players/**` — create per pipeline (028)

---

## 12. Acceptance Criteria — “Football-Native Identity”

External demo **GO** requires all of:

- [x] No forbidden terms in **football-active rendered strings** (P1-049 + `validate-identity-cleanup.mjs`)
- [x] Document `<title>` and visible title/subtitle football-native
- [x] Collection entry labeled **World Cup Album** (glyph + `album-icon.svg` manifest)
- [x] City Stamp UI uses stamp progress copy — not badge/gym
- [x] Player forms as **Form Level** — evolution UI blocked on football path
- [x] No remote asset URLs on football-critical paths (runtime gates off)
- [x] `validate-identity-cleanup.mjs` and `validate-asset-manifests.mjs` green
- [ ] Manual RC runbook PASS ([031](./031-release-candidate-manual-qa-runbook.md))
- [x] Release invariants unchanged (knockout off, cloud off, battle math)

---

## 13. Current Verdict

| Gate | Status |
|------|--------|
| Wave 0 (audit, manifests, harnesses) | **PASS** |
| Wave 1 (player-facing identity) | **PASS** — RC-B01–B11, B13, B16 resolved; B12/B14 asset debt |
| Football loop surfaces | **PASS** (P1-049 + domain harness) |
| Asset pipeline (manifests + stamps) | **PASS** schema; **PARTIAL** art (T0 portraits, node SVGs pending) |
| Manual QA ([031](./031-release-candidate-manual-qa-runbook.md)) | **PENDING** |
| External demo identity | **CONDITIONAL NO-GO** — identity gates green; manual QA + T1 portraits recommended |
| Phase 4 entry | **BLOCKED** until RC-072 sign-off |

---

*End of SPEC 014A — Release Candidate Identity Audit.*
