# SPEC 009C — Gameplay Patch

**Status:** Authoritative patch set — merge into [009-gameplay-loop-node-system.md](./009-gameplay-loop-node-system.md)  
**Inputs:** [007-football-data-pack.md](./007-football-data-pack.md), [008-meta-progression.md](./008-meta-progression.md), [009-gameplay-loop-node-system.md](./009-gameplay-loop-node-system.md), [009-design-review.md](./009-design-review.md)  
**Version:** v0.1  
**Date:** 2026-06-06  
**Scope:** Approved MVP gameplay adjustments only — not a redesign, not a new spec

---

## Purpose

SPEC 009C documents **approved changes** from the design review that must be applied to SPEC 009. Implementation teams treat this as a delta. Where 009C conflicts with 009, **009C wins**.

**Locked (unchanged):** 8 host cities, 5 knockout gates, 50-player album, Mbappé/Messi/Van Dijk starters, Football Credits, Legend Fragments (008), Contract Offer, squad cap 6, Core Six, album seen/signed states, host city and knockout progression tables.

---

## Patch 1 — Legendary Nodes

### Problem

SPEC 009 §5.6 allows **immediate permanent signing** of legends at Legendary Nodes plus fragment grants. This conflicts with SPEC 008 §8 and P4: legends are aspirational; **20 fragments → unlock → then eligible for recruitment**.

### Change

Legendary Node default outcome is **Legend Fragments**, not permanent squad recruitment.

**Legend flow (authoritative):**

```
Legendary Node
    → Player selects target legend (1-of-2 or 1-of-1 offer)
    → Grant 3–5 fragments to run ledger (008 antiExploit cap: max 5 per legend per run)
    → If legend NOT in unlockedLegends: NO squad add, NO album sign
    → At 20 fragments (account): legend added to unlockedLegends (008 §8)
    → Future Legendary Nodes OR Scout Reports (when design permits): Contract Offer available
```

**Node behavior by unlock state:**

| `unlockedLegends` | Legendary Node outcome |
|-------------------|------------------------|
| Legend **locked** | **Fragment Discovery** — pick among offered legend(s); gain **3–5 fragments** for chosen `profileId` (42, 43, 46, 47, 50). No Contract Offer. |
| Legend **unlocked** | **Contract Offer** — 1-of-1 sign to squad via standard recruitment flow. Duplicate → settlement credits per 008 §7. |

**Eligible legends:** profileIds **42, 43, 46, 47, 50** per 008 §8. Cristiano Ronaldo (50) still requires account level 3 gate per 008 §11 / 007 §6.2.

**Pool at node (map 5+):** Roll 1–2 locked legends not yet at fragment cap this run; exclude legends already in squad. Default pool `{46, 47, 42, 43}`; add 50 when meta unlock allows.

**Knockout bosses (Pelé, Maradona, etc.):** Unchanged — **fighting** a legend ≠ **owning** a legend. Boss encounters do not grant album sign or bypass fragment unlock.

### Reason

Preserves the 15–25 run legend chase (008 §13). One lucky node no longer completes the ultimate collection goal.

### Impact

- Run excitement preserved via fragment pip + “one step closer” feedback
- Album sign for legends becomes a **meta milestone**, not a RNG spike
- Legendary Nodes remain valuable on runs 10–50

### Implementation Notes

- **`doLegendaryNode`:** Branch on `unlockedLegends.includes(profileId)`.
- **Locked path:** Show 1–2 legend cards with fragment reward preview; on confirm append `{ profileId, fragments: randomInt(3,5) }` to `runSnapshot.ledger.legendaryNodeVisits`; call `markAlbumSeen(profileId)` only.
- **Unlocked path:** Existing Contract Offer flow (009 §5.3); `markAlbumSigned` on successful sign.
- **Settlement:** Fragments applied in `settleRun()` step 7 per 008 §18 — unchanged.
- **UI title (locked):** *"Legendary Scouting — Fragment Discovery"*
- **UI title (unlocked):** *"Legendary Scouting — Contract Offer"*
- **Remove from 009 §5.6:** “Signing grants fragments **in addition to** squad add” as default — fragments **replace** squad add when locked.

**SPEC 009 sections to update:** §3.1 (World Cup Legend row), §5.6, §11.3 (fragment vs safety), §15 G6, §19 acceptance criteria.

---

## Patch 2 — Remove Transfer Market From MVP

### Problem

Transfer Market duplicates Scout Report fantasy, adds Run Budget spend tuning, and increases cognitive load without validating core loop (009 design review §5).

### Change

**Transfer Market is removed from MVP.**

| Item | Action |
|------|--------|
| Node type `transfer_market` | **Not generated** — weight **0** all layers |
| Handler `doTransferMarketNode` | **Not shipped** MVP |
| Run Budget **spend** sinks | **Removed** — no market, no scout reroll |
| Run Budget **earn** | **Retained** — all sources in 009 §8.2 unchanged |
| Settlement conversion | **Retained** — `floor(unspent × 0.5)` → bonus Football Credits, max +50 per run (009 §8.3) |

**Node weight redistribution** (transfer weights removed from 009 §3.1: L3 +3, L4 +4, L5 +5, L6 +3 → **+15 total** redistributed):

| Recipient | Added weight |
|-----------|--------------|
| Scout Report (`catch`) | **+10** (maps 3–6 content layers) |
| Friendly Match (`battle`) | **+5** (maps 3–6) |

Apply redistribution proportionally per layer so layer weight sums remain stable (normalize after add).

**UI:** Remove Transfer Market map icon, tooltip, and screen. Map HUD may show Run Budget as **earn-only progress** (optional label: *"Tournament earnings"*).

### Reason

Single recruitment channel (Scout Report → Contract Offer) sharpens MVP validation and reduces economy surface.

### Impact

- Fewer node types to learn
- Pathing decisions stay scout vs heal vs fight — not price vs pick
- Run Budget still rewards combat without spend decisions

### Implementation Notes

- **`map.js` / weight config:** Set `transfer_market: 0`; do not register type in `pickType`.
- **`state.runBudget`:** Increment only; no decrement paths in MVP.
- **Remove from 009:** §3.1 Transfer Market row, §8.4, §2.3 “Transfer Market visits”, §11.2 Transfer Market row, §13 mapping row.
- **Post-MVP:** Transfer Market documented as expansion only — not in 009C scope.

---

## Patch 3 — Early Elite Guarantee

### Problem

Elite weight **0.3×** on maps 0–1 delays first star-name excitement until ~Map 3 (18+ minutes). Early runs feel like generic role players only.

### Change

Add **Guaranteed Elite Appearance** on the **first Scout Report encountered on Map 1 or Map 2** (whichever comes first in the player’s path).

**Rules:**

1. When `buildReport()` runs for the first scout on `mapIndex === 1 || mapIndex === 2`, and guarantee not yet consumed this run:
   - Force **slot 1** (index 0) to one elite from **early elite pool**.
   - Remaining two slots roll normally from stage pool (007 §6.2 early band).
   - Set `runState.flags.eliteGuaranteeUsed = true` — **once per run**.
2. Map 0 forced pool `{12, 15, 17}` **unchanged** (007 §6.1).
3. Elite weight multiplier maps 0–1: **0.3× → 0.6×** (all other scout rolls on those maps).
4. Legends `{42, 43, 46, 47, 50}` remain **excluded** from guarantee and early pools.
5. Starters `{1, 2, 3}` remain excluded.
6. Brazil cap (max 1 BRA per report) still applies.

**Early elite pool (profileIds, all `rarity: elite` in 007):**

| Slot bias | Pool |
|-----------|------|
| Default | `{4, 6, 7, 8, 13}` — Haaland, Modrić, Salah, De Bruyne, Kane |
| If marquee = Mbappé (1) | Prefer `{6, 8, 9}` — Modrić, De Bruyne, Rodri (control/mid) |
| If marquee = Messi (2) | Prefer `{4, 7, 13}` — Haaland, Salah, Kane (attack) |
| If marquee = Van Dijk (3) | Prefer `{6, 9, 14}` — Modrić, Rodri, Kanté (mid/def anchor) |

Pick uniformly from prefer list if non-empty after filters; else fall back to default pool.

### Reason

Delivers a “wow” football name by minute 8–12 without flooding elites (one guarantee + 0.6× weight, not guaranteed every scout).

### Impact

- First-run attachment to squad improves
- Rarity excitement preserved — one forced elite, two normal rolls
- Aligns with 005 success metric: scouts feel rewarding early

### Implementation Notes

- **`domain/scout.js`:** `applyEliteGuarantee(report, runState, mapIndex)` after pool roll, before instance creation.
- **Flag:** `state.flags.eliteGuaranteeUsed` persisted in `poke_current_run`.
- **Balance QA:** Verify guarantee never fires on Map 0 (forced pool already handles tutorial).

**SPEC 009 sections to update:** §4.4 weight table, §4.6 Map 1–2 row, §2.3 scout frequency note, §12.3 first-run targets.

---

## Patch 4 — Event System Upgrade

### Problem

Generic Media / Sponsor / Historical event labels lack World Cup cultural memory and are forgettable.

### Change

Replace generic question sub-types with **6 named MVP events** in `data/football/node_events.json`. Question node rolls that previously hit `media`, `sponsor`, or `history` now resolve to **one random named event** from the MVP pool (uniform weight).

**Copy rule:** Max **2 lines** body text + **2 choice buttons**. No multi-screen lore.

### MVP event pool

| event ID | Title | Reward | Risk | One-line description |
|----------|-------|--------|------|---------------------|
| `hand_of_god` | Hand of God | Marquee +1 Form Lv.; next duel shows opponent style weakness | Marquee −15% stamina | *A little luck, a little skill — the press will talk either way.* |
| `maracanazo_echo` | Maracanazo Echo | +20 Run Budget | Next Host City Challenge: enemy +5% power | *The underdog spirit of 1950 whispers: fortune favors the brave.* |
| `vuvuzela_storm` | Vuvuzela Storm | Next friendly: enemy −10% power | All players −5% stamina | *The noise never stops — neither do you.* |
| `waka_waka_boost` | Waka Waka Boost | +10 Run Budget; brief morale toast | None | *The whole stadium bounces — your squad feels it.* |
| `penalty_shootout_legacy` | Penalty Shootout Legacy | Grant consumable **Nerve of Steel** (Focus Sash reskin) | Refuse: −10 Run Budget | *Ice in the veins. Pick a spot and don't look back.* |
| `extra_time_drama` | Extra Time Drama | If ≤4 players below 50% stamina: those players +2 Form Lv. | If squad healthy: +5 Run Budget instead | *Injury time favors those who've been through hell.* |

**Question roll adjustment (replaces 009 §3.2 media/sponsor/history bands):**

| Roll range | Result |
|------------|--------|
| 0.65–1.00 | Named event from MVP pool (uniform) |
| Other bands | Unchanged (friendly, trainer, catch, item, training treat) |

### Reason

Named cultural hooks create memorable runs without new mechanics.

### Impact

- Events feel like World Cup stories, not generic sport management
- Lightweight — still 2-choice, same `question` engine handler

### Implementation Notes

- **`domain/events.js`:** `resolveNamedEvent(rng)` → event ID → apply effects from JSON.
- **Handlers:** Single `doNamedEventNode(node, eventId)`; effects modify run state only (form, stamina %, runBudget, grant item by id).
- **Remove from MVP UI copy:** “Media Event”, “Sponsor Event”, “Historical Moment” as player-facing labels.

**SPEC 009 sections to update:** §3.1 (remove generic event rows; add named event note), §3.2 roll table, §16.2 `node_events.json` example.

---

## Patch 5 — More Late-Game Scouting

### Problem

Maps 6–7 (content layers with low scout weight: **10, 9**) feel combat-heavy before knockout; collection opportunities drop when album chase matters most.

### Change

Increase Scout Report appearance on **late maps** without adding layers or fights.

**Revised Scout Report weights (content layers L1→L6):**

| Layer | 009 current | **009C** |
|-------|-------------|----------|
| L1 | 30 | 30 |
| L2 | 20 | 20 |
| L3 | 14 | 16 |
| L4 | 12 | 14 |
| L5 | 10 | **14** (+4 from Patch 2 redistribution +2) |
| L6 | 9 | **13** (+4 from Patch 2 redistribution +2) |

*L5/L6 include +2 from Transfer Market redistribution (Patch 2); additional +2 on L5/L6 for late-game scout boost.*

**Map index gate:** On `mapIndex >= 5`, apply **1.15×** multiplier to `catch` weight after layer roll (maps 5–7 only).

**Expected scouting frequency (revision):**

| Metric | 009 | **009C** |
|--------|-----|----------|
| Scout reports per run | 7–9 | **8–10** |
| Contract signings (unique) | 6–9 | **7–10** |
| Transfer Market visits | 1–3 | **0** |

Run length target unchanged: **35–40 min median** (009C does not add nodes).

### Reason

Knockout removes scouting — late maps are the last chance for album progress. More scouts = collection dopamine without longer runs.

### Impact

- Maps 6–7 offer meaningful “one more signing” decisions
- Compensates for Transfer Market removal

### Implementation Notes

- Weight table in `map.js` or `data/football/scout_pools.json` metadata.
- Normalize layer weights to 100 after edits.
- QA: verify scout rate on map 6–7 playtests ≥1.3× vs 009 baseline.

**SPEC 009 sections to update:** §3.1 Scout row weights, §3.4 appearance table, §2.3 metrics.

---

## Patch 6 — Mid-Run Reward Visibility

### Problem

Football Credits, fragment progress, and album milestones mostly appear at **settlement** — 35–40 minutes of delayed gratification (008 P1 at risk).

### Change

Add **immediate feedback** for rewards already defined in 008/009. **No new currencies. No new reward types.**

| Trigger | UI behavior | Data source |
|---------|-------------|-------------|
| **First Contract Offer sign** (new album entry) | Toast: *"+50 credits pending"* + sticker pop on album icon | `credits.newAlbumEntry`; album sign |
| **Duplicate sign confirmed** | Toast: *"Duplicate — +{N} credits pending"* | `duplicateCreditsByRarity` |
| **Legendary Node fragment gain** | **Fragment pip animation** on HUD fragment bar for that legend; show `+3` to `+5` | `ledger.legendaryNodeVisits` |
| **Any album first sign this run** | Brief album toast: *"{Name} added to album"* + `% complete` | `game_album` count / 50 |
| **4th City Stamp earned** | Milestone toast: *"Knockout bound — +50 credits pending"* | `credits` band helper; once per run |
| **Run Budget gain** | Small `+N` float near HUD budget counter (optional, 1s fade) | `state.runBudget` delta |

**Pending Credits indicator (map HUD):**

- Persistent compact line: **Credits pending: {estimated}** — client-side estimate from ledger (signs, duplicates, stamps, gates); reconciled exactly at settlement.
- Does not write `footballCredits` until `settleRun()`.

**Settlement screen:** Unchanged — still authoritative breakdown per 008 §18.3.

### Reason

Players feel progress **during** the run; settlement becomes confirmation, not the first reward signal.

### Impact

- Supports 008 P1 (“every run matters”) mid-run, not only at end
- Legend fragment chase visible without opening album modal

### Implementation Notes

- **`ui.js`:** `showPendingRewardToast(type, payload)` — non-blocking, 2.5s, stacks max 2.
- **Fragment bar:** Title screen + map HUD; reads `legendFragments` + run ledger pips (display only until settlement).
- **Estimate formula:** Sum known ledger entries × config rates; do not mutate account.
- **No new localStorage keys** beyond existing ledger in run save.

**SPEC 009 sections to update:** §14.3 (rewarding UX), §9 dopamine note, §19 acceptance (add mid-run feedback criteria).

---

## Duration note (informational patch)

Merge into 009 §1.2:

- **North star:** 35–40 min median with auto-skip
- **Ceiling:** 45 min
- **First run:** may reach 50 min with animations + event reading

Not a new system — expectation alignment only.

---

## Patch Summary Table

| Patch | Priority | Effort | Impact |
|-------|----------|--------|--------|
| 1 — Legendary Nodes (fragments default) | **Mandatory** | Medium | **High** |
| 2 — Remove Transfer Market | **Mandatory** | Low | **High** |
| 3 — Early Elite Guarantee | **Mandatory** | Low | **High** |
| 4 — Event System Upgrade (6 named events) | Recommended | Medium | Medium |
| 5 — More Late-Game Scouting | Recommended | Low | Medium |
| 6 — Mid-Run Reward Visibility | Recommended | Medium | **High** |

---

## Merge checklist for SPEC 009

Apply these edits to [009-gameplay-loop-node-system.md](./009-gameplay-loop-node-system.md) when promoting 009C:

- [ ] §1.2 — duration note
- [ ] §2.3 — scout 8–10; remove Transfer Market visits
- [ ] §3.1 — remove Transfer Market; update Scout weights; update Legend row
- [ ] §3.2 — named event roll table
- [ ] §4.4 — elite 0.6× maps 0–1; add §4.x elite guarantee
- [ ] §5.6 — replace with Patch 1 legend flow
- [ ] §8 — remove §8.4 Transfer Market; Run Budget earn-only
- [ ] §11 — remove Transfer Market risk row
- [ ] §14 — add mid-run feedback
- [ ] §16 — `node_events.json` MVP pool; scout weight config
- [ ] §19 — update acceptance criteria for patches 1–6

**Authority:** After merge, document version becomes **SPEC 009 v0.2** (optional rename); 009C remains audit trail.

---

*End of SPEC 009C — Gameplay Patch.*
