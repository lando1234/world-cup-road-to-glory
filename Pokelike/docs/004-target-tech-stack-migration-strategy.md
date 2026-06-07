# SPEC 004 — Target Tech Stack & Migration Strategy

**Project:** Pokelike → World Cup Football Roguelike Autobattler  
**Version referenced:** v1.6  
**Analysis date:** 2026-06-05  
**Inputs:** [001-codebase-discovery.md](./001-codebase-discovery.md), [002-worldcup-mapping.md](./002-worldcup-mapping.md), [003-football-content-architecture.md](./003-football-content-architecture.md), and direct inspection of all source files (~15,832 lines across 9 files).

---

## 1. Executive Summary

### Current Architecture Assessment

Pokelike is a **client-only, zero-build-step SPA**: seven JavaScript files loaded in strict order via `<script>` tags, one global `state` object, `showScreen(id)` for navigation, and `localStorage` for persistence. There is no module system, no bundler, no type system, and no test harness.

```
index.html (18 screen shells + overlays)
    ↓
data.js → map.js → battle.js → endless.js → ui.js → game.js → cloud-save.js
    ↓                              ↓
localStorage                  save.pokelike.xyz
```

The codebase is **~12,442 lines of JavaScript** plus ~3,045 lines of CSS. Game logic is real and battle-tested; presentation is tightly fused to the DOM.

### Main Strengths

| Strength | Evidence |
|----------|----------|
| **Working roguelike loop** | Full Normal, Nuzlocke, Gen 2, and Battle Tower modes with save/resume |
| **Deterministic battle engine** | `battle.js` `runBattle()` returns `{ playerWon, detailedLog, pTeam, eTeam }` — replayable, testable |
| **Data-driven combat** | `TYPE_CHART`, `MOVE_POOL`, item effects keyed by `id` |
| **Seeded RNG + run guards** | `rng()` (mulberry32), `runGeneration` prevents stale async corruption |
| **Mature persistence** | Lazy migrations, cloud merge with per-key timestamps, schema version 2 |
| **Separable map generator** | `map.js` DAG with weighted node types is largely theme-agnostic |
| **Trait/synergy system** | `endless.js` hook-based `traitsConfig` is a clean extension point |

### Main Weaknesses

| Weakness | Evidence |
|----------|----------|
| **Global namespace** | All symbols are globals; load order is fragile |
| **UI monolith** | `ui.js` (~4,521 lines) mixes rendering, canvas animations, modals, evolution flows |
| **Flow monolith** | `game.js` (~3,282 lines) mixes node handlers, mode logic, and UI orchestration |
| **Data monolith** | `data.js` (~2,003 lines) combines type chart, moves, evolutions, trainers, persistence, PokeAPI |
| **Pokémon coupling** | `speciesId` as universal FK; special cases for IDs 63, 129, 132, 133; PokeAPI CDN URLs |
| **No tests** | Battle engine is ideal for unit tests; none exist |
| **No build pipeline** | Blocks TypeScript, tree-shaking, code splitting, CI |

### Recommended Migration Strategy

## **Option C — Hybrid Migration**

Extract a **framework-independent game core**, wrap it in a **Next.js + React shell**, and migrate UI incrementally screen-by-screen.

| Option | Verdict | Why |
|--------|---------|-----|
| **A — Keep Vanilla JS** | Reject | Does not meet long-term maintainability, TypeScript, mobile UI, accounts, or live-balance goals. Reskin-only path caps scalability. |
| **B — Full Rewrite to React** | Reject | ~12k lines of working battle, map, progression, and save logic would be reimplemented with high gameplay-regression risk. Violates "preserve as much existing logic as possible." |
| **C — Hybrid Migration** | **Accept** | Keeps `runBattle`, map generation, trait hooks, save merge, and node dispatch logic intact. Replaces only the presentation layer and global-state wiring. Lowest risk path to Next.js/React/TS/Tailwind. |

The hybrid path mirrors how the codebase is already structured conceptually: `battle.js` and `map.js` are partially extractable today; `ui.js` and `index.html` are the replaceable surface.

---

## 2. Technology Recommendation

### Evaluation Matrix

| Technology | Recommended? | Why | Future Use Cases |
|------------|--------------|-----|------------------|
| **Next.js** | **Yes** | App Router gives static export for game hosting, API routes for cloud save/auth later, SSR for marketing/landing pages. Vercel deployment aligns with project constraints. | Landing page, account login, leaderboard API routes, season config endpoints |
| **React** | **Yes** | Replaces 18 `<div class="screen">` shells and `ui.js` DOM manipulation. Component model maps 1:1 to existing screens. | All game screens, modals, HUD panels |
| **TypeScript** | **Yes** | Enforces domain types (`Player`, `RunState`, `BattleState`) currently implicit in plain objects. Catches save-shape drift at compile time. | Game core, stores, content catalogs, save migrations |
| **Tailwind CSS** | **Yes** | Replaces 3,045-line monolithic `style.css`. Design tokens map cleanly from existing CSS variables (`--gold`, `--accent`). | Responsive mobile HUD, component-scoped styling |
| **Zustand** | **Yes** | Lightweight store for `state` + meta-progress. Supports selectors, middleware (persist), no boilerplate. | Run state, UI state, settings, album progress |
| **React Context** | **Partial** | Use only for static/theme config (`GameTheme`, i18n labels). Not for frequently changing game state — causes re-render storms on battle ticks. | Theme strings, football vocabulary from Spec 002 |
| **Redux** | **No** | Overkill for a single-player game with one active run. High boilerplate vs. Zustand for equivalent functionality. | N/A unless multiplayer real-time sync is added |
| **localStorage** | **Yes (keep)** | Already stores 20+ keys with lazy migrations. Works for meta-progress and active run. | Run save, album, achievements, settings — keep through v2 |
| **IndexedDB** | **Yes (future)** | Needed when content catalog exceeds localStorage limits (649+ player profiles with portraits metadata). | Offline content bundle, large album cache, replay logs |
| **Supabase** | **Yes (future)** | Postgres + Auth + Realtime fits accounts, cloud saves, leaderboards, live balance tables. | Replace `save.pokelike.xyz`, OAuth, seasonal events, leaderboard rows |
| **Firebase** | **No** | Supabase is a better fit for relational save data, SQL migrations, and leaderboard queries. Firebase Firestore document merges are harder to align with existing keyed merge logic. | — |

### Final Stack Recommendation

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 15 (App Router) + React 19 + TypeScript        │
│  Tailwind CSS 4                                         │
│  Zustand (game + meta stores)                           │
│  React Context (theme/config only)                      │
├─────────────────────────────────────────────────────────┤
│  /game-core  — framework-independent TS modules         │
│  (extracted from battle.js, map.js, data logic)       │
├─────────────────────────────────────────────────────────┤
│  localStorage (v1→v2 saves) → IndexedDB (content cache)  │
│  Supabase (Phase 2+ — accounts, cloud save, boards)     │
└─────────────────────────────────────────────────────────┘
```

**Deploy target:** Static export or Vercel with edge functions for save API. Keep the game playable offline-first; cloud sync remains optional.

---

## 3. Migration Approaches Comparison

| Dimension | A — Reskin Only | B — Rewrite First | C — Extract Core + React UI |
|-----------|-----------------|-------------------|----------------------------|
| **Cost** | Lowest (~2–4 weeks content) | Highest (6–12+ months) | Medium (3–5 months phased) |
| **Risk** | Low short-term, high long-term (tech debt ceiling) | Very high (gameplay regression) | Low–medium (controlled slices) |
| **Time to playable football reskin** | Fastest | Slowest | Fast reskin possible in Phase 1–2 before full React |
| **Scalability** | Poor (still globals, no tests) | Good if executed perfectly | Good (typed core, testable engines) |
| **Maintainability** | Poor | Good | Good |
| **Gameplay risk** | Minimal | **Severe** | Minimal if core is ported, not reimplemented |

### Winner: **Approach C — Extract Game Core + React UI**

Reskin-only (A) does not satisfy the stated target stack. Rewrite-first (B) violates the primary constraint. Hybrid (C) allows:

1. Phase 1 reskin in vanilla (football content, zero architecture change) — optional fast win
2. Parallel extraction of battle/map/save into typed modules
3. React UI migration one screen at a time with the vanilla game still runnable as fallback

---

## 4. Current Codebase Audit

### `game.js` (~3,282 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | Central orchestrator: global `state`, RNG, run persistence, init, all node handlers (`onNodeClick` → `doBattleNode`, `doCatchNode`, etc.), Normal + Endless mode lifecycle, elite/knockout chain, achievements triggers, stat buffs |
| **Reuse Score** | **55 / 100** |
| **Recommended Action** | **Split** |

**Reasoning:** Contains valuable, non-UI logic (`saveRun`/`loadRun`, `runGeneration`, level curves, encounter tables, node dispatch) mixed with UI calls (`showScreen`, `renderTeamBar`, modals). Split into:

- `game-core/run-orchestrator.ts` — node dispatch, progression rules (keep logic)
- `game-core/run-persistence.ts` — save/load run state
- React hooks/effects replace init wiring

**Do NOT rewrite:** Node handler semantics, `runGeneration` guard, level gain rules, Nuzlocke/Injury List disable rules.

---

### `battle.js` (~511 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | Pure auto-battle simulation: `calcDamage`, `getEffectiveStat`, `runBattle`, `applyLevelGain`. Returns structured `detailedLog` for animation replay. Trait hooks via `traitsConfig`. |
| **Reuse Score** | **88 / 100** |
| **Recommended Action** | **Refactor** → extract to `game-core/battle/` |

**Reasoning:** Most functions are pure given inputs. Coupling: global `rng()`, `getBestMove`/`TYPE_CHART` from `data.js`, special cases for `speciesId` 132 (Ditto/Transform equivalent). Port almost verbatim to TypeScript; inject RNG and move resolver as dependencies.

**Do NOT rewrite:** Damage formula, stage multiplier, trait hook call order, overtime at round 100, item effect checks by `id`.

---

### `map.js` (~796 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | Roguelike DAG generation (`generateMap`), node weights, edge wiring, trainer sprite assignment, map rendering (`renderMap`), node clickability |
| **Reuse Score** | **72 / 100** |
| **Recommended Action** | **Split** |

**Reasoning:** `generateMap` and weight tables are highly reusable. `renderMap` and DOM node creation are tightly coupled to CSS classes and sprite paths. Split:

- `game-core/map/generator.ts` — pure generation (Keep)
- `components/map/MapCanvas.tsx` — React rendering (Replace DOM half)

**Do NOT rewrite:** Layer sizes `[3,4,3,4,3,2]`, edge algorithm, Nuzlocke weight zeroing, Gen 2 Silver node placement on maps 1/3/5/7.

---

### `data.js` (~2,003 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | Type chart, move pools, item pools, gym/elite teams, evolutions, BST buckets, achievements, PokeAPI fetch/cache, dex/HoF persistence helpers, `createInstance` |
| **Reuse Score** | **58 / 100** |
| **Recommended Action** | **Split** |

**Reasoning:** Monolith mixing static data, runtime API, and persistence. The *patterns* are reusable; the file organization is not. Split into:

- `data/playing-styles.ts` — `TYPE_CHART` (keep matrix, rename labels per Spec 003)
- `data/signature-skills.ts` — `MOVE_POOL`
- `data/player-catalog/` — JSON profiles (replace PokeAPI)
- `data/bosses/` — host city + knockout rosters
- `lib/persistence/` — dex, HoF, achievements (keep merge/migration logic)

**Do NOT rewrite:** `{ id: 0|1 }` dex shape, evo-line-root buff keying, lazy migration functions in `getPokedex`/`getHofIndex`.

---

### `ui.js` (~4,521 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | All DOM rendering: `showScreen`, player cards, team bar, battle field, 40+ canvas attack animations, modals (dex, achievements, HoF, settings, patch notes), evolution overlays, battle log replay (`animateBattleVisually`), tooltips |
| **Reuse Score** | **28 / 100** |
| **Recommended Action** | **Replace** (logic port, DOM discard) |

**Reasoning:** Largest file, highest DOM coupling. Reusable assets:

- Animation *timing* and `detailedLog` event handling semantics
- Card layout information architecture

Not reusable as-is: imperative DOM, inline styles, canvas animation functions tied to DOM element positions. Rebuild as React components + a single `<BattleCanvas>` or CSS/SVG animations.

**Do NOT rewrite from scratch:** Battle log replay event sequence — port `animateBattleVisually` behavior against the same `detailedLog` schema.

---

### `endless.js` (~781 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | Battle Tower / Continental Champions Cup: `endlessState`, trait descriptions, `buildTraitsConfig` hooks, archetype pools, stage/region level scaling, fixed boss teams |
| **Reuse Score** | **74 / 100** |
| **Recommended Action** | **Split** |

**Reasoning:** Trait engine (`buildTraitsConfig`, tier thresholds 2/4/6, shiny 2× count) is excellent and theme-agnostic. Content (`ENDLESS_ARCHETYPES`, `FIXED_STAGE_REGIONS`) is Pokémon-themed data — reskin via JSON per Spec 003, keep hook structure.

**Do NOT rewrite:** Trait hook interface (`onStartFight`, `beforeDamage`, `whenAttacked`, `afterAttack`, `onKO`), level slot tables.

---

### `cloud-save.js` (~548 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | Auth modal, fetch with timeouts, pull-merge-push sync, `localStorage.setItem` patch for timestamps, HoF/dex union merge, schema version 2 |
| **Reuse Score** | **82 / 100** |
| **Recommended Action** | **Refactor** → `lib/save/cloud-sync.ts` |

**Reasoning:** Generic keyed merge strategies are theme-independent. `_merging` guard and one-flight `_syncing` are subtle — port carefully. Replace REST endpoint and auth UI with Supabase later; keep merge algorithms.

**Do NOT rewrite:** Per-key timestamp conflict resolution, HoF hash dedup, collection union-max merge.

---

### `style.css` (~3,045 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | Global retro theme: screens, poke-cards, map nodes, battle layout, modals, dark mode, type badge colors, responsive map HUD |
| **Reuse Score** | **25 / 100** |
| **Recommended Action** | **Replace** with Tailwind + design tokens |

**Reasoning:** Monolithic CSS with Pokémon-specific class names (`.poke-card`, `.type-fire`). Extract token values (`--gold`, `--accent`, type colors) into Tailwind config. Component-scoped styles in React. Keep pixel-font aesthetic as a deliberate design choice.

---

### `index.html` (~345 lines)

| Field | Assessment |
|-------|------------|
| **Purpose** | SPA shell: 18 screens, evolution overlays, canvas, script load order, analytics/ads |
| **Reuse Score** | **15 / 100** |
| **Recommended Action** | **Replace** with Next.js `app/` routes and React root layout |

**Reasoning:** Static screen divs map directly to React page components. Script order dependency disappears with ES modules. Analytics can move to `next/script`.

---

## 5. Future Architecture

```
/src
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, fonts, analytics
│   ├── page.tsx                  # Title / main menu
│   ├── run/
│   │   ├── map/page.tsx          # Host city map
│   │   ├── battle/page.tsx       # Highlight duel
│   │   ├── scout/page.tsx        # Scouting report (catch)
│   │   └── ...                   # Other run screens
│   └── api/                      # Future: save sync, leaderboards
│       └── save/route.ts
│
├── components/                   # React UI (presentation only)
│   ├── screens/                  # Full-screen views (BattleScreen, MapScreen, …)
│   ├── hud/                      # TeamBar, ItemBar, StampCounter
│   ├── cards/                    # PlayerCard, ManagerCard
│   ├── map/                      # MapCanvas, ScoutNode, NodeTooltip
│   ├── battle/                   # BattleField, BattleCanvas, TraitBar
│   ├── modals/                   # AlbumModal, TrophyRoomModal, SettingsModal
│   └── ui/                       # Button, Badge, HpBar, TypeBadge (style chip)
│
├── game-core/                    # Framework-independent game logic (NO React imports)
│   ├── battle/                   # runBattle, calcDamage, applyLevelGain
│   ├── map/                      # generateMap, NODE_TYPES, weights
│   ├── progression/              # evolution checks, stat buffs, level curves
│   ├── encounters/               # catch rolls, BST buckets, legendary gates
│   ├── traits/                   # buildTraitsConfig, tier counting
│   ├── rng/                      # mulberry32, seedRng
│   ├── run/                      # RunOrchestrator, node dispatch table
│   └── save/                     # serialize/deserialize run, migrations
│
├── data/                         # Static content (JSON + typed loaders)
│   ├── football/                 # player_profiles, bosses, styles (Spec 003)
│   ├── items/
│   └── achievements/
│
├── hooks/                        # React adapters over game-core
│   ├── useRunState.ts
│   ├── useBattleReplay.ts
│   └── useAlbum.ts
│
├── lib/                          # Infrastructure
│   ├── persistence/              # localStorage adapters, key registry
│   ├── cloud/                    # Supabase client (future)
│   └── theme/                    # Football vocabulary config (Spec 002)
│
├── stores/                       # Zustand stores
│   ├── runStore.ts
│   ├── metaStore.ts
│   └── uiStore.ts
│
├── types/                        # Domain type definitions
│   ├── player.ts
│   ├── battle.ts
│   ├── map.ts
│   └── save.ts
│
└── utils/                        # Pure helpers (formatting, IDs, slug builders)
```

| Folder | Responsibility |
|--------|----------------|
| `app/` | Routing, layouts, SSR pages, API routes — no game rules |
| `components/` | Dumb/smart React UI; reads stores, dispatches actions |
| `game-core/` | All gameplay rules; unit-testable; zero DOM/React |
| `data/` | Content catalogs loaded at build or runtime |
| `hooks/` | Bridge React lifecycle to imperative game-core |
| `lib/` | IO, auth, theme strings, persistence plumbing |
| `stores/` | Zustand slices mirroring current global `state` + meta keys |
| `types/` | Single source of truth for domain shapes |
| `utils/` | Shared non-domain helpers |

---

## 6. Game Core Extraction Plan

| System | Current File(s) | Future Location | Refactor Complexity | Risk |
|--------|-----------------|-----------------|---------------------|------|
| **Battle engine** | `battle.js` | `game-core/battle/engine.ts` | **Low** — mostly copy + inject deps | **Low** |
| **Damage / stats** | `battle.js`, `data.js` `calcHp` | `game-core/battle/damage.ts`, `stats.ts` | Low | Low |
| **Progression (levels)** | `battle.js` `applyLevelGain`, `game.js` curves | `game-core/progression/levels.ts` | Low | Low |
| **Evolution engine** | `data.js` `EVOLUTIONS`, `ui.js` `checkAndEvolveTeam` | `game-core/progression/evolution.ts` | Medium — UI branching overlay decoupled | Medium |
| **Inventory / items** | `data.js` pools, `game.js` equip/use | `game-core/inventory/` | Medium | Low |
| **Map generation** | `map.js` `generateMap` | `game-core/map/generator.ts` | Low | Low |
| **Map rendering** | `map.js` `renderMap` | `components/map/` | Medium — rewrite as React | Medium |
| **Node dispatch** | `game.js` `onNodeClick` + handlers | `game-core/run/node-handlers.ts` | Medium — extract UI callbacks to events | Medium |
| **Encounter / scout rolls** | `game.js` `doCatchNode`, `data.js` BST | `game-core/encounters/scout.ts` | Medium | Low |
| **Achievement engine** | `data.js` `ACHIEVEMENTS`, unlock fns | `game-core/meta/achievements.ts` | Low — data + condition checks | Low |
| **Album / dex** | `data.js` `getPokedex`, mark fns | `lib/persistence/album.ts` | Low | Low |
| **Trait / synergy combat** | `endless.js` `buildTraitsConfig` | `game-core/traits/config.ts` | Low | Low |
| **Endless / CCC mode** | `endless.js`, `game.js` endless handlers | `game-core/modes/continental-cup.ts` | Medium | Medium |
| **Save engine (local)** | `game.js`, `data.js` persistence | `game-core/save/` + `lib/persistence/` | Medium | **High** — test migrations |
| **Cloud save merge** | `cloud-save.js` | `lib/cloud/merge.ts` | Medium | **High** |
| **RNG** | `game.js` | `game-core/rng/mulberry32.ts` | **Trivial** | Low |

### Extraction Order (dependency-safe)

1. `rng` → 2. `battle` → 3. `map/generator` → 4. `traits` → 5. `progression` → 6. `run/node-handlers` → 7. `save` → 8. `cloud merge`

---

## 7. React Component Architecture

| Component | Responsibility | State Requirements | Reusability |
|-----------|---------------|-------------------|-------------|
| **BattleScreen** | Hosts highlight duel: skip/continue, battle title, dispatches `runBattle` | `battleState`, `detailedLog`, `playerTeam`, `enemyTeam`, `traitsConfig`, `autoSkip` setting | Screen-specific |
| **MapScreen** | Host city leg: map canvas, HUD panels, node click routing | `runState.map`, `currentNode`, `cityStamps`, `squad`, `items`, mode flags | Screen-specific |
| **ScoutNode** | Map node visual for catch/scout type | Node type, visited state, tooltip data | High — all node types extend base |
| **PlayerCard** | Squad member card: portrait, form level, stamina bar, style chips, held item | `Player` instance, optional `selected`, `dexCaught` | **Very high** — used in scout, swap, battle, album |
| **InventoryPanel** | Bag + held items; equip/use flows | `items[]`, `squad[]`, equip modal state | High |
| **AlbumScreen** | World Cup Album modal/page: sticker grid, seen/signed/gold states | `album` record, profile catalog, volume filter | Medium — modal or route |
| **AchievementScreen** | Manager milestones list with unlock status | `achievements[]`, unlocked IDs | Medium |
| **EndlessTournamentScreen** | Continental Champions Cup stage picker + region panel | `endlessState`, HoF unlock, stage progress | Medium |
| **SettingsScreen** | Auto-skip, dark mode, era toggle | `settings` from meta store | High |
| **ManagerSelectScreen** | Boy/girl → manager pick | `trainer` preference | Low |
| **MarqueeSigningScreen** | Starter selection with style triangle | starter IDs, used starters history | Low |
| **KnockoutPrepScreen** | Elite prep: reorder squad, preview enemy, use items | `squad`, `items`, next boss team | Medium |
| **StampRewardScreen** | City stamp ceremony after boss | boss data, stamp count | Low |
| **UpgradeOverlay** | Player upgrade animation (evolution equivalent) | upgrading player, branch choices | Medium |
| **TraitPanel** | Tactics board showing active style synergies | squad, `TRAIT_DESCRIPTIONS` | High — Normal hidden, CCC visible |
| **TrophyRoomScreen** | Completed run summaries | `hallOfFame[]` | Medium |
| **TeamBar** | Compact squad strip for HUD | `squad[]`, hover card | **Very high** |
| **HpBar** | Stamina bar with color thresholds | current, max | **Very high** |
| **StyleBadge** | Playing style chip with color | style name | **Very high** |

### Component Hierarchy (Map Screen example)

```
MapScreen
├── MapHeader (city name, stamps, icon buttons)
├── MapCanvas
│   └── ScoutNode × N (node type variants)
├── MapPanels
│   ├── TraitPanel (CCC only)
│   ├── TeamBar → PlayerCard (mini)
│   └── InventoryPanel
└── NodeTooltip
```

---

## 8. State Management Strategy

### Evaluation

| Solution | Fit | Scalability | Complexity | Learning Curve |
|----------|-----|-------------|------------|----------------|
| `useState` | Run-scoped slices only | Poor for cross-screen state | Low | Low |
| `useReducer` | Battle replay, animation queue | Medium | Medium | Medium |
| Context API | Theme/config | Poor for game state | Low | Low |
| **Zustand** | **Primary game + meta state** | **High** | **Low** | **Low** |
| Redux | Over-engineered | High | High | High |

### Recommendation: **Zustand**

**Why:** The current `state` object in `game.js` is already a flat-ish store with ~15 fields. Zustand mirrors this directly, supports `persist` middleware wrapping `localStorage`, and allows selective subscriptions (e.g., battle screen subscribes to `squad` only). No provider nesting. Works outside React for game-core callbacks.

**Why not Redux:** No time-travel debugging requirement; no middleware ecosystem need; team size is small.

**Why not Context for game state:** Battle animations and map HUD update frequently; Context would re-render large subtrees.

### Proposed Store Structure

```
runStore                          # Active run (mirrors poke_current_run)
├── currentMapIndex
├── currentNodeId
├── squad: PlayerInstance[]
├── items: InventoryItem[]
├── cityStamps (badges)
├── map: MapState
├── eliteIndex
├── mode: 'campaign' | 'injury_list' | 'continental_cup'
├── era: 'modern' | 'classic'
├── rngSeed
├── runGeneration
├── maxSquadSize
└── actions: clickNode, advanceMap, addPlayer, applyItem, …

metaStore                         # Cross-run (localStorage synced keys)
├── managerGender
├── album: Record<profileId, 0|1>
├── goldAlbum: Record<profileId, 1>
├── trophyRoom: RunSummary[]
├── hofIndex: unlock data
├── legacyTraining: stat buffs by evoLineRoot
├── achievements: string[]
├── settings: { autoSkip, darkMode }
├── usedStarters: number[]
└── actions: markAlbumSeen, addTrophy, unlockAchievement, …

uiStore                           # Ephemeral UI
├── activeScreen
├── openModal: null | 'album' | 'settings' | …
├── battleReplayQueue
├── tooltips
└── actions: showScreen, openModal, …

endlessStore                      # CCC mode (mirrors poke_endless_state)
├── stageNumber, regionNumber, mapIndexInRegion
├── traitTiers
└── actions: startStage, completeRegion, …
```

**Bridge pattern:** `game-core` functions remain pure; Zustand actions call them and write results back. This preserves testability.

---

## 9. TypeScript Domain Model

Conceptual type definitions only — no implementation.

### Core Identity

```
PlayerProfileId     = number          // 1–649, equals legacy speciesId
EvoLineRootId       = number
FormLevel           = number          // 1–100+ (was level)
SkillTier           = 0 | 1 | 2       // was moveTier
```

### Player

```
PlayerProfile {
  playerProfileId: PlayerProfileId
  displayName: string
  nation: string                     // ISO-like code, fictional
  position: PlayerRole
  styles: [PlayingStyle] | [PlayingStyle, PlayingStyle]
  rarity: PlayerRarity
  evoLineRoot: EvoLineRootId
  baseStats: PlayerStats
  portraitUrl: string
  goldPortraitUrl?: string
  flavorText: string
  isLegendary: boolean
  isMarquee: boolean
  album: { volume, page, slot }
}
```

### PlayerStats

```
PlayerStats {
  stamina: number      // hp
  power: number        // atk
  defense: number      // def
  technique: number    // special
  vision: number       // spdef
  pace: number         // speed
}
```

### PlayerRole

```
PlayerRole = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'W' | 'ST'
```

### PlayerRarity

```
PlayerRarity = 'common' | 'uncommon' | 'rare' | 'elite' | 'superstar' | 'mythic' | 'legendary'
```

### PlayStyle (Playing Style — maps 1:1 to Pokémon type keys internally)

```
PlayingStyle =
  | 'Balanced' | 'High Press' | 'Possession Build-up' | 'Wing Play'
  | 'Rapid Counter' | 'Ice Press' | 'Physical Battle' | 'Dark Arts'
  | 'Aerial Threat' | 'Wide Play' | 'Tactical Control' | 'High Intensity'
  | 'Compact Block' | 'Clinical Finishing' | 'Power Strike'
  | 'Street Smarts' | 'Iron Defense' | 'Set Piece Master'

// Internal engine key preserved: PlayingStyleEngineKey = keyof TYPE_CHART
```

### PlayerInstance (runtime squad member)

```
PlayerInstance {
  playerProfileId: PlayerProfileId
  displayName: string
  nickname?: string
  formLevel: FormLevel
  currentStamina: number
  maxStamina: number
  isGoldCard: boolean               // was isShiny
  styles: PlayingStyle[]
  baseStats: PlayerStats
  portraitUrl: string
  skillTier: SkillTier
  heldItem: InventoryItem | null
  legacyBuffs: Partial<PlayerStats> // statBuffs, 0–10 per stat per evo line
}
```

### HistoricalTeam (CCC boss / archetype squad)

```
HistoricalTeam {
  managerName: string
  archetypeId: string
  primaryStyle?: PlayingStyle
  portraitKey: string
  roster: Array<{
    playerProfileId: PlayerProfileId
    formLevel: FormLevel
    skillTier: SkillTier
    heldItemId?: string
  }>
}
```

### BossBattle

```
HostCityBoss {
  mapIndex: number                  // 0–7
  era: 'modern' | 'classic'
  hostCityName: string
  managerName: string
  primaryStyle: PlayingStyle
  stampReward: CityStamp
  team: PlayerInstance[]
}

KnockoutBoss {
  gateIndex: number                 // 0–4
  gateName: string                  // R16, QF, SF, Final, Trophy Lift
  managerName: string
  team: PlayerInstance[]
}

CityStamp {
  id: string
  displayName: string
  albumPage: string
}
```

### MapNode

```
MapNodeType =
  | 'start' | 'battle' | 'catch' | 'item' | 'question' | 'boss'
  | 'pokecenter' | 'trainer' | 'legendary' | 'move_tutor' | 'trade' | 'silver'

MapNode {
  id: string
  type: MapNodeType
  layer: number
  col: number
  visited: boolean
  trainerSpriteKey?: string
}

MapState {
  mapIndex: number
  hostCityName: string
  nodes: Record<string, MapNode>
  edges: Array<{ from: string; to: string }>
  layers: MapNode[][]
}
```

### RunState

```
RunState {
  currentMapIndex: number
  currentNode: MapNode | null
  squad: PlayerInstance[]
  items: InventoryItem[]
  cityStamps: number                // badges, 0–8
  map: MapState | null
  knockoutIndex: number             // eliteIndex
  managerGender: 'boy' | 'girl'
  marqueeProfileId: PlayerProfileId | null
  maxSquadSize: number              // 1→6
  injuryListMode: boolean           // nuzlockeMode
  era: 'modern' | 'classic'         // gen2Mode inverted naming
  rivalBeatenCount: number          // silverBeaten
  runSeed: number
  rngSeed: number
  runGeneration: number
  mode: 'campaign' | 'continental_cup'
  flags: {
    usedMedicalTent: boolean
    pickedUpItem: boolean
  }
}
```

### BattleState

```
BattleState {
  playerTeam: PlayerInstance[]
  enemyTeam: PlayerInstance[]
  enemyName: string | null
  isBoss: boolean
  traitsConfig: TraitsConfig | null
  detailedLog: BattleEvent[]
  result: 'pending' | 'victory' | 'defeat'
  replayIndex: number
  playerParticipants: Set<number>
}

BattleEvent = union of:
  | { type: 'send_out'; side; idx; name }
  | { type: 'attack'; side; attackerIdx; moveName; moveType; damage; typeEff; crit; … }
  | { type: 'faint'; side; idx; name }
  | { type: 'stat_change'; stat; change; newStage; … }
  | { type: 'result'; playerWon: boolean }
  | … (matches existing detailedLog schema — do not change event shapes)
```

### InventoryItem

```
InventoryItem {
  id: string                        // keep legacy ids: life_orb, leftovers, …
  name: string                      // display: "Power Boots", etc.
  icon: string
  category: 'held' | 'consumable' | 'upgrade'
  description: string
}
```

### Achievement

```
Achievement {
  id: string
  title: string
  description: string
  icon: string
  condition: AchievementCondition  // evaluated in engine
  hidden?: boolean
}
```

### SaveGame

```
SaveGameV1 {                        // Current Pokelike
  schemaVersion: 1
  keys: Record<string, string>     // raw localStorage blob
}

SaveGameV2 {                        // Football game
  schemaVersion: 2
  meta: {
    managerGender, settings, achievements,
    album, goldAlbum, trophyRoom, hofIndex,
    legacyTraining, usedStarters, eliteWins
  }
  activeRun: RunState | null
  endlessRun: EndlessState | null
  timestamps: Record<string, number>
}

CloudSavePayload {                  // Extends current schema
  v: 2 | 3
  lastSaved: number
  meta: Record<string, number>
  …SYNC_KEYS
}
```

---

## 10. Save System Strategy

### Current Structure

| Layer | Mechanism | Keys |
|-------|-----------|------|
| **Active run** | `saveRun()` → `poke_current_run` | Full `state` minus `currentNode` (stored as `currentNodeId`) + `rngSeed` |
| **Endless run** | `poke_endless_state` | `endlessState` + embedded run |
| **Meta progress** | Individual `poke_*` keys | dex, shiny dex, HoF, achievements, stat buffs, settings, trainer |
| **Cloud** | `save.pokelike.xyz`, schema v2 | 12 `SYNC_KEYS` with timestamp merge |
| **Migrations** | Lazy on read | dex `{caught,name,…}` → `{id:0\|1}`; HoF slimming; cache bust |

### Migration Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking `speciesId` keying | Critical | Keep `playerProfileId` = `speciesId`; never renumber during v2 |
| Cloud merge conflicts during migration | High | Bump `SAVE_SCHEMA_VERSION` to 3; server accepts both v2 and v3 during transition |
| Lost active run on schema change | High | Active run stays same shape; only display fields change |
| RNG desync after load | Medium | Continue persisting `rngSeed` in run save |
| Undo buffer (`poke_previous_run`) | Low | Preserve reset backup mechanism |

### Versioning Strategy

```
Save Version 1 (Current Pokelike)
├── Keys: poke_* prefix
├── Entity FK: speciesId (National Dex)
├── Collection: poke_dex { "25": 0|1 }
└── Cloud schema: v2

        ↓  Migration on first boot of football build

Save Version 2 (Football Game)
├── Keys: wc_* preferred, poke_* read fallback (alias layer)
├── Entity FK: playerProfileId (= speciesId, same integers)
├── Collection: wc_album { "25": 0|1 } merged with poke_dex
├── Display: football names/portraits from catalog overlay
├── Engine keys unchanged: types[], moveTier, statBuffs, evoLineRoot
└── Cloud schema: v3 (optional wc_* keys, backward compatible merge)
```

### Migration Handling

**On first launch of football build:**

1. **Read alias layer:** If `wc_album` missing, copy `poke_dex` → `wc_album`. Same for `wc_gold_album` ← `poke_shiny_dex`.
2. **Do NOT rewrite run saves:** `poke_current_run` squad instances keep `speciesId`; UI resolves display via catalog.
3. **Cloud pull:** Merge v2 cloud saves into local; write v3 on next push with both key sets during 90-day dual-key period.
4. **Catalog overlay:** `getPlayerProfile(id)` returns football name/portrait; stats from same ID in bundled JSON.
5. **Achievement strings:** IDs unchanged; titles/descriptions swapped in data file only.
6. **Stamp counter:** `state.badges` field name kept internally; UI shows "City Stamps".

**Rollback safety:** Keep v1 read path for 2 releases; never delete `poke_*` keys on migration, only mirror.

---

## 11. Technical Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **DOM tightly coupled with logic** | High | Certain | Extract core first; UI is explicitly Replace, not Refactor |
| **Global variables** | High | Certain | ES modules + explicit exports; ban implicit globals in CI |
| **Pokémon-specific assumptions (`speciesId` special cases)** | High | Certain | Gate special cases behind `AbilityRegistry` keyed by profile ID; football equivalents for 63/129/132/133 |
| **Evolution branching UI in `ui.js`** | Medium | Certain | Port Eevee-equivalent (Luca Versatile) to React `UpgradeOverlay` before removing vanilla |
| **Type chart key mismatch** | Medium | Low | Keep internal keys as Pokémon type names until engine abstraction layer; label map for UI only |
| **UI side effects in node handlers** | High | Certain | Node handlers emit events; React subscribes — no direct `showScreen` in core |
| **Save compatibility** | Critical | Medium | Dual-key period, migration tests, never renumber IDs |
| **`runGeneration` async races** | High | Medium | Preserve pattern in React effects with abort tokens |
| **Canvas battle animations** | Medium | High | Port incrementally; allow CSS fallback for MVP React battle screen |
| **PokeAPI runtime dependency** | Medium | Medium | Ship bundled `player_profiles.json`; disable network fetch for core loop |
| **Cloud save server coupling** | Low | Low | Abstract behind `SaveProvider` interface; Supabase later |
| **Missing assets in workspace** | Medium | Certain | Restore `data/pokedex.json` and `sprites/` before any migration phase |
| **No automated tests** | High | Certain | Battle engine golden tests as first CI gate before any extraction PR |
| **3k-line CSS regression** | Medium | High | Visual snapshot tests on key screens; Tailwind migration screen-by-screen |
| **AdSense/analytics breakage** | Low | Medium | Move to Next.js `Script` components in layout |

---

## 12. Implementation Roadmap

### Phase 1 — Architecture Freeze

| | |
|--|--|
| **Goals** | Approve this spec; lock domain types; lock save v2 strategy; no production refactors |
| **Deliverables** | Approved SPEC 004; typed domain model doc; save migration spec; content file layout (Spec 003 §12); risk register |
| **Success criteria** | All stakeholders sign off; zero open decisions on ID stability, state library, or migration approach |

### Phase 2 — Game Core Extraction

| | |
|--|--|
| **Goals** | Pull battle, map generator, RNG, traits into framework-independent TS modules inside a Vite library package |
| **Deliverables** | `game-core/` package; golden tests for `runBattle` (≥20 scenarios); `generateMap` determinism tests; ES module build |
| **Success criteria** | Tests pass against ported engine; vanilla game can import bundled core OR core tested in isolation; no gameplay change |

### Phase 3 — TypeScript Conversion

| | |
|--|--|
| **Goals** | Convert remaining JS to TS; split `data.js` into typed catalogs; introduce `PlayerProfile` loaders |
| **Deliverables** | Typed `data/` JSON catalogs; persistence layer with migration fns; strict TS config |
| **Success criteria** | Zero `any` in game-core; all localStorage keys documented; lazy migrations covered by tests |

### Phase 4 — Next.js Shell

| | |
|--|--|
| **Goals** | Bootstrap Next.js app; static export; title screen + routing skeleton; Zustand stores wired |
| **Deliverables** | `app/layout.tsx`, `app/page.tsx`; `runStore`, `metaStore`; Tailwind config with design tokens from CSS vars |
| **Success criteria** | App boots; settings persist; can start a run stub that calls game-core (even if UI is placeholder) |

### Phase 5 — React UI Migration

| | |
|--|--|
| **Goals** | Replace vanilla screens one-by-one; battle replay working in React |
| **Deliverables** | MapScreen, BattleScreen, ScoutScreen, modals; `<BattleCanvas>` with log replay; feature flag to toggle vanilla vs React per screen |
| **Success criteria** | Full Normal mode playable entirely in React; `runGeneration` guard works; mobile HUD responsive |

### Phase 6 — Football Data Migration

| | |
|--|--|
| **Goals** | Ship football content per Spec 003; reskin without engine changes |
| **Deliverables** | `player_profiles.json` (649); host city bosses; style labels; album art; remove PokeAPI runtime dependency |
| **Success criteria** | No Pokémon names/sprites in UI; saves migrate v1→v2; album + trophies function; Injury List + CCC modes work |

### Phase 7 — Balance and Polish

| | |
|--|--|
| **Goals** | Balance pass, performance, cloud save v3, optional Supabase |
| **Deliverables** | Balance spreadsheet; lighthouse mobile score; Supabase auth prototype; leaderboard read API |
| **Success criteria** | 60fps battle replay on mid-tier mobile; cloud sync parity with current; no P0 save bugs in 2-week soak |

### Optional Phase 0 (Parallel Fast Win)

Vanilla reskin per Spec 002/003 (strings + catalog overlay) can ship **before** Phase 2 to validate football theme with zero architecture risk. This does not replace the hybrid migration — it de-risks content while core extraction proceeds.

---

## 13. Definition of Done

Implementation work **must not begin** until all of the following are true:

### Approvals

- [ ] **Architecture approved** — Option C (Hybrid Migration) signed off by tech lead
- [ ] **Data model approved** — TypeScript domain types (§9) reviewed; `playerProfileId` = `speciesId` confirmed
- [ ] **Migration strategy approved** — Save v1→v2 dual-key plan (§10) accepted; cloud schema v3 timeline agreed

### Documentation

- [ ] **Risks documented** — §11 risk register reviewed; owners assigned for save migration and battle regression
- [ ] **Content pipeline defined** — Spec 003 file layout + art pipeline for 649 profiles and boss portraits
- [ ] **localStorage key registry** — Complete mapping of `poke_*` → `wc_*` aliases

### Unresolved Design Decisions (must be closed)

| Decision | Required resolution |
|----------|---------------------|
| National team identity | Mixed international squad (current engine) vs. single-nation manager — affects UI only |
| Real vs fictional players | Fictional default (Spec 003) — confirmed for v1 |
| Phase 0 vanilla reskin | Yes/no and timing relative to Phase 2 |
| Cloud backend | Keep `save.pokelike.xyz` through Phase 5 vs. Supabase cutover date |
| Battle animation MVP | Full canvas port vs. simplified CSS animations for React MVP |
| Domain/branding | Working title and production URL |

### Engineering Gates

- [ ] Missing assets restored (`data/pokedex.json`, `sprites/`) for local dev parity
- [ ] CI pipeline defined (lint, typecheck, battle golden tests)
- [ ] Feature flag strategy for incremental React screen rollout

### Explicit "Do Not Change" List

The following systems must be **ported, not reimplemented**:

1. `runBattle()` damage formula and turn order logic
2. `TYPE_CHART` effectiveness matrix (values, not labels)
3. `generateMap()` DAG structure and node weights
4. `buildTraitsConfig()` hook execution order
5. `rng()` mulberry32 + `runGeneration` stale-async guard
6. `{ profileId: 0|1 }` album/dex storage shape
7. Evo-line-root keyed legacy training (`poke_stat_buffs`)
8. Cloud save merge algorithms (primitive newest-wins, collection union-max)
9. Node handler semantics (scout = pick 1 of 3, trade = swap +3 levels, etc.)
10. Level gain rules (+2 Normal, +1 Injury List, wild +1)

---

## Appendix A — What Should NOT Be Changed (Summary)

| System | Rationale |
|--------|-----------|
| Battle engine math | Tuned over many releases; golden-test locked |
| Map DAG topology | Roguelike feel depends on layer sizes and edge wiring |
| Trait tier thresholds (2/4/6) | CCC balance foundation |
| Save key shapes | Existing player base + cloud merge depend on them |
| Profile ID integers 1–649 | Evolution chains, BST pools, album slots all keyed |
| Item effect IDs (`life_orb`, etc.) | Engine checks by string id throughout `battle.js` |
| Sequential 1v1 auto-battle format | Core game identity per Spec 002 highlight duel framing |

---

## Appendix B — File Reuse Score Summary

| File | Reuse Score | Action |
|------|-------------|--------|
| `battle.js` | 88 | Refactor → game-core |
| `cloud-save.js` | 82 | Refactor → lib/cloud |
| `endless.js` | 74 | Split (engine keep, data reskin) |
| `map.js` | 72 | Split (generator keep, render replace) |
| `data.js` | 58 | Split |
| `game.js` | 55 | Split |
| `style.css` | 25 | Replace (Tailwind) |
| `ui.js` | 28 | Replace (React) |
| `index.html` | 15 | Replace (Next.js) |

---

*End of SPEC 004 — Target Tech Stack & Migration Strategy.*
