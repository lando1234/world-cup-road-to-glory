# Spec 002 — World Cup Design Mapping

**Project:** Pokelike → World Cup reskin  
**Version referenced:** v1.6 (per codebase discovery)  
**Analysis date:** 2026-06-05  
**Scope:** Design proposal only — no production code modified.  
**Input:** [001-codebase-discovery.md](./001-codebase-discovery.md)

---

## Purpose

This document maps every major Pokelike system to football / World Cup equivalents. Each entry includes the current Pokémon concept, at least three reskin alternatives, trade-offs, and a **recommended option** that best preserves gameplay feel while maximizing thematic clarity for a World Cup roguelike.

### Design principles for this reskin

1. **Preserve mechanics first** — mappings should not require engine changes (1v1 auto-battles, type chart, node DAG, dex keys, evolution thresholds, trait tiers).
2. **World Cup as the narrative spine** — the Normal run is a tournament campaign; Battle Tower is a separate elite competition.
3. **Squad, not monster collection** — language should consistently frame the player as a **national team manager** building a **squad**.
4. **Avoid real FIFA/IP lock-in in copy** — use generic football terms (host city, knockout, album sticker) unless licensed assets are confirmed.

---

## Executive Summary

| Layer | Pokémon concept | Recommended football equivalent |
|-------|-----------------|----------------------------------|
| Core unit | Pokémon | **Player** |
| Player avatar | Trainer (boy/girl) | **Manager** |
| Main campaign | 8 gyms + Elite Four | **Group stage host cities → Knockout bracket** |
| Collection meta | Pokédex | **World Cup Album** (sticker / player collection) |
| Power growth | Evolution + levels | **Player upgrade** (development + form progression) |
| Endgame mode | Battle Tower | **Continental Champions Cup** (multi-region tournament) |
| Type synergies | Battle Tower traits | **Team tactical traits** (style chemistry) |
| Rare encounters | Legendary Pokémon | **World Cup Legends** (iconic retired stars / mythic players) |
| Permadeath mode | Nuzlocke | **Injury List mode** (ruled out for the run) |

---

## 1. Core Entities

### 1.1 Pokémon (creature instance)

**Pokémon equivalent:** A species instance on your team — level, HP, types, held item, move tier, shiny flag, stat buffs.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Player** | Universal, intuitive; maps cleanly to squad roster (max 6). | Generic — needs position/style tags to feel football-specific. |
| B | **Squad member** | Emphasizes team context over individual star power. | Slightly wordy in UI; "swap squad member" is less punchy than "swap player". |
| C | **International call-up** | Strong World Cup framing; reinforces national-team fantasy. | Awkward for Battle Tower club-style content; sounds temporary. |

**Recommended:** **Player (A)** — simplest label across Normal mode, transfers, scouting, and Battle Tower. Use "call-up" only in flavor text when adding from scout nodes.

---

### 1.2 Trainer (player avatar)

**Pokémon equivalent:** `state.trainer` — boy/girl sprite choice; no combat stats.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Manager** | Classic football fantasy; matches tactical UI (traits, prep screen). | Gendered sprites need manager art variants. |
| B | **Head coach** | Slightly more authoritative tone for elite prep / knockout screens. | Longer copy in tight HUD space. |
| C | **National team captain** | Player-hero framing; iconic World Cup image. | Conflicts with squad of "players"; captain is usually one roster slot. |

**Recommended:** **Manager (A)** — distinct from squad **Players**, aligns with reorder/items prep before knockout fights.

---

### 1.3 Species / speciesId

**Pokémon equivalent:** National Dex ID as universal foreign key; species definition from `pokedex.json`.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Player profile ID** | Theme-agnostic key; easy migration from `speciesId`. | No football flavor in the identifier itself. |
| B | **Real-world player archetype catalog** | Rich flavor (e.g., "Box-to-box 8", "Target man 9"). | Licensing risk if using real names; large content pipeline. |
| C | **Fictional player pool** (generated names + nations) | Legally safe; supports sticker-album collectathon. | Requires full art/naming pass; no instant PokeAPI fallback. |

**Recommended:** **Fictional player pool (C)** for shipping reskin; keep internal **`playerProfileId`** alias of `speciesId` during transition (**A** as technical bridge).

---

### 1.4 Types (Fire, Water, Psychic, …)

**Pokémon equivalent:** 18-type chart drives moves, effectiveness, traits, and item boosts.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Playing styles** (Pressing, Possession, Counter, Aerial, Technical, …) | Natural type-chart metaphor (styles beat styles); trait panel reads as tactics board. | 18 distinct styles need clear player-facing names and icons. |
| B | **Position groups** (GK, CB, FB, DM, CM, AM, W, ST) | Instant football literacy. | Hard to fit 18 groups; dual-type = dual-position awkward in 1v1. |
| C | **Regional football identities** (Samba, Catenaccio, Gegenpress, …) | Strong World Cup color; nation-themed squads. | Stereotype risk; weaker as combat rock-paper-scissors. |

**Recommended:** **Playing styles (A)** — preserves dual-type teams and trait synergies. Map each Pokémon type 1:1 to a style (e.g., Fire → **High Press**, Water → **Fluid Build-up**, Psychic → **Tactical Control**). Use nation flags as cosmetic layer, not combat types.

---

### 1.5 Stats (HP, ATK, DEF, SP.A, SP.D, SPE)

**Pokémon equivalent:** Main-series-inspired stats in `createInstance` / `calcDamage`.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Stamina, Power, Defense, Technique, Vision, Pace** | Readable football labels; SP.A/SP.D → Technique/Vision works. | Six stats still abstract for casual fans. |
| B | **FIFA-style aggregates** (Pace, Shooting, Passing, Dribbling, Defending, Physical) | Familiar to gamers. | Trademark-adjacent naming; Physical overlaps Defense. |
| C | **Keep short codes** (STA, PWR, DEF, TEC, VIS, PAC) | Minimal UI churn. | Less immersive than full words. |

**Recommended:** **Stamina, Power, Defense, Technique, Vision, Pace (A)** — rename only labels; keep underlying stat keys until engine refactor.

---

### 1.6 Moves / moveTier

**Pokémon equivalent:** `MOVE_POOL` by type; `moveTier` 0–2 upgraded by Move Tutor / TM item.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Signature skills** (weak / standard / elite tier) | Explains moveTier as skill development. | Less visceral than "shoot/pass". |
| B | **Actions** (Pass, Shot, Dribble, Tackle, Cross, …) | Matches battle animation fantasy. | Type-linked move names need full rewrite. |
| C | **Set-piece & pattern moves** (Overlap run, Through ball, Long shot) | Distinct football flavor. | Harder to auto-map 18 types × move lists. |

**Recommended:** **Signature skills (A)** for tier system; display random **action verb** per attack animation (B) in battle log only.

---

## 2. Game Modes

### 2.1 Normal mode

**Pokémon equivalent:** Starter → 8 roguelike maps → Elite Four → Hall of Fame.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **World Cup campaign** (group cities → knockout) | Perfect arc; 8 maps = 8 host checkpoints before bracket. | Group stage vs knockout structure is simplified in current map DAG. |
| B | **Qualifying road to the World Cup** | Explains early weaker foes and rising difficulty. | Anti-climactic if "World Cup" is only the final map. |
| C | **Manager career: one tournament run** | Roguelike-friendly; HoF = trophy cabinet. | Less specific World Cup branding. |

**Recommended:** **World Cup campaign (A)** — each map is a **Host City** leg; badge = **City Stamp**; Elite Four = **Knockout Stage** (see §4.2).

---

### 2.2 Nuzlocke mode

**Pokémon equivalent:** Fainted Pokémon removed permanently (Silver battles exempt).

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Injury List mode** | Clear permadeath metaphor; "ruled out for the tournament". | May confuse with heal nodes (medical tent still OK). |
| B | **Red card ban mode** | Dramatic; player sent off = gone. | Red card usually means suspension, not career death. |
| C | **No substitutions pool** | Emphasizes scarce roster depth. | Doesn't communicate permanence on faint. |

**Recommended:** **Injury List mode (A)** — on "faint", player suffers **tournament-ending injury** and is removed from squad.

---

### 2.3 Gen 2 toggle

**Pokémon equivalent:** Johto gym order, Gen 2 starters, Silver rival, different level curves.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Era toggle** (Classic World Cup vs Modern World Cup) | Same mechanical split; different roster pools and boss order. | "Gen 2" players won't know what it means in UI. |
| B | **Confederation toggle** (e.g., Europe 1990s vs Americas 2010s) | Thematic regions with distinct pools. | Content must be duplicated per confederation. |
| C | **Women's / Men's tournament toggle** | Inclusive; doubles audience. | Requires parallel asset set; scope explosion. |

**Recommended:** **Era toggle (A)** — label **Classic Era** / **Modern Era**; map Johto leaders to classic host cities / coaches.

---

### 2.4 Battle Tower (endless mode)

**Pokémon equivalent:** Unlocked after HoF; 5 stages × 3 regions × 3 maps; type traits; stat buff rewards.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Continental Champions Cup** | Multi-region structure maps 1:1; traits = tactical identity. | Not World Cup-branded — intentional side mode. |
| B | **Club World Championship** | Explains mixed "trainer" bosses (club legends). | Weaker tie to national squad from Normal run. |
| C | **Legends Invitational** | Matches archetype names (Fire Ace → Striker Icon). | Sounds exhibition-only; less stakes. |

**Recommended:** **Continental Champions Cup (A)** — Normal run wins the **World Cup**; Battle Tower is **continental club + federation gauntlet** with **team tactical traits**.

---

## 3. Map & Node Types

The roguelike DAG (`map.js` `NODE_TYPES`) is the spine of each Host City leg.

### 3.1 Map / arena (per `mapIndex`)

**Pokémon equivalent:** One generated map per gym; `MAP_NAMES` themed arenas.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Host City leg** | World Cup sticker album per city; boss = city federation chief. | 8 cities must be authored. |
| B | **Training camp week** | Explains varied node types (scout, gear, friendly). | Less tournament urgency. |
| C | **Group stage matchday cluster** | Football-native; nodes = events between matches. | Group tables not simulated in engine. |

**Recommended:** **Host City leg (A)** — e.g., "São Paulo Leg", "Berlin Leg"; final map before knockout = **Final Host City**.

---

### 3.2 Battle node (`battle`)

**Pokémon equivalent:** Wild battle; +1 level on win.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Friendly match** | Low stakes; XP = match experience. | Less exciting than competitive node name. |
| B | **Training drill** | Fits auto-battle abstraction. | Weaker connection to level gain. |
| C | **Warm-up fixture** | Tournament tone; still clearly pre-knockout. | Slightly long for map tooltip. |

**Recommended:** **Friendly match (A)** — tooltip: *"Friendly — +1 level"*.

---

### 3.3 Catch node (`catch`)

**Pokémon equivalent:** Pick 1 of 3 wild Pokémon; BST bucket roll.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Scouting report** (choose 1 of 3 signings) | Core football loop; no balls/capture RNG needed (game already pick-1-of-3). | — |
| B | **Transfer window** | Familiar term. | Implies selling/swap mechanics not present. |
| C | **Youth academy intake** | Explains lower BST early picks. | Weird for late-tournament high-BST rolls. |

**Recommended:** **Scouting report (A)** — screen title: *"Three players available — sign one"*.

---

### 3.4 Item node (`item`)

**Pokémon equivalent:** Pick 1 of 3 from `ITEM_POOL` / bag.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Equipment drop** (boots, shinguards, GPS vest) | Maps held items cleanly. | Some items are consumables — need split copy. |
| B | **Sponsor package** | Roguelike loot flavor. | Less tied to equip-on-player UX. |
| C | **Tactics crate** | Good for consumables (energy drink, ice pack). | Held gear thematically weaker. |

**Recommended:** **Equipment & medical crate (A+C hybrid)** — node label **Gear crate**; consumables labeled **Medical / boost**.

---

### 3.5 Boss node (`boss`)

**Pokémon equivalent:** Gym leader battle → badge.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Host City Boss** (federation head / legendary local coach) | Matches user example; gatekeeper before next city. | Requires 8+ boss characters. |
| B | **Regional FA chairman** | Bureaucratic humor; clear boss framing. | Less epic than coach fight. |
| C | **Star manager duel** | High drama (vs Mourinho archetype). | Licensing if using real managers. |

**Recommended:** **Host City Boss (A)** — reward = **City Stamp** (replaces badge).

---

### 3.6 Pokécenter node (`pokecenter`)

**Pokémon equivalent:** Full team heal.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Medical tent / recovery session** | Universal World Cup image (sideline physio). | — |
| B | **Team hotel rest day** | Fits roguelike map pacing. | Less instant-heal clarity. |
| C | **Ice bath & rehab** | Meme-friendly. | Silly tone may clash with knockout prep. |

**Recommended:** **Medical tent (A)**.

---

### 3.7 Trainer node (`trainer`)

**Pokémon equivalent:** Named trainer sprite battle; harder than wild.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Rival national team** | Clear step-up fight; trainer sprites → opposing manager. | — |
| B | **Club side fixture** | Variety; club crest on map node. | National squad theme diluted. |
| C | **Media darlings XI** | Fun flavor team. | Obscure who you're fighting. |

**Recommended:** **Rival national team (A)** — use opposing **manager portrait** on node.

---

### 3.8 Legendary node (`legendary`)

**Pokémon equivalent:** Guaranteed legendary encounter from `LEGENDARY_IDS`.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **World Cup Legend** (iconic retired great) | Matches user example; rare squad centerpiece. | Must be fictional or licensed. |
| B | **Hall of Fame guest player** | Collectible album hook. | "Legend" is punchier for rarity. |
| C | **Mythical prospect** (once-in-a-generation talent) | Explains high BST. | Weaker World Cup nostalgia hit. |

**Recommended:** **World Cup Legend (A)** — album entry stamped **Legendary** foil variant.

---

### 3.9 Move Tutor node (`move_tutor`)

**Pokémon equivalent:** Upgrade `moveTier` +1 for one player.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Specialist coach** (finishing coach, set-piece coach) | Perfect for skill tier upgrade. | — |
| B | **Training camp focus week** | Squad-wide feel though effect is single player. | Slight mismatch. |
| C | **Skills challenge unlock** | Gamey. | Less football-native. |

**Recommended:** **Specialist coach (A)** — *"Upgrade signature skill tier"*.

---

### 3.10 Trade node (`trade`)

**Pokémon equivalent:** Swap roster member for random pick ~3 levels higher.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Transfer swap** (loan exchange +3 levels) | Matches mechanics exactly. | — |
| B | **Agent offer** | Flavorful. | Doesn't imply losing a player. |
| C | **Captain exchange program** | Whimsical. | Confusing. |

**Recommended:** **Transfer swap (A)** — disabled in Injury List mode (same as Nuzlocke catch/trade disable).

---

### 3.11 Silver node (`silver` — Gen 2 rival)

**Pokémon equivalent:** Forced rival battle mid-map.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Grudge derby** (fixed rival nation) | Silver → recurring rival manager (e.g., same flag every era). | Needs Gen 2 parallel rival identity. |
| B | **Neighbouring nation clash** | World Cup qualifying drama. | Less personal than named rival. |
| C | **Former mentor betrayal** | Story hook. | Extra narrative authoring. |

**Recommended:** **Grudge derby (A)** — recurring **Rival Manager** character across Classic Era maps.

---

### 3.12 Question mark node (`question`)

**Pokémon equivalent:** Random roll among battle, trainer, catch, item, shiny, mega-item.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **VAR review** (random event) | Timely football humor; "? " icon still works. | VAR association can be negative/frustrating. |
| B | **Mystery event** | Neutral; works in all locales. | Less thematic punch. |
| C | **Press conference surprise** | Scandal/injury rumor random event flavor. | Odd mapping to catch nodes. |

**Recommended:** **Mystery event (B)** for broad appeal; optional skin **VAR review** as easter-egg mode text.

---

### 3.13 Start node (`start`)

**Pokémon equivalent:** Map entry point.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Arrival in host city** | Sets scene for each leg. | — |
| B | **Kickoff** | Punchy. | Usually one kickoff per match, not map. |
| C | **Team bus arrival** | Visual storytelling. | Long for tooltip. |

**Recommended:** **Arrival in host city (A)**.

---

## 4. Campaign Progression

### 4.1 Badges (`state.badges`, 0–8)

**Pokémon equivalent:** Gym badge counter; shown on HUD; unlocks Elite Four at 8.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **City Stamps** (album stickers per host city) | Collectible; ties to World Cup Album meta. | — |
| B | **Qualification points** | Sports-table logic. | Less tangible reward feel than stamp/badge. |
| C | **FIFA-style patch** | Visual on manager jacket. | Trademark risk. |

**Recommended:** **City Stamps (A)** — 8 stamps unlock **Knockout Stage**.

---

### 4.2 Elite Four

**Pokémon equivalent:** 5 sequential boss battles (Gen 1) with transition + prep screens; champion at end.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Knockout Stage** (R16 → QF → SF → Final → Champion) | Matches user example; 5 fights map cleanly. | Current ELITE_4 is 4 + champion — still 5 battles. |
| B | **Single-elimination bracket** | Accurate football structure. | Bracket UI not in engine — names only. |
| C | **Penalty shootout gauntlet** | Dramatic. | Misrepresents auto-battle format. |

**Recommended:** **Knockout Stage (A)** — name each gate: *Round of 16, Quarter-final, Semi-final, Final, Trophy lift*.

---

### 4.3 Hall of Fame

**Pokémon equivalent:** `poke_hall_of_fame` — completed run summaries; unlocks Battle Tower.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Trophy Room** | Visual cabinet of World Cup wins; unlocks Continental Champions Cup. | — |
| B | **Winners gallery** | Photo wall of squads. | Less action-oriented. |
| C | **Hall of Champions** | Epic tone. | Collides with "Legend" player terminology. |

**Recommended:** **Trophy Room (A)**.

---

### 4.4 Starter selection

**Pokémon equivalent:** Pick Gen 1/2 starter; `poke_used_starters` tracks history.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Marquee signing** (choose flagship player archetype) | Three style pillars (e.g., Striker / Playmaker / Defender). | Must retheme starter triads. |
| B | **Captain pick** | World Cup armband moment. | Only one captain — awkward for choosing species template. |
| C | **Formation anchor** | Tactical. | Abstract for casual players. |

**Recommended:** **Marquee signing (A)** — three **position-style starters** matching original type triangle (Attack / Mid / Defense styles).

---

### 4.5 Level / XP

**Pokémon equivalent:** +2 levels per win (Normal), +1 Nuzlocke; wild +1; Lucky Egg bonus.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Match experience** (form rating growth) | Natural; "level 32" → "OVR 32" or keep level as abstract form. | OVR implies FIFA overlap. |
| B | **Fitness & form curve** | Explains HP scaling. | Level number still needed internally. |
| C | **International caps** | Caps = appearances metaphor. | Caps usually don't decrease on injury. |

**Recommended:** **Match experience (A)** — display **Form Lv.** in UI.

---

## 5. Progression & Upgrades

### 5.1 Evolution (level threshold + branching)

**Pokémon equivalent:** `EVOLUTIONS`, `BRANCHING_EVOLUTIONS`, Eevee overlay, Moon Stone.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Player upgrade** (development milestone) | Matches user example; youth → first team → star. | Branching evo → **tactical reposition** needs explanation. |
| B | **Position conversion** | Winger → inverted forward, etc. | Real football is coach decision, not automatic at level 36. |
| C | **Career breakthrough** | Narrative "breakout tournament" moment. | Less clear for multi-stage evo lines. |

**Recommended:** **Player upgrade (A)** — branching choices labeled **Development path** (e.g., same prospect becomes **Finisher** or **False 9**).

**Moon Stone equivalent:**

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Breakthrough injection** (instant development) | Consumable force-upgrade. | — |
| B | **Specialist camp invite** | Thematic item node synergy. | Two-step copy. |

**Recommended:** **Breakthrough injection (A)**.

---

### 5.2 Move tier (TM item / Move Tutor)

**Pokémon equivalent:** `moveTier` 0→2.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Skill tier upgrade** | Aligns with specialist coach node. | — |
| B | **Trait unlock** (skill move) | Distinct from Battle Tower team traits if named carefully. | "Trait" overload — use **Skill** here. |
| C | **Weak foot training** | Funny for dual-type Metronome item. | Too narrow. |

**Recommended:** **Skill tier upgrade (A)** — UI: **Skill I / II / III**.

---

### 5.3 Stat buffs (Battle Tower permanent)

**Pokémon equivalent:** `poke_stat_buffs` keyed by evo line root; +10% per point, max 10.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Legacy training program** (per-player-line permanent buff) | Meta-progression across runs; fits "academy investment". | — |
| B | **National FA infrastructure funding** | Thematic macro upgrade. | Less tied to individual player card. |
| C | **Wonderkid development track** | Emotional attachment. | Only works for youth profiles. |

**Recommended:** **Legacy training program (A)** — reward screen: invest points into **Stamina / Power / Defense / Technique / Vision / Pace** for that player line.

---

### 5.4 Shiny Pokémon

**Pokémon equivalent:** Rare variant; 2× trait count in Battle Tower; Shiny Charm at full Gen 1 dex.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Golden Boot contender** (gold-card variant) | Visual gold frame; rare scout pull. | Implies striker-only — use **Gold card** generically. |
| B | **Star player edition** | Album foil sticker parallel. | — |
| C | **Limited edition kit number** | Collectible. | Weak combat distinction. |

**Recommended:** **Gold card player (B)** — shiny charm → **Scout network upgrade** (higher gold-card rate when album complete).

---

## 6. Combat Systems

### 6.1 Auto-battle (1v1 sequential)

**Pokémon equivalent:** `runBattle` — first alive vs first alive; detailed log replay.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Highlight duel** (one-on-one moment each phase) | Explains 1v1 abstraction — key matchups. | Not full 11v11 — set expectations in tutorial. |
| B | **Automated match simulation** | Honest about auto-battle. | Less immersive. |
| C | **Penalty shootout rounds** | Dramatic. | Wrong mechanics for multi-turn HP war. |

**Recommended:** **Highlight duel (A)** — battle log: *"Player A takes on Opponent B in a key duel"*.

---

### 6.2 Type effectiveness

**Pokémon equivalent:** `TYPE_CHART` multipliers.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Style matchup table** (Press beats Build-up, etc.) | Keeps tactical depth. | Requires 18×18 reskin matrix copy. |
| B | **Formation counter** (4-3-3 vs 5-4-1) | Football-native. | Formations aren't on creatures today. |
| C | **Weather / pitch conditions** | Atmospheric. | Doesn't map to move types. |

**Recommended:** **Style matchup table (A)** — rename only; same math.

---

### 6.3 Battle Tower traits (`TRAIT_DESCRIPTIONS`)

**Pokémon equivalent:** Count types on squad (shiny = 2×); tiers at 2/4/6; hooks in battle engine.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Team tactical traits** (style chemistry) | Matches user example; panel = tactics board. | Must rewrite 18 trait description sets. |
| B | **Manager playbook bonuses** | Manager fantasy. | Traits are squad-composition derived, not manager. |
| C | **Nation synergy** (3+ Brazil-style players) | World Cup flavor. | Collides with style-as-type decision. |

**Recommended:** **Team tactical traits (A)** — e.g., High Press tier 3: *"+3 Power & Technique at duel start"* (maps Fire tier).

**Example type → style → trait rename (subset):**

| Pokémon type | Playing style | Trait flavor (tier 3 example) |
|--------------|---------------|-------------------------------|
| Fire | High Press | +3 Power & Technique at duel start |
| Water | Possession build-up | On hit: chance to drain opponent Pace/Technique |
| Fighting | Physical battle | When a player goes down, survivors gain Power |
| Flying | Wide play | Chance to dodge duel contact |
| Ghost | Clinical finishing | Execute weakened opponents below HP threshold |
| Steel | Compact block | Reduce incoming duel damage |

---

## 7. Items & Equipment

Held items (`ITEM_POOL`) and consumables (`USABLE_ITEM_POOL`) need category labels, not necessarily 1:1 rename of every item on day one.

### 7.1 Held items (category mapping)

| Pokémon item class | Recommended football equivalent |
|--------------------|----------------------------------|
| Type boost items (Charcoal, Mystic Water, …) | **Style kit** (+50% that style's skill damage) |
| Life Orb, Choice Band/Specs/Scarf | **Risk/reward gear** (Power boots, Focus contract, Sprint kit) |
| Eviolite | **Youth prospect clause** (+DEF if not fully developed) |
| Leftovers, Shell Bell | **Recovery gear** (Regen shinguards, Duel drain kit) |
| Rocky Helmet, Focus Sash | **Defensive duel gear** |
| Expert Belt | **Tactical exploit manual** (bonus vs style weakness) |

**Recommended approach:** Rename top 10 most common items for MVP; keep internal `id` keys (`life_orb`, etc.) unchanged.

### 7.2 Consumables

| Pokémon consumable | Football equivalent |
|--------------------|---------------------|
| Potion / Super Potion / Hyper Potion | **Medical spray / physio treatment / full recovery** |
| Revive | **Magic sponge / emergency sub** |
| Escape Rope | **Forfeit friendly** (skip battle — rename carefully) |
| Moon Stone | **Breakthrough injection** |
| TM / move upgrade | **Skill manual** |

---

## 8. Collection & Meta Systems

### 8.1 Pokédex

**Pokémon equivalent:** `{ id: 0|1 }` seen/caught; modal in UI.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **World Cup Album** | Matches user example; sticker collectathon. | — |
| B | **Scout database** | Functional tone. | Less collectible joy. |
| C | **Panini-style sticker book** | Nostalgic World Cup reference. | Brand-adjacent naming. |

**Recommended:** **World Cup Album (A)** — 0 = silhouette sticker, 1 = signed sticker.

---

### 8.2 Shiny dex

**Pokémon equivalent:** Separate `{ id: 1 }` gold variant tracking.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Gold sticker album** | Parallel collection meta. | — |
| B | **Legends subset** | Merges conceptually with Legendary players. | Confusing split. |

**Recommended:** **Gold sticker album (A)**.

---

### 8.3 Achievements

**Pokémon equivalent:** `ACHIEVEMENTS` array — starter wins, dex completion, etc.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Manager milestones** | "Win with each marquee signing", "Complete album". | — |
| B | **World Cup records** (Golden Boot, clean sheet streak) | Thematic. | Must align each unlock condition mechanically. |
| C | **Trophy cabinet badges** | Visual parity with City Stamps. | Overlap with Trophy Room. |

**Recommended:** **Manager milestones (A)** with football-flavored titles (e.g., *"Gotta Scout 'Em All"* → *"Complete the album"*).

---

### 8.4 Cloud save

**Pokémon equivalent:** `save.pokelike.xyz` — optional cross-device sync.

| # | Football equivalent | Pros | Cons |
|---|---------------------|------|------|
| A | **Manager profile cloud** | Neutral reskin; same schema. | Domain/branding change only at deploy. |
| B | **FA digital passport** | Whimsical. | Extra fiction layer. |

**Recommended:** **Manager profile cloud (A)** — rebrand endpoint in deploy phase, not mechanics.

---

## 9. UI Screens & Copy

| Screen (current) | Pokémon concept | Recommended football label |
|------------------|-----------------|----------------------------|
| `title-screen` | Main menu | **World Cup Roguelike** title |
| `trainer-screen` | Boy/girl pick | **Choose your manager** |
| `starter-screen` | Starter pick | **Marquee signing** |
| `map-screen` | Roguelike map | **Host city map** |
| `battle-screen` | Auto-battle | **Highlight duel** |
| `catch-screen` | Pick 1 of 3 | **Scouting report** |
| `item-screen` | Loot pick | **Gear crate** |
| `swap-screen` | Roster full | **Squad registration limit** |
| `trade-screen` | Trade offer | **Transfer swap** |
| `shiny-screen` | Shiny reveal | **Gold card signing!** |
| `badge-screen` | Badge earned | **City Stamp secured** |
| `transition-screen` | Elite transition | **Knockout draw ceremony** |
| `elite-prep-screen` | Reorder + items | **Matchday squad selection** |
| `win-screen` | Champion | **World Cup lifted** |
| `gameover-screen` | Run lost | **Campaign over** |
| `stat-buff-screen` | BT stat points | **Legacy training investment** |
| `endless-stage-select` | Stage picker | **Continental Champions Cup** |
| Pokédex modal | Dex | **World Cup Album** |
| Hall of Fame modal | HoF | **Trophy Room** |

---

## 10. Battle Tower Specifics

| Pokémon concept | Recommended football equivalent |
|-----------------|--------------------------------|
| Stage (1–5) | **Cup edition year / tier** ( harder continental draw ) |
| Region (×3 per stage) | **Confederation bracket** (e.g., UEFA, CONMEBOL, CAF) |
| Map index 0–1 | **Group mini-legs** within confederation |
| Map index 2 (Big Boss) | **Confederation final** |
| `ENDLESS_ARCHETYPES` | **Iconic manager archetypes** (Pressing zealot, Catenaccio master, …) |
| `FIXED_STAGE_REGIONS` boss teams | **Historical XI** (hand-crafted legendary squads) |
| Forced `REGION_STARTERS` | **Confederation marquee youth** |
| Trait panel | **Tactics board — team traits active** |

---

## 11. Content Migration Notes

These mappings assume **mechanics unchanged** from Spec 001. Implementation risks:

| Area | Pokémon coupling | Reskin implication |
|------|------------------|------------------|
| `speciesId` | National Dex everywhere | Introduce `playerProfileId` alias; fictional roster catalog |
| Sprites | PokeAPI + Showdown CDN | Replace with player portraits, manager portraits, stamp art |
| `GYM_LEADERS` / `ELITE_4` | Named characters + teams | Author **Host City Bosses** + **Knockout bosses** JSON |
| Type chart | 18 Pokémon types | 18 **playing styles** with new icons/colors |
| `localStorage` keys | `poke_*` prefix | Optional migration to `wc_*` with merge layer |
| Achievements copy | Pokémon phrases | Rewrite unlock strings only |

---

## 12. Recommended Theming Package (MVP)

For a coherent first playable reskin, ship this **consistent vocabulary set**:

| Concept | Use this term |
|---------|---------------|
| Creature | Player |
| User avatar | Manager |
| Team roster | Squad |
| Map run | Host City leg |
| Gym leader boss | Host City Boss |
| Badge | City Stamp |
| Elite Four | Knockout Stage |
| Wild fight | Friendly match |
| Catch node | Scouting report |
| Heal node | Medical tent |
| Legendary encounter | World Cup Legend |
| Evolution | Player upgrade |
| Dex | World Cup Album |
| Shiny | Gold card |
| Nuzlocke | Injury List mode |
| Battle Tower | Continental Champions Cup |
| Type synergies | Team tactical traits |
| Types | Playing styles |
| HoF | Trophy Room |
| Win screen | World Cup lifted |

---

## 13. Open Design Questions

1. **Real vs fictional players** — Is the album all fictional pros, or licensed World Cup stars? (Drives art/legal scope.)
2. **National team identity** — Does the manager represent one nation for the whole run, or is the squad multi-national (current game allows any caught species)?
3. **11v11 aspiration** — Is 1v1 **highlight duel** copy sufficient long-term, or should a future engine support multi-player phases?
4. **Women's tournament** — Use Era toggle for gender-inclusive parallel content, or unified roster?
5. **Penalty shootout as separate node type?** — Not in current engine; would be new mechanic vs reskin.
6. **Domain & title** — Working title options: *World Cup Roguelike*, *Cuplike*, *Manager's Road to the Trophy*.

---

## Appendix A — Quick Reference Table (All Systems)

| System | Pokémon equivalent | Recommended football equivalent |
|--------|-------------------|--------------------------------|
| Pokémon instance | Pokémon | Player |
| Trainer | Trainer (boy/girl) | Manager |
| speciesId | National Dex ID | Player profile ID |
| Types | Pokémon types | Playing styles |
| Stats | HP/ATK/DEF/SP.A/SP.D/SPE | Stamina/Power/Defense/Technique/Vision/Pace |
| Moves | Moves + moveTier | Signature skills (tiers I–III) |
| Normal mode | 8 gyms + Elite Four | World Cup campaign |
| Nuzlocke | Permadeath faint | Injury List mode |
| Gen 2 toggle | Johto content | Classic / Modern era |
| Battle Tower | Endless stages | Continental Champions Cup |
| Map | Gym map DAG | Host City leg map |
| Battle node | Wild battle | Friendly match |
| Catch node | Catch Pokémon | Scouting report |
| Item node | Item pickup | Gear crate |
| Boss node | Gym leader | Host City Boss |
| Pokécenter | Full heal | Medical tent |
| Trainer node | Trainer battle | Rival national team |
| Legendary node | Legendary | World Cup Legend |
| Move Tutor | Move tier up | Specialist coach |
| Trade node | Trade Pokémon | Transfer swap |
| Silver node | Rival Silver | Grudge derby |
| Question node | Random event | Mystery event |
| Badges | Gym badges (8) | City Stamps (8) |
| Elite Four | Elite chain | Knockout Stage |
| Hall of Fame | HoF entries | Trophy Room |
| Starter pick | Starter Pokémon | Marquee signing |
| Level | Pokémon level | Form level / match experience |
| Evolution | Evolution | Player upgrade |
| Moon Stone | Force evolve item | Breakthrough injection |
| Stat buffs | Evo-line buffs | Legacy training program |
| Shiny | Shiny variant | Gold card player |
| Auto-battle | 1v1 turn fight | Highlight duel |
| Type chart | Effectiveness | Style matchup table |
| Traits | Battle Tower type traits | Team tactical traits |
| Held items | Pokémon held items | Player equipment |
| Consumables | Potions, revives, etc. | Medical / boost items |
| Pokédex | Seen/caught dex | World Cup Album |
| Shiny dex | Shiny collection | Gold sticker album |
| Achievements | Achievement list | Manager milestones |
| Cloud save | Cross-device sync | Manager profile cloud |

---

*End of World Cup design mapping document.*
