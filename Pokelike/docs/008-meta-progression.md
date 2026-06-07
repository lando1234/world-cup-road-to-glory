# SPEC 008 — Meta Progression & Collection Loop

**Status:** Product progression blueprint — approved for implementation after SPEC 007  
**Authority:** Extends [005-football-mvp-definition.md](./005-football-mvp-definition.md), [006B-technical-blueprint-revised.md](./006B-technical-blueprint-revised.md), and [007-football-data-pack.md](./007-football-data-pack.md)  
**Version:** v0.2  
**Date:** 2026-06-06  
**Scope:** Permanent progression, collection systems, run persistence, unlocks, duplicates, long-term retention

---

## 1. Objective

Define why players return after each run.

The combat loop already exists:

- Build squad
- Beat host cities
- Reach knockout stage
- Challenge historical World Cup teams
- Win or lose

SPEC 008 defines:

- Permanent progression
- Collection motivation
- Duplicate handling
- Long-term goals
- Meta unlock structure

This system must provide meaningful progress even after failed runs.

---

## 2. Design Principles

### P1 — Every run matters

Even a failed run should advance something.

Player should never feel:

> "I wasted 30 minutes."

Instead:

- "I got a new sticker."
- "I earned credits."
- "I unlocked part of a legend."

### P2 — Collection first

The primary retention system is **album completion**, not power grinding.

The emotional fantasy is:

> Complete the greatest World Cup album ever assembled.

### P3 — Runs remain fresh

Players do not keep squads.

Each run starts with **Mbappé / Messi / Van Dijk** selection and a new scouting journey.

### P4 — Legends remain aspirational

Legends should feel rare.

Seeing Pelé should be exciting. Owning Pelé should feel special.

---

## 3. Data Layers

Three persistence scopes must not be conflated in implementation.

| Layer | Lifetime | Storage key(s) | Mutability | Synced to cloud (MVP) |
|-------|----------|----------------|------------|-------------------------|
| **Current run** | One campaign attempt | `poke_current_run` | Cleared on settlement or abandon | No |
| **Permanent account** | Across all runs | See §4 | Append-only meta; album grows | Partial (see §17) |
| **Cloud save envelope** | Cross-device account | Server blob + `poke_meta` timestamps | Merge on pull/push | Yes (when enabled) |

### 3.1 Current run data

Ephemeral campaign state. Owned by `game.js` today.

**Contains:** map graph, team instances, items, city stamps (`state.badges`), knockout progress, RNG seed, run flags (`usedPokecenter`, etc.).

**Does not contain:** Football Credits, legend fragments, album signed counts, achievement reward claim state.

**Rule:** Meta rewards are **computed at settlement** from a run snapshot — not written incrementally to account during the run (except live album **seen** marks for UX; see §18).

### 3.2 Permanent account data

Survives run clear. Written only through `domain/save.js` facades after domain logic returns a patch.

**Contains:** album, credits, fragments, achievements, cosmetics, run counters, settlement dedupe token.

**Rule:** UI and `game.js` call `domain/meta.js` pure functions → receive patch → `save.applyAccountPatch(patch)`.

### 3.3 Cloud save data

Subset of account keys packaged by `cloud-save.js` when cloud sync is enabled (hidden MVP per 006B; schema must still be v3-ready).

**Contains:** same keys as §17.2 `SYNC_KEYS` list — not the active run.

**Merge semantics (unchanged from v2):**

- **Primitive keys** (`footballCredits`, `runCount`, …): newest `poke_meta[key]` timestamp wins.
- **Collection keys** (`game_album`, `legendFragments`, …): union-merge with per-entry max / OR rules defined in §17.
- **Settlement dedupe** (`lastSettledRunId`): primitive — prevents double-claim across devices only if both settled same run id (edge case; local guard is primary).

---

## 4. Permanent Account Data & Schemas

### 4.1 Account blob (persisted)

Logical account shape after save v3 migration:

```json
{
  "game_album": { "4": 0, "12": 1, "42": 1 },
  "game_album_meta": {
    "legendsPageUnlocked": false,
    "knockoutGatesSeen": [],
    "milestonesClaimed": []
  },
  "footballCredits": 0,
  "legendFragments": { "42": 0, "43": 0, "46": 0, "47": 0, "50": 0 },
  "unlockedLegends": [],
  "unlockedAchievements": [],
  "achievementRewardsClaimed": [],
  "unlockedCosmetics": {
    "stadiumTheme": null,
    "pitchStyle": null,
    "albumFrame": null,
    "owned": []
  },
  "accountFlags": {
    "reachedKnockout": false,
    "reachedFinal": false,
    "wonWorldCup": false
  },
  "runCount": 0,
  "campaignWins": 0,
  "lastSettledRunId": null
}
```

**localStorage mapping (single write path — no dual aliases):**

| Field | Key | Type |
|-------|-----|------|
| Album | `game_album` | `Record<string, 0 \| 1>` |
| Album meta | `game_album_meta` | object |
| Credits | `footballCredits` | integer ≥ 0 |
| Fragments | `legendFragments` | `Record<LegendProfileId, number>` |
| Unlocked legends | `unlockedLegends` | `number[]` (subset of 42,43,46,47,50) |
| Achievements | `poke_achievements` | `string[]` (ID set; key name retained for migration) |
| Reward claim dedupe | `achievementRewardsClaimed` | `string[]` |
| Cosmetics | `unlockedCosmetics` | object |
| Account flags | `accountFlags` | object |
| Run counter | `runCount` | integer |
| Wins | `campaignWins` | integer (replaces semantic of `poke_elite_wins`) |
| Settlement guard | `lastSettledRunId` | `string \| null` |
| Schema version | `saveVersion` | `3` |

### 4.2 `game_album`

Compact sticker progress for Volume 1 (50 profileIds from [007-football-data-pack.md](./007-football-data-pack.md)).

```typescript
/** @typedef {Record<string, 0 | 1>} GameAlbum */
// Key: profileId as decimal string ("1".."50")
// Absent key  → unknown (never encountered)
// 0           → seen (silhouette unlocked, name hidden)
// 1           → signed (recruited at least once across all runs)
```

**Constraints:**

- Only profileIds present in `player_profiles.json` are valid keys.
- Value `1` implies value was `0` or absent before sign; signing is monotonic (`unknown → seen → signed`).
- Dual-page placements (e.g. Pelé on knockout + legends) share one key — one sticker, two album slots in UI.

### 4.3 `legendFragments`

```typescript
/** @typedef {Record<string, number>} LegendFragments */
// Keys: only eligible legend profileIds as strings: "42","43","46","47","50"
// Value: accumulated fragments toward unlock (0..FRAGMENTS_PER_LEGEND while locked)
```

**After unlock:** consuming `FRAGMENTS_PER_LEGEND` (20) moves player to `unlockedLegends` and resets that key to `0` (or removes key — implementation choice; must be idempotent on reload).

**Cap while locked:** `fragments[profileId] <= FRAGMENTS_PER_LEGEND - 1` except during the single unlock transaction that deducts 20.

### 4.4 `footballCredits`

```typescript
/** @typedef {number} FootballCredits */
// Non-negative integer. Never decremented in MVP (no shop spend yet).
```

### 4.5 `achievementRewardsClaimed`

```typescript
/** @typedef {string[]} AchievementRewardsClaimed */
// Subset of achievement IDs whose credit/fragment payout has been applied.
// Parallel to unlockedAchievements: unlock grants badge; claim grants economy.
```

**Invariant:** `achievementRewardsClaimed ⊆ unlockedAchievements` (enforce on write).

### 4.6 `unlockedCosmetics`

```typescript
/** @typedef {{
 *   stadiumTheme: string | null,
 *   pitchStyle: string | null,
 *   albumFrame: string | null,
 *   owned: string[]
 * }} UnlockedCosmetics */
```

**Cosmetic IDs (stable):**

| Category | IDs |
|----------|-----|
| Stadium themes | `stadium_maracana_night`, `stadium_azteca_sunset`, `stadium_berlin_lights`, `stadium_wembley_rain` |
| Pitch styles | `pitch_classic_1970`, `pitch_qatar_2022`, `pitch_vintage_wc` |
| Album frames | `frame_gold`, `frame_holographic`, `frame_champion` |

Active selection stored in `poke_settings` (existing key); `owned[]` is authoritative unlock list.

### 4.7 `meta_progression.json` (static config — not save data)

Authored tuning constants loaded at boot. **Not written by gameplay.** Lives at `js/data/football/meta_progression.json`.

```json
{
  "schemaVersion": 1,
  "fragmentsPerLegend": 20,
  "legendProfileIds": [42, 43, 46, 47, 50],
  "duplicateCreditsByRarity": {
    "uncommon": 20,
    "rare": 40,
    "elite": 75,
    "legend": 250
  },
  "credits": {
    "hostCityWin": 25,
    "knockoutGateWin": 50,
    "reachKnockout": 100,
    "reachFinal": 150,
    "winWorldCup": 300,
    "newAlbumEntry": 50,
    "albumMilestone10": 250,
    "albumMilestone40RareScoutToken": 0
  },
  "fragments": {
    "legendaryNodeMin": 3,
    "legendaryNodeMax": 5,
    "worldCupVictory": 5,
    "albumMilestone": 5
  },
  "campaignOutcomeBands": {
    "earlyExit": { "min": 50, "max": 150 },
    "knockoutRun": { "min": 150, "max": 400 },
    "finalist": { "min": 400, "max": 600 },
    "worldCupChampion": { "min": 600, "max": 1000 }
  },
  "accountLevels": {
    "1": { "gate": "reachedKnockout", "unlocks": ["album_page_previews", "rare_scout_token"] },
    "2": { "gate": "reachedFinal", "unlocks": ["historical_team_viewer"] },
    "3": { "gate": "wonWorldCup", "unlocks": ["legend_node_cr7", "cosmetic_champion_pack"] }
  },
  "achievementRewards": {
    "scout_master": { "credits": 150, "fragments": 0 },
    "album_hunter": { "credits": 250, "fragments": 5 },
    "world_football_archive": { "credits": 500, "fragments": 10 },
    "host_city_traveler": { "credits": 200, "fragments": 0 },
    "finalist": { "credits": 300, "fragments": 5 },
    "world_champion": { "credits": 500, "fragments": 5 },
    "first_immortal": { "credits": 400, "fragments": 5 },
    "hall_of_fame": { "credits": 500, "fragments": 10 }
  },
  "antiExploit": {
    "abandonedRunPayoutMultiplier": 0.5,
    "maxFragmentsPerRunPerLegend": 5,
    "maxCreditsPerRun": 1500
  }
}
```

All numeric tuning for MVP should be read from this file — not hardcoded in `game.js`.

---

## 5. Football Credits

Primary meta currency.

**Earned from:**

- Run completion (settlement band + activity totals)
- Boss victories (included in run snapshot, settled once)
- Album discoveries (new signed entries)
- Achievements (one-time claim)
- Duplicate players (at sign time in settlement ledger)

**Never lost** in MVP (no spend sinks required for ship).

### Credit Sources

Authoritative values in `meta_progression.json` → `credits.*`. Summary:

| Activity | Credits |
|----------|---------|
| Host city win | 25 |
| Knockout gate win | 50 |
| Reach knockout stage | 100 |
| Reach final | 150 |
| Win World Cup | 300 |
| New album entry (first sign) | 50 |
| Album milestone @ 10 signed | 250 |
| Achievement | 100–500 (per achievement; see §10) |

---

## 6. Album System

**Volume 1:** *Road to the Trophy* — 50 total entries (see [007-football-data-pack.md](./007-football-data-pack.md)).

### Entry States

| State | Condition | Display |
|-------|-----------|---------|
| **Unknown** | Key absent in `game_album` | `???` — silhouette hidden |
| **Seen** | `game_album[id] === 0` | Silhouette visible — name hidden |
| **Signed** | `game_album[id] === 1` | Full entry unlocked |

### Completion Rewards

| Signed count | Reward |
|--------------|--------|
| 10 | 250 Credits (`milestonesClaimed` includes `"album_10"`) |
| 25 | Unlock achievement `album_hunter` |
| 40 | Rare scout token (meta flag; no duplicate credit) |
| 50 | Unlock achievement `world_football_archive` + completion bonus per config |

**Milestone dedupe:** each milestone ID in `game_album_meta.milestonesClaimed` at most once.

---

## 7. Duplicate System

Duplicates automatically convert into Football Credits at settlement (when player signs a profile already at `game_album[id] === 1`).

- No inventory clutter
- No duplicate stickers
- No album state change on duplicate (stays signed)

### Conversion Values

From `meta_progression.json` → `duplicateCreditsByRarity`:

| Tier | Credits |
|------|---------|
| Uncommon | 20 |
| Rare | 40 |
| Elite | 75 |
| Legend | 250 |

**Rarity source:** `player_profiles.json` → `rarity` field per [007-football-data-pack.md](./007-football-data-pack.md).

### Example

Player already owns Vinícius (`game_album["12"] === 1`). Scout result: Vinícius again.

**Result:** +75 Football Credits (Elite tier). Album unchanged.

---

## 8. Legend Fragment System

Legends are the ultimate collection goal. Players do not unlock legends instantly — they collect fragments.

### Eligible Legends

| profileId | Player |
|-----------|--------|
| 42 | Pelé |
| 43 | Maradona |
| 46 | Ronaldo Nazário |
| 47 | Ronaldinho |
| 50 | Cristiano Ronaldo |

### Unlock Rule

**20 fragments (`fragmentsPerLegend`) = 1 legend unlock** → profileId added to `unlockedLegends`; legend becomes available in Legendary Nodes / album signed via normal recruit rules.

### Sources

| Source | Fragments |
|--------|-----------|
| Legendary Nodes | 3–5 (uniform random in band, per node visit in run ledger) |
| World Cup Victory | 5 (split across eligible pool or targeted — implementer choice; document in run ledger) |
| Album Milestones | 5 (on milestone claim) |
| Achievements | 0–10 (per §10 `achievementRewards`) |

**Per-run cap:** `antiExploit.maxFragmentsPerRunPerLegend` (default 5) prevents legendary node farming in one run.

---

## 9. Campaign Rewards

End-of-run **outcome band** credits (settlement step 5) — additive with activity credits from the run ledger.

| Outcome | Credits (band) |
|---------|----------------|
| Early exit (before knockout) | 50–150 |
| Knockout run (knockout reached, lost before final) | 150–400 |
| Finalist (lost in final) | 400–600 |
| World Cup Champion | 600–1000 |

**Band selection:** deterministic from run snapshot depth (badges count, `eliteIndex`, win flag) — see §18.

**Requirement:** Run settlement screen on **both win and loss**. Failed runs receive partial payout; abandoned runs receive `abandonedRunPayoutMultiplier` × computed total (§19).

---

## 10. Achievement Expansion

Progression achievements (SPEC 008). Coexist with [007](./007-football-data-pack.md) MVP milestones (`stamp_0`, `knockout_debut`, `world_cup_win`, `album_25`, `album_50`, `brazil_1970`).

### Collection

| ID | Name | Trigger | Credits | Fragments |
|----|------|---------|---------|-----------|
| `scout_master` | Scout Master | 10 signed album entries | 150 | 0 |
| `album_hunter` | Album Hunter | 25 signed album entries | 250 | 5 |
| `world_football_archive` | World Football Archive | All 50 signed | 500 | 10 |

### Campaign

| ID | Name | Trigger | Credits | Fragments |
|----|------|---------|---------|-----------|
| `host_city_traveler` | Host City Traveler | 8 city stamps in one run OR cumulative account flag | 200 | 0 |
| `finalist` | Finalist | Reach final gate (win or lose) | 300 | 5 |
| `world_champion` | World Champion | Win World Cup | 500 | 5 |

### Legends

| ID | Name | Trigger | Credits | Fragments |
|----|------|---------|---------|-----------|
| `first_immortal` | First Immortal | Any entry in `unlockedLegends` | 400 | 5 |
| `hall_of_fame` | Hall of Fame | All five legends unlocked | 500 | 10 |

**Reward flow:** On settlement, evaluate unlock conditions → append to `unlockedAchievements` → for each newly unlocked ID not in `achievementRewardsClaimed`, apply `achievementRewards` from config and append ID to `achievementRewardsClaimed`.

**Legacy ID map (save v3 migration — idempotent):**

| Legacy ID | Football ID |
|-----------|-------------|
| `gym_0` | `stamp_0` |
| `elite_four` | `knockout_debut` |
| `gen2_win` | `world_cup_win` |
| `pokedex_complete` | `world_football_archive` |

Unmapped legacy IDs remain in `poke_achievements` but hidden from football UI.

**Overlap note:** `album_hunter` (25 signed) aligns with 007 `album_25`; `world_football_archive` aligns with `album_50`. Migration may dedupe unlock set; rewards claim only once via `achievementRewardsClaimed`.

---

## 11. Meta Unlock Roadmap

Account level derived from `accountFlags` (monotonic OR across runs):

| Level | Gate (`accountFlags`) | Unlocks |
|-------|----------------------|---------|
| **0** | default | — |
| **1** | `reachedKnockout: true` | Album page previews; Rare Scout Token |
| **2** | `reachedFinal: true` | Historical Team Viewer |
| **3** | `wonWorldCup: true` | Cristiano Ronaldo in Legendary Nodes; Champion cosmetic pack |

Levels do not decrease. Flags set during settlement from run snapshot maximum depth.

---

## 12. Cosmetic Unlocks

No gameplay impact — pure prestige. IDs in §4.6.

### Stadium Themes

- Maracanã Night → `stadium_maracana_night`
- Azteca Sunset → `stadium_azteca_sunset`
- Berlin Lights → `stadium_berlin_lights`
- Wembley Rain → `stadium_wembley_rain`

### Pitch Styles

- Classic 1970 → `pitch_classic_1970`
- Qatar 2022 → `pitch_qatar_2022`
- Vintage World Cup → `pitch_vintage_wc`

### Album Frames

- Gold → `frame_gold`
- Holographic → `frame_holographic`
- Champion → `frame_champion`

---

## 13. Long-Term Retention Goals

| Goal | Expected runs |
|------|---------------|
| Complete Fan Favorites | 2–5 |
| Complete Host City Heroes | 5–10 |
| Complete Knockout Immortals | 10–15 |
| Unlock First Legend | 15–25 |
| Complete Volume 1 | 30–50 |

---

## 14. Success Metrics

| Session | Target |
|---------|--------|
| Session 1 | Reach Map 3+ |
| Session 3 | Reach Knockout |
| Session 5 | Own 15+ Album Entries |
| Session 10 | Own 1 Legend |
| Session 20 | 50% Album Completion |

---

## 15. MVP Recommendation

**Ship with:**

- Football Credits
- Album persistence (`game_album` + seen/signed UX)
- Duplicate conversion
- Legend fragments
- Achievement rewards + `achievementRewardsClaimed` dedupe

**Do NOT ship initially:**

- Battle passes
- Daily quests
- Energy systems
- Timers
- Loot boxes

The album and legend chase are sufficient for MVP retention.

---

## 16. Final Recommendation

The emotional loop should become:

```
Start Run
    ↓
Scout Players
    ↓
Collect Stickers
    ↓
Earn Credits
    ↓
Collect Legend Fragments
    ↓
Complete Album
    ↓
Unlock Legends
    ↓
Win World Cup
    ↓
Repeat
```

Players return primarily to complete their World Cup album and build a permanent football legacy, not merely to win individual campaigns.

---

## 17. Save v3 Migration

Implements 006B §10 with SPEC 008 meta fields. Entry point: `domain/save.js` → `migrateSaveV2toV3()` on boot **before** any run load.

### 17.1 Rules

1. **Idempotent:** If `saveVersion >= 3`, migration is a no-op. Running migration twice must not double credits, fragments, or milestone claims.
2. **Album:** If `game_album` absent, shallow-copy `poke_dex` → `game_album` (string keys, values 0|1). Do not delete `poke_dex` until one release grace period (read fallback only).
3. **Achievements:** Map legacy IDs via §10 table into `poke_achievements` set union. Do not remove unmapped legacy IDs.
4. **Missing meta fields:** Initialize to §4.1 defaults (0, `[]`, `{}`, `false`).
5. **`poke_elite_wins`:** Copy to `campaignWins` if `campaignWins` absent.
6. **`achievementRewardsClaimed`:** Initialize `[]`. **Do not** retroactively grant credit payouts for pre-migration unlocks (avoid economy inflation) unless product explicitly opts in later.
7. **Active run:** Never mutate team names or album during migration.
8. **Single write path:** Never dual-write `poke_dex` and `game_album` on gameplay paths post-migration.
9. Set `saveVersion = 3` once all steps succeed.

### 17.2 Cloud `SYNC_KEYS` (v3 additions)

Add to `cloud-save.js` when cloud re-enabled:

```
game_album, game_album_meta, footballCredits, legendFragments,
unlockedLegends, achievementRewardsClaimed, unlockedCosmetics,
accountFlags, runCount, campaignWins, lastSettledRunId
```

Retain `poke_achievements` (achievement ID list). Deprecate `poke_dex` from sync after grace period.

### 17.3 Collection merge (cloud pull)

| Key | Merge rule |
|-----|------------|
| `game_album` | Per profileId: `max(local, remote)` treating 1 > 0 > absent |
| `legendFragments` | Per legendId: `max(local, remote)` while locked; union `unlockedLegends` |
| `achievementRewardsClaimed` | Set union |
| `footballCredits` | **Not summed** — primitive timestamp wins (full value replacement) |

---

## 18. Run Settlement Algorithm

Single entry point: `domain/meta.js` → `settleRun(runSnapshot, accountState, config) → { patch, summary }`.

Called from `game.js` on win screen and game over **before** `clearSavedRun()`. UI renders `summary`; save layer applies `patch`.

### 18.1 Inputs: `runSnapshot`

Built from `state` at end of run (immutable for this call):

```typescript
{
  runId: string,              // uuid generated at run start
  abandoned: boolean,         // true if quit-from-menu without normal end
  won: boolean,
  badgeCount: number,         // city stamps 0..8
  knockoutGatesCleared: number,
  reachedKnockout: boolean,
  reachedFinal: boolean,
  wonWorldCup: boolean,
  hostCityWins: number,
  knockoutGateWins: number,
  ledger: {
    seenProfileIds: number[],
    signedProfileIds: number[],      // includes duplicates in order
    duplicateSignProfileIds: number[], // subset already signed before this sign
    legendaryNodeVisits: { profileId: number, fragments: number }[],
    fragmentGrants: { legendId: number, amount: number, source: string }[]
  }
}
```

**Live seen marks:** `markAlbumSeen` may update `game_album` during run for UI; settlement reconciles `seenProfileIds` without downgrading signed → seen.

### 18.2 Calculation order

Execute strictly in order; each step reads account state as updated by prior steps in the **patch accumulator** (not mid-run live writes):

| Step | Action |
|------|--------|
| **0 — Dedupe guard** | If `account.lastSettledRunId === runSnapshot.runId`, return empty patch + prior summary (no-op). |
| **1 — Album updates** | For each `seenProfileIds`: set `0` if absent. For each `signedProfileIds`: if absent/`0`, set `1` (new sign). |
| **2 — Duplicate conversion** | For each `duplicateSignProfileIds`: add `duplicateCreditsByRarity[profile.rarity]` to credit total. Do not change album. |
| **3 — New entry credits** | For each first-time sign in step 1: add `credits.newAlbumEntry` (50). |
| **4 — Activity credits** | Add host city / gate / depth bonuses from run totals (not per-event double count with step 5). |
| **5 — Outcome band** | Map snapshot to `campaignOutcomeBands`; add band value via deterministic formula (badges + gates + win flag). |
| **6 — Album milestones** | Count signed entries; claim unclaimed thresholds (10/40/50); add milestone credits / tokens. |
| **7 — Fragment grants** | Apply ledger + milestone + achievement fragment grants; enforce per-run per-legend cap; run legend unlock check (≥20 → `unlockedLegends`). |
| **8 — Achievements** | Evaluate conditions; new unlocks → add IDs; apply rewards if ID ∉ `achievementRewardsClaimed`. |
| **9 — Account flags** | OR `reachedKnockout`, `reachedFinal`, `wonWorldCup` into `accountFlags`. |
| **10 — Counters** | `runCount += 1`; if `wonWorldCup`, `campaignWins += 1`. |
| **11 — Anti-exploit clamp** | Apply `maxCreditsPerRun`; if `abandoned`, multiply total credits by `abandonedRunPayoutMultiplier`. |
| **12 — Finalize** | Set `lastSettledRunId = runSnapshot.runId`; emit `patch` + human-readable `summary` for UI. |

### 18.3 Outputs: `summary` (UI)

```typescript
{
  creditsEarned: number,
  creditsBreakdown: { label: string, amount: number }[],
  newSigns: number[],
  duplicates: { profileId: number, credits: number }[],
  fragments: { legendId: number, amount: number }[],
  legendsUnlocked: number[],
  achievementsUnlocked: string[],
  milestonesClaimed: string[]
}
```

### 18.4 Persistence

`game.js` calls `save.applyAccountPatch(patch)` then `clearSavedRun()`. Optional cloud sync after patch applied.

---

## 19. Anti-Exploit Rules

| Rule | Enforcement |
|------|-------------|
| **One settlement per run** | `lastSettledRunId === runId` → no-op (§18 step 0). |
| **No duplicate double-pay** | Duplicate credits only from `duplicateSignProfileIds` once; signing same duplicate twice in ledger still one payout per profileId per settlement. |
| **Achievement rewards once** | Credit/fragment payout only if ID ∉ `achievementRewardsClaimed`; append on grant. |
| **Fragment cap** | Per run, per legendId: grants capped at `maxFragmentsPerRunPerLegend`; locked storage capped below 20 until unlock transaction. |
| **Credit cap** | Total credits per settlement ≤ `maxCreditsPerRun` (default 1500). |
| **Abandoned runs** | Quit/abandon path sets `abandoned: true` → 50% payout multiplier; still settles album seen/signed from ledger. |
| **Reload exploit** | `runId` generated at run start and stored in `poke_current_run`; settlement idempotent on same id. |
| **Migration safety** | v3 migration never adds credits or fragments — structure only. |

---

## 20. MVP Tuning Constants

Authoritative source: `js/data/football/meta_progression.json` (§4.7). Summary for designers:

### Credits

| Constant | Value |
|----------|-------|
| `hostCityWin` | 25 |
| `knockoutGateWin` | 50 |
| `reachKnockout` | 100 |
| `reachFinal` | 150 |
| `winWorldCup` | 300 |
| `newAlbumEntry` | 50 |
| `albumMilestone10` | 250 |

### Duplicate conversion

| Rarity | Credits |
|--------|---------|
| uncommon | 20 |
| rare | 40 |
| elite | 75 |
| legend | 250 |

### Fragments

| Constant | Value |
|----------|-------|
| `fragmentsPerLegend` | 20 |
| Legendary node | 3–5 |
| World Cup win grant | 5 |
| Album milestone | 5 |

### Account level thresholds

| Level | Flag |
|-------|------|
| 1 | `reachedKnockout` |
| 2 | `reachedFinal` |
| 3 | `wonWorldCup` |

### Campaign outcome bands

| Band | Min | Max |
|------|-----|-----|
| earlyExit | 50 | 150 |
| knockoutRun | 150 | 400 |
| finalist | 400 | 600 |
| worldCupChampion | 600 | 1000 |

### Anti-exploit defaults

| Constant | Value |
|----------|-------|
| `abandonedRunPayoutMultiplier` | 0.5 |
| `maxFragmentsPerRunPerLegend` | 5 |
| `maxCreditsPerRun` | 1500 |

---

## 21. Acceptance Criteria / Golden Tests

Implement as `tests/meta.settlement.golden.json` + runner (or manual QA checklist pre-React).

| # | Scenario | Expected |
|---|----------|----------|
| G1 | Failed run, 3 badges, before knockout | Outcome band `earlyExit`; credits ∈ [50,150]; `runCount` +1; settlement summary shown |
| G2 | Duplicate sign elite profileId 12 (Vinícius), already signed | +75 credits; album unchanged; listed in `duplicates` |
| G3 | First sign profileId 5 | `game_album["5"] === 1`; +50 new-entry credit; appears in `newSigns` |
| G4 | Account has 19 fragments for Pelé; grant +1 in settlement | `unlockedLegends` includes 42; fragments reset; `first_immortal` eligible |
| G5 | Achievement `scout_master` unlocked twice via replay | `achievementRewardsClaimed` contains ID once; credits awarded once |
| G6 | Run `migrateSaveV2toV3()` twice on same localStorage | `footballCredits`, `game_album`, `runCount` unchanged after second call; `saveVersion === 3` |
| G7 | Same `runId` settled twice | Second call no-op; credits unchanged |
| G8 | Abandoned run with full ledger | Total credits × 0.5; album updates still apply |
| G9 | 10th unique sign in settlement | Milestone `album_10` claimed once; +250 credits |
| G10 | Fragment grants exceed per-run cap | Additional grants clamped; no overflow past 20 unlock threshold without unlock transaction |

---

## 22. Implementation Module Recommendation

### 22.1 File layout

```
js/domain/
├── meta.js          # settleRun, duplicate credits, fragments, milestones, achievements
├── album.js         # getAlbum, markSeen, markSigned, countSigned, getEntryState
├── save.js          # migrateSaveV2toV3, applyAccountPatch, loadAccountState
└── profiles.js      # getProfile(id).rarity — duplicate tier lookup
```

### 22.2 `js/domain/meta.js` contract

**Pure functions (no DOM, no localStorage):**

- `settleRun(runSnapshot, accountState, config) → { patch, summary }`
- `computeDuplicateCredits(profileId, accountState, config) → number`
- `evaluateAchievements(accountState, runSnapshot, config) → { newUnlocks, rewardGrants }`
- `applyLegendFragmentGrant(accountState, legendId, amount, config) → fragmentPatch`
- `deriveAccountLevel(accountFlags) → 0|1|2|3`

**Dependencies:** `profiles.js`, loaded `meta_progression.json` as `config`.

**Side effects:** none inside pure functions. `game.js` / `save.js` owns persistence.

### 22.3 UI integration

- `ui.js` renders settlement modal from `summary` only.
- Title screen reads `loadAccountState()` for credits, album %, fragment progress.
- Achievement toasts show badge + credit/fragment line from `summary`.

### 22.4 Dependencies

| Dependency | Spec | Required for |
|------------|------|--------------|
| Domain layer + save v3 | 006B | Account blob, migration |
| Player catalog + rarity | 007 | Duplicate tiers, 50-slot album |
| Album UI (seen/signed/unknown) | 005, 006B | Collection loop UX |
| Run settlement screen | 005, 008 | P1 — every run matters |

---

## 23. Out of Scope (Explicit)

Not part of SPEC 008 MVP and must not be added while implementing this spec:

- Battle passes
- Daily quests / login calendars
- Energy / stamina gates for runs
- Timers on scouts or nodes
- Loot boxes / gacha pulls
- Paid currency or IAP hooks
