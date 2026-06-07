# SPEC 006B — Technical Blueprint (Revised)

**Status:** **Authoritative** — supersedes [006-technical-blueprint.md](./006-technical-blueprint.md) for implementation  
**Revision basis:** [006A-blueprint-review-and-corrections.md](./006A-blueprint-review-and-corrections.md)  
**Project:** Pokelike → World Cup Football Roguelike (real players)  
**Version:** v2.0  
**Date:** 2026-06-05

---

## Revision summary

| Dimension | SPEC 006 (v1) | SPEC 006B (v2) |
|-----------|---------------|----------------|
| Players | Fictional overlay on dex IDs | **Canonical catalog**, real names, authored stats |
| Progression | Pokémon evolution renames | **Form level + skill tier** on fixed identity |
| Style system | Pokémon type keys + label map | **`StyleId` native keys** + `STYLE_CHART` |
| Content pipeline | Overlay on `data.js` / PokeAPI | **JSON catalogs** + `js/domain/` loaders |
| Save | Dual `poke_*` / `wc_*` aliases | **Schema v3** single migration path |
| Assets | 83 placeholders OK | **Phased legal tiers** (internal → public) |
| Migration debt | Deferred to post-React | **Domain layer now**, React imports later |
| Assessment | 6.5 / 10 | **10 / 10** (see 006A §11 addendum) |

**MVP constraint (unchanged):** Ship on existing vanilla JS engine. No full rewrite. Maximum reuse of battle, map, save semantics, node handlers.

**Future constraint (now first-class):** Next.js + React + TypeScript. Every new module in `js/domain/` must be portable to `src/domain/` without logic changes.

---

## 0. Locked decisions (implementation gate)

These are **final** for MVP. Implementation does not start until row "Legal tier for target release" is signed off.

| # | Decision | Locked value |
|---|----------|--------------|
| L1 | Player identity | **Real footballers** (names in UI always) |
| L2 | Likeness (internal demo) | Names + stylized jersey avatars (no face) |
| L3 | Likeness (public alpha) | **Stylized illustrated portraits** OR licensed photo pack |
| L4 | Progression | **Form level** (1–100) + **skill tier** (0–2); **no name/speciesId change** on level threshold |
| L5 | Multi-era same person | **Single `profileId`** per person in MVP (Messi = one ID in scout and 2022 boss) |
| L6 | Era variants (post-MVP) | Separate `profileId` only when album needs two distinct cards (e.g., Pelé 1958 vs 1970) |
| L7 | Internal combat key | `profileId: number` — persisted field remains `speciesId` until save v4 |
| L8 | Style keys | **`StyleId`** string enum — not Pokémon type names in new code |
| L9 | Catalog | **`data/football/player_profiles.json`** is source of truth for MVP roster |
| L10 | Stats | **Authored per player** — never derived from National Dex / PokeAPI |
| L11 | Starters | **Mbappé (High Press), Modrić (Possession Build-up), Van Dijk (Compact Block)** — `profileId` 1, 2, 3 |
| L12 | Knockout bosses | Uruguay 1950, Brazil 1970, Argentina 1986, France 1998, Argentina 2022 — **real named squads** |
| L13 | Host city bosses | **Nation challenge** (flag + city + federation label); optional real manager name if licensed |
| L14 | Album storage | `{ "profileId": 0\|1 }` — migrate key `poke_dex` → `game_album` in save v3 |
| L15 | Save version | **`SAVE_SCHEMA_VERSION = 3`** with one-shot migration on boot |
| L16 | PokeAPI | **Removed from MVP hot path** |
| L17 | Domain layer | **`js/domain/*.js`** created before content authoring |
| L18 | Battle engine | **Unchanged math**; adapter at domain boundary |
| L19 | MVP scope | Spec 005 cuts retained (no CCC, no Nuzlocke, no trade, no shiny) |
| L20 | Branching "evolution" | **Disabled** — `BRANCHING_EVOLUTIONS` UI never triggered for MVP roster |

---

## 1. System-by-System Migration Matrix

| System | Current source | Action | Notes |
|--------|----------------|--------|-------|
| **Battle engine** | `battle.js` | **Keep** | Port verbatim to `game-core/battle` later. Inject `getCombatMove(profile, tier)` from domain. |
| **Map generator** | `map.js` `generateMap` | **Keep** | Weights: trade=0, map 0 scout bias. Node labels via `GAME_THEME`. |
| **Save engine** | `game.js`, `data.js`, `cloud-save.js` | **Refactor** | v3 migration; `domain/save.js` facade. Cloud UI hidden MVP. |
| **Endless / CCC** | `endless.js` | **Gate off** | `FEATURES.continentalCup = false`. Code preserved. |
| **Collection** | `getPokedex` etc. | **Wrap** | `domain/album.js` → same `{0\|1}` semantics. |
| **Achievements** | `ACHIEVEMENTS` | **Replace data** | 6 MVP milestones; IDs `stamp_0`…`world_cup_win`. Map legacy IDs on load. |
| **UI** | `ui.js`, `index.html`, `style.css` | **Refactor surface** | All copy via `GAME_THEME`; cards via `domain/profiles`. React replaces this layer post-MVP. |
| **Content** | `data.js` monolith | **Split** | Catalog + bosses in JSON; `data.js` shrinks to engine constants + adapters. |
| **Progression** | levels, badges | **Keep mechanics** | `state.badges` → expose as `cityStamps` in domain. No `checkAndEvolveTeam` name swaps for MVP. |
| **Evolution system** | `EVOLUTIONS`, `checkAndEvolveTeam` | **Bypass for MVP** | `domain/progression.js`: `applyFormGrowth` only. Career variants post-MVP. |
| **Items** | `ITEM_POOL` | **Keep IDs** | Display rename only. Effects unchanged in `battle.js`. |
| **Styles** | `TYPE_CHART` | **Replace keys** | `STYLE_CHART` in `domain/styles.js`. Adapter maps legacy saves if needed. |

---

## 2. Content migration matrix (real players)

| Legacy (engine) | Football (user-facing) | MVP |
|-----------------|------------------------|-----|
| Pokémon / species | **Player** | ✅ |
| Trainer | **Manager** | ✅ |
| `speciesId` | **`profileId`** (persisted key unchanged) | ✅ |
| Pokémon types | **`StyleId`** (18 playing styles) | ✅ |
| HP / ATK / DEF / special / spdef / speed | Stamina / Power / Defense / Technique / Vision / Pace | ✅ labels |
| Level | **Form level** | ✅ |
| Evolution | **Form growth** (stats scale; identity fixed) | ✅ no rename |
| moveTier | Skill tier I–III | ✅ |
| Pokédex | **World Cup Album** | ✅ |
| Gym leader | **Host city challenge** | ✅ nation-led |
| Elite Four | **Knockout stage** (5 historical XIs) | ✅ real squads |
| Legendary node | **Legend scouting** (Pelé, Maradona, …) | ✅ |
| Starter | **Marquee signing** — Mbappé / Modrić / Van Dijk | ✅ |
| Badge | **City stamp** | ✅ |
| Shiny | Gold card | ❌ post-MVP |
| Battle Tower | Continental Champions Cup | ❌ gated |

---

## 3. Architecture: domain layer + engine adapter

### 3.1 Folder layout (MVP — vanilla JS, TS-ready)

```
js/
├── domain/                    # NEW — portable to src/domain/
│   ├── styles.js              # StyleId, STYLE_CHART, STYLE_LABELS, styleCssClass()
│   ├── profiles.js            # loadCatalog(), getProfile(id), createPlayerInstance()
│   ├── album.js               # getAlbum(), markSeen(), markSigned()
│   ├── bosses.js              # loadHostCityBosses(), loadKnockoutTeams()
│   ├── progression.js         # applyFormGrowth(), applySkillTier() — NO evo rename
│   ├── save.js                # migrateSaveV2toV3(), SCHEMA_VERSION
│   ├── combat-adapter.js      # toCombatant(instance) → battle.js shape
│   └── features.js            # FEATURES flags (ccc, trade, nuzlocke)
├── data/
│   └── football/
│       ├── player_profiles.json      # MVP ~50 real players — SOURCE OF TRUTH
│       ├── host_city_bosses.json
│       ├── knockout_teams.json
│       ├── album_layout.json
│       └── achievements_mvp.json
├── battle.js                  # UNCHANGED math
├── map.js                     # UNCHANGED generator
├── game.js                    # Calls domain; node handlers unchanged
├── data.js                    # STYLE_CHART deprecated → re-export from domain/styles
└── ui.js                      # Reads domain only for player/boss/album data
```

**Script load order (updated):**

```
domain/*.js → data.js → map.js → battle.js → endless.js → ui.js → game.js → cloud-save.js
```

### 3.2 Combat adapter pattern

Battle engine keeps `speciesId`, `types`, `baseStats`. Domain creates instances:

```
createPlayerInstance(profile, formLevel, opts)
  → { profileId, speciesId: profileId, name, types: profile.stylesAsLegacyTypes OR profile.styleIds,
      baseStats, level: formLevel, moveTier, ... }
```

During MVP transition, `types[]` may dual-write: engine accepts either legacy capitalized keys mapped from `StyleId` via `styleToLegacyType()` **only at combat boundary** — removed when `STYLE_CHART` keys fully replace `TYPE_CHART` in `battle.js` (single file change).

**Target (same sprint as catalog):** Replace `TYPE_CHART` with `STYLE_CHART` keyed by `StyleId`. Update `MOVE_POOL` → `SKILL_POOL` keyed by `StyleId`. One coordinated rename — not a permanent dual layer.

---

## 4. Style system (final)

### 4.1 StyleId enum (18)

```
balanced | high_press | possession_buildup | wing_play | rapid_counter | ice_press
| physical_battle | dark_arts | aerial_threat | wide_play | tactical_control
| high_intensity | compact_block | clinical_finishing | power_strike
| street_smarts | iron_defense | set_piece_master
```

### 4.2 Display labels

| StyleId | Label |
|---------|-------|
| high_press | High Press |
| possession_buildup | Possession Build-up |
| wing_play | Wing Play |
| rapid_counter | Rapid Counter |
| compact_block | Compact Block |
| tactical_control | Tactical Control |
| … | (full table in domain/styles.js) |

### 4.3 Matrix

- **Values:** identical to current `TYPE_CHART` (same 18×18 balance).
- **Keys:** `StyleId` only in catalog, bosses, UI, future TS types.
- **CSS:** `data-style="high_press"` + legacy `.type-fire` alias until Tailwind migration.

### 4.4 MVP tutorial — Core Six

Unchanged from Spec 005: High Press, Wing Play, Compact Block, Possession Build-up, Rapid Counter, Tactical Control.

---

## 5. Player data model (real players)

### 5.1 PlayerProfile (catalog)

```typescript
// Conceptual — implement as JSDoc in profiles.js
interface PlayerProfile {
  profileId: number              // PK; persisted as speciesId in saves
  slug: string                   // "lionel-messi" — stable for URLs/React routes
  displayName: string            // "Lionel Messi"
  commonName: string | null      // "Messi"
  nation: string                 // "ARG" — ISO 3166-1 alpha-3
  position: 'GK'|'CB'|'FB'|'DM'|'CM'|'AM'|'W'|'ST'
  primaryStyle: StyleId
  secondaryStyle: StyleId | null
  baseStats: { hp, atk, def, special, spdef, speed }  // authored
  rarity: 'common'|'uncommon'|'rare'|'elite'|'legend'
  portrait: string               // path; tier-dependent (see §9)
  flavorText: string
  flags: {
    isMarquee: boolean
    isLegend: boolean
    scoutable: boolean
    bossExclusive: boolean
  }
  album: { pageId: string; slot: number }
  legal: { nameOk: boolean; likenessTier: 0|1|2 }  // 0=name only, 1=stylized, 2=licensed photo
}
```

**No `evoLineRoot` required for MVP** — legacy stat buffs keyed by `profileId` when CCC returns.

### 5.2 PlayerInstance (runtime)

Same as SPEC 006 instance shape. **Identity invariant:** `name` and `profileId`/`speciesId` never change during a run.

Form level increases → `getEffectiveStat` scales stats. Optional **milestone toast** at L16/L32 ("Messi hits peak form") — cosmetic only.

### 5.3 Progression (replaces evolution)

| Mechanic | Engine hook | Real-player behavior |
|----------|-------------|----------------------|
| Form level | `level`, `applyLevelGain` | Match experience; same person |
| Skill tier | `moveTier`, specialist coach | Better signature skills |
| Items | `heldItem` | Boots, vest, etc. |
| Career variant | `EVOLUTIONS` (post-MVP) | Only for distinct era cards (two profileIds) |

**MVP code path:** `checkAndEvolveTeam()` becomes no-op for roster where `!profile.careerVariant`. Domain calls `applyFormGrowth()` after battles instead.

---

## 6. MVP roster (real players — authoritative table)

**50 profileIds.** Stats authored in JSON — not Pokémon-derived.

### 6.1 Marquee signings (starters)

| profileId | Player | Nation | Position | Primary style | Role in triangle |
|-----------|--------|--------|----------|---------------|------------------|
| 1 | Kylian Mbappé | FRA | ST | high_press | Aggressive press |
| 2 | Luka Modrić | CRO | CM | possession_buildup | Control |
| 3 | Virgil van Dijk | NED | CB | compact_block | Defensive anchor |

`STARTER_IDS = [1, 2, 3]` — replaces `[1, 4, 7]`.

### 6.2 Scout pool (profileId 4–28) — sample

| ID | Player | Nation | Style(s) | Rarity |
|----|--------|--------|----------|--------|
| 4 | Erling Haaland | NOR | high_press | elite |
| 5 | Vinícius Júnior | BRA | wing_play | elite |
| 6 | Pedri | ESP | possession_buildup | rare |
| 7 | Jamal Musiala | GER | tactical_control | rare |
| 8 | Mohamed Salah | EGY | rapid_counter | elite |
| 9 | Kevin De Bruyne | BEL | tactical_control | elite |
| 10 | Rodri | ESP | compact_block | elite |
| … | *(25 total scoutable)* | | | |

### 6.3 Host city squad stars (29–36)

One signature player per city leg appearing on boss roster + album "Host City Heroes" page.

### 6.4 Knockout historical squads (gates 0–4)

Loaded from `knockout_teams.json`. **Real names.** Same `profileId` when player also scoutable (e.g., Messi = profileId 40 everywhere).

| Gate | Team | Key immortals (examples) |
|------|------|--------------------------|
| R16 | Uruguay 1950 | Ghiggia, Schiaffino, Varela |
| QF | Brazil 1970 | Pelé, Jairzinho, Carlos Alberto, Tostão |
| SF | Argentina 1986 | Diego Maradona, Jorge Burruchaga, Nery Pumpido |
| Final | France 1998 | Zinedine Zidane, Lilian Thuram, Didier Deschamps |
| Trophy | Argentina 2022 | Lionel Messi, Ángel Di María, Emiliano Martínez |

### 6.5 Legend nodes (profileId 48–50)

| ID | Player | Unlock |
|----|--------|--------|
| 48 | Pelé | Legendary node map 5+ |
| 49 | Diego Maradona | Legendary node map 5+ |
| 50 | Cristiano Ronaldo | Legendary node map 6+ (optional 3rd) |

**Note:** Messi is in knockout final roster AND may appear in scout pool — **same profileId 40**.

---

## 7. Boss architecture

### 7.1 Host city (8)

```json
{
  "mapIndex": 0,
  "hostCity": "São Paulo",
  "nation": "BRA",
  "label": "Brazil Federation Challenge",
  "managerName": null,
  "primaryStyle": "compact_block",
  "stamp": { "id": "stamp_sao_paulo", "displayName": "São Paulo Stamp" },
  "roster": [ { "profileId": 29, "formLevel": 14 }, ... ]
}
```

No fictional coaches. Optional `managerName: "Luiz Felipe Scolari"` if legal clears.

### 7.2 Knockout (5)

```json
{
  "gateIndex": 2,
  "gateName": "Semi-final",
  "historicalTeam": { "nation": "ARG", "year": 1986, "nickname": "La Albiceleste" },
  "kit": { "primary": "#75AADB", "secondary": "#FFFFFF" },
  "roster": [
    { "profileId": 49, "formLevel": 55, "skillTier": 2, "heldItemId": "life_orb" },
    ...
  ]
}
```

Prep screen reads `historicalTeam` + aggregated style hint from roster.

### 7.3 Engine wiring

`game.js` `doBossNode` / elite handlers:

```
const boss = domain.bosses.getHostCity(state.currentMapIndex)
const enemyTeam = boss.roster.map(slot => domain.profiles.createInstance(slot))
```

**Delete direct reads of `GYM_LEADERS` / `ELITE_4` in new code paths.** Legacy arrays remain until cutover PR removes them.

---

## 8. Album architecture

### 8.1 Storage (save v3)

```json
{
  "game_album": { "1": 1, "4": 1, "40": 0, "49": 1 },
  "game_album_meta": { "legendsPageUnlocked": true, "knockoutGatesSeen": [0, 1, 2] }
}
```

Migration: `game_album` ← copy of `poke_dex` on first v3 boot. Keep reading `poke_dex` if `game_album` absent (one release).

### 8.2 Pages (`album_layout.json`)

| pageId | Title | Slots |
|--------|-------|-------|
| marquee | Marquee Signings | 1, 2, 3 |
| favorites | Fan Favorites | 4–28 |
| host_city | Host City Heroes | 29–36 |
| legends | Legends | 48–50 (hidden until any legend seen) |
| knockout | Knockout Immortals | 41–45 (gate icons: Maradona, Pelé, Zidane, …) |

Silhouette shows **surname initial + nation flag** until signed. Signed shows portrait + styles.

---

## 9. Asset strategy (revised)

### 9.1 Legal tiers

| Tier | Release | Names | Visual |
|------|---------|-------|--------|
| **T0** | Internal dev | Real | Jersey silhouette (number + nation colors) |
| **T1** | Private playtest | Real | Stylized illustrated portraits (no photorealistic likeness) |
| **T2** | Public alpha | Real + legal review | T1 art OR licensed photo bundle |

**Never:** Public release with T0 assets.

### 9.2 MVP required assets

| Asset | T0 | T1 | Count |
|-------|----|----|-------|
| Player portraits | Silhouette template | Illustrated | 50 |
| Nation flags | SVG | SVG | ~20 |
| Knockout kit palettes | CSS vars | CSS vars | 5 |
| City stamps | Text+flag | Designed stamp | 8 |
| Style chips | CSS pills | CSS pills | 18 (no icons) |
| Trophy / win | CSS | 1 PNG | 1 |
| Map nodes | Reuse/memoji | Reuse sprites | ~10 |

**Deferred:** manager portraits, per-city backgrounds, item PNGs, style icon set.

### 9.3 Portrait pipeline

1. Content exports `player_profiles.json` with `portrait: "/assets/players/{slug}.png"`.
2. Art delivers `{slug}.png` to match.
3. `onerror` → nation silhouette fallback (T0) — **dev only**.

---

## 10. Save migration (v3)

### 10.1 Schema bump

```javascript
const SAVE_SCHEMA_VERSION = 3  // was 2
```

### 10.2 Migration on boot (`domain/save.js`)

1. If `saveVersion < 3`: copy `poke_dex` → `game_album`; copy achievements with ID map; **do not** mutate active run team names.
2. Set `saveVersion = 3`.
3. **Never** dual-write `wc_album` and `game_album`.

### 10.3 Active run

Unchanged shape. `speciesId` holds `profileId`. On load, UI enriches from catalog (never overwrite save `name` from catalog mid-run unless blank).

### 10.4 Pokémon build compat

Non-goal for football MVP. If needed later: football IDs 1–50 simply won't exist in Pokelike dex — acceptable.

### 10.5 Cloud save

Hidden MVP. When re-enabled: add `game_album` to `SYNC_KEYS`; server accepts v3.

---

## 11. Battle engine blueprint

**Unchanged from SPEC 006 §4** except:

- Special-case registry: `domain/combat-abilities.js` maps `profileId` → `{ noDamage, transform, defaultStyleOverride }`. MVP roster empty registry — no Magikarp/Ditto equivalents.
- Move display: `domain/skills.js` returns `{ name, power, styleId, isTechnical }`.
- Log strings: `GAME_THEME.battle.*` — no "Pokémon" / "fainted" → "injured off" / "duel won".

Physical vs technical split unchanged (`special >= atk`).

---

## 12. Implementation order (revised)

1. **`js/domain/` scaffold** + feature flags  
2. **`StyleId` + `STYLE_CHART`** — replace `TYPE_CHART` in one PR  
3. **`player_profiles.json`** — 50 real players, authored stats  
4. **`domain/profiles.js`** + `createPlayerInstance` — remove PokeAPI from MVP path  
5. **Save v3 migration**  
6. **`knockout_teams.json` + `host_city_bosses.json`** + boss loaders  
7. **Disable evo rename path** for MVP roster  
8. **`GAME_THEME`** full terminology pass  
9. **Album UI** (pages from `album_layout.json`)  
10. **Map 0 pacing weights**  
11. **Asset tier T1 portraits** (block public playtest until ready)  
12. **Golden battle tests** (20 scenarios, JSON fixtures with real profile stats)  
13. **Balance pass** on knockout gates  
14. **Strip** cloud, ads, CCC, Nuzlocke, trade  

**Parallel (week 1):** Golden tests can start after step 3.

---

## 13. Open questions (remaining)

| # | Question | Owner | Blocks? |
|---|----------|-------|---------|
| 1 | Legal sign-off tier for public alpha | Product/Legal | **Yes** for public |
| 2 | Licensed photo vs illustrated portraits | Product | **Yes** for T2 |
| 3 | Third marquee alternative roster (women's icons?) | Product | No — post-MVP |
| 4 | Exact 25-name scout list sign-off | Content | **Yes** before balance |
| 5 | Manager names on host city or nation-only | Content/Legal | No — nation-only default |
| 6 | Production asset repo location | Eng | Yes for dev parity |

All architecture questions from 006A are **resolved** in §0 locked decisions.

---

## 14. Go / No-Go assessment

### Can MVP be built without full rewrite?

## **Yes — Go.**

**Confidence: 95%** (100% architecture; 5% reserved for legal/portrait delivery)

### Why 10/10 architecture (vs 6.5 for SPEC 006)

| Criterion | SPEC 006B |
|-----------|-----------|
| Engine reuse | Battle, map, nodes, album shape preserved |
| Real players | Canonical catalog, authored stats, real knockout squads |
| Progression | Form level — semantically correct for humans |
| Migration-ready | Domain layer, StyleId, JSON content, save v3 |
| Debt avoidance | No dual keys, no PokeAPI hot path, no fiction overlay |
| MVP scope | Spec 005 cuts honored |
| Legal | Explicit tiers — not an afterthought |
| Testability | Golden battle fixtures specified |

### Residual risks

1. **Legal/portrait timeline** — mitigated by T0/T1 tier gating  
2. **Balance with authored stats** — mitigated by golden tests  
3. **`ui.js` monolith** — mitigated by domain facades; full React split post-MVP  

### No-go triggers (unchanged)

- 11v11 manual tactics  
- Full rewrite before MVP playtest  
- Simultaneous React migration + content sprint  

---

## Appendix A — Script migration checklist

- [ ] Create `js/domain/` (7 files)  
- [ ] Add `STYLE_CHART` keyed by `StyleId`; update `battle.js` references  
- [ ] `player_profiles.json` (50 players)  
- [ ] `host_city_bosses.json` (8)  
- [ ] `knockout_teams.json` (5)  
- [ ] `album_layout.json`  
- [ ] `SAVE_SCHEMA_VERSION = 3` + migration  
- [ ] `STARTER_IDS = [1, 2, 3]`  
- [ ] Bypass `checkAndEvolveTeam` rename for MVP profiles  
- [ ] Remove PokeAPI calls for `profileId <= 50`  
- [ ] `FEATURES.continentalCup = false`  
- [ ] Trade node weight 0  

---

## Appendix B — TypeScript migration map (future)

| MVP (`js/domain/`) | Future (`src/domain/`) |
|--------------------|------------------------|
| `profiles.js` | `profiles.ts` — identical exports |
| `styles.js` | `styles.ts` — `StyleId` becomes union type |
| `album.js` | `album.ts` |
| `bosses.js` | `bosses.ts` |
| `save.js` | `save.ts` |
| `combat-adapter.js` | consumed by `game-core/battle` |

React components import from `@/domain/*`. No logic rewrite — copy + type.

---

*SPEC 006B supersedes SPEC 006 for all implementation work.*  
*Reviewed against 006A — assessment **10/10**.*
