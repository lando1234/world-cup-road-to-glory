# SPEC 005 — Football MVP Definition

**Project:** Pokelike → World Cup Football Roguelike Autobattler  
**Version:** v0.1 Alpha  
**Analysis date:** 2026-06-05  
**Scope:** Product and game design only — no implementation, no architecture, no technology.  
**Inputs:** [001-codebase-discovery.md](./001-codebase-discovery.md), [002-worldcup-mapping.md](./002-worldcup-mapping.md), [003-football-content-architecture.md](./003-football-content-architecture.md), [004-target-tech-stack-migration-strategy.md](./004-target-tech-stack-migration-strategy.md)

---

## 1. Product Vision

**World Cup Roguelike** is a single-player roguelike autobattler where you play as a national team manager on a road to lift the trophy. Each run is a tournament campaign: you sign players through scouting reports, build a squad of up to six footballers with distinct playing styles, fight through host-city legs on a branching map, collect City Stamps, and survive a knockout gauntlet against legendary historical sides. Battles are **highlight duels** — fast, readable 1v1 auto-fights framed as key match moments, not full 90-minute simulations.

The game is fun because it combines three proven hooks: **roguelike variety** (every run's squad and map path differ), **collectible obsession** (sticker-album completion and gold-card hunts), and **satisfying power growth** (players level up, upgrade, and equip gear mid-run). Football fans get nostalgia without needing a license: fictional pros, real tournament structure, and boss fights against teams that *feel* like Brazil 1970 or Argentina 1986 even if names on the pitch are original. Non-football fans get an accessible autobattler with clear rock-paper-scissors style matchups, visible squad synergies, and short sessions — the football skin is flavor, not homework.

What makes it different from FIFA, Football Manager, and typical football games: there is no manual control of passes or tactics in real time, no season-long career sim, and no 11v11 match engine. This is **Slay the Spire meets Panini sticker album meets World Cup fantasy** — build impossible squads across positions and eras within a single run, lose, unlock, and try again. It rewards composition and collection, not reflexes or transfer-market spreadsheets.

---

## 2. Core Fantasy

Ranked by importance for MVP validation:

| Rank | Fantasy | Why it matters for v0.1 |
|------|---------|-------------------------|
| 1 | **Build your dream squad mid-tournament** | Core roguelike loop; must feel good in first run |
| 2 | **Defeat iconic World Cup teams** | Primary football differentiation; knockout bosses carry nostalgia |
| 3 | **Scout and collect players into the album** | Meta hook for run #2; sticker completion drives retention |
| 4 | **Create impossible teams across styles** | Style matchups + dual-style players = tactical depth without complexity |
| 5 | **Collect football legends** | Rare spike moments; defer full legend catalog |
| 6 | **Scout future stars (youth → icon upgrades)** | Evolution satisfaction; linear paths only in MVP |
| 7 | **Create impossible teams across eras** | Requires Classic Era + large roster — post-MVP |

**Primary player fantasy (one sentence):** *I am a World Cup manager who scouts talent on the road, builds a squad that clicks, and takes down legendary champion sides to lift the trophy — then fills my album with everyone I missed.*

---

## 3. MVP Success Criteria

These are measurable signals that the **concept** works, not launch KPIs.

### Must-hit (alpha gate)

| Metric | Target | What it proves |
|--------|--------|----------------|
| **First-run completion rate** | ≥40% of playtesters finish a run (win or lose at knockout) | Campaign length and difficulty are tolerable |
| **Second-run start rate** | ≥60% of finishers start run #2 within same session | Roguelike "one more run" hook works |
| **Time to first boss** | ≤12 minutes | Early game is not a slog |
| **Time to first knockout fight** | ≤25 minutes | Full arc reachable in one sitting |
| **Scouts per first run** | ≥4 players signed beyond marquee | Scouting loop is frequent and rewarding |
| **Album interactions** | ≥50% open album at least once post-run | Collection meta resonates |

### Strong signals (concept is working)

| Signal | Indicator |
|--------|-----------|
| Players **describe their squad** unprompted | Attachment to characters, not just stats |
| Players **ask about missing players** after a run | Album/collection pull is real |
| Players **debate starter choice** | Marquee triangle creates meaningful decision |
| Players **remember a knockout boss** by team/year, not mechanics | Historical boss fantasy landed |
| Players **experiment with style composition** in run #2+ | Style system readable without tutorial wall |

### Failure signals (pivot or cut scope)

| Signal | Meaning |
|--------|---------|
| Playtesters quit before first City Stamp | Map pacing or battle boredom |
| "Feels like reskinned Pokémon" with no football identity | Theming failed; boss/scout flavor insufficient |
| No desire to replay after a win | Meta progression too thin |
| Confusion about why they lost | Style matchups or UI illegibility |

**North-star qualitative test:** After 45 minutes, a playtester can answer *"Who was on your squad, which historical team beat you (or did you beat), and which player do you want to find next run?"* If all three answers come easily, the concept is working.

---

## 4. MVP Scope

For each feature: what ships in v0.1, what does not, and why.

### Collection

| | |
|--|--|
| **Included** | World Cup Album with **~50 sticker slots** (partial Modern Era volume). Seen (silhouette) vs signed (full color) states. Album accessible from map HUD and post-run. |
| **Excluded** | Full 151-slot volume, Classic Era volume, gold sticker album as separate completion track, Scout Network Upgrade reward |
| **Reasoning** | Album shape `{ id: 0\|1 }` is engine-ready; 50 slots matches authored MVP roster. Full completion chase is launch content, not validation content. |

### Scouting

| | |
|--|--|
| **Included** | Scouting report nodes: pick **1 of 3** players. Guaranteed scout nodes on early maps; weighted spawns later. Pool limited to MVP roster IDs. |
| **Excluded** | Transfer window multi-step UX, nation-restricted scouting, scout quality tiers as separate node type, agent narrative events |
| **Reasoning** | `doCatchNode` is pick-1-of-3 already — zero new mechanics. Limiting pool to ~50 IDs controls authoring cost. |

### Team Building

| | |
|--|--|
| **Included** | Squad grows **1 → 6** over the campaign (existing `maxTeamSize` curve). Swap screen when full. Style chips visible on cards. Optional squad reorder before knockout fights (elite prep screen). |
| **Excluded** | Formation picker, nation-only squads, chemistry separate from styles, bench/reserve slots beyond six |
| **Reasoning** | Engine caps at six; reorder prep exists for Elite Four. Formations add UI and rules without validating core fantasy. |

### Battles

| | |
|--|--|
| **Included** | Highlight duel auto-battles: friendlies, rival national teams, all bosses. Skip/auto-continue toggle. Style effectiveness with **6-style cheat sheet** in first-run tutorial. Battle log flavor text (pass, shot, tackle verbs). |
| **Excluded** | Manual substitutions mid-fight, multi-player phases, penalty shootout minigame, weather/pitch modifiers |
| **Reasoning** | `runBattle` + replay is the entire engine. MVP validates whether *framing* sells football, not new combat rules. |

### Bosses

| | |
|--|--|
| **Included** | **8 Host City Bosses** (fictional federation coaches, Spec 003 table). **5 Knockout bosses** as **Historical World Cup Champions** (see §9). City Stamp reward after each host boss. |
| **Excluded** | Historical teams as host-city bosses (doubles authoring), Continental Champions Cup bosses, recurring rival manager arc (Silver/Grudge derby) |
| **Reasoning** | Eight maps require eight stamps — engine constraint. Nostalgia budget concentrated on knockout stage where emotional peak belongs. |

### Progression

| | |
|--|--|
| **Included** | Form level gains (+2 trainer/boss, +1 friendly). **Linear player upgrades** only (2-stage chains: prospect → first team → icon where chain exists). Gear crates (pick 1 of 3 items). Medical tent full heal. Specialist coach node (skill tier +1). |
| **Excluded** | Branching development paths (Luca Versatile / Eevee equivalent), legacy training stat buffs, Battle Tower meta, permanent cross-run stat investment |
| **Reasoning** | Linear `EVOLUTIONS` works out of the box. Branching requires overlay UI and seven paths — high cost, low validation value for run #1. Legacy training is CCC reward — mode excluded. |

### Album

| | |
|--|--|
| **Included** | Single partial volume: **"Road to the Trophy — Vol. 1"** with ~5 pages (starters, fan favorites, host city leg highlights, legends, knockout hall). Empty slots visible; signed slots satisfying. |
| **Excluded** | Multiple volumes, stamp book as separate collectible, hidden slots, trading cards with friends |
| **Reasoning** | Completion motivation comes from **visible empty silhouettes** after first run, not from 151 pages. |

### Unlocks

| | |
|--|--|
| **Included** | **Trophy Room** entry on campaign win (Hall of Fame). **3 marquee signings** rotate availability via `usedStarters` — encourage replay with different starter. **2 World Cup Legends** added to album pool after first win (not before). |
| **Excluded** | Continental Champions Cup unlock, Classic Era unlock, achievement wall beyond ~6 milestones, cloud account features |
| **Reasoning** | Minimal meta: win once → trophy + new legend encounters + new starter incentive. Enough for run #2 without building endgame mode. |

---

## 5. Gameplay Loop

Complete loop for v0.1 World Cup campaign:

```
Title Screen
    ↓
Choose Manager (boy/girl — one-time or persisted)
    ↓
Marquee Signing — pick 1 of 3 starters (style triangle)
    ↓
┌─ HOST CITY LEG (×8) ─────────────────────────────────────┐
│  Arrival in host city (map start)                        │
│       ↓                                                  │
│  Navigate branching map — pick nodes                       │
│       ├── Friendly match → +1 Form Lv.                   │
│       ├── Scouting report → sign 1 of 3 players          │
│       ├── Gear crate → pick 1 of 3 items                 │
│       ├── Rival national team → harder fight, +2 Form Lv.│
│       ├── Medical tent → full squad heal                   │
│       ├── Specialist coach → skill tier +1 (one player)  │
│       ├── Mystery event → random node roll               │
│       └── (later legs) World Cup Legend node — rare      │
│       ↓                                                  │
│  Host City Boss → Highlight duel → City Stamp (+2 Lv.)   │
└──────────────────────────────────────────────────────────┘
    ↓ (after 8 City Stamps)
Knockout Draw Ceremony (transition)
    ↓
Matchday Squad Selection — reorder squad, use consumables
    ↓
Knockout Gate 1 — Historical champion team (R16)
    ↓
Matchday prep → Gate 2 (Quarter-final)
    ↓
Matchday prep → Gate 3 (Semi-final)
    ↓
Matchday prep → Gate 4 (Final)
    ↓
Matchday prep → Gate 5 (Champion / Trophy lift)
    ↓
┌─ OUTCOME ────────────────────────────────────────────────┐
│  WIN  → World Cup lifted → Trophy Room → Album updated   │
│  LOSE → Campaign over → Album updated → Retry prompt     │
└──────────────────────────────────────────────────────────┘
    ↓
Start Again — new map seed, new scouts, maybe new marquee
```

**Between-node player decisions:** path choice on map (risk vs scout opportunity), squad swap when full, item equip on player, which specialist coach target to pick.

**Run ends when:** squad wipes in any battle with no viable players, or player wins Gate 5.

---

## 6. Starter Experience

**Goal:** Fun in 5 minutes. Player understands scout → fight → grow before first boss.

### Minute 0–1: Title → Manager → Marquee Signing

- Skip cloud save prompt in alpha (or hide behind settings).
- **Manager pick:** boy/girl — cosmetic only; one screen, no stats.
- **Marquee signing:** 3 choices only:

| Option | Player | Style | Role fantasy |
|--------|--------|-------|--------------|
| A | Diego Núñez | High Press | Aggressive striker — easy to understand |
| B | Pedro Mendes | Wing Play | Balanced creator |
| C | Jonas Klar | Compact Block | Defensive anchor |

- Show **style triangle** tooltip once: *Press beats Wing Play beats Compact Block beats Press.*
- No era toggle on title in MVP — **Modern Era only**.

### Minute 1–3: São Paulo Leg (Map 0)

- Map 0 is **scripted weights** for first run (not pure random): guaranteed **Scouting report** as second node, then **Friendly match**, then path to boss.
- First scout offers **3 Common/Uncommon** players — all usable. Signing anyone triggers album animation (first sticker).
- First friendly is **winnable at form level 5** with zero items; battle lasts ~15–20 seconds with auto-skip default **off** for first fight only (show animations once).

### Minute 3–5: First boss tease

- Player reaches **Coach Rocha** (São Paulo Host City Boss) by minute **8–12** (full first boss), but by minute 5 they should have:
  - **2 squad members**
  - **1 form level gain** on marquee
  - **1 album sticker** filled
  - Seen **City Stamp** icon on HUD explaining the goal

**Choices count in first 5 minutes:** 1 marquee + 1 map path + 1 scout pick + 1–2 map paths ≈ **4–5 meaningful clicks**.

**New player rate:** First scout by minute 2; second scout opportunity by minute 8–10 (Map 0 or early Map 1).

**First boss timing:** **8–12 minutes** (Map 0 only, tuned level band).

---

## 7. First Run Experience

Designed arc for a fresh player with no meta unlocks.

| Parameter | MVP target | Notes |
|-----------|------------|-------|
| **Host city maps** | 8 | Engine default; do not cut |
| **City Stamps** | 8 | One per map boss |
| **Knockout gates** | 5 | Elite Four chain |
| **Total boss fights** | 13 | 8 + 5 |
| **Approximate duration** | **30–45 minutes** | With auto-skip on after first battle |
| **Scouting reports** | **6–9 signed** | ~1 per map leg average |
| **Gear/medical nodes** | 4–6 interacted | Pick 1 of 3 each time |
| **Player upgrades (evo)** | **2–4 evolutions** | Marquee hits first upgrade ~Map 2–3 |
| **Skill tier upgrades** | 0–2 | Optional specialist coach nodes |
| **World Cup Legend encounters** | 0–1 | Map 5+ if lucky; not guaranteed run 1 |
| **Peak squad size** | 6 by Map 4–5 | Standard curve |

### Pacing knobs (design tuning, not engine rewrites)

- Enable **auto-skip** after first battle of run.
- Map 0–1: higher scout node weight.
- Boss level bands unchanged from Spec 003 — proven curve.
- Knockout prep: allow consumables; telegraph next historical team's **primary style** on prep screen.

### Expected first-run outcome distribution (playtest target)

| Outcome | Expected share |
|---------|----------------|
| Win World Cup | 15–25% |
| Lose in knockout (Gates 1–4) | 40–50% |
| Lose in host cities (Maps 4–7) | 25–35% |
| Lose before Map 3 | <15% |

A first-run **loss in semi-final or final** is ideal — player felt the fantasy, came close, wants revenge.

---

## 8. MVP Roster

### Recommendation: **50 player profile IDs** (~20 player lines)

Not 30, not 75, not 100.

| Option | Verdict | Rationale |
|--------|---------|-----------|
| 30 | Too small | Exhausts scout variety by Map 4; album feels sparse; evolution chains consume IDs fast |
| **50** | **Optimal** | Matches Spec 003 §11 sample content; enough rarity spread; authorable in alpha timeline |
| 75 | Acceptable stretch | Only if art pipeline is fast; marginal validation gain |
| 100 | Reject | Authoring and balance cost without proportional learning for alpha |

### Roster composition (50 IDs)

| Bucket | Count (IDs) | Purpose |
|--------|-------------|---------|
| Marquee lines (3 chains) | 9 | IDs 1–3, 4–6, 7–9 — starters + upgrades |
| Scoutable fan favorites | 24 | IDs 10–33 — varied styles/rarities |
| Host city boss squad reuse | 8 | IDs 34–41 — appear in boss teams + album |
| Knockout historical squads | 6 | IDs 42–47 — boss-exclusive faces |
| World Cup Legends | 2 | IDs 48–49 — legendary node only |
| Wildcard / mystery event | 1 | ID 50 — optional flair |

**Evolution depth:** Maximum **3 forms** per line; most lines **2 forms** (prospect → star).

**Dual-style players:** ~15% of roster — enough to teach synergy without overwhelming.

**Album displays:** 50 slots; evolution stages share album page rows (show highest form signed).

---

## 9. Historical Team Bosses

MVP uses historical teams **only in knockout stage** (5 gates). Host city bosses remain **fictional coaches** per Spec 003 to separate "tournament geography" from "football nostalgia."

All teams use **fictional player names** on historical **national team identities** (flag, kit colors, era nickname in UI). No licensed player likenesses.

| Gate | Team | Year | Why selected | Difficulty |
|------|------|------|--------------|------------|
| **Round of 16** | **Uruguay** | 1950 | Original giant-killer myth (Maracanazo); teaches that underdog stories are core to World Cup | ★★☆☆☆ — Intro knockout; 4-player squad, form Lv. 38–42 |
| **Quarter-final** | **Brazil** | 1970 | Peak aesthetic football; most universally recognized "best team ever" reference | ★★★☆☆ — Style diversity; Lv. 45–50 |
| **Semi-final** | **Argentina** | 1986 | Individual brilliance + underdog narrative; emotional peak before final | ★★★★☆ — High burst damage style; Lv. 52–58 |
| **Final** | **France** | 1998 | Modern multi-star template; bridges classic and contemporary | ★★★★☆ — Balanced styles; Lv. 60–65 |
| **Trophy lift** | **Argentina** | 2022 | Most recent champion; immediate recognition for players under 40 | ★★★★★ — Gatekeeper; Lv. 65–72, one mythic-profile boss player |

**Excluded from MVP (launch backlog):** Spain 2010, Germany 2014, Italy 2006, Brazil 2002, Netherlands 1974 — excellent additions, not needed to prove nostalgia hook.

**Difficulty curve intent:** Each gate adds **+1 squad member** on enemy side (matching Elite Four escalation) and **+1 primary style synergy tier** on boss team composition.

---

## 10. Player Development

### Recommendations for MVP

| Question | MVP answer |
|----------|------------|
| Keep evolutions? | **Yes — linear only** |
| How many stages? | **2 stages default** (prospect at sign → upgrade at Form Lv. 16); **3 stages** for marquee lines only (add Form Lv. 36 icon form) |
| How many upgrade paths? | **1 path per player** — no branches |
| Branching upgrades? | **No** — defer Luca Versatile equivalent entirely |
| Moon Stone / breakthrough injection? | **No** — one less consumable type to explain |
| Skill tiers? | **Yes** — keep 3 tiers (I / II / III); max one specialist coach + one skill manual item per run typical |

### Simplest rewarding implementation

1. **Automatic upgrade at level threshold** — big portrait flash, name suffix change, stats bump. No player choice.
2. **Skill tier** — visible on card; specialist coach node lets player pick **one squad member** to upgrade. Clear before/after on damage in next fight.
3. **Form level** — always visible; primary power feel between fights.

**Cut aggressively:** Branching overlays, breakthrough injection item, Eviolite youth clause flavor (item can exist renamed but not required for MVP tutorial).

---

## 11. Play Styles

### Engine reality

The battle engine requires the full **18-style type chart** internally (Spec 003 Appendix B). MVP does not simplify math — it simplifies **teaching**.

| Question | MVP answer |
|----------|------------|
| How many styles? | **18 exist**; **6 taught** in first run |
| How many required for launch? | **All 18 functional** — labels and colors reskinned only |
| Can we launch with fewer? | **No** — cutting styles breaks `TYPE_CHART` and trait hooks; high engine cost for zero product gain |

### MVP "Core Six" (tutorial and UI emphasis)

| Style | Beats | Loses to | Player-facing one-liner |
|-------|-------|----------|-------------------------|
| High Press | Wing Play | Compact Block | *Swarm them before they settle* |
| Wing Play | Compact Block | High Press | *Stretch the block sideways* |
| Compact Block | High Press | Wing Play | *Absorb and frustrate* |
| Possession Build-up | Rapid Counter | High Press | *Control the tempo* |
| Rapid Counter | High Press | Possession Build-up | *Hit on the break* |
| Tactical Control | Physical Battle | Rapid Counter | *Read the game, exploit space* |

Other 12 styles appear on cards with tooltip definitions — no separate tutorial.

**Continental Champions Cup traits:** Not in MVP. Trait panel hidden in campaign mode (existing behavior).

---

## 12. Collection Album

### MVP album design

**Volume title:** *Road to the Trophy — Vol. 1*

| Page | Slots | Visibility | Completion motivation |
|------|-------|------------|------------------------|
| Marquee Signings | 3 | Always visible | "Try all three starters across runs" |
| Fan Favorites | 20 | Visible | Core scout targets; silhouettes after seeing in report |
| Host City Heroes | 8 | Visible | Boss squad players; ties stamps to characters |
| Legends | 2 | **Hidden until first legend seen** | Surprise foil page |
| Knockout Immortals | 5 | Visible but **locked gray** until gate reached | Preview upcoming bosses' roster faces |

### States

| State | UI |
|-------|-----|
| Unknown | Empty page slot (legends only) |
| Seen | Silhouette sticker |
| Signed | Full-color sticker + nation flag + style chip |
| Gold card | **Excluded from MVP** — defer shiny/gold variant |

### What creates completion motivation

- After first loss, album shows **12+ empty silhouettes** the player almost signed.
- Knockout page previews **Argentina 2022** locked slot — explicit "come back for this."
- Trophy Room shows **winning squad snapshot** — social screenshot moment for playtests.

---

## 13. Features Explicitly Excluded From MVP

# Not In MVP

| Feature | Why excluded |
|---------|--------------|
| **Online accounts / cloud save** | Validation is local playtest; sync adds infra risk with zero concept-learning value |
| **Multiplayer / PvP** | Different game; 6–8 week scope |
| **Live events / seasons** | Requires backend, ops, balance pipeline |
| **Continental Champions Cup (Battle Tower)** | Entire parallel mode; traits meta; legacy training — ship after campaign validated |
| **Classic Era toggle** | Doubles boss roster, album volume, starter pool |
| **Injury List mode (Nuzlocke)** | Audience shrink; permadeath frustrates first-time validation |
| **Grudge derby / rival manager (Silver node)** | Narrative content for Gen 2 equivalent — cut |
| **Branching player upgrades** | UI + content cost; linear upgrades sufficient for "growth feels good" |
| **Gold card / shiny variants** | Collection complexity; defer to beta |
| **Full 151+ album** | Authoring bottleneck; partial album tests completion drive |
| **649 player catalog** | Launch scope per Spec 003; MVP uses 50 |
| **Real player names / licenses** | Legal cost; fictional pool validates fantasy equally |
| **Advanced battle animations** | Canvas port not required for fun validation; existing animations reskinned |
| **Leaderboards** | Needs accounts + anti-cheat |
| **Mobile app / PWA polish** | Desktop browser alpha first |
| **Achievements beyond ~6** | Milestone set only: first stamp, first knockout, first win, 25/50 album, beat Brazil 1970, win with each marquee |
| **Trade node** | **Cut from MVP** — confusing for new players ("why lose my player?"); engine supports it but disable via map weights = 0 |
| **Transfer swap narrative** | Same as trade |
| **National team identity lock** | Engine allows mixed squad; restricting nations is new ruleset |
| **Formation / position tactics** | Positions shown as flavor text on cards only |
| **Penalty shootout nodes** | New mechanic |
| **Women's tournament volume** | Parallel content doubling |
| **Legacy training (permanent stat buffs)** | CCC reward system |
| **Scout Network Upgrade** | Album completion reward — no full album in MVP |
| **Patch notes / analytics / ads** | Strip for alpha build |

---

## 14. MVP Risk Analysis

### Biggest product risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Football theme feels pasted on; battles still feel like Pokémon** | Medium | High | Knockout historical teams with kit colors + era titles; battle log verbs; manager/boss portraits; **no Pokémon words in UI** |
| **50 players exhausts variety by run 3** | Medium | Medium | Weight scout pools by map; 20 fan favorites with style spread; evolution stages feel like "new" finds |
| **No attachment to squad — players remember stats not names** | Medium | High | Short flavor text on every profile; marquee upgrade renames; Trophy Room squad snapshot; 2–3 named boss players per historical team |
| **30–45 min target missed; runs feel 60+ min** | High | Medium | Auto-skip default on; reduce optional nodes per map layer weights; playtest from Map 3 onward |
| **Style system confusing despite tutorial** | Medium | High | Core Six triangle always on scout screen; prep screen shows boss primary style + counter hint |
| **1v1 highlight duel breaks football immersion** | Low–Medium | High | Set expectation in tutorial: *"Each fight is a key duel, not a full match"* — lean in, don't apologize |
| **Historical teams without stars feel generic** | Medium | Medium | Era nicknames ("Brazil 1970 — The Beautiful Game"), kit palette, one **signature mythic** player per gate |
| **Partial album kills collection motivation** | Low | Medium | Show total "50 to collect" prominently; locked knockout page teases future signings |
| **First run too hard; players never reach knockout** | Medium | High | Monitor loss histogram; tune Map 0–2 level bands down 5–10% if >15% quit before Map 3 |
| **First run too easy; no tension** | Low | Medium | Argentina 2022 gate should end **most** first runs; acceptable |

---

## 15. Recommended MVP Scope

# MVP Recommendation

**If we had only 6–8 weeks to launch a playable alpha using the existing Pokelike engine, build exactly this:**

### One-sentence scope

A **Modern Era World Cup campaign only**: 8 host cities, 5 historical knockout champions, 50 fictional players, linear upgrades, partial sticker album, local save — reskin and content, not new mechanics.

### Included features (build list)

1. Full **8-map + 5-knockout** campaign loop (Normal mode only)
2. **3 marquee starters** with style triangle tutorial
3. **50 player profiles** with names, nations, portraits (placeholder art acceptable), 18 styles labeled
4. **8 fictional Host City Bosses** (Spec 003 Modern Era table — names/flavor only)
5. **5 historical knockout teams** (Uruguay 1950 → Argentina 2022)
6. **Scouting, friendlies, gear crates, medical tent, specialist coach** nodes
7. **Linear player upgrades** (2–3 stages on key lines)
8. **Partial World Cup Album** (50 slots, 5 pages)
9. **Trophy Room** on win
10. **6 manager milestones** achievements
11. **~10 renamed items** (top held + medical consumables)
12. **Football vocabulary pass** per Spec 002 theming package
13. **First-run map 0 scout weight bias** (data/config tweak, not new code)
14. **Trade node disabled** (weight 0)
15. **2 World Cup Legend encounters** in pool (maps 5+)

### Excluded features (do not build in alpha)

- Continental Champions Cup / Battle Tower / traits panel
- Classic Era / Injury List / cloud save
- Branching evolutions / gold cards / trade
- Full album (151+) / 649 roster
- Accounts, leaderboards, live ops, mobile polish
- New battle mechanics, formations, PvP

### Recommended numbers

| Parameter | Value |
|-----------|-------|
| **Roster size** | 50 profile IDs |
| **Boss count** | 13 (8 host + 5 historical knockout) |
| **Run length** | 30–45 minutes target |
| **Scouts per run** | 6–9 |
| **Legends in pool** | 2 |
| **Achievements** | 6 |
| **Items renamed** | 10 |
| **Play styles taught** | 6 (18 functional) |
| **Album slots** | 50 |

### Week-by-week opinionated priority (product-facing)

| Weeks | Focus |
|-------|-------|
| 1–2 | Vocabulary reskin + 3 starters + Map 0–1 playable; first boss win internal milestone |
| 3–4 | All 50 profiles + 8 host bosses + album UI |
| 5 | 5 historical knockout teams + prep screen telegraph |
| 6 | Pacing pass, tutorial, 6 achievements, Trophy Room |
| 7–8 | Playtest loop, difficulty tuning, polish flavor text, strip non-MVP nodes |

### Tradeoffs made deliberately

| We chose | Over | Because |
|----------|------|---------|
| 50 players | 151 | Ship playtests 4 weeks sooner |
| Historical bosses in knockout only | Historical bosses everywhere | Maximum nostalgia per authored squad (5 teams, not 13) |
| Linear upgrades | Branching paths | Upgrade moment in minute 15 of run #1 matters more than build diversity |
| No Battle Tower | Including CCC | Campaign *is* the product hypothesis |
| Disable trade | Keep trade | First-run cognitive load kills scout excitement |
| Fictional names | Licensed stars | Alpha validates mechanics; licensing is a business decision |

### Alpha success definition

Ship when an internal playtester can complete the loop above, say *"I want to try Compact Block starter to beat Brazil differently,"* and file **zero** bugs that block reaching the knockout stage.

---

## Appendix — Challenge Log (Scope we rejected on purpose)

Ideas that sound good but **fail the 6–8 week test**:

| Idea | Challenge |
|------|-----------|
| "Let's add 100 players for more variety" | Doubles art + balance time; 50 is enough to validate scout joy |
| "Let's make host city bosses historical too" | 8 historical XIs to author vs 5; dilutes knockout peak |
| "Let's include Battle Tower for replayability" | Second product; campaign replayability not yet proven |
| "Let's add nation-locked squads for authenticity" | New rules + UI; mixed squad is fun and engine-free |
| "Let's implement branching development for depth" | Eevee overlay is highest UI risk in codebase per Spec 001 |
| "Let's wait until full React migration to playtest" | Phase 0 vanilla reskin validates football theme before architecture spend |

---

*End of SPEC 005 — Football MVP Definition.*
