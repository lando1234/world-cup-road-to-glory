# Spec 001 — Codebase Discovery & Architecture Map

**Project:** Pokelike (Pokemon Roguelike)  
**Version referenced:** v1.6 (per title screen)  
**Analysis date:** 2026-06-05  
**Scope:** Read-only inspection — no production code modified.

---

## Architecture Summary

Pokelike is a **single-page, client-only browser game** with no build step, no framework, and no server-side game logic. The entire application is vanilla JavaScript loaded via `<script>` tags in `index.html`, with one global `state` object as the runtime source of truth.

### High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  index.html — screen shells (title, map, battle, catch, etc.)   │
└────────────────────────────┬────────────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
  data.js               game.js                  ui.js
  (static data,         (state, flows,           (rendering,
   PokeAPI fetch,        node handlers,           animations,
   persistence)          run lifecycle)           modals)
     │                       │                       │
     ├─ map.js ──────────────┤                       │
     ├─ battle.js ───────────┤                       │
     └─ endless.js ──────────┘                       │
                             │                       │
                    cloud-save.js                    │
                    (optional sync)                  │
                             ▼                       ▼
                    localStorage (+ save.pokelike.xyz)
```

### Game modes

| Mode | Entry | Progression |
|------|-------|-------------|
| **Normal** | Title → trainer → starter → 8 gym maps → Elite Four | Roguelike node map per arena |
| **Nuzlocke** | Same as Normal | Fainted Pokémon removed permanently (Silver battles exempt) |
| **Gen 2** | Gen toggle on title | Johto gym leaders, Gen 2 starters, different level curves |
| **Battle Tower** | Unlocked after any Hall of Fame entry | 5 stages × 3 regions × 3 maps; type-trait combat meta |

### Core loop (Normal mode)

1. Player picks a node on a layered DAG map (`map.js` → `generateMap`).
2. Node type dispatches to a handler in `game.js` (`onNodeClick`).
3. Battles run through `runBattleScreen` → `runBattle` (`battle.js`) with canvas animations (`ui.js`).
4. Wins grant XP/levels, possible evolution (`checkAndEvolveTeam`), dex updates, achievements.
5. Boss nodes award badges; after 8 badges, Elite Four chain → win screen → Hall of Fame.
6. Active run persists in `localStorage` (`poke_current_run`); meta-progress syncs to cloud optionally.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Framework** | None | Plain HTML/CSS/JS — no React, Vue, etc. |
| **Language** | JavaScript (ES6+) | Global functions/objects; no modules/bundler |
| **Package manager** | None | No `package.json`, `npm`, or build pipeline in repo |
| **Database / storage** | `localStorage` | All persistence client-side; keys prefixed `poke_` / `pkrl_` |
| **Cloud storage** | Custom REST API | `https://save.pokelike.xyz` — username/password auth, UUID-based saves |
| **Auth** | Cloud save only | Register/login modal in `cloud-save.js`; no OAuth |
| **External data** | PokeAPI + bundled JSON | `fetchPokemonById` hits API; `data/pokedex.json` intended as offline bundle |
| **Sprites / assets** | PokeAPI GitHub CDN + Pokemon Showdown CDN + local `sprites/` | Heavy external dependency |
| **Analytics** | Google Analytics (`G-7B6G2K0W0K`) | In `index.html` |
| **Ads** | Google AdSense | Client ID in `index.html` |
| **Telemetry** | Cloudflare Web Analytics | Beacon script at bottom of `index.html` |
| **Fonts** | Google Fonts — Press Start 2P | Retro pixel aesthetic |
| **Deployment assumptions** | Static site on `pokelike.xyz` | Single `index.html` entry; relative asset paths; separate save server subdomain |

### Workspace snapshot caveat

The analyzed workspace contains **only 15 tracked files** (HTML, 7 JS modules, CSS, 5 UI images). Referenced but **missing locally**:

- `data/pokedex.json` (~324 KB bundled species data)
- `sprites/` (trainers, badges, map icons, gen2 variants)
- `favicon.svg`, `privacy.html`

Production deployment clearly expects these assets; local clone may be incomplete or assets live outside this snapshot.

---

## Folder Map

```
Pokelike/
├── index.html          # SPA shell: all screens as <div class="screen">, script load order
├── css/
│   └── style.css       # ~3k lines: layout, poke-cards, map, battle, modals, dark mode
├── js/
│   ├── data.js         # ~2k lines: TYPE_CHART, MOVE_POOL, gym/elite teams, evolutions,
│   │                   #   species pools, items, achievements, dex/HoF, PokeAPI helpers
│   ├── map.js          # Node map generation, rendering, trainer sprite assignment
│   ├── battle.js       # Auto-battle engine: damage, items, traits hooks, level gain
│   ├── endless.js      # Battle Tower: traits, archetypes, fixed stage teams, regions
│   ├── ui.js           # ~4.5k lines: all DOM rendering, battle animations, modals,
│   │                   #   evolution UI, pokedex, settings, patch notes
│   ├── game.js         # ~3.3k lines: state, init, node handlers, run lifecycle
│   └── cloud-save.js   # Cloud sync: auth, merge, visibility-change pull
├── ui/                 # HUD icons (pokedex, achievements, settings, backgrounds)
├── data/               # (expected) pokedex.json — not present in workspace
├── sprites/            # (expected) trainer/map/badge sprites — not present in workspace
└── docs/
    └── 001-codebase-discovery.md
```

### Script load order (critical)

```html
data.js → map.js → battle.js → endless.js → ui.js → game.js → cloud-save.js
```

`game.js` depends on symbols from all prior files. `cloud-save.js` patches `localStorage.setItem` and calls `initGame` after auth.

### Routes / pages

There is **no client-side router**. Navigation is `showScreen(id)` toggling `.screen.active` on predefined divs:

| Screen ID | Purpose |
|-----------|---------|
| `title-screen` | Main menu, mode select, cloud save |
| `trainer-screen` | Boy/Girl trainer pick |
| `starter-screen` | Starter selection |
| `map-screen` | Roguelike map + team/items HUD |
| `battle-screen` | Auto-battle with skip/continue |
| `catch-screen` | Wild encounter — pick 1 of 3 |
| `item-screen` | Item pickup — pick 1 of 3 |
| `swap-screen` | Team full — swap or skip |
| `trade-screen` | Trade offer (Normal mode) |
| `shiny-screen` | Shiny encounter celebration |
| `badge-screen` | Gym badge reward |
| `transition-screen` | Elite Four transitions |
| `elite-prep-screen` | Reorder team + use items before elite fight |
| `gameover-screen` | Run lost |
| `win-screen` | Champion victory |
| `stat-buff-screen` | Battle Tower permanent stat upgrades |
| `endless-stage-select` | Battle Tower stage picker |
| `endless-stage-complete` | Stage clear summary |

Modals (Pokédex, Achievements, Hall of Fame, Settings, Patch Notes, Item Equip, Cloud Auth) are **dynamically injected** by `ui.js` / `cloud-save.js`.

---

## Core Entities

### Pokémon / creature instance

Created by `createInstance(species, level, isShiny, moveTier)` in `data.js`:

```javascript
{
  speciesId,      // National dex ID (primary key)
  name,             // Display name (Pokémon-specific)
  nickname,         // Optional player nickname
  level,
  currentHp, maxHp,
  isShiny,
  types,            // ['Fire', 'Flying']
  baseStats,        // { hp, atk, def, speed, special, spdef }
  spriteUrl,
  megaStone,        // Field exists; mega evolution not implemented
  heldItem,         // { id, name, icon, ... } or null
  moveTier,         // 0–2 (weak/standard/powerful move pool tier)
  statBuffs,        // Persistent per-evo-line buffs { atk: 0–10, ... }
}
```

Species **definitions** come from `data/pokedex.json`, PokeAPI, or hardcoded boss teams (`GYM_LEADERS`, `ELITE_4`, etc.).

### User / player

Not a traditional user entity. Player identity is:

- `state.trainer` — `'boy'` | `'girl'` (persisted `poke_trainer`)
- Cloud account — `poke_save_uuid`, `poke_username` (optional)
- No avatar stats beyond trainer sprite choice

### Inventory (items)

- `state.items` — bag array during active run
- Held items attach to individual Pokémon (`heldItem`)
- Two pools: `ITEM_POOL` (held/battle) and `USABLE_ITEM_POOL` (consumables)
- Items affect `calcDamage` / `getEffectiveStat` in `battle.js`

### Battles

- **Format:** Sequential 1v1 auto-battle (first alive on each side)
- **Resolution:** `runBattle()` returns `{ playerWon, detailedLog, pTeam, eTeam, playerParticipants }`
- **Presentation:** `animateBattleVisually()` replays `detailedLog` with canvas attack animations
- **Traits:** Battle Tower only — type-count synergies from `endless.js` (`buildTraitsConfig`)

### Collection

| System | Storage key | Shape |
|--------|-------------|-------|
| Pokédex (seen/caught) | `poke_dex` | `{ "<id>": 0 \| 1 }` |
| Shiny dex | `poke_shiny_dex` | `{ "<id>": 1 }` |
| Hall of Fame | `poke_hall_of_fame` | Array of run summaries (slimmed entries) |
| HoF index (unlocks) | `poke_hof_index` | `{ evoLineRoots, starterRuns, maxEndlessStage }` |
| Used starters | `poke_used_starters` | Array of species IDs |
| Stat buffs | `poke_stat_buffs` | `{ "<evoLineRoot>": { hp, atk, ... } }` |

### Rewards

- **Badges:** `state.badges` counter (0–8)
- **Level ups:** +2 base per win (`getLevelGain`), +1 in Nuzlocke; wild battles +1
- **Achievements:** `ACHIEVEMENTS` array in `data.js`, unlocked IDs in `poke_achievements`
- **Elite wins:** `poke_elite_wins` counter
- **Battle Tower:** Stage unlocks derived from HoF; stat buff points on stage complete
- **Shiny Charm:** Unlocked when Gen 1 dex complete (`hasShinyCharm()` → 2% shiny rate)

### Upgrades / evolution

| Mechanic | Location | Notes |
|----------|----------|-------|
| **Level evolution** | `EVOLUTIONS`, `BRANCHING_EVOLUTIONS` in `data.js`; `checkAndEvolveTeam()` in `ui.js` | Level thresholds; Eevee branches via overlay |
| **Moon Stone** | Usable item | Force-evolve regardless of level |
| **Move tier (TM)** | Usable item | Upgrades `moveTier` by 1 (max 2) |
| **Stat buffs** | Battle Tower rewards | Permanent +10% per point per stat, max 10 per stat per evo line |
| **Merge** | — | **Not implemented** |
| **Mega evolution** | — | `megaStone` field exists; question-mark `'mega'` node type routes to **item pickup**, not mega |

---

## Main User Flows

### 1. New Normal run

```
title-screen → trainer-screen (if first time) → starter-screen
  → startMap(0) → map-screen → [node clicks] → badge-screen (×8)
  → elite transitions → elite-prep-screen → battle-screen (×5)
  → win-screen → Hall of Fame entry → syncToCloud()
```

### 2. Node click dispatch (`onNodeClick`)

| Node type | Handler | Outcome |
|-----------|---------|---------|
| `battle` | `doBattleNode` | Wild/trainer fight, XP |
| `catch` | `doCatchNode` | Pick 1 of 3 Pokémon |
| `item` | `doItemNode` | Pick 1 of 3 items |
| `boss` | `doBossNode` | Gym leader battle → badge |
| `pokecenter` | `doPokeCenterNode` | Full heal |
| `trainer` | `doTrainerNode` | Trainer battle |
| `legendary` | `doLegendaryNode` | Legendary encounter |
| `move_tutor` | `doMoveTutorNode` | Move tier upgrade |
| `trade` | `doTradeNode` | Trade team member |
| `silver` | `doSilverNode` | Rival battle (Gen 2) |
| `question` | `resolveQuestionMark()` | Random: battle/trainer/catch/item/shiny/mega-item |

### 3. Catch flow

`doCatchNode` → roll 3 species from BST bucket + gen range → `catch-screen` → `catchPokemon` → if team full, `showSwapScreen`.

### 4. Battle Tower

```
win-screen or title → endless-stage-select → pick stage
  → forced starter from REGION_STARTERS → endless map (3 regions × 3 maps)
  → trait panel visible → region bosses → stat buff screen → stage complete
```

### 5. Cloud save

```
initCloudSave() on boot → load/merge from save.pokelike.xyz
  → visibilitychange triggers syncToCloud() (pull → merge → push)
```

---

## Reusable Systems

These subsystems are **conceptually separable** from Pokémon theming and could be reskinned:

| System | Primary files | Abstraction quality |
|--------|---------------|---------------------|
| **Roguelike map** | `map.js` | Good — `NODE_TYPES`, weighted generation, DAG edges; trainer sprites are themed |
| **Auto-battle engine** | `battle.js` | Moderate — damage formula is Pokémon-like; type chart is generic enough to swap |
| **Creature card UI** | `ui.js` `renderPokemonCard` | Moderate — hardcoded stat labels (ATK/SP.A) and type badges |
| **Collection / dex** | `data.js` | Good — ID-keyed `{ id: 0\|1 }` pattern is theme-agnostic |
| **Achievement system** | `data.js` `ACHIEVEMENTS` | Moderate — achievement copy and unlock conditions reference Pokémon content |
| **Inventory / held items** | `data.js`, `battle.js`, `game.js` | Good — item effects are data-driven via `id` checks |
| **Progression (levels)** | `battle.js` `applyLevelGain` | Good — simple level + HP scaling |
| **Evolution** | `data.js`, `ui.js` | Moderate — keyed by `speciesId` with large hardcoded `EVOLUTIONS` map |
| **Trait / synergy combat** | `endless.js` | Good — type-count tiers with hook-based `traitsConfig` |
| **Persistent buffs** | `game.js`, `data.js` | Good — evo-line-root keyed stat points |
| **Cloud save merge** | `cloud-save.js` | Good — generic key-level merge strategies |
| **Seeded RNG** | `game.js` `rng()` | Excellent — mulberry32, `runGeneration` guard against stale async |
| **Screen manager** | `ui.js` `showScreen` | Excellent — simple show/hide pattern |
| **Battle animations** | `ui.js` | Moderate — per-move-type canvas animations, Pokémon move names |

---

## Pokémon-Specific Dependencies

### Names

| Location | Examples |
|----------|----------|
| `data.js` | All `GYM_LEADERS`, `ELITE_4`, `JOHTO_GYM_LEADERS`, `SILVER_ENCOUNTERS`, `MOVE_POOL` move names, `EVOLUTIONS` target names |
| `endless.js` | `ENDLESS_ARCHETYPES`, `FIXED_STAGE_REGIONS` trainer names (Brock, Ash, Cynthia, N, …) |
| `index.html` | "POKELIKE", "Pokemon Roguelike", "Pokédex", "Wild Pokemon Appeared!" |
| `data.js` `ACHIEVEMENTS` | "Gotta Catch 'Em All", starter-specific achievements |

### Images / sprites

| Source | Usage |
|--------|-------|
| `raw.githubusercontent.com/PokeAPI/sprites` | Pokémon sprites, item sprites, shiny variants — **50+ hardcoded URL templates** across `data.js`, `game.js`, `ui.js`, `map.js` |
| `play.pokemonshowdown.com/sprites/trainers` | Player trainer (Red/Dawn), gym leaders, elite four portraits |
| Local `sprites/` | Map node icons, custom trainers, badges, gen2 reskins — **paths throughout `map.js`** |
| `TYPE_IDS` in `data.js` | PokeAPI type icon IDs |

### Types

- `TYPE_CHART` — full 18-type effectiveness matrix (`data.js`)
- `MOVE_POOL` — moves organized by Pokémon type
- `TRAIT_DESCRIPTIONS` — Battle Tower bonuses per Pokémon type
- CSS classes `type-fire`, `type-water`, etc.

### Stats

- Pokémon stat names: HP, ATK, DEF, SP.A (special), SP.D (spdef), SPE (speed)
- `calcHp` uses main-series-inspired formula
- Physical/special split based on `special >= atk`
- Species IDs 129 (Magikarp/Splash), 63 (Abra/Teleport), 132 (Ditto/Transform) have special-case logic in `battle.js` / `getBestMove`

### UI copy

Extensive Pokémon terminology throughout HTML and JS: Pokédex, badges, gym leaders, Elite Four, Nuzlocke, starter, shiny, evolution, Poké Center, etc. Fan disclaimer in `index.html` acknowledges Nintendo/Game Freak/TPC ownership.

### API / data files

| Dependency | Endpoint / file | Purpose |
|------------|-----------------|---------|
| PokeAPI | `https://pokeapi.co/api/v2/pokemon/{id}` | Species stats, types, sprites (fallback) |
| PokeAPI | `https://pokeapi.co/api/v2/pokemon-species/{id}` | Flavor text for dex |
| PokeAPI | `https://pokeapi.co/api/v2/pokemon?limit=2000` | Species list cache |
| Bundled | `data/pokedex.json` | Primary offline source for 649 species |
| Showdown | Trainer sprite CDN | Battle portraits |

### Routes / storage fields

- All `localStorage` keys use `poke_` prefix
- Cache keys use `pkrl_poke_{id}`, `pkrl_species_{id}`
- `speciesId` is the universal foreign key (National Dex number)
- Gen ranges hardcoded: Gen1 (1–151), Gen2 (152–251), … Gen5 (494–649)

### Hardcoded species ID lists

Scattered across `data.js` and `endless.js`:

- `STARTER_IDS`, `GEN2_STARTER_IDS`
- `LEGENDARY_IDS`, `ALL_CATCHABLE_IDS`
- `GEN1_BST_APPROX` pools (low/midLow/mid/midHigh/high)
- `ENDLESS_ARCHETYPES[].pool` — per-archetype Pokémon ID arrays
- `FIXED_STAGE_REGIONS` — hand-crafted boss teams by numeric ID
- Special-case arrays in `getBestMove` (Geodude line, Lanturn, etc.)

---

## Risky Areas

### 1. Tightly coupled Pokémon logic

- **`speciesId` as universal identifier** — every system (battle, dex, evolution, encounters, achievements) assumes National Dex numbering.
- **`data.js` monolith (~2000 lines)** — gym teams, evolutions, move pools, encounter tables, and persistence all in one file.
- **Special-case species checks** — Magikarp (129), Abra (63), Ditto (132), Eevee branching, form slugs (`deoxys-attack`, `kyurem-black`) embedded in logic.
- **Boss teams fully hardcoded** — names, types, stats, held items inline; not data-driven.

### 2. Hardcoded assumptions

- Team size cap grows to 6 (`state.maxTeamSize`)
- Level cap 100 in Normal mode, unlimited in Battle Tower
- Gen 1 / Gen 2 mode toggles affect starters, gym order, map level curves, node weights
- Nuzlocke disables catch/trade nodes; Escape Rope disabled in Nuzlocke
- Battle Tower locked until `getHallOfFame().length > 0`
- `runGeneration` pattern required for any new async flows after reset

### 3. External API dependencies

| Risk | Impact |
|------|--------|
| PokeAPI downtime / rate limits | New species fetches fail; cached/local bundle mitigates for known IDs |
| PokeAPI sprites CDN | Broken images across entire UI (onerror handlers hide some) |
| Pokemon Showdown trainer CDN | Missing trainer portraits in battles |
| `save.pokelike.xyz` unreachable | Game still playable locally; cross-device sync fails (UI shows offline warning) |
| Google Fonts / Analytics / AdSense | Cosmetic / analytics only |

### 4. Asset / licensing dependencies

- **Pokémon IP:** Names, sprites, types, moves, trainer characters, gym leaders — all Nintendo/TPC/Game Freak property. Fan disclaimer present but commercial/reskin risk remains.
- **Missing local assets in workspace:** Game will 404 on `sprites/`, `data/pokedex.json` without full deploy artifact.
- **Badge sprites** reference local `sprites/badges/` with note about upstream halo artifacts.

### 5. Database / migration considerations

There is no SQL database. "Migrations" are **lazy localStorage shape upgrades**:

| Key | Migration |
|-----|-----------|
| `poke_dex` | `{ caught, name, types, spriteUrl }` → `{ id: 0\|1 }` |
| `poke_shiny_dex` | Full objects → `{ id: 1 }` |
| `poke_hall_of_fame` | Slim entries via `_slimHofEntry`; capped at `HOF_MAX_ENTRIES` |
| `pkrl_poke_*` | Bust cache missing `special`/`spdef` on boot |
| Cloud save | `SAVE_SCHEMA_VERSION = 2`; union/max merge per key type |

Any theme reskin must preserve key shapes or provide migration paths for existing player saves.

### 6. Code organization risks

- **`ui.js` (~4500 lines)** — rendering, animations, modals, evolution, pokedex all combined.
- **`game.js` (~3300 lines)** — all node handlers and mode logic.
- **Global namespace pollution** — no encapsulation; load order is fragile.
- **No tests** — no test runner or spec files in repo.

---

## Recommended Refactor Strategy

### Phase 0 — Inventory & assets (no behavior change)

1. Restore/commit missing `data/pokedex.json` and `sprites/` so local dev matches production.
2. Document all `localStorage` keys and cloud sync schema (partially done above).
3. Add a simple `ARCHITECTURE.md` pointer to this doc.

### Phase 1 — Data extraction (low risk)

1. Split `data.js` into:
   - `types.js` — `TYPE_CHART`, `MOVE_POOL`, `getTypeEffectiveness`, `getBestMove`
   - `species-data.js` — evolution tables, BST pools, legendary lists
   - `trainers-data.js` — gym/elite/silver/endless fixed teams
   - `items-data.js` — `ITEM_POOL`, `USABLE_ITEM_POOL`, `TYPE_ITEM_MAP`
   - `meta-data.js` — achievements, map names, level ranges
2. Introduce a **`CreatureDefinition`** interface (id, name, types, baseStats, spriteUrl) decoupled from dex IDs.
3. Map current `speciesId` → `CreatureDefinition` through a single `getCreatureDef(id)` gateway.

### Phase 2 — Theme abstraction layer (medium risk)

1. Replace hardcoded strings in `index.html` with a `GAME_THEME` config object (title, currency names, collection label).
2. Parameterize sprite URL builder: `theme.getSpriteUrl(id, variant)`.
3. Rename UI CSS classes generically (`creature-card` alongside `poke-card`) — optional dual support period.
4. Keep `speciesId` internally during transition; add `themeId` alias field on instances.

### Phase 3 — Engine modularization (medium–high risk)

1. Extract **battle engine** as pure functions taking generic `Combatant` types (stats, types, moves, items).
2. Extract **map generator** accepting `NodeTypeConfig` + `weight tables`.
3. Move `state` behind a minimal store with explicit `saveRun()` / `loadRun()` boundaries.
4. Consider ES modules + Vite for dev server (optional; enables tree-shaking without changing deploy model).

### Phase 4 — Content pipeline (for full reskin)

1. Replace National Dex IDs with internal creature IDs in all data files.
2. Build content authoring format (JSON/YAML) for:
   - Creature catalog
   - Evolution graph
   - Trainer rosters
   - Encounter tables per map tier
3. Generate `pokedex.json` equivalent from pipeline; eliminate runtime PokeAPI dependency for core content.
4. Replace PokeAPI/Showdown sprites with owned/original art assets.

### Phase 5 — Legal / deploy hygiene

1. Remove or replace all copyrighted names/sprites before any non-fan distribution.
2. Self-host all assets; remove third-party CDN runtime dependencies.
3. Audit AdSense/analytics for new branding.

### Suggested priority order

```
Data extraction → Theme config → Sprite URL indirection → Battle engine generics → Content pipeline
```

Avoid big-bang rewrites; the `runGeneration` async guard and cloud-save merge logic are subtle and easy to break.

---

## Open Questions

1. **Where do full assets live?** `sprites/` and `data/pokedex.json` are referenced but absent from this workspace — separate repo, LFS, or deploy-only artifact?

2. **Is there a backend repo for `save.pokelike.xyz`?** Schema version 2 is client-defined; server validation rules unknown.

3. **Build/deploy pipeline?** No CI config in workspace — manual upload to `pokelike.xyz`? Cloudflare Pages?

4. **`megaStone` field purpose?** Present on instances but no mega evolution flow found — planned feature or dead field?

5. **Gen 3–5 content scope?** BST pools and Battle Tower stages reference up to ID 649, but Normal mode only supports Gen 1/2 toggle. Is full-gen Normal mode planned?

6. **Privacy policy & compliance?** `privacy.html` referenced but not in workspace; AdSense + cloud accounts may need GDPR/COPPA review.

7. **Intended reskin scope?** Full creature replacement vs. mechanical reskin keeping Pokémon names for fan project?

8. **Test strategy?** Battle engine is deterministic with seeded RNG — ideal for unit tests, but none exist. Will tests be part of refactor?

9. **Mobile/PWA support?** Viewport meta present; touch tooltips implemented — is offline/PWA a goal?

10. **Patch notes source of truth?** `openPatchNotesModal()` in `ui.js` — is changelog embedded in JS or fetched remotely?

---

## File Size Reference

| File | Lines (approx.) | Role |
|------|-----------------|------|
| `ui.js` | 4,521 | UI + animations + modals |
| `game.js` | 3,282 | Game flow + state |
| `css/style.css` | 3,045 | All styling |
| `data.js` | 2,003 | Data + persistence helpers |
| `endless.js` | 781 | Battle Tower mode |
| `map.js` | 796 | Map generation/render |
| `battle.js` | 511 | Combat simulation |
| `cloud-save.js` | 548 | Cloud sync |
| `index.html` | 345 | App shell |

**Total JS:** ~12,442 lines across 7 files.

---

## localStorage Key Reference

| Key | Scope | Synced to cloud |
|-----|-------|-----------------|
| `poke_current_run` | Active run state | No |
| `poke_endless_state` | Battle Tower progress | No |
| `poke_previous_run` | Reset undo buffer | No |
| `poke_trainer` | Trainer gender | Yes |
| `poke_selected_gen` | Gen 1/2 toggle | No |
| `poke_tutorial_seen` | Tutorial flag | Yes |
| `poke_settings` | Auto-skip, dark mode | Yes |
| `poke_achievements` | Unlocked achievement IDs | Yes |
| `poke_dex` | Pokédex | Yes |
| `poke_shiny_dex` | Shiny dex | Yes |
| `poke_elite_wins` | Win counter | Yes |
| `poke_hall_of_fame` | Completed runs | Yes |
| `poke_hof_index` | HoF-derived unlocks | Yes |
| `poke_stat_buffs` | Permanent stat upgrades | Yes |
| `poke_used_starters` | Starter history | Yes |
| `poke_last_used` | Recent HoF PC picks | Yes |
| `poke_last_run_won` | Streak tracking | Yes |
| `poke_win_streak` | Back-to-back wins | No |
| `poke_save_uuid` | Cloud save ID | No |
| `poke_username` | Cloud username | No |
| `poke_meta` | Per-key sync timestamps | No |
| `pkrl_poke_{id}` | PokeAPI cache entries | No |
| `pkrl_species_list` | Species list cache | No |

---

*End of discovery document.*
