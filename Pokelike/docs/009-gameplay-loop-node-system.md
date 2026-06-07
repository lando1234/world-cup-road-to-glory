# SPEC 009 — Gameplay Loop & Node System

**Status:** Authoritative gameplay design — implements minute-to-minute campaign experience  
**Authority:** Extends [005-football-mvp-definition.md](./005-football-mvp-definition.md), [006B-technical-blueprint-revised.md](./006B-technical-blueprint-revised.md), [007-football-data-pack.md](./007-football-data-pack.md), [008-meta-progression.md](./008-meta-progression.md)  
**Patches merged:** [009C-gameplay-patch.md](./009C-gameplay-patch.md) (v0.2)  
**Version:** v0.2  
**Date:** 2026-06-06  
**Scope:** Gameplay loop and node system only — no code, no meta-economy redesign beyond in-run ledger hooks defined in §8

---

## Revision summary

| Dimension | Prior specs | SPEC 009 locks |
|-----------|-------------|----------------|
| Campaign arc | 005 §5, 007 §7 | 35–40 min median; 45 min ceiling |
| Nodes | 001 `NODE_TYPES`, 002 §3 | Football catalog + weights + handlers |
| Scouting | 007 §6 | Stage pools, elite guarantee, late-map boost |
| Recruitment | Pokelike catch | **Contract Offer** (pick 1 of 3, no capture RNG) |
| Legends | 008 §8 | **Fragment Discovery** default; Contract Offer when unlocked |
| In-run economy | 008 account credits | **Run Budget earn-only** → partial settlement conversion |
| Training | 006B form level | Training Camp nodes + battle gains |
| Bosses | 007 §7–8 | Host city + knockout progression tables |
| Difficulty | 007 §13 | First-run targets, win rates, loss locations |

**Out of scope for this spec:** Continental Champions Cup, Injury List mode, trade node, gold cards, branching evolution, cloud save UX, React migration.

---

## 0. Locked compatibility checklist

These decisions from prior specs **must not change** in implementation of SPEC 009:

| Source | Locked value |
|--------|--------------|
| 006B L11 | Starters: **Mbappé (1), Messi (2), Van Dijk (3)** |
| 007 §1 | **50-player** album roster (profileIds 1–50) |
| 006B L4 | **Form level + skill tier** only — no identity rename on threshold |
| 007 §7 | Host cities: São Paulo → Berlin → Tokyo → Madrid → Milan → Amsterdam → Mexico City → London |
| 007 §8 | Knockout: Uruguay 1950 → Brazil 1970 → Argentina 1986 → France 1998 → Argentina 2022 |
| 008 §5 | Account **Football Credits** accumulate only at settlement — never spent mid-account in MVP |
| 006B L19 | Trade node weight **0**; Silver node **disabled** (Modern Era only) |
| 006B L5 | One `profileId` per person — Messi is always profileId **2** |

---

## 1. Core Campaign Loop

### 1.1 Player journey (single run)

```
Title Screen
    ↓
Choose Manager (cosmetic — boy/girl)
    ↓
Marquee Signing — pick 1 of 3 starters (Mbappé / Messi / Van Dijk)
    ↓
┌─ HOST CITY LEG × 8 ──────────────────────────────────────────────┐
│  Arrival (start node) → navigate branching map                      │
│      ├── Friendly Match / Training Camp → form growth               │
│      ├── Scout Report → Contract Offer (sign 1 of 3)              │
│      ├── Gear Crate → pick 1 held/consumable item                   │
│      ├── Rival National Team / Federation Challenge → harder duel   │
│      ├── Recovery Center → full squad heal                          │
│      ├── Specialist Coach → skill tier +1 (one player)              │
│      ├── Named World Cup events (6 MVP pool)                        │
│      └── World Cup Legend node (map 5+, rare) → Fragment Discovery  │
│      ↓                                                              │
│  Host City Challenge (required boss) → City Stamp + Run Budget bonus  │
└─────────────────────────────────────────────────────────────────────┘
    ↓ (8 City Stamps)
Knockout Draw Ceremony (transition screen)
    ↓
Matchday Squad Selection (reorder squad, use consumables, preview opponent)
    ↓
Knockout Gate 0 — Uruguay 1950 (Round of 16)
    ↓ prep → Gate 1 — Brazil 1970 (Quarter-final)
    ↓ prep → Gate 2 — Argentina 1986 (Semi-final)
    ↓ prep → Gate 3 — France 1998 (Final)
    ↓ prep → Gate 4 — Argentina 2022 (Trophy lift)
    ↓
┌─ OUTCOME ───────────────────────────────────────────────────────────┐
│  WIN  → World Cup Lifted → Settlement → Trophy Room / Album       │
│  LOSE → Campaign Over → Settlement (partial rewards) → Retry        │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Expected campaign duration

| Segment | Target time | Cumulative |
|---------|-------------|------------|
| Title → Marquee → Map 0 start | 1–2 min | ~2 min |
| Maps 0–2 (3 host legs) | 8–12 min | ~14 min |
| Maps 3–5 | 10–14 min | ~28 min |
| Maps 6–7 | 6–10 min | ~38 min |
| Knockout (5 gates + prep) | 8–12 min | **35–45 min total** |

**Pacing assumption:** Auto-skip enabled after first battle of run (005 §7).

**Duration targets (009C):**

- **North star:** 35–40 min median with auto-skip
- **Ceiling:** 45 min
- **First run:** may reach 50 min with animations and event reading

### 1.3 What the player does every minute

| Minute band | Primary activity | Decisions |
|-------------|------------------|-----------|
| 0–5 | Learn triangle, first scout, first friendly | Marquee choice, 1–2 map paths, first Contract Offer |
| 5–15 | Build squad to 3–4, first stamp | Path (scout vs heal vs fight), swap if full, item equip |
| 15–28 | Style composition, stamps 2–5 | Federation optional fights, named events, specialist target |
| 28–38 | Peak power, stamps 6–8 | Legend fragment path vs safe heal route, consumable hoard for knockout |
| 38–45 | Knockout gauntlet | Squad order, consumables, which gate to spend items on |

### 1.4 Run end conditions

| End state | Trigger |
|-----------|---------|
| **Campaign loss** | All squad members at 0 stamina with no consumable recovery possible mid-fight chain |
| **Campaign win** | Victory at Knockout Gate 4 (Argentina 2022) |
| **Abandoned run** | Player quits from menu — settlement at 50% payout per 008 §19 |

---

## 2. Run Structure

### 2.1 Map topology (engine-aligned)

Each **Host City Leg** uses `generateMap(mapIndex)` unchanged:

| Property | Value | Source |
|----------|-------|--------|
| Maps per campaign | **8** | `mapIndex` 0–7 |
| Layers per map | **9** (start + 2 fixed + 6 content + boss) | `map.js` `CONTENT_SIZES` |
| Content layers | 6 (sizes `[3,4,3,4,3,2]`) | `map.js` |
| Edges | DAG — each node connects to 2 nearest below | `makeLayerEdges` |
| Forced Recovery Center | Last content layer always includes one `pokecenter` | `map.js` L155–157 |
| Boss layer | Single **Host City Challenge** node (required) | `NODE_TYPES.BOSS` |

**Knockout stage:** No map graph — linear chain of 5 prep + battle pairs (`eliteIndex` 0–4).

### 2.2 Nodes per map (typical)

| Layer group | Node count (typical) | Notes |
|-------------|----------------------|-------|
| Start | 1 | Auto-advance on arrival |
| L1 (fixed) | 2 | L1 always includes **Scout Report** slot; second slot battle or scout |
| L2–L7 (content) | 18–20 total across 6 layers | Weighted random types |
| Boss | 1 | Host City Challenge |
| **Total clickable per map** | **~21–23** | Player visits **~8–12** per map (one path through DAG) |

### 2.3 Average run length (targets)

| Metric | Target | Acceptable range |
|--------|--------|------------------|
| **Map nodes visited** | 72 | 65–85 |
| **Highlight duels (all fights)** | 28–35 | Includes friendlies, trainers, bosses, knockout |
| **Scout Reports / Contract Offers** | **8–10** | 7–11 |
| **Contract signings (unique players)** | **7–10** | Excludes duplicate offers declined |
| **Recovery Center visits** | 6–8 | One forced per map minimum |
| **Legendary node encounters** | 0–1 | Not guaranteed run 1 |
| **Host City Challenges** | 8 | Required |
| **Knockout gates** | 5 | Required after 8 stamps |

### 2.4 Pacing philosophy

1. **Maps 0–1:** High scout weight, elite guarantee on first Map 1–2 scout — teach Contract Offer loop.
2. **Maps 2–4:** Federation Challenges, gear decisions — squad reaches 4–6.
3. **Maps 5–7:** Legendary nodes unlock, **1.15× scout weight** — last collection push before knockout.
4. **Knockout:** No scouting — pure squad test + prep consumables.

**Map 0 first-run script (005 §6):** Second node on path forced **Scout Report** with pool `{12, 15, 17}` (Pedri, Ramos, Alisson) — implemented via `mapIndex === 0 && node.layer === 1` override replacing Gen1 grass/water guarantee.

---

## 3. Node Taxonomy

### 3.1 Master catalog

Engine key → football node. Weights reference `NODE_WEIGHTS` layers L1–L6 (content layers 0–5) unless overridden.

| Football node | Engine `type` | Purpose | Base weight (L1→L6) | Player decision | Rewards | Risks |
|---------------|---------------|---------|---------------------|-----------------|--------|-------|
| **Arrival** | `start` | Map entry | Fixed | None — continue | None | None |
| **Scout Report** | `catch` | Primary recruitment | L1:30, L2:20, L3:16, L4:14, L5:14, L6:13‡ | Pick 1 of 3 or skip | New squad member; album seen/sign; ledger entry | Opportunity cost vs heal/fight path |
| **Friendly Match** | `battle` | Basic combat + form | L1:25, L2:20, L3:16, L4:13, L5:13, L6:20 | Fight or skip (if allowed) | +1 Form Lv.; +5 Run Budget | Stamina loss; possible loss |
| **Training Camp** | `training_camp`* | Form-focused sparring | L3:4, L4:4, L5:5, L6:6† | Accept drill | +2 Form Lv.; +2 Run Budget; easier opponent | Stamina loss; time vs scout |
| **Recovery Center** | `pokecenter` | Full heal | Forced L6 + 0 random | Use or skip path | Full stamina all players | Skip = enter boss damaged |
| **Gear Crate** | `item` | Item pickup | L1:15, L2:15, L3:12, L4:10, L5:8, L6:14 | Pick 1 of 3 items | Held item or consumable | Opportunity cost |
| **Rival National Team** | `trainer` | Harder duel | L1:30, L2:30, L3:27, L4:27, L5:27, L6:18 | Fight | +2 Form Lv.; +10 Run Budget | Higher loss risk |
| **Federation Challenge** | `trainer`* | Optional mini-boss | L4:5, L5:6, L6:4† | Fight optional path | +2 Form Lv.; +15 Run Budget; guaranteed gear drop | Heavy stamina cost |
| **Specialist Coach** | `move_tutor` | Skill tier up | L3:9, L4:8, L5:8 | Pick one squad member | Skill tier +1 (max III) | Which player to invest in |
| **World Cup Legend** | `legendary` | Legend encounter | 0 until map≥5 then **2** | Fragment Discovery or Contract Offer† | 3–5 fragments (locked) or squad sign (unlocked) | Pathing vs heal route |
| **Mystery Event** | `question` | Random roll | L2:10, L3:13, L4:13, L5:18, L6:9 | Accept | Resolves to sub-event | Unpredictable |
| **Named World Cup Event** | `question`→event | Cultural risk/reward | Sub-roll 0.65–1.00 of question | Choose A or B | Per event (§3.2, §16.2) | Per event |
| **Host City Challenge** | `boss` | Required boss | Fixed boss layer | Must fight | City Stamp; +2 Form Lv.; +25 Run Budget | Loss ends run |

\* New football node types implemented as engine type + `node.meta.footballKind` **or** dedicated type string with handler registration in `game-core/run/node-handlers.ts` (future) / `game.js` (MVP).

† **Legend unlock state:** If `profileId ∉ unlockedLegends` → Fragment Discovery only (008 §8). If unlocked → Contract Offer (§5.6).

‡ On `mapIndex >= 5`, apply **1.15×** multiplier to `catch` weight after layer roll.

**Removed from MVP:** `transfer_market` (weight **0** all layers). Post-MVP expansion only.

**Disabled in MVP:** `trade` (0), `silver` (Gen2 only, not generated in Modern Era MVP).

### 3.2 Question node resolution (football)

Replace `resolveQuestionMark()` football branch (`domain/events.js`):

| Roll | Result | Football label |
|------|--------|----------------|
| 0.00–0.22 | `battle` | Friendly Match (hidden until reveal) |
| 0.22–0.42 | `trainer` | Rival National Team |
| 0.42–0.52 | `catch` | Scout Report surprise |
| 0.52–0.65 | `item` | Gear Crate |
| 0.65–1.00 | `named_event` | Random pick from **6-event MVP pool** (§16.2) |

Shiny/mega rolls **removed** for MVP (006B L19).

### 3.3 Node data shape

```typescript
interface MapNodeFootballMeta {
  footballKind?: 'training_camp' | 'federation_challenge' | 'named_event'
  hostCityLabel?: string       // "São Paulo Leg"
  eventId?: string             // key into node_events.json (MVP pool §16.2)
}
```

Stored on `MapNode` as `meta` field — optional for MVP; `type` alone sufficient for core nodes.

### 3.4 Appearance rate summary (per content layer slot)

Approximate chance a random content slot is each type (Modern Era, map 3, after weight normalization):

| Node | ~Rate |
|------|-------|
| Rival National Team | 22% |
| Friendly Match | 14% |
| Scout Report | **~15%** (maps 5–7 higher via 1.15× gate) |
| Mystery / Named Event | 11% |
| Gear Crate | 9% |
| Specialist Coach | 7% |
| Training Camp | 6% |
| Federation Challenge | 5% |
| Recovery Center | forced 1/map |
| World Cup Legend | +2 weight maps 5+ (≈2% of rolls) |

---

## 4. Scouting System

### 4.1 Discovery flow

```
Player clicks Scout Report node
    ↓
domain/scout.buildReport(mapIndex, runState, config)
    ↓
Roll 3 profileIds from stage pool (weighted, no duplicates)
    ↓
Create instances at node form level (getLevelForNode)
    ↓
UI: "Scout Report — 3 players available"
    ↓
markAlbumSeen for each displayed profileId (008 live seen)
    ↓
Player selects one → Contract Offer flow (§5) or Skip
```

### 4.2 Scout report presentation

| UI element | Content |
|------------|---------|
| Title | **Scout Report** |
| Subtitle | `{Host City} — {date flavor}` |
| Cards | 3 player cards: portrait, name, nation, position, styles, rarity border, form level |
| Core Six hint | Style triangle tooltip (collapsible) |
| Duplicate hint | If album signed: "Already in album — duplicate converts to credits at end" |
| Actions | Select player / **Pass on report** (skip) |

### 4.3 Choice count

| Node type | Choices |
|-----------|---------|
| Scout Report | **3** (always pad to 3 from pool) |
| World Cup Legend (locked) | **1–2** (fragment discovery among offered legends) |
| World Cup Legend (unlocked) | **1** (Contract Offer sign) |

Reroll: **Not in MVP campaign** (Battle Tower only in legacy engine). Post-MVP only: spend Run Budget to reroll one scout slot once per report.

### 4.4 Rarity weighting

Uses `player_profiles.json` `rarity` + stage pools from [007 §6.2](./007-football-data-pack.md).

**Weight multipliers by map band:**

| Map band | uncommon | rare | elite | legend |
|----------|----------|------|-------|--------|
| 0–1 | 1.4× | 1.2× | **0.6×** | 0× |
| 2–4 | 1.0× | 1.0× | 1.0× | 0× |
| 5–7 | 0.8× | 1.0× | 1.2× | 0× (legend nodes separate) |

**Exclusion rules:**

- Starters `{1,2,3}` never in pool
- Knockout-only `{37,38,39,41}` not in scout pool
- Legends `{42,43,46,47,50}` legend nodes only (50 gated account level 3 per 008 §11)
- Max **1 Brazil** player per report (007 §14 nation cap)

**First scout override (Map 0):** forced pool `{12, 15, 17}` — Pedri, Ramos, Alisson.

### 4.5 Duplicates in scouting

| Album state | On sign during run | Album | Meta |
|-------------|-------------------|-------|------|
| Unknown / seen | First sign | → signed (`1`) | +50 credits at settlement |
| Already signed | Duplicate sign | unchanged | Duplicate credit tier at settlement (008 §7) |

Scout report still **shows** owned players — player may take duplicate intentionally for credit farming (discouraged by low duplicate payouts vs opportunity cost).

### 4.6 Scouting scale through run

| Map | Pool character | Typical offer level |
|-----|----------------|---------------------|
| 0 | Safe rares, no elites | Form 4–8 |
| 1–2 | **Guaranteed elite** in first scout + 0.6× elite weight | Form 10–18 |
| 3–4 | Full elite pool (Haaland, Modrić, Salah…) | Form 22–34 |
| 5–7 | Full elite pool + host heroes | Form 38–52 |
| Legendary node | Fragment Discovery or Contract Offer | Form node level +5 |

Form level on offer uses `getLevelForNode(node)` capped by `MAP_LEVEL_RANGES[mapIndex]`.

### 4.7 Guaranteed Elite Appearance (009C Patch 3)

On the **first Scout Report** encountered on **Map 1 or Map 2** (whichever comes first):

1. Force **slot 1** (index 0) to one elite from the early elite pool.
2. Remaining two slots roll normally from stage pool.
3. Set `runState.flags.eliteGuaranteeUsed = true` — **once per run**.

**Early elite pool:**

| Marquee starter | Prefer profileIds |
|-----------------|-------------------|
| Mbappé (1) | `{6, 8, 9}` — Modrić, De Bruyne, Rodri |
| Messi (2) | `{4, 7, 13}` — Haaland, Salah, Kane |
| Van Dijk (3) | `{6, 9, 14}` — Modrić, Rodri, Kanté |
| Default fallback | `{4, 6, 7, 8, 13}` |

Pick uniformly from prefer list after filters; else default pool. Legends and starters remain excluded. Brazil cap still applies.

---

## 5. Recruitment System

### 5.1 System choice: **Contract Offer**

**Selected mechanism:** **Contract Offer** — not capture RNG, not multi-step negotiation minigame.

| Alternative | Rejected because |
|-------------|------------------|
| Transfer Negotiation | Multi-step UI; feels like FM not roguelite |
| Signing Opportunity | Vague; same mechanics needed underneath |
| Capture / bid RNG | Not football; adds frustration |

**Contract Offer** maps 1:1 to engine `doCatchNode` → pick 1 of 3 → add to squad. Thematic rename only; no new probability system.

### 5.2 Fantasy framing

> Your scouting department presents three shortlisted players. You may offer a **match-day contract** to exactly one — immediate squad registration for this tournament run.

### 5.3 UX flow

```
Scout Report screen
    ↓
Player taps card → Confirmation modal:
    "Offer contract to {Name}?"
    [Playing style chips] [Rarity border]
    Duplicate warning if applicable
    ↓
Accept → Contract Offer animation (stamp + handshake, 1.2s)
    ↓
If squad < 6 → add to squad
If squad = 6 → Squad Registration screen (swap one out or decline)
    ↓
Album mark signed; run ledger append signedProfileId
Advance map node
```

**Skip label:** "Pass on report" (not "Run away").

### 5.4 Probabilities

| Event | Probability |
|-------|-------------|
| Any given scout pool member appears in report | Weighted by stage table (§4.4) — not uniform |
| Player accepts (you pick them) | **100%** — no reject roll |
| Legendary Contract Offer (unlocked) | **100%** on sign |
| Legendary Fragment Discovery (locked) | **100%** fragment grant on confirm — no squad add |

No hidden capture rate. Excitement comes from **who appears**, not whether they sign.

### 5.5 Outcomes

| Outcome | Squad | Album | Run ledger |
|---------|-------|-------|------------|
| Sign new player | +1 member (or swap) | `0→1` or seen→signed | `signedProfileIds` |
| Sign duplicate | swap or bench reject | unchanged | `duplicateSignProfileIds` |
| Pass on report | unchanged | seen only (already marked) | none |
| Squad full + decline swap | unchanged | seen if new profile | none |

### 5.6 World Cup Legend recruitment (009C Patch 1)

Legendary Node outcome depends on **meta unlock state** (`unlockedLegends` per 008 §8):

```
Legendary Node
    → Player selects target legend (1-of-2 or 1-of-1 offer)
    → Grant 3–5 fragments to run ledger (008 antiExploit cap: max 5 per legend per run)
    → If legend NOT in unlockedLegends: NO squad add, NO album sign
    → At 20 fragments (account): legend added to unlockedLegends (008 §8)
    → Future Legendary Nodes OR Scout Reports (when design permits): Contract Offer available
```

**Node behavior by unlock state:**

| `unlockedLegends` | Outcome | UI title |
|-------------------|---------|----------|
| Legend **locked** | **Fragment Discovery** — pick among 1–2 offered legends; gain **3–5 fragments** for chosen `profileId` (42, 43, 46, 47, 50). No Contract Offer. | *"Legendary Scouting — Fragment Discovery"* |
| Legend **unlocked** | **Contract Offer** — 1-of-1 sign to squad via standard recruitment flow. Duplicate → settlement credits per 008 §7. | *"Legendary Scouting — Contract Offer"* |

**Eligible legends:** profileIds **42, 43, 46, 47, 50** per 008 §8. Cristiano Ronaldo (50) still requires account level 3 gate per 008 §11 / 007 §6.2.

**Pool at node (map 5+):** Roll 1–2 locked legends not yet at fragment cap this run; exclude legends already in squad. Default pool `{46, 47, 42, 43}`; add 50 when meta unlock allows.

**Knockout bosses (Pelé, Maradona, etc.):** Unchanged — **fighting** a legend ≠ **owning** a legend. Boss encounters do not grant album sign or bypass fragment unlock.

**Locked path UX:**

- Single or dual legend cards with foil frame and fragment reward preview (`+3` to `+5`)
- On confirm: append `{ profileId, fragments: randomInt(3,5) }` to `runSnapshot.ledger.legendaryNodeVisits`; call `markAlbumSeen(profileId)` only
- Fragment pip animation on HUD (§14.3)

**Unlocked path UX:**

- Single card, legend foil frame
- Copy: *"Legendary scouting opportunity — {Pelé}"*
- Standard Contract Offer flow; `markAlbumSigned` on successful sign
- Still subject to squad size / swap rules

---

## 6. Team Building Loop

### 6.1 Squad size

| Rule | Value |
|------|-------|
| Maximum squad | **6** players (hard cap, engine) |
| Starting squad | **1** (marquee signing) |
| Typical end of Map 3 | 4 players |
| Typical entering knockout | **6** players |
| Bench | **None** — all 6 are active duel rotation |

### 6.2 Battle rotation (1v1 sequential)

Auto-battle uses **first alive** player in squad order. Player sets order on:

- Matchday Squad Selection (knockout prep)
- Optional reorder button on map HUD (same data structure)

**No separate bench slot** — order = priority.

### 6.3 Replacement decisions

When squad at 6 and signing occurs:

**Squad Registration screen** (swap-screen reskin):

| Option | Result |
|--------|--------|
| Release {player} to sign incoming | Incoming replaces released; released player gone for run |
| Decline contract | Incoming unsigned; node completed without add |

Show style synergy delta preview if 3+ same style would trigger (informational only in campaign — traits hidden MVP).

### 6.4 Duplicate handling during run

| Situation | Behavior |
|-----------|----------|
| Scout offers Messi, Messi already in squad | Allow sign → triggers swap screen; if same profileId, treat as **duplicate sign** for settlement |
| Same profileId impossible in squad | Engine prevents two identical profileIds on squad — swap required |
| Same player different form level | N/A MVP — identity fixed per 006B |

### 6.5 Roster management decisions (player-facing)

| Decision | When | Skill expression |
|----------|------|------------------|
| Who to sign | Every scout report | Style coverage, rarity, duplicate credits |
| Who to release | Squad full | Protect marquee vs upgrade bench |
| Squad order | Before knockout gates | Matchup vs boss primary style |
| Item equip | After gear crates | Held item on carry or support |
| Specialist coach target | move_tutor node | Invest in marquee vs new signing |
| Consumable use | Prep screen | Save for final vs spend now |

---

## 7. Training & Form Growth

### 7.1 Form level (primary power)

Per 006B — **identity fixed**, stats scale via `applyLevelGain` / `getEffectiveStat`.

| Event | Form gain | Engine hook |
|-------|-----------|-------------|
| Friendly Match win | +1 | `getLevelGain` wild=true override |
| Training Camp win | **+2** | `doTrainingCampNode` → custom gain |
| Rival / Federation win | +2 | trainer battle |
| Host City Challenge win | +2 | boss battle |
| Knockout gate win | +2 | elite battle |

**No evolution rename** — toast at L16/L32 optional: *"{Name} hits peak form"* (cosmetic).

### 7.2 Training Camp node

| Property | Value |
|----------|-------|
| Opponent | Auto-generated "Reserve XI" at **−15%** stats vs map band |
| Duel label | Training Camp Scrimmage |
| Win | +2 Form Lv., +2 Run Budget |
| Loss | +0 form (still advance node) — training shouldn't hard-fail run |
| Skip | Not allowed once entered |

Implementation: `doTrainingCampNode` wraps battle with `enemyStatMultiplier: 0.85`, `levelGain: 2`, `lossAllowed: true`.

### 7.3 Specialist Coach (skill tier)

| Property | Value |
|----------|-------|
| Engine type | `move_tutor` |
| Effect | `moveTier + 1` on selected player (max 2 = Skill III) |
| Frequency | ~7% of content nodes maps 3+ |
| UI | Pick one squad card → skill bar animates I→II or II→III |

### 7.4 Player improvement summary

| Mechanism | Permanent across run? | Cross-run? |
|-----------|----------------------|------------|
| Form level | Yes (this run) | No |
| Skill tier | Yes (this run) | No |
| Held items | Yes (this run) | No |
| Consumables | Yes (this run) | No |
| Legacy stat buffs | No (CCC disabled) | Would be yes post-MVP |

**No evolution system. No permanent stat upgrades within run beyond form + gear.**

---

## 8. Economy Inside A Run

### 8.1 Two-layer currency model

| Currency | Scope | Spent during run? | Persists? |
|----------|-------|-------------------|-----------|
| **Run Budget** | Current campaign | **No (MVP)** — earn-only | No — converts at settlement |
| **Football Credits** | Account meta | **No** (MVP) | Yes — 008 |

Run Budget is **earn-only** in MVP (009C Patch 2). No spend sinks; settlement still converts unspent budget to bonus Football Credits.

### 8.2 Run Budget

**Storage:** `state.runBudget` (integer ≥ 0) in `poke_current_run`.

**Earned during run:**

| Source | Run Budget |
|--------|------------|
| Friendly Match win | +5 |
| Training Camp win | +2 |
| Rival National Team win | +10 |
| Federation Challenge win | +15 |
| Host City Challenge win | +25 |
| Knockout gate win | +20 |
| Named events (see §16.2) | Per event — e.g. `maracanazo_echo` +20, `waka_waka_boost` +10 |

**Spent during run (MVP):** **None.** `runBudgetSpent` remains **0** for MVP runs.

**Post-MVP spend sinks (not shipped):** Transfer Market signing, scout reroll.

### 8.3 Settlement conversion

At `settleRun()` (008 §18), add to run snapshot:

```typescript
runSnapshot.ledger.runBudgetEarned: number
runSnapshot.ledger.runBudgetSpent: number
runSnapshot.ledger.runBudgetUnspent: number
```

**Conversion rule:** `floor(unspent × 0.5)` Run Budget → bonus Football Credits (max +50 per run). Activity credits from 008 still apply separately — no double-counting host city wins.

### 8.4 Post-MVP economy expansions

**Transfer Market** and scout reroll spend are **post-MVP only** — not generated, not implemented in MVP. See 009C Patch 2 audit trail.

### 8.5 Reroll pricing (optional post-MVP)

Not shipped MVP. Document for future: 15 Run Budget rerolls one scout slot once per report.

---

## 9. Host City Progression

### 9.1 Progression table

Expected **player** power entering each boss (first-run median playtest targets):

| mapIndex | Host City | Boss label | Enemy form band | Expected squad form (avg) | Expected squad size | Expected styles | Boss win rate target |
|----------|-----------|------------|-----------------|---------------------------|----------------------|-----------------|----------------------|
| 0 | São Paulo | Brazil Federation Challenge | 12–16 | 8–12 | 2 | Any + triangle | **85%+** |
| 1 | Berlin | Germany Federation Challenge | 18–22 | 14–18 | 2–3 | 1–2 styles | 80% |
| 2 | Tokyo | Japan Federation Challenge | 22–27 | 18–24 | 3–4 | 2 styles | 75% |
| 3 | Madrid | Spain Federation Challenge | 28–34 | 24–30 | 4 | 2–3 styles | 70% |
| 4 | Milan | Italy Federation Challenge | 36–44 | 30–38 | 4–5 | 3 styles | 65% |
| 5 | Amsterdam | Netherlands Federation Challenge | 40–46 | 36–42 | 5 | 3 styles | 60% |
| 6 | Mexico City | Mexico Federation Challenge | 48–54 | 42–48 | 5–6 | 3–4 styles | 55% |
| 7 | London | England Federation Challenge | 52–60 | 48–55 | **6** | 4 styles | 50% |

Data source: [007 §7](./007-football-data-pack.md) boss rosters + [007 §13](./007-football-data-pack.md) balance notes.

### 9.2 Squad quality expectations

| Checkpoint | Marquee form | Supporting cast | Items typical |
|------------|--------------|-----------------|---------------|
| After Map 0 | 12–16 | 1 signing form 6–10 | 0–1 |
| After Map 3 | 28–34 | 3 players 22–30 | 2–3 held/consumable |
| After Map 7 | 50–58 | full six 45–55 | 4–6 items used/saved |
| Enter knockout | 52–60 avg | six players | consumables saved for gates 2–4 |

### 9.3 Difficulty telegraph

Prep-adjacent HUD on map before boss:

- Federation primary style chip
- Recommended counter from Core Six
- Enemy anchor player name (host hero from 007)

### 9.4 Mid-run reward pacing (009C Patch 6)

Host city progression is the macro arc; **micro dopamine** comes from scouts, stamps, fragments, and pending-credit feedback during the run — not only at settlement. See §14.3 for HUD toasts and pending-credits estimate (supports 008 P1: every run matters mid-run).

---

## 10. Knockout Progression

### 10.1 Transition

When `state.badges === 8`:

1. Block map navigation
2. **Knockout Draw Ceremony** screen (transition-screen reskin) — 3s skippable
3. Set `state.eliteIndex = 0`
4. Show **Matchday Squad Selection** (elite-prep-screen)
5. Load knockout team from `knockout_teams.json` gate 0

No scouting nodes during knockout.

### 10.2 Gate progression table

| Gate | eliteIndex | Historical team | Signature | Enemy form | Player squad target (avg form) | Player win rate (1st run) |
|------|------------|-----------------|-----------|------------|-------------------------------|---------------------------|
| 0 | 0 | Uruguay 1950 | Ghiggia (41) | 38–44 | 50–54 | **70%** |
| 1 | 1 | Brazil 1970 | Pelé (42) | 45–52 | 54–58 | **55%** |
| 2 | 2 | Argentina 1986 | Maradona (43) | 52–58 | 58–62 | **40%** |
| 3 | 3 | France 1998 | Zidane (44) | 60–66 | 60–65 | **30%** |
| 4 | 4 | Argentina 2022 | Messi (2) | 65–72 | 62–68 | **20%** (15–25% overall win) |

**First-run campaign win:** 15–25% (005 §7). Gate 4 ends most runs.

### 10.3 Prep screen between gates

| Element | Behavior |
|---------|----------|
| Squad reorder | Drag-drop 6 slots |
| Consumables | Apply to player before fight |
| Opponent preview | Historical team name, kit colors, primary/secondary style, signature player |
| Counter hint | Core Six suggestion |
| Continue | Start highlight duel |

### 10.4 Knockout loss / win

| Result | Next |
|--------|------|
| Loss at gate N | Game over → settlement |
| Win gate 4 | World Cup Lifted → settlement → Trophy Room |

---

## 11. Risk / Reward Systems

### 11.1 Design rules

- **One decision per tension** — no nested modals
- **Visible tradeoffs** — show what you gain vs lose before confirm
- **No run-ending RNG** outside combat (events never wipe squad)

### 11.2 Choice catalog

| Choice | Risk | Reward |
|--------|------|--------|
| Scout path vs Recovery path | Damaged squad enters boss | Full stamina vs new signing |
| Federation Challenge detour | Extra stamina loss | +15 Run Budget + gear |
| Specialist on marquee vs depth | Power concentrated | Better carry vs wide coverage |
| **Hand of God** | Marquee −15% stamina | Marquee +1 Form Lv.; next duel shows opponent style weakness |
| **Maracanazo Echo** | Next Host City Challenge: enemy +5% power | +20 Run Budget |
| **Vuvuzela Storm** | All players −5% stamina | Next friendly: enemy −10% power |
| **Waka Waka Boost** | None | +10 Run Budget; brief morale toast |
| **Penalty Shootout Legacy** | Refuse: −10 Run Budget | Grant consumable **Nerve of Steel** |
| **Extra Time Drama** | If squad healthy: +5 Run Budget instead of form boost | If ≤4 players below 50% stamina: those players +2 Form Lv. |
| Legend node vs heal route | Legend slot vs safety | 3–5 fragments (locked) or squad sign (unlocked) |
| Hoard consumables vs use | Lose earlier | Win later gate |
| Duplicate sign for credits | Squad slot opportunity | +75 elite duplicate credits at settlement |

### 11.3 Fragment vs safety

Legend nodes appear on map 5+ branches parallel to Recovery Center routes:

- **Safe route:** Recovery → Friendly → Boss
- **Risk route:** Legend node (stamina cost to reach) → weaker heal → Boss

**Locked legends:** Fragments (3–5) apply on **Fragment Discovery** confirm — no sign required. Passing legend node without choosing still costs path time.

**Unlocked legends:** Contract Offer adds player to squad; duplicate settlement per 008 §7.

---

## 12. Difficulty Curve

### 12.1 First-run targets

| Metric | Target |
|--------|--------|
| Reach Map 3 | **90%+** players |
| Earn first City Stamp | **85%+** |
| Reach knockout (8 stamps) | **70%+** |
| Reach Gate 2 (Argentina 1986) | **45%+** |
| Win World Cup | **15–25%** |

### 12.2 Expected loss locations (first run distribution)

| Loss zone | Share of losses |
|-----------|-----------------|
| Maps 0–2 | **<15%** |
| Maps 3–5 | **25–30%** |
| Maps 6–7 | **20–25%** |
| Knockout Gates 0–1 | **15–20%** |
| Knockout Gates 2–3 | **15–20%** |
| Gate 4 (final) | **10–15%** of all runs (includes wins) |

### 12.3 Desired success rates (tuning knobs)

| Fight type | Target win rate |
|------------|-----------------|
| Map 0 Friendly | 95% |
| Map 0 Boss | 85% |
| Map 4 Boss | 65% |
| Map 7 Boss | 50% |
| Knockout Gate 0 | 70% |
| Knockout Gate 4 | 20% (player) |

**Tuning levers (data-only):** enemy form levels in `host_city_bosses.json` / `knockout_teams.json`, `MAP_LEVEL_RANGES`, Training Camp frequency.

---

## 13. Mapping From Pokelike

| Pokelike | Football (SPEC 009) | Engine `type` | Notes |
|----------|----------------------|---------------|-------|
| Wild encounter | Scout Report | `catch` | 3 choices |
| Catch / ball RNG | Contract Offer | `catch` handler | 100% sign on pick |
| Pokémon battle | Friendly Match | `battle` | +1 form |
| — | Training Camp | `training_camp` | +2 form; easier fight |
| Trainer battle | Rival National Team | `trainer` | +2 form |
| — | Federation Challenge | `trainer` + meta | Optional mini-boss |
| Gym Leader | Host City Challenge | `boss` | City Stamp |
| Elite Four | Knockout Stage gates | elite chain | 5 historical teams |
| Champion | Trophy lift (Argentina 2022) | elite index 4 | |
| Pokécenter | Recovery Center | `pokecenter` | Full heal |
| Item pickup | Gear Crate | `item` | Pick 1 of 3 |
| Move Tutor | Specialist Coach | `move_tutor` | Skill tier +1 |
| Trade node | *(disabled MVP)* | `trade` weight 0 | |
| Legendary encounter | World Cup Legend node | `legendary` | Fragment Discovery (locked) or Contract Offer (unlocked) |
| Question mark | Mystery / Named World Cup Event | `question` → `named_event` | 6-event MVP pool (§16.2) |
| Shiny encounter | *(post-MVP gold card)* | — | Removed |
| Evolution | Peak form toast only | bypassed | Form level scales stats |
| Pokédex | World Cup Album | `game_album` | 50 slots |
| Badge | City Stamp | `state.badges` | 8 required |
| Hall of Fame | Trophy Room | settlement | |
| Money / items | Run Budget + Football Credits | `runBudget` / account | Run Budget earn-only MVP |
| Starter pick | Marquee Signing | starter screen | Mbappé/Messi/Van Dijk |
| Team cap 6 | Squad cap 6 | hardcoded | |
| Map route | Host City Leg map | `generateMap` | 8 maps |
| Nuzlocke | Injury List mode | — | Post-MVP |
| Battle Tower | Continental Champions Cup | — | Gated off |
| Rival Silver | Grudge derby | `silver` | Gen2 only; off |
| PC box / inventory | *(none)* | — | No inventory clutter |
| EXP / level | Form level | `level` field | |
| TM | Skill manual item | consumable | |
| Type chart | Style matchup | `STYLE_CHART` | 18 styles |
| Traits | Team tactical traits | — | Hidden campaign MVP |

---

## 14. UX Principles

### 14.1 Should feel **exciting**

- Contract Offer reveal — three real names with rarity borders
- Knockout draw ceremony — historical team kit reveal
- Legend node — foil card + fragment counter animation
- Gate 4 — Messi vs your Messi narrative (same profileId, opposing teams)

### 14.2 Should feel **surprising**

- Mystery → **named World Cup events** (Hand of God, Maracanazo Echo, etc.)
- Federation Challenge gear drop
- Duplicate conversion punchline at settlement ("Already signed — +75 credits")
- First elite name in Map 1–2 scout guarantee

### 14.3 Should feel **rewarding**

- City Stamp ceremony with host city name
- Form level milestone toast at L16/L32
- Album sticker fill animation on first sign
- Settlement breakdown (008 summary modal)
- Fragment progress bar toward Pelé/Maradona unlock
- **Mid-run reward visibility (009C Patch 6):**

| Trigger | UI behavior |
|---------|-------------|
| First Contract Offer sign (new album entry) | Toast: *"+50 credits pending"* + sticker pop on album icon |
| Duplicate sign confirmed | Toast: *"Duplicate — +{N} credits pending"* |
| Legendary Node fragment gain | Fragment pip animation on HUD; show `+3` to `+5` |
| Any album first sign this run | Brief toast: *"{Name} added to album"* + `% complete` |
| 4th City Stamp earned | Milestone toast: *"Knockout bound — +50 credits pending"* (once per run) |
| Run Budget gain | Small `+N` float near HUD budget counter (optional, 1s fade) |

**Map HUD — Pending Credits indicator:** compact line **Credits pending: {estimated}** — client-side estimate from ledger; reconciled exactly at settlement. Does not write `footballCredits` until `settleRun()`.

### 14.4 Should feel **memorable**

- Historical team nicknames on knockout prep ("The Beautiful Game", "La Scaloneta")
- Signature player callouts in battle log (*"Maradona turns the duel"*)
- Trophy Room squad snapshot on win
- "Almost had it" losses at Gate 3–4 drive rerun

### 14.5 UX anti-patterns (avoid)

- Pokémon terminology in any label
- Hidden capture rates
- More than 3 scout cards
- Forced trade / release of marquee
- Run-ending event choices
- Account Football Credit spend during run (confusing vs Run Budget)

---

## 15. Golden Gameplay Tests

| # | Scenario | Setup | Expected outcome |
|---|----------|-------|------------------|
| G1 | Player picks Van Dijk starter, routes all heal nodes Map 0 | Low offensive form | Still clears São Paulo boss with 2 players by form 14+ |
| G2 | Player reaches Map 3 with only defensive profiles (CB/DM/GK) | Styles: compact_block, iron_defense | Run **viable** — slower kills but wins via Compact Block triangle |
| G3 | Player skips every optional node, rushes boss each map | Minimum nodes visited | Enters knockout **possible** but Gate 0 win rate <40% |
| G4 | Player signs duplicate Vinícius (5) when already in album | album["5"]===1 | Squad swap or decline; settlement +75 credits; album unchanged |
| G5 | Player accumulates Run Budget through Map 4 | 80+ budget unspent | No spend sinks in MVP; settlement converts unspent per §8.3 |
| G6 | Player takes Legend node, Pelé locked in meta | Fragment Discovery offer | Pick Pelé → +3–5 fragments in ledger; album seen only; no squad add |
| G6b | Player takes Legend node, Pelé in `unlockedLegends` | Contract Offer | Swap screen if squad full; `markAlbumSigned` on sign |
| G7 | Player loses single duel but others alive | 1v1 sequential | Battle continues with next alive player — run not over |
| G8 | First run, average pathing, no meta unlocks | Fresh account | Reaches knockout **≥70%** playtests; wins World Cup **15–25%** |
| G9 | Player uses Recovery Center then immediately loses friendly | Stamina full then damaged | Forced heal on last layer still reachable on alternate path |
| G10 | Player enters Gate 4 with Messi (2) in squad vs boss Messi | Same profileId both sides | Battle resolves normally; no ID collision crash |
| G11 | Map 0 second node forced scout | First run script | Pool exactly Pedri/Ramos/Alisson band; no legend/elite breaker |
| G12 | Player abandons run mid-map 5 | Quit menu | Settlement at 50% credits; album seen/signs preserved |
| G13 | First scout on Map 1 or 2 | Fresh run, guarantee unused | Slot 1 forced elite from early pool; `eliteGuaranteeUsed` set; never fires on Map 0 |

---

## 16. Data structures

### 16.1 Run state extensions

```typescript
interface RunStateFootball {
  // existing RunState fields...
  runBudget: number
  runId: string                    // settlement dedupe (008)
  ledger: RunLedger
  knockoutGatesCleared: number
}

interface RunLedger {
  seenProfileIds: number[]
  signedProfileIds: number[]
  duplicateSignProfileIds: number[]
  legendaryNodeVisits: { profileId: number; fragments: number }[]
  runBudgetEarned: number
  runBudgetSpent: number
  hostCityWins: number
  knockoutGateWins: number
}
```

### 16.2 Static config: `node_events.json`

```json
{
  "schemaVersion": 1,
  "namedEvents": [
    {
      "id": "hand_of_god",
      "title": "Hand of God",
      "body": "A little luck, a little skill — the press will talk either way.",
      "choiceA": { "label": "Take the luck", "effects": { "marqueeForm": 1, "marqueeStaminaPct": -0.15, "revealNextStyleWeakness": true } },
      "choiceB": { "label": "Play it straight", "effects": {} }
    },
    {
      "id": "maracanazo_echo",
      "title": "Maracanazo Echo",
      "body": "The underdog spirit of 1950 whispers: fortune favors the brave.",
      "choiceA": { "label": "Embrace the echo", "effects": { "runBudget": 20, "nextBossPowerPct": 0.05 } },
      "choiceB": { "label": "Stay cautious", "effects": {} }
    },
    {
      "id": "vuvuzela_storm",
      "title": "Vuvuzela Storm",
      "body": "The noise never stops — neither do you.",
      "choiceA": { "label": "Ride the storm", "effects": { "nextFriendlyEnemyPowerPct": -0.10, "squadStaminaPct": -0.05 } },
      "choiceB": { "label": "Wait it out", "effects": {} }
    },
    {
      "id": "waka_waka_boost",
      "title": "Waka Waka Boost",
      "body": "The whole stadium bounces — your squad feels it.",
      "choiceA": { "label": "Join the bounce", "effects": { "runBudget": 10 } },
      "choiceB": { "label": "Focus up", "effects": {} }
    },
    {
      "id": "penalty_shootout_legacy",
      "title": "Penalty Shootout Legacy",
      "body": "Ice in the veins. Pick a spot and don't look back.",
      "choiceA": { "label": "Accept Nerve of Steel", "effects": { "grantItem": "nerve_of_steel" } },
      "choiceB": { "label": "Refuse", "effects": { "runBudget": -10 } }
    },
    {
      "id": "extra_time_drama",
      "title": "Extra Time Drama",
      "body": "Injury time favors those who've been through hell.",
      "choiceA": { "label": "Push through", "effects": { "lowStaminaFormBoost": 2, "lowStaminaThresholdPct": 0.50 } },
      "choiceB": { "label": "Stay composed", "effects": { "runBudget": 5 } }
    }
  ]
}
```

**Copy rule:** Max **2 lines** body + **2 choice buttons**. Question rolls 0.65–1.00 pick uniformly from this pool.

### 16.3 Scout pool config: `scout_pools.json`

```json
{
  "schemaVersion": 1,
  "bands": {
    "early": { "mapMax": 1, "profileIds": [10,11,12,15,17,18,28,31], "weights": {} },
    "mid": { "mapMax": 4, "profileIds": [4,5,6,7,8,9,13,19,20], "weights": {} },
    "late": { "mapMax": 7, "profileIds": [4,6,21,22,23,26,27,40,44,45], "weights": {} }
  },
  "forcedOverrides": [
    { "mapIndex": 0, "layer": 1, "profileIds": [12, 15, 17] }
  ],
  "eliteGuarantee": {
    "mapIndices": [1, 2],
    "flagKey": "eliteGuaranteeUsed",
    "slotIndex": 0,
    "poolsByMarquee": {
      "1": [6, 8, 9],
      "2": [4, 7, 13],
      "3": [6, 9, 14],
      "default": [4, 6, 7, 8, 13]
    }
  },
  "catchWeightMultiplier": {
    "mapIndexMin": 5,
    "multiplier": 1.15
  }
}
```

Authoritative pool lists: [007 §6.2](./007-football-data-pack.md).

---

## 17. Implementation notes

### 17.1 Handler registration (MVP `game.js`)

| Handler | Trigger | Priority |
|---------|---------|----------|
| `doTrainingCampNode` | `type === 'training_camp'` | P1 |
| `doNamedEventNode` | question → `named_event` / roll 0.65–1.00 | P1 |
| `doLegendaryNode` | `type === 'legendary'` — branch locked vs unlocked | P0 |
| `doCatchNode` | rename UI to Contract Offer | P0 |
| `doBossNode` | load from `domain/bosses.js` | P0 |

### 17.2 Map weight patch

Add to `NODE_WEIGHTS` generation (subtract from battle/trainer to keep sum stable):

- `training_camp`: maps 2–5 only
- `transfer_market`: **0** (not generated MVP)
- `trade`: **0** (explicit)
- `legendary`: **2** when `mapIndex >= 5`
- `catch`: L3–L6 weights per §3.1; **1.15×** when `mapIndex >= 5`

### 17.3 Domain modules

| Module | Responsibility |
|--------|----------------|
| `domain/scout.js` | `buildReport()`, pool weights, forced overrides, `applyEliteGuarantee()` |
| `domain/recruit.js` | `offerContract()`, swap flow, ledger append |
| `domain/run-economy.js` | Run Budget earn only (MVP); settlement conversion |
| `domain/events.js` | `resolveNamedEvent()` → 6-event MVP pool |
| `domain/meta.js` | Settlement consumes ledger (008) |

### 17.4 UI reskins (terminology)

| Screen ID | Football title |
|-----------|----------------|
| `catch-screen` | Contract Offer |
| `swap-screen` | Squad Registration |
| `catch-screen` h2 | Scout Report |
| `pokecenter` tooltip | Recovery Center |

---

## 18. Balance targets (summary)

| System | Target |
|--------|--------|
| Campaign duration | **35–40 min** median; 45 min ceiling; first run up to 50 min |
| Scout reports per run | **8–10** |
| Signings per run | **7–10** unique |
| Run Budget end (typical) | **80–150** unspent (earn-only MVP) |
| First knockout reach | 70%+ |
| First World Cup win | 15–25% |
| Gate 4 stop rate | 60–70% of knockout entrants |

---

## 19. Acceptance criteria

### 19.1 Gameplay loop

- [ ] Full loop Title → Marquee → 8 maps → 5 knockout gates → Settlement playable
- [ ] Median playtest duration **35–40 minutes** with auto-skip (45 min ceiling)
- [ ] No Pokémon terminology in node labels or Contract Offer flow

### 19.2 Nodes

- [ ] All catalogued node types have handlers or documented reskins
- [ ] Trade weight 0; Transfer Market not generated; Silver not generated Modern Era
- [ ] Forced Recovery Center once per map on last content layer
- [ ] Map 0 forced scout pool `{12,15,17}` on scripted node

### 19.3 Scouting & recruitment

- [ ] Scout reports show exactly 3 choices (pad if needed)
- [ ] Contract Offer — 100% sign on select; skip available
- [ ] Starters excluded from pools; legends only on legend nodes (Fragment Discovery when locked)
- [ ] Elite guarantee fires once on first Map 1–2 scout; Map 0 uses forced pool only
- [ ] Duplicate signs flagged for settlement conversion

### 19.4 Team building

- [ ] Squad hard cap 6; swap screen on full sign
- [ ] Sequential 1v1 uses squad order

### 19.5 Training & economy

- [ ] Form gains match §7 table
- [ ] Run Budget tracked **earn-only** — no decrement paths in MVP; `runBudgetSpent === 0`
- [ ] Account Football Credits unchanged during run (only settlement)
- [ ] Mid-run reward toasts per §14.3 (pending credits, fragments, album, stamps)
- [ ] Named events resolve from 6-event MVP pool (§16.2)

### 19.6 Progression

- [ ] Host city and knockout tables match 007 data
- [ ] Win rates tunable via JSON without code changes

### 19.7 Meta integration

- [ ] Run ledger feeds `settleRun()` per 008 §18
- [ ] Album seen on scout display; signed on contract; legend fragments on Fragment Discovery
- [ ] Legendary Node: locked → fragments only; unlocked → Contract Offer (009C Patch 1)

### 19.8 Golden tests

- [ ] All §15 scenarios pass manual or automated QA checklist

---

## 20. Out of scope (explicit)

Not defined here — see prior specs:

- Continental Champions Cup node maps
- Injury List permadeath
- Gold card / shiny encounters
- Branching development paths
- Account-level Football Credit shop spend
- Daily quests, battle pass, energy, loot boxes
- Crafting, inventories, talent trees

---

## Appendix A — Minute-by-minute reference (ideal first run)

| Min | Event |
|-----|-------|
| 0 | Title → Manager |
| 1 | Marquee: Messi |
| 2 | Map 0 arrival → Scout Report (Pedri/Ramos/Alisson) → sign Pedri |
| 4 | Friendly win → Messi form 6 |
| 6 | Recovery Center |
| 8 | São Paulo Host City Challenge → Stamp 1 |
| 12 | Map 1 scout #2 → squad 3 |
| 18 | Stamp 2 Berlin |
| 25 | Squad 5, Map 3 Madrid stamp |
| 32 | Map 5 legend node optional |
| 38 | Stamp 8 London |
| 40 | Knockout Gate 0 Uruguay — win |
| 43 | Gate 1 Brazil 1970 — loss or win |
| … | Continue or game over → settlement |

---

## Appendix B — Config file index

| File | Purpose |
|------|---------|
| `data/football/player_profiles.json` | 50 players (007) |
| `data/football/host_city_bosses.json` | 8 bosses (007) |
| `data/football/knockout_teams.json` | 5 gates (007) |
| `data/football/scout_pools.json` | Stage pools + overrides (009) |
| `data/football/node_events.json` | Named World Cup events — 6-event MVP pool (009C) |
| `data/football/run_economy.json` | Run Budget earn tables (009) |
| `data/football/meta_progression.json` | Account meta (008) |

---

*End of SPEC 009 — Gameplay Loop & Node System.*
