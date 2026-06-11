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

## 4. Player-Facing Blockers (Category 1 / 6)

| ID | Location | Finding | RC task |
|----|----------|---------|---------|
| RC-B01 | `index.html` L32 | Static subtitle `Pokemon Roguelike` until JS applies theme | RC-010 |
| RC-B02 | `index.html` L46 | Visible `Nuzlocke` button label (football mode should hide or rename) | RC-011 |
| RC-B03 | `index.html` L49, L112–122 | Collection button `📖 Pokédex` + `ui/pokedex.png` alt | RC-012 |
| RC-B04 | `index.html` L69–70 | Pokémon disclaimer block (hidden in football via JS; should remove from DOM or gate) | RC-013 |
| RC-B05 | `index.html` L91 | Starter screen fallback title `Choose Your Starter!` | RC-014 |
| RC-B06 | `index.html` L149 | Battle title fallback `Wild Battle!` | RC-015 |
| RC-B07 | `index.html` L234–236 | Badge screen fallback `Badge Earned!` / `Badges: 0/8` | RC-016 |
| RC-B08 | `index.html` L354 | Evolution overlay `Choose its evolution:` | RC-017 |
| RC-B09 | `ui.js` L277 | `GAME_THEME` fallback subtitle still `Pokemon Roguelike` in legacy branch | RC-018 |
| RC-B10 | `ui.js` L125 | Legacy battle intro `Wild ${name} appeared!` | RC-019 |
| RC-B11 | `ui.js` L135 | Default faint string `fainted!` (football uses `is exhausted` via theme) | RC-019 |
| RC-B12 | `ui/pokedex.png` | Asset filename and icon imply Pokédex | RC-020 |
| RC-B13 | `css/style.css` L1 | File header `Pokemon Roguelike Retro Theme` | RC-021 |
| RC-B14 | Player profile `portrait` paths | `/assets/players/{slug}.png` referenced but **no files on disk** (T0 fallback only) | RC-030+ |
| RC-B15 | `ui.js` remote URLs | PokeAPI sprite URLs in legacy card/evolution paths | RC-022 (football path must never hit) |
| RC-B16 | `game.js` `doTrainerNode` / `doBattleNode` | Trainer battles still spawn Pokémon (`Fisherman wants to battle`, Psyduck); friendly match uses National Dex pool | RC-019 |

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

- [ ] No `Pokemon`, `Pokémon`, `Pokédex`, `Gym`, `Elite Four`, `Wild`, `fainted`, `evolution`, `starter`, `shiny`, `legendary`, `Nuzlocke` in **football-active rendered strings** (P1-049 surfaces + title/HUD/album/settlement/battle chrome)
- [ ] Document `<title>` and visible title/subtitle are football-native (`World Cup: Road to Glory` / `Road to Glory`)
- [ ] Collection entry labeled **World Cup Album** with owned icon asset
- [ ] City Stamp UI uses stamp/stamp progress copy — not badge/gym
- [ ] Player forms described as **Form Level** / **Career Form** — never “evolution” player-facing
- [ ] No remote asset URLs on football-critical paths (PokeAPI, Showdown, TheSportsDB runtime)
- [ ] `validate-identity-cleanup.mjs` and `validate-asset-manifests.mjs` green
- [ ] Manual RC runbook PASS (see [031](./031-release-candidate-manual-qa-runbook.md))
- [ ] Release invariants unchanged (knockout off, cloud off, battle math)

---

## 13. Current Verdict

| Gate | Status |
|------|--------|
| Football loop surfaces (scout/swap/slice/settlement) | **PASS** (P1-049) |
| Title / collection / battle chrome | **FAIL** — RC-B01–B13 |
| Asset pipeline | **NOT STARTED** — T0 fallbacks only |
| External demo identity | **NO-GO** until RC Waves 1–3 minimum |

---

*End of SPEC 014A — Release Candidate Identity Audit.*
