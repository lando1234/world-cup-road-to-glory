# SPEC 009 Design Review

**Type:** Senior game design review — revision notes for [009-gameplay-loop-node-system.md](./009-gameplay-loop-node-system.md)  
**Reviewer lens:** Roguelite design · Progression design · Retention design  
**Date:** 2026-06-06  
**Constraint:** Does not rewrite SPEC 009. Preserves locked systems from 006B, 007, 008 unless flagged as **MANDATORY** conflict resolution.

---

## Executive summary

SPEC 009 is **technically coherent** and correctly maps Pokelike’s engine to football fantasy. As a *fun* document, it over-indexes on **system completeness** and under-indexes on **dopamine pacing** and **MVP discipline**. The core loop — scout, build, stamp, knockout — is strong. The spec introduces **three parallel recruitment channels** (Scout Report, Transfer Market, Legendary Node immediate sign) and **two currencies** (Run Budget + Football Credits) where one channel and one reward vocabulary would suffice for MVP validation.

**Highest-impact finding:** SPEC 009 §5.6 (sign Pelé immediately at Legendary Node + fragments) **conflicts with SPEC 008 §8** (20 fragments → unlock → *then* legend becomes recruitable). Resolving this is **MANDATORY** for retention coherence.

**Second finding:** Realistic first-run duration is **38–52 minutes**, not 30–45, unless pacing cuts are made. Recommendation: **keep 8 maps** (engine/content lock) but **shorten perceived length** via faster fights and fewer optional systems — not by removing host cities.

---

## 1. Campaign Duration Audit

### Current SPEC 009 claims

| Metric | Target |
|--------|--------|
| Total duration | 30–45 min |
| Map nodes visited | ~72 |
| Highlight duels | 28–35 |
| Boss fights | 13 (8 host + 5 knockout) |
| Scout reports | 7–9 |

### Realistic estimate (playtest math)

| Activity | Count | Time each (auto-skip on) | Subtotal |
|----------|-------|--------------------------|----------|
| Marquee + tutorial | 1 | 2 min | 2 min |
| Map nodes (decisions, not fights) | ~75 | ~15 sec avg | **19 min** |
| Friendly / training fights | ~12 | 20–30 sec | 4 min |
| Trainer / federation fights | ~10 | 30–45 sec | 5 min |
| Host city bosses | 8 | 45–60 sec | 6 min |
| Knockout gates + prep | 5 + 5 prep | 90 sec + 30 sec prep | 10 min |
| Scout / contract UI | 8 | 30–45 sec | 5 min |
| Events (media/sponsor/history) | 3–5 | 45–90 sec reading | 4 min |
| Settlement | 1 | 60 sec | 1 min |
| **Total** | | | **~56 min** |

With aggressive auto-skip and event text stripped to one line: **~42 min median**. With first-run animations on and players reading events: **50+ min**.

### Reading & event tax

Question nodes are **11–18%** of content slots. If 75% resolve to generic fight/item/scout, the remaining **25%** are bespoke events requiring **2-choice copy**. At 5 events × 45 sec reading = **~4 min** — modest alone, but stacked with **72 map clicks** the run feels like a **marathon**, not a roguelite snack.

### Ideal duration (design target)

| Audience | Ideal | Rationale |
|----------|-------|-----------|
| First run (validation) | **35–40 min** | One sitting; knockout reachable |
| Repeat run (retention) | **25–35 min** | "One more run" before bed |
| Current spec | 30–45 min | Achievable only with cuts |

### Recommendation

| Verdict | **Keep 30–45 min as north star, but treat 45 as ceiling — not average** |
|---------|---------------------------------------------------------------------------|

**Campaign length:** **Unchanged in structure** (8 maps + 5 knockout — locked in 007/006B).

**Pacing:** **Effectively shorter** via:

1. Default auto-skip ON after first fight (already in 005) — **MANDATORY enforcement**
2. Cap event copy at **2 lines + 2 buttons** — **RECOMMENDED**
3. Remove or defer Transfer Market node visits (saves decisions + UI) — see §5
4. Merge Training Camp into "Friendly Match+" rather than separate node type for MVP — **OPTIONAL**

**Do not** remove maps or knockout gates for MVP — that amputates the World Cup fantasy and engine contract.

---

## 2. Boss Density Audit

### Current structure

| Phase | Boss count | Emotional role |
|-------|------------|----------------|
| Host City Challenges | **8** | Progress gates; federation flavor |
| Knockout Gates | **5** | Nostalgia peaks (1950 → 2022) |
| **Total** | **13** | |

Plus optional **Federation Challenge** nodes that feel like mini-bosses (trainer fights with gear drops).

### Fatigue analysis

| Problem | Where it hurts |
|---------|----------------|
| **Boss normalization** | Host city #5–8 feel like "another stamp" — same ceremony, lower novelty |
| **Peak dilution** | 8 host fights before knockout means **60% of boss encounters** are non-historical |
| **Prep fatigue** | Knockout adds 5 more with prep screens — excellent for finale, heavy after long group phase |
| **Repetition** | Federation Challenge + Host City Challenge both = "hard national team fight" |

### Would 6 Host Cities be better for MVP?

| Option | Pros | Cons |
|--------|------|------|
| **6 host cities** | Tighter 30-min run; each stamp more meaningful; faster to knockout | **Breaks 007/006B locked city list**; requires engine `mapIndex` retune, content cut, album "Host City Heroes" page resize |
| **8 host cities (keep)** | Zero content conflict; matches Pokelike cadence; full world tour fantasy | Maps 6–7 risk slog; 13 total bosses |

### Recommendation

| Verdict | **Keep 8 Host Cities for MVP** (locked). **Reserve 6-city "Express Cup" mode for post-MVP expansion.** |
|---------|-------------------------------------------------------------------------------------------------------------|

**Rationale:** Cutting to 6 cities saves ~8–10 minutes but costs **8 weeks of authored content alignment** and breaks the stamp/album/boss tables in 007. The fatigue problem is not *count* — it is **sameness**. Fix ceremony and peaks, not map count.

**RECOMMENDED changes (within 8 maps):**

1. **Escalate host city ceremony** — maps 0–2 minimal; maps 5–7 full stamp animation + host hero callout (Casemiro, Bergkamp, Charlton)
2. **Remove Federation Challenge as separate node** — fold into Rival National Team with +5 Run Budget bonus (see §8)
3. **Telegraph knockout from Map 4** — gray album slots unlock; "knockout awaits" HUD to shift emotional anticipation earlier

**OPTIONAL (expansion):** "Express World Cup" — 6 host cities, same 5 knockout gates, for repeat players.

---

## 3. Scout Excitement Audit

### Current curve (SPEC 009 + 007)

| Map band | Scout frequency | Pool quality |
|----------|-----------------|--------------|
| 0–1 | High weight (30→20) | Elites **0.3×**; forced safe pool Map 0 |
| 2–4 | Medium | Full elites |
| 5–7 | Lower weight (10–9) | Elites 1.2×; legends via separate node |

### Do players see exciting footballers often enough?

**First run:** Yes on Map 0 (Pedri/Ramos/Alisson). **Maps 1–2:** Often **no** — mostly rare/uncommon role players. **First elite name** (Haaland, Modrić, Salah) typically **Map 3+** (~18–22 min in). That is a **long excitement valley**.

**Repeat runs:** Pool familiarity kicks in by run 5 — "Oh, Rodri again."

### Rarity visibility

SPEC 009 specifies rarity borders — good. Missing:

- **"New to album"** pulse on unseen silhouettes
- **Spotlight card** — one of three scouts marked "Scout's top pick" (cosmetic, not power)
- **Name recognition moment** — elite+ should trigger brief portrait flash on report open

### Recommendations

| Priority | Change |
|----------|--------|
| **MANDATORY** | **One guaranteed elite appearance** in Map 1 or Map 2 scout report (rotating by starter — e.g., Modrić after Mbappé pick) |
| **RECOMMENDED** | Raise elite weight on maps 1–2 from **0.3× → 0.6×** (still no legends) |
| **RECOMMENDED** | Increase scout weight on maps 5–7 from 9–10 → **12–14** (collection phase before knockout drought) |
| **OPTIONAL** | "Scout spotlight" — 1 of 3 cards gets gold frame if elite+ |

**Legends:** Should **not** appear in standard scout pools (correct in spec). Legend excitement belongs to fragment chase + unlock moment — not Map 3 Haaland-style frequency.

---

## 4. Legendary System Audit

### SPEC 009 current behavior (§5.6)

Legendary Node → **immediate Contract Offer** (Pelé joins squad) **+ 3–5 fragments** to ledger.

### SPEC 008 intended behavior (§8, P4)

- Legends are **aspirational**
- **20 fragments** → unlock → added to `unlockedLegends`
- **Then** "legend becomes available in Legendary Nodes / album signed via normal recruit rules"
- Legendary nodes grant **3–5 fragments per visit** (not necessarily full player)

### Conflict

| Model | Squad impact | Album / retention | Alignment |
|-------|--------------|-------------------|-----------|
| **A: Immediate sign** | Pelé in squad this run | Album signed in one lucky node; **short-circuits 15–25 run chase** | **Conflicts with 008 P4** |
| **B: Fragments only → unlock → recruit** | No legend in squad until unlocked | Strong long-term goal; legendary nodes stay relevant for months | **Matches 008** |

### Hybrid (recommended)

**Model B+** — aligns 009 with 008 without losing run excitement:

| Legend unlock state | Legendary Node behavior |
|---------------------|-------------------------|
| **Locked** (< 20 fragments) | **Fragment Discovery** — choose to commit node; gain **3–5 fragments** for that legend (or player picks among 2 legend options). **No squad add.** Album: mark legend **seen** only. |
| **Unlocked** (in `unlockedLegends`) | **Contract Offer** — 1-of-1 sign to squad; album **signed**; duplicate → credits per 008 |
| **Optional run fantasy** | **Trial Contract** — locked legends can be signed **for this run only** (does not album-sign until unlocked). Fragments still awarded. Satisfies "I used Pelé!" without killing meta. |

### Recommendation

| Verdict | **MANDATORY: Replace Model A with Model B+** |
|---------|------------------------------------------------|

**MANDATORY change to SPEC 009 §5.6:**

- Legendary Node default = **fragments**, not immediate permanent sign
- Full album sign requires **`unlockedLegends`** OR trial contract clearly labeled ephemeral
- Fragment grant remains 3–5; per-run cap 5 per legend (008)

**Why:** Immediate Pelé sign collapses the **primary retention loop** (008 §16 emotional loop). One lucky node on run 3 removes 20 runs of legend chase. Collection-first design (008 P2) requires fragments to be the **default** legendary node outcome.

**Knockout immortals (Pelé 42, Maradona 43)** remain **boss encounters** — fighting them ≠ owning them. Reinforces distinction between *facing* legends and *collecting* them.

---

## 5. Transfer Market Audit

### What it adds

| Claimed benefit | Reality |
|-----------------|---------|
| Economic decision | Run Budget earn/spend loop parallel to Football Credits |
| Targeted signing | Curated 2–3 players at fixed price |
| Football fantasy | Transfer window flavor |

### What it costs

| Cost | Severity |
|------|----------|
| New node type + handler | Engineering |
| Run Budget currency layer | Player cognitive load ("two moneys") |
| Balance surface (40–120 pricing vs scout opportunity cost) | Design QA |
| Overlaps Scout Report | **Same fantasy — pick a player** |

### Player decision test

> "I saw Haaland in Scout Report OR I paid 90 Run Budget in Transfer Market."

Both end at Contract Offer. The market adds **pricing math** where roguelites want **pathing math** (scout node vs heal node vs boss rush).

### Recommendation

| Verdict | **Move Transfer Market to post-MVP expansion** |
|---------|------------------------------------------------|

**Rationale:**

1. **005 explicitly cut trade** for cognitive load — Transfer Market is trade-with-a-price
2. Scout Reports already deliver **7–9 recruitment moments** per run — sufficient
3. Run Budget can still exist as **score/flavor** converting to settlement credits **without a spend sink** in MVP
4. Removing market saves **~5% of node types** and an entire economy tuning surface

**MANDATORY for MVP scope discipline:** Remove `transfer_market` node from MVP weights; keep Run Budget earn-only + settlement conversion.

**OPTIONAL post-MVP:** Transfer Market as **Account Football Credit spend** (when shop exists) or Run Budget sink in "Director Mode" difficulty.

---

## 6. Event Fun Audit

### Current SPEC 009 events

| Event | Memorable? | Issue |
|-------|------------|-------|
| Media Event | Generic | "Back the star" could be any sport |
| Sponsor Event | Generic | Kit deal ≠ World Cup cultural memory |
| Historical Moment | Better | Still abstract without named references |

**Problem:** Events resolve from question node randomness — player cannot **seek** them. Memorable culture needs **recognizable titles** and **one-line punch**.

### 20 World Cup–inspired event concepts

| # | Event name | Reward | Risk | Emotional goal |
|---|------------|--------|------|----------------|
| 1 | **Hand of God** | +1 form on star; reveal opponent weakness next fight | Star loses 15% stamina | Cheeky legend energy; Maradona myth |
| 2 | **Maracanazo Echo** | +20 Run Budget | Next boss +5% enemy power | Underdog giant-killer fantasy (Uruguay 1950) |
| 3 | **Miracle of Bern** | +2 form all underdog-style players | None | Comeback hope (1954 West Germany) |
| 4 | **Headbutt Moment** | +30 Run Budget | Skip next Recovery Center on path | Zidane 2006 — fame vs discipline |
| 5 | **Vuvuzela Storm** | Enemy −10% power next friendly | Player −5% stamina all | 2010 atmosphere — chaotic, funny |
| 6 | **Jabulani Knuckle** | Random gear crate item | Next duel damage variance +20% | 2010 ball controversy — unpredictability |
| 7 | **Waka Waka Boost** | +10 Run Budget; morale toast | None | 2010 joy — pure hype |
| 8 | **South African Buzz** | Reveal next map's boss primary style | None | 2010 host pride; tactical info |
| 9 | **Extra Time Drama** | +2 form if squad ≤4 players alive | If squad full, no bonus | Clutch narrative |
| 10 | **Penalty Shootout Legacy** | Consumable "Nerve of Steel" | Lose 10 Run Budget if refuse | Martínez / Casillas fantasy |
| 11 | **Golden Generation Hype** | Elite scout weight +50% next report | Media pressure: lose on next loss | Portugal/Belgium "almost" eras |
| 12 | **VAR Review** | Reroll last fight outcome once (win→win confirm) | 45 sec wait animation | Modern football humor |
| 13 | **Panenka Nerve** | +15 Run Budget | 20% chance next duel starts −10% stamina | Panenka 1976 — swagger |
| 14 | **Total Football Lesson** | +1 skill tier on one Dutch-style player | None | Cruyff/Bergkamp nod (host city tie-in) |
| 15 | **Samba Rhythm** | Brazil players +1 form | Non-BRA players no bonus | Brazil host identity |
| 16 | **La Albiceleste Passion** | Argentina players +1 form next gate | None | Messi/Maradona emotional bridge |
| 17 | **Catenaccio Lockdown** | +1 form all Compact Block players | −5 Run Budget | Italy defensive culture |
| 18 | **Gazza's Tears** | Full heal one player | Team −1 form avg | 1990 human drama |
| 19 | **Own Goal Nightmare** | +40 Run Budget | Random squad member −20% stamina | Universal football trauma — dark comedy |
| 20 | **Champions' Photograph** | Album seen mark on random unsigned favorite | None | Sticker album emotional hit |

### Recommendations

| Priority | Change |
|----------|--------|
| **RECOMMENDED** | Ship **6 events** for MVP (bold names): Hand of God, Maracanazo Echo, Vuvuzela Storm, Extra Time Drama, Penalty Shootout Legacy, Waka Waka Boost |
| **RECOMMENDED** | Replace generic Media/Sponsor/History **labels** with named events from table |
| **OPTIONAL** | Weight events by map/host city (Samba in São Paulo, Total Football in Amsterdam) |
| **MANDATORY** | Max **2 lines** of copy per event — no lore essays |

---

## 7. Replayability Audit

### Enjoyment decay projection

| Run count | Enjoyment | Why |
|-----------|-----------|-----|
| **1–3** | High | New names, knockout reveal, album fills |
| **4–10** | Medium-high | Starter triangle experiments; fragment progress visible |
| **10–20** | Medium | Scout pool repetition; same 8 city structure |
| **20–50** | Medium-low **without legend/album chase** | Map pathing feels identical; events repeat |
| **50+** | Sustained **only if** album <100% and legends unlocking | Collection saves the loop |

### Repetitive systems

| System | Repetition type | Severity |
|--------|-----------------|----------|
| Map DAG structure | Same layer shape every map | Low (roguelike norm) |
| Host city boss cadence | Every map = fight → stamp | **High** maps 5–8 |
| Friendly matches | Stat padding | Medium |
| Scout Report UI | Same 3-card layout | Low if names vary |
| Rival National Team | Anonymous hard fight | **High** — no identity |
| Question → fight/item | Fake randomness | Medium |
| Recovery Center | Mandatory heal checkpoint | Low |

### Repetitive decisions

| Decision | Runs 1–5 | Runs 10+ |
|----------|----------|----------|
| Scout pick (style coverage) | Meaningful | Formulaic ("need CB") |
| Path heal vs scout | Meaningful | Solved pattern |
| Specialist coach target | Meaningful | Always marquee |
| Transfer Market buy | N/A if cut | — |
| Event A vs B | Novel | Optimal choice learned |

### Recommendations

| Priority | Change |
|----------|--------|
| **RECOMMENDED** | **Named rival managers** on trainer nodes (recurring character every 2 maps) — gives narrative continuity |
| **RECOMMENDED** | **Weekly spotlight scout** — +weight on 3 profileIds per account (meta flag, not live ops) |
| **RECOMMENDED** | **Starter-specific Map 0–2 pool bias** — different scout stories per Mbappé/Messi/Van Dijk |
| **OPTIONAL** | Map modifier mutators post-MVP ("Rainy London", "High Altitude Mexico") |
| **OPTIONAL** | Express 6-city mode for repeat players |

---

## 8. MVP Scope Audit

### Keep in MVP (core fun)

| System | Reason |
|--------|--------|
| Marquee Signing (3 starters) | Identity + replay triangle |
| Scout Report → Contract Offer | **Primary dopamine engine** |
| Friendly Match | Form growth + combat familiarity |
| Recovery Center | Pacing safety valve |
| Gear Crate | Build variance |
| Host City Challenge ×8 | Progress structure (locked) |
| Knockout Gates ×5 | **Peak fantasy** (locked) |
| Matchday Squad Selection | Knockout decision moment |
| Settlement + Football Credits | 008 retention |
| Album seen/signed | Collection loop |
| Legend **fragments** (not immediate sign) | Long-term chase |
| Specialist Coach | Simple build depth |
| World Cup Legend node (fragment mode) | Aspiration |
| 6 named events (subset of §6) | Flavor without bloat |
| Run Budget **earn-only** | Optional score → settlement bonus |

### Consider for MVP (borderline)

| System | Verdict | Notes |
|--------|---------|-------|
| Training Camp node | **Defer** | Merge into Friendly+2 on specific nodes; separate type is scope |
| Federation Challenge | **Cut** | Fold bonus into Rival National Team |
| Mystery Event wrapper | **Keep** | Engine already has `question` — reskin rolls only |
| Media / Sponsor / History (generic) | **Replace** | Use 6 named events instead of 3 generic categories |
| Transfer Market | **Cut** | See §5 |
| Run Budget spend sinks | **Cut** | Earn-only for MVP |

### Move to expansion

| System | Phase |
|--------|-------|
| Transfer Market | Post-MVP v0.2 |
| Training Camp (dedicated node) | Post-MVP |
| Federation Challenge (mini-boss) | Post-MVP |
| Full 20-event library | Post-MVP (ship 6) |
| Express 6-city mode | Post-MVP |
| Scout reroll (Run Budget) | Post-MVP |
| Trial Contract for locked legends | Consider v0.2 if fragment-only feels too harsh |
| Account Football Credit shop | Post-MVP |

---

## 9. Dopamine Frequency Audit

### Rewards per ~40-minute run (current SPEC 009)

| Reward type | Estimated frequency | Dead zone? |
|-------------|---------------------|------------|
| **New player signed** | 6–9 | No — strong early, slows Map 6+ |
| **New album entry (first sign)** | 4–7 unique | **Map 3–5** if duplicates rise |
| **Album seen (silhouette)** | 15–20 | Can feel like "almost" rewards |
| **Legend fragments** | 0–5 (if node found) | **Runs 1–10: 0–3 common** — dead zone |
| **City Stamp** | 8 | Good rhythm ~every 5 min |
| **Form level milestone toast** | 2–3 | Weak dopamine alone |
| **Achievement unlock** | 0–1 per run | Sparse — OK for meta |
| **Football Credits (settlement)** | 150–400 typical | **End-only** — 40 min wait |
| **Run Budget tick** | 15–25 micro-gains | Low salience unless UI pulses |

### Dead zones identified

| Window | Duration | Problem |
|--------|----------|---------|
| **Maps 1–2** | ~8–12 min | No elite names; mostly stat fights |
| **Maps 6–7 pre-knockout** | ~10 min | Scout weight low; no new mechanics; stamp fatigue |
| **Knockout (no scouts)** | ~10 min | Pure combat — OK if prep matters; empty if squad locked |
| **Settlement-only credits** | Last 1 min | All meta reward backloaded |

### Estimated rewards per 30-min run (MVP trimmed)

With Transfer Market cut, Federation folded, legend = fragments:

| Reward | Count |
|--------|-------|
| Contract signings | 6–8 |
| New album stickers | 3–5 |
| Stamps | 8 |
| Fragment pips | 3–5 (if 1 legend node) |
| Named events | 2–3 |
| Settlement credits | 1 lump + breakdown |

### Recommendations

| Priority | Change |
|----------|--------|
| **MANDATORY** | **Micro-credit toast** on first sign each run (+50 preview "banked for settlement") |
| **MANDATORY** | **Fragment pip animation** immediately at legend node — don't wait for settlement |
| **RECOMMENDED** | **Mid-run milestone toast** at 4 stamps: "+50 credits pending" |
| **RECOMMENDED** | **Album % HUD** on map — always visible collection progress |
| **RECOMMENDED** | Guaranteed elite scout Map 1–2 (§3) |
| **OPTIONAL** | Knockout gate entry = guaranteed fragment bonus (+2) even on loss |

---

## 10. Final Product Review

### Top 5 strengths

1. **Contract Offer clarity** — 100% sign on pick removes gacha frustration; perfect for football fantasy.
2. **Knockout historical teams** — Emotional peaks are correctly placed after stamp grind; Uruguay → Argentina 2022 arc is excellent.
3. **Dual-layer meta (album + fragments)** — 008 alignment gives runs purpose even on loss.
4. **Host city → knockout structure** — Mirrors World Cup journey; teachable in one tooltip.
5. **Engine-faithful mapping** — Spec respects Pokelike pacing knobs (weights, layers, prep screen) — shippable.

### Top 5 weaknesses

1. **Legend immediate sign** — Undermines 20-fragment chase; one lucky node kills retention (009 vs 008 conflict).
2. **Transfer Market redundancy** — Second recruitment channel adds complexity without new decisions.
3. **Duration optimism** — 30–45 min target likely 42–52 in practice with events and first-run UX.
4. **Maps 1–2 excitement valley** — Elite suppression (0.3×) delays "I got a star" fantasy too long.
5. **Generic events** — Media/Sponsor/History lack World Cup cultural punch; question rolls feel like noise.

### Top 10 improvements (ranked by impact)

| Rank | Improvement | Type | Impact |
|------|-------------|------|--------|
| 1 | Legendary Node → **fragments default**; sign only when unlocked (Model B+) | **MANDATORY** | Fixes retention core |
| 2 | **Remove Transfer Market** from MVP | **MANDATORY** | Cuts complexity; sharpens scout fantasy |
| 3 | **Guaranteed elite** in Map 1 or 2 scout | **MANDATORY** | Kills early dead zone |
| 4 | **6 named World Cup events** replace generic 3 | **RECOMMENDED** | Memorable runs |
| 5 | **Fragment + credit micro-feedback** during run, not only settlement | **RECOMMENDED** | Dopamine frequency |
| 6 | **Remove Federation Challenge**; merge into Rival | **RECOMMENDED** | Less boss fatigue |
| 7 | **Defer Training Camp** node; use Friendly+2 sparingly | **RECOMMENDED** | MVP scope |
| 8 | **Escalating stamp ceremony** maps 5–7 | **RECOMMENDED** | Host city emotional lift |
| 9 | **Named rival manager** recurring on trainer nodes | **OPTIONAL** | Replay narrative |
| 10 | **Knockout telegraph** from Map 4 album page | **OPTIONAL** | Anticipation bridge |

---

## Proposed SPEC 009 changes (patch list)

Apply as targeted edits to SPEC 009 — **not** a rewrite.

### MANDATORY CHANGES

| § | Change |
|---|--------|
| **§5.6** | Legendary Node: default outcome = **3–5 fragments** + album seen. Squad Contract Offer only if `profileId ∈ unlockedLegends`. Optional: Trial Contract (run-only, no album sign). |
| **§3.1 / §8** | Remove `transfer_market` from MVP node catalog and weights. Run Budget = **earn-only**; settlement conversion unchanged. |
| **§4.4** | Add **Map 1–2 guaranteed elite** rule (one elite per report, pool by starter). Raise elite weight 0.3× → **0.6×** maps 0–1. |
| **§1.2** | Revise duration note: **"North star 35–40 min median; 45 min ceiling; first run may reach 50 min."** |
| **§9 / §18** | Add **immediate fragment UI feedback** at legend node (ledger → animation before settlement). |

### RECOMMENDED CHANGES

| § | Change |
|---|--------|
| **§3.1** | Remove Federation Challenge as distinct node; +5 Run Budget on optional Rival paths. |
| **§3.2** | Replace media/sponsor/history sub-rolls with **6 named events** (§6 table). |
| **§2.3** | Reduce Transfer Market visits target to **0**; increase scout reports to **8–10** (reallocate node weight). |
| **§4.6** | Increase scout weight maps 5–7 (+20%). |
| **§9.1** | Add ceremony tier notes for stamps maps 5–7. |
| **§14** | Add "fragment pip" and "pending credits" to rewarding UX list. |
| **§11** | Add mid-run milestone at 4 stamps (+50 pending credits toast). |

### OPTIONAL CHANGES

| § | Change |
|---|--------|
| **§7.2** | Defer `training_camp` type; flag specific friendlies as +2 form. |
| **§2.1** | Document post-MVP Express mode (6 host cities). |
| **§7 / §11** | Trial Contract for locked legends (run-only). |
| **§4.2** | Scout spotlight cosmetic on one card. |
| **§10** | Named rival manager on trainer nodes. |

---

## Conflict resolution log

| Conflict | Resolution |
|----------|------------|
| 009 immediate legend sign vs 008 fragment unlock | **008 wins** — fragments default |
| 009 Transfer Market vs 005 trade cut / scope | **005 spirit wins** — cut market |
| 009 30–45 min vs realistic 42–52 min | **Adjust expectation + trim optional nodes** |
| 8 host cities vs 6 for pacing | **Keep 8** (007 lock); fix ceremony not count |
| Run Budget spend vs 008 no account spend | **Run Budget earn-only** — no conflict |

---

## Sign-off recommendation

SPEC 009 is **approved for implementation after MANDATORY patch list** is applied. Without those three changes (legend fragments, cut Transfer Market, elite scout early), the spec risks building a **technically correct but retention-soft** MVP.

**Fun verdict:** Core loop is **7.5/10** as written; **8.5/10** with mandatory patches; **9/10** with mandatory + recommended event and pacing changes.

---

*End of SPEC 009 Design Review.*
