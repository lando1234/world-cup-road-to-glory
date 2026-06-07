# SPEC 006 — Technical Blueprint

> **⚠️ SUPERSEDED** — Use [006B-technical-blueprint-revised.md](./006B-technical-blueprint-revised.md) for implementation.  
> This document is retained for history. Review: [006A-blueprint-review-and-corrections.md](./006A-blueprint-review-and-corrections.md).

**Project:** Pokelike → World Cup Football Roguelike  
**Version referenced:** v1.6 engine, MVP v0.1 Alpha (per Spec 005)  
**Analysis date:** 2026-06-05  
**Scope:** Definitive implementation blueprint — no code, no tasks.  
**Inputs:** Specs 001–005; source files `index.html`, `style.css`, `game.js`, `battle.js`, `map.js`, `data.js`, `ui.js`, `endless.js`, `cloud-save.js`.

---

## Purpose

This document is the **single technical authority** for MVP implementation. It translates product intent (Spec 005) and content architecture (Spec 003) into concrete decisions about what to keep, refactor, or replace in the existing Pokelike codebase — grounded in evidence from the actual source files.

**MVP constraint (non-negotiable):** Ship on the existing vanilla JS engine. Spec 004's Next.js/React migration is **post-MVP**. This blueprint optimizes for a reskin-and-content pass that preserves gameplay, save shapes, and battle math.

---

## 1. System-by-System Migration Matrix

| System | Current Source | Keep | Refactor | Replace | Notes |
|--------|----------------|------|----------|---------|-------|
| **Battle Engine** | `battle.js` (~511 lines) | **Yes** — `runBattle`, `calcDamage`, `getEffectiveStat`, `applyLevelGain`, stage multipliers, trait hooks, overtime at round 100 | Inject display-name resolver for move labels; gate `speciesId` special cases behind profile registry | No | Highest reuse score (88/100 per Spec 004). Special cases at IDs 63, 129, 132 hardcoded in `getBestMove` and `runBattle`. Trait hook order must not change. |
| **Map Generation** | `map.js` `generateMap` (~796 lines total) | **Yes** — DAG topology, `CONTENT_SIZES [3,4,3,4,3,2]`, `NODE_WEIGHTS`, edge wiring, forced pokecenter on last content layer | Add `MVP_NODE_WEIGHTS` override (trade=0, map 0 scout bias); rename tooltip strings via theme config | **Partial** — `renderMap` DOM half stays for MVP but gets football labels/sprites | Generator is theme-agnostic. Trainer sprite assignment uses `TRAINER_SPRITE_KEYS` — swap to manager portrait keys. |
| **Save System** | `game.js` `saveRun`/`loadRun`; `data.js` persistence helpers; `cloud-save.js` | **Yes** — run serialization shape, lazy dex migrations, `rngSeed` persistence, `runGeneration` guard | Add read alias layer (`wc_*` ← `poke_*`); catalog overlay for display fields on load | Cloud save **disabled in MVP** (Spec 005) — code stays, UI hidden | Active run key `poke_current_run` unchanged. Dex shape `{ "<id>": 0\|1 }` preserved per `getPokedex()` at `data.js:1747`. |
| **Endless Mode** | `endless.js` (~781 lines) | Engine only — `buildTraitsConfig`, tier thresholds 2/4/6, hook interface | N/A for MVP | **MVP: feature-flag off** — menu entry hidden, `endlessState.active` never set | Spec 005 explicitly excludes Continental Champions Cup from MVP. Do not delete; gate with single flag. |
| **Collection System** | `data.js` `getPokedex`, `markPokedexSeen/Caught`; `ui.js` dex modal | **Yes** — storage shape, seen/caught semantics, `_isDexCaught` logic | Reskin modal to album pages; filter display to MVP 50-ID roster | Album page layout (5 pages per Spec 005 §12) | Keys remain `poke_dex` for MVP; optional `wc_album` mirror deferred. Shiny dex excluded from MVP. |
| **Achievements** | `data.js` `ACHIEVEMENTS` array; unlock checks in `game.js` | Condition logic (starter ID checks, badge count, win flags) | Replace 6 MVP achievement copy entries; map gym achievements to City Stamp IDs | Remove or hide non-MVP achievements from UI | Current array has 20+ entries referencing Brock, Elite Four, etc. IDs like `gym_0` can stay; only strings/icons change. |
| **UI** | `ui.js` (~4,521 lines), `index.html`, `style.css` | Screen manager pattern (`showScreen`); battle log replay event schema; card layout IA | Introduce `GAME_THEME` string map; rename stat labels in `renderPokemonCard` | Full React migration post-MVP | Largest surface area. MVP = terminology pass + portrait URLs + CSS type badge colors. Do not split `ui.js` pre-MVP. |
| **Content Data** | `data.js` monolith + `data/pokedex.json` (missing locally) | `TYPE_CHART` matrix values; `EVOLUTIONS` graph structure; BST bucket logic; item effect `id` strings | Split read path: `getPlayerProfile(id)` overlays football names/portraits on bundled stats | PokeAPI runtime fetch for MVP roster | MVP ships `data/football/player_profiles_mvp.json` (50 entries) merged at boot. Boss teams in `host_city_bosses.json` + `knockout_bosses.json`. |
| **Progression** | `game.js` level curves; `battle.js` `applyLevelGain`; `state.badges` | +2 trainer/boss, +1 friendly rules; badge≥8 unlocks elite chain; `maxTeamSize` 1→6 curve | Rename badges→stamps in HUD only | No | `state.badges` field name kept internally. Map index 0–7 drives boss lookup in `GYM_LEADERS[state.currentMap]`. |
| **Evolutions** | `data.js` `EVOLUTIONS`, `BRANCHING_EVOLUTIONS`; `ui.js` `checkAndEvolveTeam` | Linear chains for MVP roster IDs; `resolveEvoForLevel`; auto-upgrade at threshold | Update `EVOLUTIONS` display names only for MVP IDs; **disable** branching overlay trigger for ID 133 | Branching UI for Luca Versatile / Eevee equivalent | MVP: linear only (Spec 005 §10). Branching code stays dormant — do not remove `BRANCHING_EVOLUTIONS` or overlay HTML. |
| **Items** | `data.js` `ITEM_POOL`, `USABLE_ITEM_POOL`, `TYPE_ITEM_MAP` | All `id` keys (`life_orb`, `charcoal`, etc.); effect checks in `battle.js` | Rename top 10 items display strings; map type boost items to style kit names | Moon Stone / breakthrough injection hidden from MVP pools | Engine checks items by string `id` throughout `battle.js:60–74`. Never rename IDs. |

---

## 2. Content Migration Matrix

Complete mapping from Pokémon concepts to football equivalents. **Recommended option** from Spec 002 unless MVP explicitly cuts the feature.

| Pokémon concept | Football equivalent | MVP status |
|-----------------|---------------------|------------|
| Pokémon (creature instance) | **Player** | ✅ |
| Trainer (boy/girl avatar) | **Manager** | ✅ |
| speciesId / National Dex ID | **playerProfileId** (same integer) | ✅ |
| Pokémon types (18) | **Playing styles** (18, 1:1 map) | ✅ all functional; 6 taught in UI |
| HP | **Stamina** | ✅ label only |
| Attack (ATK) | **Power** | ✅ label only |
| Defense (DEF) | **Defense** | ✅ label only |
| Special Attack (SP.A / `special`) | **Technique** | ✅ label only; engine key stays `special` |
| Special Defense (SP.D / `spdef`) | **Vision** | ✅ label only; engine key stays `spdef` |
| Speed (SPE) | **Pace** | ✅ label only |
| Moves | **Signature skills** (display); action verbs in battle log | ✅ reskin move names in `MOVE_POOL` optional; tier system unchanged |
| moveTier 0–2 | **Skill tier I–III** | ✅ |
| Level | **Form level** / match experience | ✅ |
| Normal mode | **World Cup campaign** | ✅ |
| Nuzlocke mode | **Injury List mode** | ❌ MVP excluded |
| Gen 2 toggle | **Classic Era** toggle | ❌ MVP excluded (Modern Era only) |
| Battle Tower | **Continental Champions Cup** | ❌ MVP excluded |
| Gym map / arena | **Host City leg** | ✅ |
| MAP_NAMES | Host city names (São Paulo, Berlin, …) | ✅ replace `MAP_NAMES` array |
| Battle node | **Friendly match** | ✅ |
| Catch node | **Scouting report** | ✅ |
| Item node | **Gear crate** | ✅ |
| Boss node | **Host City Boss** | ✅ |
| Gym leader | **Host City Boss** (fictional federation coach) | ✅ |
| Badge | **City Stamp** | ✅ |
| Pokécenter node | **Medical tent** | ✅ |
| Trainer node | **Rival national team** | ✅ |
| Legendary node | **World Cup Legend** | ✅ (2 legends in MVP pool) |
| Move Tutor node | **Specialist coach** | ✅ |
| Trade node | **Transfer swap** | ❌ disabled (weight 0) |
| Silver node | **Grudge derby** (rival manager) | ❌ MVP excluded |
| Question mark node | **Mystery event** | ✅ |
| Start node | **Arrival in host city** | ✅ |
| Elite Four | **Knockout Stage** (5 gates) | ✅ |
| Elite prep screen | **Matchday squad selection** | ✅ |
| Champion / Gary | **Trophy lift** — Coach Sterling + historical gate boss | ✅ |
| Hall of Fame | **Trophy Room** | ✅ |
| Starter selection | **Marquee signing** | ✅ (IDs 4, 1, 7 → Diego, Pedro, Jonas) |
| Evolution | **Player upgrade** | ✅ linear only |
| Moon Stone | **Breakthrough injection** | ❌ MVP excluded from pools |
| TM item | **Skill manual** | ✅ optional node |
| Shiny Pokémon | **Gold card player** | ❌ MVP excluded |
| Shiny Charm | **Scout network upgrade** | ❌ MVP excluded |
| Shiny dex | **Gold sticker album** | ❌ MVP excluded |
| Pokédex | **World Cup Album** | ✅ partial (50 slots) |
| BST bucket | **Rarity tier** (Common → Legendary) | ✅ flavor only; same pools |
| Held items | **Player equipment** | ✅ rename display |
| Consumables (Potion, Revive) | **Medical / boost items** | ✅ rename ~10 |
| Type effectiveness | **Style matchup table** | ✅ same math |
| Battle Tower traits | **Team tactical traits** | ❌ MVP hidden |
| statBuffs (per evo line) | **Legacy training program** | ❌ MVP excluded |
| Team (max 6) | **Squad** | ✅ |
| Wild Pokémon | **Scouted player** | ✅ |
| PokeAPI sprites | **Local player portraits** (`/assets/players/{id}.png`) | ✅ replace URLs |
| Showdown trainer CDN | **Manager/boss portraits** (local) | ✅ |
| Cloud save | **Manager profile cloud** | ❌ MVP UI hidden |
| Achievements | **Manager milestones** | ✅ 6 only |
| Gen ranges (1–151, etc.) | **Album volumes** (Vol. 1 Modern, Vol. 2 Classic) | ✅ Vol. 1 partial in MVP |
| Escape Rope | **Forfeit friendly** (skip loss) | ⚠️ keep engine; hide or rename low priority |
| Ditto (ID 132) Transform | **Tactical chameleon** profile behavior | ⚠️ keep special case if ID 132 in roster; else omit from MVP pool |
| Magikarp (ID 129) Splash | **Reserve benchwarmer** no-damage skill | ⚠️ omit ID 129 from MVP pool unless authored as joke entry |
| Abra (ID 63) Teleport | **Substitution trick** no-damage skill | ⚠️ same as above |
| Eevee (ID 133) branching | **Luca Versatile** development paths | ❌ MVP deferred |
| megaStone field | *(unused)* | Ignore — routes to item node, not mega evolution |
| Analytics / AdSense | Strip for alpha | ✅ per Spec 005 |

---

## 3. Data.js Transformation Plan

`data.js` (~2,003 lines) is the primary migration surface. MVP strategy: **overlay, don't rewrite**.

### 3.1 `TYPE_CHART`

| Action | **Keep matrix values; modify labels only** |
|--------|---------------------------------------------|
| How | Internal keys remain Pokémon type names (`Fire`, `Water`, …) in all engine code. Add parallel `STYLE_LABELS` map: `Fire → "High Press"`, etc. (Spec 003 Appendix B). UI reads labels; `getTypeEffectiveness` unchanged. |
| Risk if wrong | Renaming keys breaks `MOVE_POOL`, `TYPE_ITEM_MAP`, trait hooks, CSS classes. **Do not rename TYPE_CHART keys in MVP.** |

### 3.2 `species` / player profiles

| Action | **Replace display layer; keep ID-indexed stats** |
|--------|--------------------------------------------------|
| How | Ship `data/football/player_profiles_mvp.json` with 50 entries keyed by `playerProfileId`. At boot, `getPlayerProfile(id)` returns overlay `{ displayName, nation, position, portrait, flavorText, rarity }` merged onto existing stats from bundled pokedex or hardcoded boss entries. `createInstance` (`data.js:1120`) continues to set `speciesId`, `name`, `types`, `baseStats`, `spriteUrl`. |
| PokeAPI | Disable `fetchPokemonById` for IDs in MVP bundle; fallback to PokeAPI only for dev parity on non-MVP IDs. |
| MVP pool | Restrict `GEN1_BST_APPROX` pools, scout choices, and album to IDs 1–50 (plus boss/knockout reference IDs as needed). |

### 3.3 `EVOLUTIONS` / `BRANCHING_EVOLUTIONS`

| Action | **Modify names for MVP IDs; keep graph structure** |
|--------|-----------------------------------------------------|
| How | For each MVP evolution edge (e.g., `4→5→6`), update `name` field to football display names. Thresholds unchanged (`level: 16`, `level: 36`). Do not alter `into` target IDs. |
| Branching | **Keep table; suppress UI.** `checkAndEvolveTeam` in `ui.js` checks `BRANCHING_EVOLUTIONS[pokemon.speciesId]` — ensure ID 133 not in MVP scout pools so overlay never triggers. |
| Moon Stone | Remove from `USABLE_ITEM_POOL` roll tables for MVP; keep item definition for post-MVP. |

### 3.4 `items`

| Action | **Modify display; keep IDs and effect logic** |
|--------|-----------------------------------------------|
| How | Rename 10 MVP items in `ITEM_POOL` + `USABLE_ITEM_POOL` (e.g., `charcoal` → display "Pressing Kit", `life_orb` → "Power Boots"). `TYPE_ITEM_MAP` keys stay as type names; descriptions reference styles. |
| Held effects | Zero changes to `battle.js` item checks (`hasItem(items, 'life_orb')`, etc.). |

### 3.5 `trainers` / bosses

| Action | **Replace content for MVP scope** |
|--------|-----------------------------------|
| How | **`GYM_LEADERS`** (8 entries, `data.js:202`): Replace `name`, `badge`, `type` label, team `name` fields. Keep `speciesId`, `level`, `baseStats`, `heldItem.id` identical for balance. Map to Spec 003 Host City Boss table (Coach Rocha → Coach Fischer → …). |
| **`ELITE_4`** (5 battles, `data.js:272`): Replace with **Historical knockout teams** per Spec 005 §9. Same team array structure; enemy `name` fields become fictional player names; add metadata fields `historicalTeam`, `eraYear` for prep screen (new display-only fields on boss config object — not persisted in save). |
| **`JOHTO_GYM_LEADERS`**, **`SILVER_ENCOUNTERS`**, **`GEN2_ELITE_4`** | Untouched for MVP (Classic Era excluded). |
| **`ENDLESS_ARCHETYPES`**, **`FIXED_STAGE_REGIONS`** | Untouched; mode disabled. |

### 3.6 `moves` / `MOVE_POOL`

| Action | **Modify flavor text; optionally rename for MVP** |
|--------|---------------------------------------------------|
| How | Each type has `physical`/`special` arrays with `[tier0, tier1, tier2]`. MVP minimum: reskin battle log by replacing move `name` at display time via `STYLE_ACTION_VERBS` table keyed by type — **no pool edit required**. Optional pass: rename tier-2 moves to football terms (e.g., Fire tier-2 physical → "Match-Winning Rocket"). |
| `getBestMove` | **Keep logic intact.** Special cases for IDs 74/75/76/95 (Rock default), 170/171 (Electric), 129/63 (no-damage) remain unless those IDs excluded from MVP pool. |

### 3.7 `type chart` (effectiveness)

| Action | **Keep** |
|--------|----------|
| How | 18×18 matrix at `data.js:3–22` unchanged. UI shows "Super effective!" / "Not very effective..." with style names in tooltips. |

### 3.8 Other `data.js` sections

| Section | Action |
|---------|--------|
| `ACHIEVEMENTS` | Replace 6 MVP entries; hide rest |
| `MAP_NAMES` | Replace with 8 host city names |
| `LEGENDARY_IDS` | Filter to MVP legend IDs (48–49 or chosen pair) for legendary node rolls |
| `STARTER_IDS` | Keep `[1, 4, 7]` — football marquee triangle |
| `GEN1_BST_APPROX` | Filter pools to MVP ID subset |
| `fetchPokemonById` / cache | Bypass for bundled MVP IDs |
| Persistence helpers | Keep; add optional `getAlbum()` alias reading `poke_dex` |

---

## 4. Battle Engine Blueprint

### 4.1 Player → stat mapping

Football players are **`createInstance` objects** with unchanged internal schema. Display renaming only:

| Engine field | Football label | Combat role |
|--------------|------------------|-------------|
| `baseStats.hp` | Stamina | Pool size; 0 = knocked out / injured off |
| `baseStats.atk` | Power | Physical duel strength; used when `special < atk` |
| `baseStats.def` | Defense | Physical resilience |
| `baseStats.special` | Technique | Technical duel strength; used when `special >= atk` |
| `baseStats.spdef` | Vision | Tactical reading / defensive awareness vs technique |
| `baseStats.speed` | Pace | Turn order (`battle.js:211–212`) |
| `currentHp` / `maxHp` | Current / max stamina | `calcHp(baseStats.hp, level)` formula unchanged |
| `level` | Form level | Scales all stats via `getEffectiveStat` |
| `types[]` | Playing styles[] | STAB, effectiveness, move pool selection |
| `moveTier` | Skill tier | Selects tier 0/1/2 from `MOVE_POOL` |
| `heldItem` | Equipment | All `calcDamage` / `getEffectiveStat` modifiers |
| `statBuffs` | Legacy training | +10% per point per stat per evo line (inactive in MVP) |
| `isShiny` | Gold card | Inactive in MVP |

**Physical vs technical split** (`battle.js:41`): Unchanged — if `special >= atk`, player uses technical skills (special moves); otherwise power skills (physical moves). Football framing: *technique-led playmakers* vs *power-led finishers*.

### 4.2 What remains identical

- Damage formula (`calcDamage`, lines 39–86)
- STAB 1.5×, crit 6.25% (20% with scope lens), variance 85–100%
- Type effectiveness multipliers from `TYPE_CHART`
- Turn order: speed → Quick Claw → Lagging Tail overrides
- Sequential 1v1: first alive on each side (`battle.js:185–191`)
- Overtime at round 100 (3× damage)
- Item effects keyed by `id`
- Trait hook call order: `onStartFight` → `onBeforeAttack` → `beforeDamage` → `whenAttacked` → `afterAttack` → `onKO`
- `detailedLog` event schema (required for `animateBattleVisually` in `ui.js`)
- Level gain: +2 win (Normal), +1 wild, Lucky Egg 50% bonus

### 4.3 What gets renamed (presentation only)

- Battle log: `"X used Flamethrower"` → `"X used [skill name]"` or football verb
- Stat labels on cards: ATK→PWR, SP.A→TEC, SP.D→VIS, SPE→PAC
- Type badges: CSS class `type-fire` kept; label "High Press"
- Effectiveness text: optional style names in tooltips
- `"Pokemon"` → `"Player"` in send-out / faint messages

### 4.4 What data changes

- `name` / portrait on instances (from catalog overlay)
- Boss team display names and manager portraits
- Move display names (optional)
- Item display names
- **No changes** to numeric stats, type arrays, item IDs, or damage math for MVP

### 4.5 Pokémon-specific assumptions (must address)

| Assumption | Location | MVP handling |
|------------|----------|--------------|
| `speciesId` as universal FK | Everywhere | Keep; alias as `playerProfileId` in docs/catalog only |
| ID 132 Transform copies enemy stats/types | `battle.js:194–204` | Exclude ID 132 from MVP pool OR author "Chameleon" profile at ID 132 with same behavior |
| ID 129 / 63 no-damage moves | `getBestMove:160–161` | Exclude from MVP pools |
| Geodude line forces Rock attacks | `getBestMove:177` | Keep if boss teams use IDs 74, 95 |
| Metronome item uses secondary type | `getBestMove:192–196` | Keep; rename item to "Dual-Style Manual" |
| Eviolite blocks evolution + DEF boost | `getEffectiveStat:98`, item desc | Keep; rename "Youth Prospect Clause" |
| `canEvolve(speciesId)` checks | Eviolite logic | Unchanged |
| Poison/freeze status | `battle.js` | Reflavor as "knock" / "frozen in duel" in log strings only |
| Struggle fallback | `battle.js:280–286` | Reflavor as "Desperate challenge" |
| PokeAPI sprite URL templates | `createInstance:1128–1130` | Replace with local portrait paths in catalog |
| Trainer Showdown CDN | `getTrainerImgHtml` | Replace with local manager portraits |

---

## 5. Style System Blueprint

### 5.1 Final style list (18)

Internal engine key → display label (Spec 003 Appendix B):

| Engine key | Display style |
|------------|---------------|
| Normal | Balanced |
| Fire | High Press |
| Water | Possession Build-up |
| Grass | Wing Play |
| Electric | Rapid Counter |
| Ice | Ice Press |
| Fighting | Physical Battle |
| Poison | Dark Arts |
| Ground | Aerial Threat |
| Flying | Wide Play |
| Psychic | Tactical Control |
| Bug | High Intensity |
| Rock | Compact Block |
| Ghost | Clinical Finishing |
| Dragon | Power Strike |
| Dark | Street Smarts |
| Steel | Iron Defense |
| Fairy | Set Piece Master |

Dual-style players carry two keys in `types[]` (e.g., `["Fire", "Flying"]` → High Press + Wide Play). Trait counting uses both — irrelevant in MVP campaign (traits hidden).

### 5.2 Style relationships

**No changes to relationships.** The full 18×18 matrix in `TYPE_CHART` (`data.js:3–22`) defines effectiveness. Example: High Press (Fire) deals 2× vs Wing Play (Grass), 0.5× vs Possession Build-up (Water).

MVP UI teaches **Core Six** triangle (Spec 005 §11):

- High Press beats Wing Play beats Compact Block beats High Press
- Possession Build-up ↔ Rapid Counter ↔ High Press (secondary triangle)
- Tactical Control as advanced counter to Physical Battle

### 5.3 Migration strategy

1. **Phase A (zero engine risk):** Add `STYLE_LABELS` and `styleCssClass(type)` helper — maps type key to CSS class (existing `type-fire`) and display string.
2. **Phase B:** Update `renderPokemonCard`, battle log, scout screen, prep screen to call helper.
3. **Phase C:** Replace type icon URLs (`TYPE_IDS` PokeAPI icons) with local style icons (18 SVG/PNG).
4. **Do NOT:** Rename `TYPE_CHART` keys, `MOVE_POOL` keys, or `TRAIT_DESCRIPTIONS` keys until post-MVP engine abstraction (Spec 004 Phase 3).

**CSS:** Keep `.type-fire`, `.type-water`, etc. in `style.css`; update colors if desired for football palette. Tailwind migration is post-MVP.

---

## 6. Player Data Blueprint

### 6.1 Player profile (catalog / static)

Authoritative definition per roster entry. Loaded from JSON; not persisted in save.

```
PlayerProfile {
  playerProfileId: number          // = speciesId, PK, 1–649
  displayName: string              // "Diego Núñez"
  stageName: string | null         // optional nickname e.g. "El Fuego"
  nation: string                   // ISO-like, fictional OK e.g. "ARG"
  position: enum                   // GK | CB | FB | DM | CM | AM | W | ST
  styles: string[1..2]             // display style names; maps to types[] in engine
  primaryStyle: string
  secondaryStyle: string | null
  rarity: enum                     // common | uncommon | rare | elite | superstar | mythic | legendary
  evoLineRoot: number              // first form ID in chain
  baseStats: {
    hp: number                     // stamina base
    atk: number                    // power
    def: number                    // defense
    special: number                // technique
    spdef: number                  // vision
    speed: number                  // pace
  }
  portrait: string                 // URL path
  goldPortrait: string | null      // post-MVP
  flavorText: string
  album: {
    volume: string                 // "vol_mvp_1"
    page: string                   // "marquee_starters"
    slot: number
  }
  flags: {
    isLegendary: boolean
    isMarquee: boolean             // starter-eligible
    isStarter: boolean             // same as isMarquee for MVP
    bossExclusive: boolean         // knockout/historical only
  }
}
```

### 6.2 Player instance (runtime / squad member)

Mirrors `createInstance` return shape exactly. Persisted inside `poke_current_run`.

```
PlayerInstance {
  speciesId: number                // DO NOT RENAME in save
  name: string                     // display name at creation; updated on upgrade
  nickname: string | null
  level: number                    // form level
  currentHp: number
  maxHp: number
  isShiny: boolean                 // gold card; false in MVP
  types: string[]                  // engine type keys, NOT display labels
  baseStats: { hp, atk, def, special, spdef, speed }
  spriteUrl: string
  megaStone: null                   // unused
  heldItem: HeldItem | null
  moveTier: 0 | 1 | 2
  statBuffs: { hp, atk, def, special, spdef, speed }  // 0–10 each; unused in MVP
}
```

### 6.3 Upgrade chains

```
UpgradeEdge {
  fromProfileId: number
  toProfileId: number
  formLevelRequired: number        // EVOLUTIONS[].level
  displayName: string              // post-upgrade name
  branchGroup: string | null       // null for MVP linear chains
}
```

Stored in `EVOLUTIONS` object today. MVP: only edges where both IDs are in MVP roster.

### 6.4 Legendary players

```
LegendProfile extends PlayerProfile {
  legendTag: "WORLD_CUP_LEGEND"
  encounterNode: "legendary"
  albumPage: "legends"
  albumSlot: number
  // Stats typically high BST; IDs from LEGENDARY_IDS subset
}
```

MVP: 2 legends (Spec 005), appearing on map 5+ legendary nodes via `getRandomLegendary` pool filter.

### 6.5 Boss-only players

Players that appear **only** on boss rosters, not in scout pools:

```
BossRosterSlot {
  playerProfileId: number
  displayName: string              // can override catalog name
  formLevel: number
  styles: string[]
  heldItemId: string | null
  skillTier: 0 | 1 | 2
}
```

Used in `GYM_LEADERS[].team` and knockout historical teams. May reference IDs outside MVP scout pool (e.g., boss ace at ID 95). Album: "Host City Heroes" and "Knockout Immortals" pages show these on defeat/sign.

---

## 7. Boss Architecture

Three boss categories for MVP plus standard nodes.

### 7.1 Host City Bosses

| Field | Value |
|-------|-------|
| **Data location** | `GYM_LEADERS[mapIndex]` (Modern Era); 8 entries |
| **Trigger** | `NODE_TYPES.BOSS` → `doBossNode` in `game.js` |
| **Identity** | Fictional federation coach (Coach Rocha, Coach Fischer, …) |
| **Reward** | `state.badges++`; stamp screen with `badge` string → "Granite Stamp", etc. |
| **Team structure** | `{ speciesId, name, types, baseStats, level, heldItem? }[]` passed through `createInstance` |
| **moveTier** | Leader-level `moveTier` applied to whole team |
| **Display metadata** (add to boss config, not in save) | `hostCityName`, `primaryStyleLabel`, `stampId`, `managerPortrait` |

Maps 0–7 → 8 bosses. Johto parallel exists in `JOHTO_GYM_LEADERS` for post-MVP Classic Era.

### 7.2 Historical Team Bosses (Knockout)

| Field | Value |
|-------|-------|
| **Data location** | `ELITE_4[]` — 5 entries repurposed |
| **Trigger** | Elite chain after `state.badges >= 8` |
| **Identity** | National team + era (Uruguay 1950, Brazil 1970, Argentina 1986, France 1998, Argentina 2022) |
| **Gate names** | R16, QF, SF, Final, Trophy lift |
| **Team structure** | Same as gym leaders; escalating team size per gate |
| **Prep screen** | `elite-prep-screen` — show `historicalTeam`, `eraYear`, `primaryStyle` before fight |
| **Fictional players** | All roster `name` fields are original; kit colors via UI theme |

**Critical:** These are **not** Host City Bosses. Separate data authoring pass. Spec 005 deliberately concentrates nostalgia here (5 teams, not 13).

### 7.3 Knockout Bosses (engine)

Same as §7.2 — the Elite Four chain **is** the knockout stage. `state.eliteIndex` tracks progress 0–4. Transition screens between gates use `transition-screen`.

### 7.4 Legend Nodes

| Field | Value |
|-------|-------|
| **Node type** | `NODE_TYPES.LEGENDARY` — weight 0 until map tier allows; appears in layer weights as `legendary: 0` default, overridden on high maps |
| **Handler** | `doLegendaryNode` → guaranteed encounter from `LEGENDARY_IDS` pool |
| **Data** | Legend profiles in catalog; `getRandomLegendary(mapIndex)` filters by BST range |
| **Album** | Legends page (hidden until first seen); foil treatment |
| **MVP count** | 2 legends in pool |

### 7.5 Data representation summary

```
BossConfig {
  bossId: string                   // "host_city_0" | "knockout_r16"
  bossCategory: "host_city" | "historical_knockout" | "legend"
  mapIndex: number | null
  gateIndex: number | null
  managerName: string
  displayTitle: string
  primaryStyle: string             // engine type key
  stampReward: { id, displayName } | null
  historicalTeam: { nation, year, nickname } | null
  moveTier: 0 | 1 | 2
  team: BossRosterSlot[]
}
```

At runtime, `doBossNode` / elite handlers materialize `BossRosterSlot[]` → `PlayerInstance[]` via `createInstance`. No new save fields.

---

## 8. Album Architecture

### 8.1 Mapping to existing Pokédex

| Football | Engine | Implementation |
|----------|--------|----------------|
| World Cup Album | `poke_dex` | Same `{ "<id>": 0 \| 1 }` shape |
| Seen (silhouette) | `dex[id] === 0` | `markPokedexSeen` on scout reveal |
| Signed (collected) | `dex[id] === 1` | `markPokedexCaught` on sign |
| Gold card | `poke_shiny_dex` | **Not used in MVP** |

Lazy migration at `getPokedex()` (`data.js:1752–1758`) collapses legacy object entries — **must remain**.

### 8.2 MVP pages (Spec 005 §12)

| Page ID | Title | Slots | Slot IDs | Notes |
|---------|-------|-------|----------|-------|
| `marquee_starters` | Marquee Signings | 3 | 1, 4, 7 (highest form signed shown) | Always visible |
| `fan_favorites` | Fan Favorites | 20 | MVP scout pool IDs | Silhouette on seen |
| `host_city_heroes` | Host City Heroes | 8 | Boss squad standout IDs | Tied to stamps |
| `legends` | Legends | 2 | MVP legend IDs | **Hidden until first legend seen** |
| `knockout_immortals` | Knockout Immortals | 5 | One signature player per historical gate | **Locked gray until gate reached** |

**Total: 50 slots** (some IDs appear on multiple pages — album indexes by unique ID, pages are views).

### 8.3 Unlock flow

```
Scout report reveals player → markPokedexSeen(id) → silhouette in album
Player signed → markPokedexCaught(id) → full-color sticker
Boss defeated → boss roster IDs marked seen (even if not signed)
Legend node encountered → legends page unlocked; seen/caught as normal
Knockout gate reached → corresponding immortals slot un-grayed
Campaign win → Trophy Room entry; album persists
```

### 8.4 Seen vs collected

- **Seen (`0`):** Appeared in scouting report or battle; silhouette with nation flag outline
- **Collected (`1`):** Signed to squad at least once across all runs; full portrait + style chip
- Engine does not distinguish "seen in battle only" from "seen in scout" — both write `0`. Sufficient for MVP.

### 8.5 Legends

- Separate album page, not separate storage key
- Page hidden in DOM until `legendsPageUnlocked` flag in meta (new key `wc_legends_page_seen` or derive from any MVP legend ID in dex)
- Legendary foil border is CSS treatment on legend page slots

### 8.6 Hidden entries

| Hidden type | Mechanism |
|-------------|-----------|
| Legends page | CSS `display:none` until first legend ID in dex |
| Knockout immortals | Slots rendered gray/locked until `state.eliteIndex >= gateIndex` OR permanent unlock on first run to that gate |
| Unknown players | Default: show empty slot with "?" — **not used in MVP** (all 50 slots visible from start except legends page) |

### 8.7 UI implementation notes

- Reuse `openPokedexModal()` in `ui.js` (~line 3474) — replace grid layout with page tabs
- Detail modal `openDexDetailModal` fetches flavor from catalog instead of PokeAPI species endpoint for MVP IDs
- Evolution chain display: use `buildEvoChain(speciesId)` with football names from catalog

---

## 9. Asset Strategy

### 9.1 Asset categories

| Category | Description | MVP quantity | Format | Replaces |
|----------|-------------|--------------|--------|----------|
| **Player portraits** | Head/shoulder fictional players | **50** + 2 legend variants | PNG 128×128 | PokeAPI `sprites/pokemon/{id}.png` |
| **Boss/manager portraits** | Host city coaches + knockout manager avatars | **13** (8 host + 5 knockout) | PNG 128×128 | Showdown trainer CDN |
| **Manager avatar (player)** | Boy/girl manager select | **2** | PNG | Red/Dawn Showdown sprites |
| **Nation flags** | Album + card chip | **~15** unique nations in MVP roster | SVG or PNG 24×24 | — |
| **Style icons** | 18 playing style badges | **18** | SVG | PokeAPI type icons via `TYPE_IDS` |
| **City stamps** | Badge reward graphics | **8** | PNG 64×64 | `sprites/badges/` |
| **Map node icons** | Node type visuals | **~10** | PNG 32×32 | `sprites/` map icons (catch, boss, etc.) |
| **Item icons** | Top 10 renamed items | **10** (optional emoji fallback) | PNG 24×24 | PokeAPI item sprites |
| **Backgrounds** | Map screen per host city | **8** (optional; CSS gradient acceptable for MVP) | JPG/WebP | Generic map background |
| **Album UI** | Sticker frame, silhouette, foil | **3** templates | CSS + 1 PNG | Dex modal styling |
| **Historical kit palettes** | Knockout team color accents | **5** | CSS variables | — |
| **Trophy / win screen** | World Cup lifted | **1** | PNG | Champion win art |

### 9.2 Quantity summary

| Tier | Count |
|------|-------|
| Minimum viable (placeholder acceptable) | 50 portraits + 13 managers + 2 player managers + 18 style icons = **83** images |
| Recommended polish | + 8 stamps + 10 node icons + 15 flags = **116** images |
| Full MVP visual target | + 8 backgrounds + album templates = **~125** assets |

### 9.3 Blockers

| Blocker | Severity | Mitigation |
|---------|----------|------------|
| **Missing `data/pokedex.json` and `sprites/` in workspace** | High | Restore from production deploy artifact before implementation; local dev 404s without them |
| **50 portrait art pipeline** | High | Placeholder generated avatars (initials + nation color) acceptable for internal alpha; block public playtest until portraits land |
| **Historical team likeness** | Medium | Use nation flags + era nicknames only; no real player likenesses (Spec 005 legal constraint) |
| **PokeAPI CDN removal** | Medium | `createInstance` must set `spriteUrl` from catalog; add `onerror` fallback to placeholder |
| **Showdown trainer CDN removal** | Medium | `getTrainerImgHtml` must resolve local paths for all MVP bosses |
| **Style icon set** | Low | Can defer to colored pills with text labels for week 1–2 |
| **Cloud save branding** | None for MVP | Cloud UI hidden |

---

## 10. Save Migration Strategy

### 10.1 Current save shape

**Active run** (`poke_current_run` via `saveRun()` in `game.js`):

- Full `state` object: `team[]` with `speciesId`, `level`, `currentHp`, `types`, `baseStats`, `heldItem`, `moveTier`, etc.
- `rngSeed`, `currentMapIndex`, `badges`, `eliteIndex`, `maxTeamSize`, mode flags
- `currentNodeId` (not full node object)

**Meta keys** (persist across runs):

| Key | Shape | Cloud synced |
|-----|-------|--------------|
| `poke_dex` | `{ "25": 0\|1 }` | Yes |
| `poke_shiny_dex` | `{ "25": 1 }` | Yes |
| `poke_hall_of_fame` | Array of slim run summaries | Yes |
| `poke_hof_index` | Unlock derived data | Yes |
| `poke_stat_buffs` | `{ evoLineRoot: { atk: 0..10 } }` | Yes |
| `poke_achievements` | string[] IDs | Yes |
| `poke_used_starters` | number[] | Yes |
| `poke_trainer` | `'boy'\|'girl'` | Yes |
| `poke_settings` | `{ autoSkip, darkMode }` | Yes |

Cloud schema: `SAVE_SCHEMA_VERSION = 2` (`cloud-save.js:2`).

### 10.2 Football save shape (MVP)

**No breaking changes to engine fields.** Migration is **display overlay + optional key aliases**.

```
Football save (MVP) =
  Active run: unchanged (still speciesId, level, types, etc.)
  Meta:
    poke_dex          → read/write (album data)
    poke_hall_of_fame → Trophy Room
    poke_achievements → manager milestones
    poke_used_starters → marquee rotation
    [all other keys unchanged]

  Optional aliases (post-MVP dual-key period):
    wc_album          → mirror of poke_dex
    wc_trophy_room    → mirror of poke_hall_of_fame
```

### 10.3 Migration path

**Scenario A: Existing Pokémon player opens football build**

1. On boot, read `poke_dex` as album. IDs 1–50 show football names via catalog overlay. IDs 51+ still in dex but hidden from MVP album UI (data preserved).
2. Active run: if `poke_current_run` exists with Pokémon names in team, reload instances — catalog overlay replaces `name` and `spriteUrl` on display, not in save blob until next save.
3. Achievements: ID `gym_0` still valid; display string updated.
4. No automatic ID remapping — **never renumber**.

**Scenario B: Fresh football player**

1. Clean `localStorage` or first visit — normal init flow.
2. Album starts empty; fills per run.

**Scenario C: Football player with cloud save (post-MVP re-enable)**

1. Pull v2 cloud payload via `SYNC_KEYS` (`cloud-save.js:37–42`)
2. Union-merge dex/HoF per existing algorithms
3. Future v3: add `wc_*` keys to `SYNC_KEYS`; server accepts both during 90-day transition (Spec 004 §10)

### 10.4 Compatibility guarantees

| Guarantee | Detail |
|-----------|--------|
| Forward compatible | Football build reads all v1 saves |
| Backward compatible | Keep `poke_*` keys for 2 releases minimum; football build writes both if aliases added |
| Run resume | Mid-run saves work — same node, same squad IDs |
| RNG continuity | `rngSeed` preserved — same sequence after load |
| Rollback | Reverting to Pokémon build: dex entries for IDs still valid; football-only display names not stored in dex blob |

### 10.5 Rollback procedure

1. Football build must **never delete** `poke_*` keys on migration
2. If dual keys written (`wc_album`), Pokémon build ignores them
3. If football build wrote catalog-only display names into team instances, Pokémon build shows those strings until player overwrites — **mitigation:** do not rewrite `name` in save on load; overlay at render time only

---

## 11. MVP Implementation Order

High-level sequence with reasoning. **Not a task breakdown.**

### 1. Theme configuration layer

Introduce central `GAME_THEME` object: all user-facing strings (screen titles, node labels, stat names, mode names). Reason: enables terminology pass without hunting 4,500 lines of `ui.js`. Zero gameplay risk.

### 2. Style label system

Add `STYLE_LABELS` map; wire to cards and battle log. Reason: most visible football identity per minute of effort; engine untouched.

### 3. Player catalog (50 profiles)

Author `player_profiles_mvp.json`; implement `getPlayerProfile(id)` overlay in data load path. Reason: **blocks all content** — names, portraits, album, bosses depend on this.

### 4. Portrait and manager assets (minimum set)

Replace sprite URL builders in `createInstance` and `getTrainerImgHtml`. Reason: removes Pokémon CDN dependency; unblocks playtests.

### 5. Boss data migration

Reskin `GYM_LEADERS` → Host City Bosses; replace `ELITE_4` → historical knockout teams. Reason: core fantasy validation (Spec 005 §2 rank #2); depends on catalog.

### 6. Scout pool restriction

Filter `GEN1_BST_APPROX`, `getCatchChoices`, legendary pool to MVP IDs. Reason: prevents unsigned Pokémon appearing in MVP runs.

### 7. UI terminology pass

`index.html` screen titles, `map.js` tooltips, battle messages, HUD labels. Reason: "feels like reskinned Pokémon" is top product risk (Spec 005 §14).

### 8. Album reskin

Page-tabbed album modal; 5 pages / 50 slots; seen/signed states. Reason: collection meta is rank #3 fantasy; dex engine already works.

### 9. Map tuning

Map 0 scripted weights; trade weight 0; optional friendly/scout bias. Reason: first-run pacing (Spec 005 §6–7); config-only.

### 10. Items rename pass

Top 10 items display names and descriptions. Reason: low effort, high immersion in gear crates and prep screen.

### 11. Achievements (6)

Replace strings; hide non-MVP entries. Reason: polish; not blocking core loop.

### 12. Endless mode gate

Hide Battle Tower entry; verify no trait panel in campaign. Reason: scope control per Spec 005.

### 13. Balance and pacing playtest

Tune knockout level bands, map 0–2 difficulty. Reason: 30–45 min target is product success criterion.

### 14. Strip non-MVP surfaces

Cloud save prompt, ads, analytics, Classic Era toggle, Nuzlocke, trade nodes, shiny flows. Reason: reduce confusion in alpha.

**Explicitly deferred post-MVP:** React/Next migration (Spec 004), full 649 catalog, Continental Champions Cup, gold cards, cloud save re-enable, branching evolutions.

---

## 12. Open Questions

Only genuinely unresolved decisions from Specs 002–005 and codebase inspection. **Do not block MVP on items marked optional.**

| # | Question | Impact | Status |
|---|----------|--------|--------|
| 1 | **Where do production assets live?** `data/pokedex.json` and `sprites/` referenced but absent from workspace (Spec 001). | Blocks local dev parity | **Unresolved — must locate deploy artifact** |
| 2 | **Placeholder vs final art gate for public alpha?** | Timeline | **Unresolved — product decision** |
| 3 | **National team identity:** mixed international squad (current engine) vs single-nation manager fantasy? | UI/copy only; no engine change | **Unresolved — Spec 002/003/005 lean mixed squad** |
| 4 | **Position on cards:** show GK/CB/ST or style-only? | UI density | **Unresolved — Spec 003 lists as open** |
| 5 | **Domain and working title** (World Cup Roguelike, Cuplike, etc.) | Deploy/branding | **Unresolved** |
| 6 | **Chameleon (ID 132) in MVP roster?** Transform behavior is complex to explain. | Content | **Unresolved — recommend exclude unless authored with intent** |
| 7 | **Knockout immortals unlock:** per-run gate progress vs permanent unlock? | Album UX | **Unresolved — recommend permanent unlock on first gate reached** |
| 8 | **Cloud save re-enable timing** relative to football launch | Infra | **Deferred post-MVP by Spec 005; cutover date TBD** |
| 9 | **Phase 0 vanilla reskin vs parallel React extraction timing** | Engineering | **Resolved for MVP: vanilla only.** Spec 004 hybrid migration is post-alpha. |
| 10 | **Real vs fictional players** | Legal | **Resolved: fictional for MVP (Spec 005)** |
| 11 | **Backend repo / schema for save.pokelike.xyz** | Cloud v3 | **Unresolved — not MVP blocking** |

---

## 13. Go / No-Go Assessment

### Can this MVP be built on top of Pokelike without a full rewrite?

## **Yes — Go, with conditions.**

**Confidence level: 82%**

The existing codebase is explicitly structured for this reskin. Spec 005's MVP scope ("reskin and content, not new mechanics") aligns with what the engine already does: roguelike map → scout pick-1-of-3 → auto-battle → stamp → knockout chain → Trophy Room. The battle engine (`battle.js`), map generator (`map.js`), save shape (`poke_dex`, `poke_current_run`), and node dispatch (`game.js` `onNodeClick`) can carry the football theme with **content and presentation changes only**.

Spec 004's Next.js/React migration is **not required** for MVP and would **increase** delivery risk if attempted concurrently.

### Biggest risks

1. **Asset pipeline (confidence killer).** Fifty player portraits plus 13 manager portraits is the critical path. Placeholders work for engineering; they will fail the "not a reskinned Pokémon" product test (Spec 005 §14).

2. **UI surface area without component framework.** `ui.js` at ~4,521 lines means terminology and album reskin require disciplined search-and-replace via `GAME_THEME`. One missed "Pokémon" string undermines the theme.

3. **Historical knockout teams on Elite Four scaffolding.** `ELITE_4` teams are hand-crafted with Pokémon names, levels, and held items. Repurposing to Uruguay 1950 → Argentina 2022 is **content authoring**, not code — but balance tuning across 5 gates is non-trivial and untested without automated battle tests (none exist).

4. **Special-case species IDs in battle engine.** If MVP roster accidentally includes IDs 129, 63, or 133, players hit Pokémon-specific behaviors (Splash, Teleport, branching evo). Pool curation must be enforced in data, not code.

5. **Missing local assets break dev loop.** Without `pokedex.json` / `sprites/`, engineers cannot verify parity with production until artifacts are restored.

### Biggest opportunities

1. **ID-stable catalog overlay.** Keeping `speciesId` means saves, evolutions, BST pools, and album keys work day one. This is the single best architectural decision already present in the codebase.

2. **Battle engine is portable gold.** `runBattle` returns structured `detailedLog` — deterministic, replayable, and 88% reusable (Spec 004). Golden tests can be added **without** refactoring first, de-risking knockout balance.

3. **Album = dex with zero schema migration.** `{ id: 0|1 }` compact shape (Spec 001) maps perfectly to sticker collection — immediate meta-progression hook.

4. **Scope discipline in Spec 005.** Cutting CCC, branching evo, trade, shiny, and cloud save removes the highest-complexity code paths (Eevee overlay, trait panel, cloud merge during migration) from MVP critical path.

5. **Phase 0 fast validation.** A playable football-themed run can ship in weeks on vanilla JS, proving the concept before any Spec 004 architecture investment.

### No-Go triggers (when to reconsider)

- If product demands **real licensed players** → new legal, art, and potentially stat model
- If product demands **11v11 or manual tactics** → new battle engine, not reskin
- If product demands **multiplayer** → new architecture regardless
- If team attempts **simultaneous React rewrite + football reskin** → stop; pick one

---

## Appendix A — MVP Roster ID Allocation (Reference)

Per Spec 005 §8, for implementation cross-reference:

| ID range | Purpose |
|----------|---------|
| 1–9 | Marquee starter chains (Pedro, Diego, Jonas) |
| 10–33 | Scoutable fan favorites |
| 34–41 | Host city boss squad faces |
| 42–47 | Knockout historical squad faces |
| 48–49 | World Cup Legends |
| 50 | Wildcard / mystery event |

Engine `STARTER_IDS = [1, 4, 7]` maps to marquee triangle (Wing Play / High Press / Compact Block).

---

## Appendix B — Files Touched in MVP (Expected)

| File | Change intensity |
|------|------------------|
| `data.js` | High — catalog loader, boss data, theme maps, pool filters |
| `index.html` | Medium — screen copy, hide cloud/ads |
| `ui.js` | High — album modal, card labels, evolution names |
| `game.js` | Low–medium — map 0 weights, hide modes, achievement filter |
| `map.js` | Low — tooltips, node icons, trade weight 0 |
| `battle.js` | Minimal — log string flvor only |
| `endless.js` | Minimal — feature gate |
| `cloud-save.js` | Minimal — hide UI |
| `css/style.css` | Medium — style badge colors, album styling |
| `data/football/*` | **New** — profiles, bosses JSON |

**Do not split or rewrite these files pre-MVP.** Spec 004 extraction comes after concept validation.

---

*End of SPEC 006 — Technical Blueprint.*
