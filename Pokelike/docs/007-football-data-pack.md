# SPEC 007 — Football Data Pack

**Status:** Content blueprint for v0.1 MVP data authoring  
**Authority:** Implements locked decisions from [006B-technical-blueprint-revised.md](./006B-technical-blueprint-revised.md)  
**Inputs:** [001](./001-codebase-discovery.md), [002](./002-worldcup-mapping.md), [003](./003-football-content-architecture.md), [005](./005-football-mvp-definition.md)  
**Version:** v0.1  
**Date:** 2026-06-05  
**Scope:** Content/data only — no code, no implementation tasks

---

## 1. Data Pack Summary

| Parameter | Count | profileId range | Notes |
|-----------|-------|-----------------|-------|
| **Total roster** | 50 | 1–50 | Single canonical catalog; one `profileId` per person |
| **Marquee starters** | 3 | 1–3 | Run-start only; excluded from scout pools |
| **Scoutable fan favorites** | 26 | 4–28, 48 | Normal map scouting; Martínez scoutable from mid maps |
| **Host city boss heroes** | 8 | 29–36 | Signature face per host city leg |
| **Knockout squad extras** | 5 | 37–40, 49 | Historical XI depth; Carlos Alberto boss-exclusive |
| **Knockout immortals (album)** | 5 | 41–45 | Gate signature faces |
| **World Cup legends** | 5 | 42, 43, 46, 47, 50 | Pelé/Maradona use IDs 42/43 (also knockout icons) |
| **Album pages** | 5 | — | 50 slots total |
| **Achievements** | 6 | — | Milestone set per Spec 005 |
| **Item renames** | 10 | — | Display-only; IDs unchanged |

**ID band rule:** Starters 1–3 · Scouts 4–28 (+48 Martínez on favorites page) · Host city 29–36 · Knockout depth 37–40, 49 · Knockout icons 41–45 · Legends 42, 43, 46, 47, 50.

**Progression note:** Form level + skill tier only. No evolution rename, no species change. Stats scale via form level; identity fixed.

---

## 2. Starter Recommendation

### Verdict: **Replace Modrić with Messi**

Keep **Mbappé** and **Van Dijk**. Swap **Modrić → Lionel Messi**.

| Current proposal | Issue |
|----------------|-------|
| Mbappé / Modrić / Van Dijk | Modrić is elite but emotionally cooler than hot for a *first click*; three different eras without a single “GOAT” anchor |
| Missing Messi as starter | Messi is the strongest World Cup 2022 emotional hook; every playtester expects him somewhere in run 1 |

**Recommended starter triangle:**

| Role | Style triangle | Why |
|------|----------------|-----|
| **Attack** — Mbappé | `high_press` | Instant fantasy: pace, directness, World Cup final scorer energy |
| **Control** — Messi | `possession_buildup` | GOAT recognition; teaches build-up vs press; Argentina 2022 payoff in knockout |
| **Defense** — Van Dijk | `compact_block` | Clear low-block anchor; Netherlands defensive identity; completes Core Six triangle |

Triangle: **High Press → Wing Play → Compact Block → High Press**. Messi’s possession build-up sits adjacent (loses to High Press, beats Rapid Counter) — slightly wider than pure grass/fire/water but still readable with one tooltip.

### Starter profiles

| profileId | Player | Nation | Pos | primaryStyle | secondaryStyle | rarity | Reason |
|-----------|--------|--------|-----|--------------|----------------|--------|--------|
| 1 | Kylian Mbappé | FRA | ST | `high_press` | `rapid_counter` | elite | Most recognizable young star; aggressive first-run fantasy; not stat-broken at form Lv. 5 |
| 2 | Lionel Messi | ARG | AM | `possession_buildup` | `tactical_control` | elite | Global icon; control pivot; knockout arc pays off emotionally |
| 3 | Virgil van Dijk | NED | CB | `compact_block` | `aerial_threat` | elite | Defensive anchor; teaches absorbing press; iconic modern CB |

**Modrić disposition:** profileId **8** in scout pool (mid maps). Still signable early-ish; rewards players who pick Mbappé + Van Dijk and hunt midfield control.

**Balance guardrails for starters:**

- Total base stat sum ~480–510 each (below legend ceiling)
- No starter above **105** in any single stat at base
- Messi Technique/Vision high; Van Dijk Defense/Stamina high; Mbappé Pace/Power high — distinct silhouettes

---

## 3. Full MVP Player Roster

### 3.1 Roster overview by bucket

| IDs | Bucket | Count |
|-----|--------|-------|
| 1–3 | Marquee signings | 3 |
| 4–28, 48 | Fan favorites (scoutable) | 26 |
| 29–36 | Host city heroes | 8 |
| 37–40, 49 | Knockout squad depth | 5 |
| 41–45 | Knockout immortals | 5 |
| 42–43, 46–47, 50 | Legend-flagged | 5 unique persons |

### 3.2 Nation distribution (50 players)

| Nation | Count | Players |
|--------|-------|---------|
| BRA | 11 | Pelé, Ronaldinho, Ronaldo Nazário, Vinícius, Casemiro, Cafu, Roberto Carlos, Marcelo, Alisson, Jairzinho, Carlos Alberto |
| ARG | 5 | Messi, Maradona, Di María, Martínez, Burruchaga |
| ESP | 5 | Iniesta, Xavi, Casillas, Rodri, Ramos |
| FRA | 4 | Mbappé, Zidane, Thuram, Kanté |
| GER | 4 | Beckenbauer, Neuer, Kroos, Musiala |
| NED | 4 | Van Dijk, Cruyff, Bergkamp, Robben |
| ENG | 3 | Kane, Bellingham, Charlton |
| ITA | 3 | Buffon, Maldini, Rossi |
| POR | 2 | Cristiano Ronaldo, Figo |
| URU | 2 | Schiaffino, Ghiggia |
| CRO | 1 | Modrić |
| NOR | 1 | Haaland |
| EGY | 1 | Salah |
| BEL | 1 | De Bruyne |
| MEX | 1 | Sánchez |
| JPN | 1 | Kubo |

**Note:** Brazil count is high (11) due to host-city leg + 1970 gate + samba scout flavor — mitigate via scout weight caps (max 1 BRA player per scout report).

**Position coverage:** GK ×4, CB ×8, FB ×4, DM ×5, CM ×8, AM ×6, W ×8, ST ×7 — adequate spread; not forward-heavy.

### 3.3 Complete roster table

| profileId | slug | displayName | commonName | nation | pos | primaryStyle | secondaryStyle | rarity | scoutable | isMarquee | isLegend | bossExclusive | albumPage | flavorText |
|-----------|------|-------------|------------|--------|-----|--------------|----------------|--------|-----------|-----------|----------|---------------|-----------|------------|
| 1 | kylian-mbappe | Kylian Mbappé | Mbappé | FRA | ST | high_press | rapid_counter | elite | false | true | false | false | marquee | Lightning in boots. Forces mistakes high up the pitch and punishes them instantly. |
| 2 | lionel-messi | Lionel Messi | Messi | ARG | AM | possession_buildup | tactical_control | elite | false | true | false | false | marquee | The ball obeys him. Slows the game down until the killer pass appears. |
| 3 | virgil-van-dijk | Virgil van Dijk | Van Dijk | NED | CB | compact_block | aerial_threat | elite | false | true | false | false | marquee | Calm in chaos. Organizes the line and wins everything in the air. |
| 4 | erling-haaland | Erling Haaland | Haaland | NOR | ST | high_press | power_strike | elite | true | false | false | false | favorites | A pure goal machine. One touch, one chance, one net. |
| 5 | vinicius-junior | Vinícius Júnior | Vinícius | BRA | W | wing_play | rapid_counter | elite | true | false | false | false | favorites | Terrorizes full-backs on the flank, then cuts inside without warning. |
| 6 | luka-modric | Luka Modrić | Modrić | CRO | CM | possession_buildup | tactical_control | elite | true | false | false | false | favorites | Metronome in midfield. Turns pressure into progress with disguised passes. |
| 7 | mohamed-salah | Mohamed Salah | Salah | EGY | W | rapid_counter | clinical_finishing | elite | true | false | false | false | favorites | Starts wide, finishes like a striker. Counter-attacks live through him. |
| 8 | kevin-de-bruyne | Kevin De Bruyne | De Bruyne | BEL | AM | tactical_control | power_strike | elite | true | false | false | false | favorites | Sees passes others draw on tactics boards. |
| 9 | rodri | Rodri | Rodri | ESP | DM | compact_block | possession_buildup | elite | true | false | false | false | favorites | The reset button. Wins the ball and never gives it away. |
| 10 | jude-bellingham | Jude Bellingham | Bellingham | ENG | CM | high_intensity | high_press | rare | true | false | false | false | favorites | Box-to-box energy with a goal scorer's instinct. |
| 11 | jamal-musiala | Jamal Musiala | Musiala | GER | AM | tactical_control | street_smarts | rare | true | false | false | false | favorites | Slithers through tight spaces where tackles don't exist. |
| 12 | pedri | Pedri | Pedri | ESP | CM | possession_buildup | balanced | rare | true | false | false | false | favorites | Keeps the tempo. Rarely loses the ball, rarely forces it. |
| 13 | harry-kane | Harry Kane | Kane | ENG | ST | clinical_finishing | aerial_threat | elite | true | false | false | false | favorites | Drops deep or stays high — always finds the right shot. |
| 14 | n-golo-kante | N'Golo Kanté | Kanté | FRA | DM | high_intensity | compact_block | elite | true | false | false | false | favorites | Covers ground that GPS trackers can't map. |
| 15 | sergio-ramos | Sergio Ramos | Ramos | ESP | CB | aerial_threat | dark_arts | rare | true | false | false | false | favorites | Wins duels, then joins the attack when it matters. |
| 16 | manuel-neuer | Manuel Neuer | Neuer | GER | GK | tactical_control | iron_defense | elite | true | false | false | false | favorites | Sweeper-keeper who acts as an extra defender — and still saves everything. |
| 17 | alisson-becker | Alisson Becker | Alisson | BRA | GK | balanced | iron_defense | rare | true | false | false | false | favorites | Composed under pressure. Distribution starts counters. |
| 18 | marcelo | Marcelo | Marcelo | BRA | FB | wing_play | street_smarts | rare | true | false | false | false | favorites | Attacking full-back who plays like a winger with defensive duties. |
| 19 | andres-iniesta | Andrés Iniesta | Iniesta | ESP | CM | possession_buildup | ice_press | elite | true | false | false | false | favorites | Glides past pressure. The big moment always finds him. |
| 20 | xavi-hernandez | Xavi Hernández | Xavi | ESP | CM | possession_buildup | tactical_control | elite | true | false | false | false | favorites | Circulation master. Every teammate looks available when he has the ball. |
| 21 | roberto-carlos | Roberto Carlos | Roberto Carlos | BRA | FB | power_strike | wing_play | elite | true | false | false | false | favorites | Howitzer left foot. Defenders hear the run before they see him. |
| 22 | cafu | Cafu | Cafu | BRA | FB | wing_play | high_intensity | elite | true | false | false | false | favorites | Never stops running. Overlap after overlap until the cross lands. |
| 23 | paolo-maldini | Paolo Maldini | Maldini | ITA | CB | iron_defense | compact_block | elite | true | false | false | false | favorites | Positioning so perfect it looks like he never tackles. |
| 24 | gianluigi-buffon | Gianluigi Buffon | Buffon | ITA | GK | iron_defense | compact_block | elite | true | false | false | false | favorites | Commanding presence. Organizes the back line like a captain in gloves. |
| 25 | iker-casillas | Iker Casillas | Casillas | ESP | GK | rapid_counter | iron_defense | elite | true | false | false | false | favorites | Reflex saves that defy physics. Big-game calm. |
| 26 | franz-beckenbauer | Franz Beckenbauer | Beckenbauer | GER | CB | tactical_control | possession_buildup | elite | true | false | false | false | favorites | Libero who steps out of defense to dictate the game. |
| 27 | johan-cruyff | Johan Cruyff | Cruyff | NED | AM | tactical_control | possession_buildup | elite | true | false | false | false | favorites | Total football brain. Makes teammates play two steps ahead. |
| 28 | arjen-robben | Arjen Robben | Robben | NED | W | wing_play | ice_press | rare | true | false | false | false | favorites | Everyone knows the cut inside. Nobody stops it anyway. |
| 29 | casemiro | Casemiro | Casemiro | BRA | DM | compact_block | dark_arts | elite | true | false | false | false | host_city | São Paulo leg anchor — shields the back four, breaks transitions. |
| 30 | toni-kroos | Toni Kroos | Kroos | GER | CM | possession_buildup | set_piece_master | elite | true | false | false | false | host_city | Berlin leg metronome — tempo control from deep. |
| 31 | takefusa-kubo | Takefusa Kubo | Kubo | JPN | W | rapid_counter | wing_play | rare | true | false | false | false | host_city | Tokyo leg spark — direct running in tight spaces. |
| 32 | luis-figo | Luís Figo | Figo | POR | W | wing_play | tactical_control | elite | true | false | false | false | host_city | Madrid leg maestro — wide creation with elite end product. |
| 33 | paolo-rossi | Paolo Rossi | Rossi | ITA | ST | clinical_finishing | high_press | rare | true | false | false | false | host_city | Milan leg poacher — arrives where the ball will be. |
| 34 | dennis-bergkamp | Dennis Bergkamp | Bergkamp | NED | AM | ice_press | tactical_control | elite | true | false | false | false | host_city | Amsterdam leg artist — first touch eliminates a defender. |
| 35 | hugo-sanchez | Hugo Sánchez | Sánchez | MEX | ST | clinical_finishing | aerial_threat | rare | true | false | false | false | host_city | Mexico City leg — acrobatic finishes and predatory movement. |
| 36 | bobby-charlton | Bobby Charlton | Charlton | ENG | CM | power_strike | tactical_control | elite | true | false | false | false | host_city | London leg — long-range thunder and World Cup-winning composure. |
| 37 | juan-schiaffino | Juan Schiaffino | Schiaffino | URU | AM | possession_buildup | tactical_control | elite | false | false | false | false | knockout | Uruguay 1950 — elegant link between midfield and attack. |
| 38 | jairzinho | Jairzinho | Jairzinho | BRA | W | wing_play | high_intensity | elite | false | false | false | false | knockout | Brazil 1970 — scored in every knockout game. Relentless wide threat. |
| 39 | jorge-burruchaga | Jorge Burruchaga | Burruchaga | ARG | AM | rapid_counter | clinical_finishing | rare | false | false | false | false | knockout | Argentina 1986 — the pass and the run that finished the story. |
| 40 | lilian-thuram | Lilian Thuram | Thuram | FRA | CB | iron_defense | compact_block | elite | true | false | false | false | knockout | France 1998 — immovable full-back turned defensive general. |
| 41 | alcides-ghiggia | Alcides Ghiggia | Ghiggia | URU | W | rapid_counter | clinical_finishing | elite | false | false | false | false | knockout | **Gate 0 icon** — Maracanazo silence. The ultimate giant-killer. |
| 42 | pele | Pelé | Pelé | BRA | ST | balanced | power_strike | legend | false | false | true | false | knockout | **Gate 1 icon** — Brazil 1970 heartbeat. Joy football personified. |
| 43 | diego-maradona | Diego Maradona | Maradona | ARG | AM | street_smarts | tactical_control | legend | false | false | true | false | knockout | **Gate 2 icon** — Argentina 1986. Hand of God, Foot of God, one man. |
| 44 | zinedine-zidane | Zinedine Zidane | Zidane | FRA | AM | tactical_control | ice_press | legend | true | false | false | false | knockout | **Gate 3 icon** — France 1998. Big-game elegance under the brightest lights. |
| 45 | angel-di-maria | Ángel Di María | Di María | ARG | W | wing_play | rapid_counter | elite | true | false | false | false | knockout | **Gate 4 icon** — Argentina 2022. Final hero beside Messi. |
| 46 | ronaldo-nazario | Ronaldo Nazário | Ronaldo | BRA | ST | power_strike | rapid_counter | legend | true | false | true | false | legends | The Phenomenon. Pace and power before the injuries — still unstoppable. |
| 47 | ronaldinho | Ronaldinho | Ronaldinho | BRA | AM | street_smarts | wing_play | legend | true | false | true | false | legends | Smile on his face, defenders on the floor. Samba genius. |
| 48 | emiliano-martinez | Emiliano Martínez | Martínez | ARG | GK | iron_defense | tactical_control | elite | true | false | false | false | favorites | Penalty shootout hero. Mind games and miracle saves. |
| 49 | carlos-alberto | Carlos Alberto | Carlos Alberto | BRA | FB | wing_play | high_intensity | elite | false | false | false | false | knockout | Brazil 1970 captain — overlapping full-back who scored in the final. |
| 50 | cristiano-ronaldo | Cristiano Ronaldo | Ronaldo | POR | ST | power_strike | aerial_threat | legend | true | false | true | false | legends | Machine of goals. Aerial dominance and clutch composure. |

### 3.4 profileId rule — Pelé & Maradona (single ID)

Per SPEC 006B locked decision **L5** (one `profileId` per person):

- **Pelé** → profileId **42** only (knockout immortal + legend node + Brazil 1970 roster + legends album slot)
- **Maradona** → profileId **43** only (knockout immortal + legend node + Argentina 1986 roster + legends album slot)
- **IDs 48–49** → Emiliano Martínez and Carlos Alberto (not duplicate legend entries)

**Legend-flagged players (5):** 42 Pelé, 43 Maradona, 46 Ronaldo Nazário, 47 Ronaldinho, 50 Cristiano Ronaldo.

### 3.5 Mandatory names checklist

| Required | profileId | Status |
|----------|-----------|--------|
| Messi | 2 | Starter |
| Cristiano Ronaldo | 50 | Legend |
| Pelé | 42 | Knockout + legend |
| Maradona | 43 | Knockout + legend |
| Zidane | 44 | Knockout immortal |
| Ronaldo Nazário | 46 | Legend |
| Ronaldinho | 47 | Legend |
| Mbappé | 1 | Starter |
| Modrić | 6 | Scout |
| Van Dijk | 3 | Starter |
| Iniesta | 19 | Scout |
| Xavi | 20 | Scout |
| Cruyff | 27 | Scout |
| Beckenbauer | 26 | Scout |
| Cafu | 22 | Scout |
| Roberto Carlos | 21 | Scout |
| Buffon | 24 | Scout |
| Neuer | 16 | Scout |
| Casillas | 25 | Scout |

All mandatory names included.

---

## 4. Authored Base Stats

### 4.1 Stat philosophy

| Principle | Application |
|-----------|-------------|
| **Scale 1–120** | hp = Stamina, atk = Power, def = Defense, special = Technique, spdef = Vision, speed = Pace |
| **BST banding** | Common ~320–380, Uncommon ~380–420, Rare ~420–460, Elite ~460–510, Legend ~500–540 |
| **105–120 reserved** | Legend-defining peaks only (Messi Technique, CR7 Power/Aerial, Pelé balanced excellence) |
| **Role identity** | GK: high def/spdef, low atk. CB: high def/hp. W: high speed. AM: high special/spdef |
| **No FIFA copy** | Original relative curves; comparisons internal to this roster only |
| **Starters** | Strong but not top-5 in roster at base — room to grow via form level |

**Physical vs technical split (engine):** `special >= atk` → technical attacker; else physical.

### 4.2 Full stat table (50 players)

| ID | Player | hp | atk | def | special | spdef | speed | BST |
|----|--------|----|-----|-----|---------|-------|-------|-----|
| 1 | Mbappé | 72 | 88 | 58 | 82 | 68 | 118 | 486 |
| 2 | Messi | 68 | 72 | 62 | 118 | 112 | 92 | 524 |
| 48 | Martínez | 78 | 52 | 82 | 72 | 105 | 75 | 464 |
| 49 | Carlos Alberto | 82 | 85 | 88 | 78 | 82 | 92 | 507 |
| 3 | Van Dijk | 88 | 78 | 112 | 68 | 95 | 72 | 513 |
| 4 | Haaland | 82 | 115 | 65 | 72 | 62 | 95 | 491 |
| 5 | Vinícius | 70 | 82 | 55 | 78 | 65 | 112 | 462 |
| 6 | Modrić | 78 | 68 | 72 | 105 | 102 | 82 | 507 |
| 7 | Salah | 72 | 88 | 58 | 82 | 68 | 110 | 478 |
| 8 | De Bruyne | 75 | 85 | 65 | 112 | 88 | 78 | 503 |
| 9 | Rodri | 85 | 72 | 95 | 82 | 88 | 62 | 484 |
| 10 | Bellingham | 82 | 78 | 75 | 85 | 78 | 88 | 486 |
| 11 | Musiala | 68 | 75 | 62 | 95 | 82 | 92 | 474 |
| 12 | Pedri | 72 | 62 | 68 | 92 | 88 | 78 | 460 |
| 13 | Kane | 82 | 92 | 72 | 88 | 78 | 68 | 480 |
| 14 | Kanté | 88 | 68 | 92 | 72 | 85 | 95 | 500 |
| 15 | Ramos | 78 | 82 | 88 | 72 | 78 | 72 | 470 |
| 16 | Neuer | 78 | 55 | 82 | 78 | 105 | 68 | 466 |
| 17 | Alisson | 75 | 52 | 78 | 72 | 98 | 70 | 445 |
| 18 | Marcelo | 72 | 78 | 72 | 82 | 75 | 88 | 467 |
| 19 | Iniesta | 70 | 68 | 65 | 112 | 95 | 82 | 492 |
| 20 | Xavi | 72 | 62 | 68 | 108 | 105 | 72 | 487 |
| 21 | Roberto Carlos | 75 | 105 | 78 | 82 | 72 | 92 | 504 |
| 22 | Cafu | 82 | 78 | 82 | 72 | 78 | 95 | 487 |
| 23 | Maldini | 78 | 72 | 115 | 68 | 95 | 75 | 503 |
| 24 | Buffon | 82 | 52 | 85 | 70 | 108 | 65 | 462 |
| 25 | Casillas | 75 | 50 | 78 | 68 | 102 | 88 | 461 |
| 26 | Beckenbauer | 82 | 78 | 105 | 95 | 92 | 78 | 530 |
| 27 | Cruyff | 75 | 82 | 72 | 110 | 98 | 88 | 525 |
| 28 | Robben | 68 | 88 | 58 | 82 | 68 | 102 | 466 |
| 29 | Casemiro | 85 | 72 | 95 | 75 | 82 | 68 | 477 |
| 30 | Kroos | 78 | 72 | 78 | 105 | 95 | 65 | 493 |
| 31 | Kubo | 65 | 72 | 55 | 82 | 68 | 102 | 444 |
| 32 | Figo | 72 | 82 | 68 | 95 | 85 | 88 | 490 |
| 33 | Rossi | 72 | 88 | 62 | 78 | 68 | 82 | 450 |
| 34 | Bergkamp | 70 | 78 | 62 | 105 | 88 | 82 | 485 |
| 35 | Sánchez | 72 | 88 | 65 | 78 | 68 | 85 | 458 |
| 36 | Charlton | 78 | 95 | 75 | 92 | 85 | 78 | 503 |
| 37 | Schiaffino | 75 | 78 | 72 | 95 | 92 | 78 | 490 |
| 38 | Jairzinho | 78 | 85 | 68 | 78 | 72 | 105 | 486 |
| 39 | Burruchaga | 72 | 78 | 68 | 85 | 78 | 92 | 473 |
| 40 | Thuram | 85 | 72 | 108 | 68 | 95 | 82 | 510 |
| 41 | Ghiggia | 72 | 82 | 65 | 78 | 72 | 105 | 474 |
| 42 | Pelé | 88 | 95 | 82 | 95 | 85 | 95 | 540 |
| 43 | Maradona | 82 | 78 | 72 | 115 | 95 | 95 | 537 |
| 44 | Zidane | 78 | 82 | 72 | 112 | 98 | 85 | 527 |
| 45 | Di María | 72 | 82 | 62 | 88 | 75 | 105 | 484 |
| 46 | Ronaldo Nazário | 82 | 115 | 68 | 88 | 72 | 112 | 537 |
| 47 | Ronaldinho | 75 | 78 | 62 | 112 | 85 | 95 | 507 |
| 48 | Martínez | 78 | 52 | 82 | 72 | 105 | 75 | 464 |
| 49 | Carlos Alberto | 82 | 85 | 88 | 78 | 82 | 92 | 507 |
| 50 | Cristiano Ronaldo | 85 | 112 | 72 | 88 | 78 | 95 | 530 |

### 4.3 Stat exemplars (design intent)

| Player | Identity expressed in stats |
|--------|----------------------------|
| Messi (2) | Technique 118, Vision 112, Pace 92 — not highest Power |
| Cristiano Ronaldo (50) | Power 112, Pace 95, Stamina 85 — aerial threat via Power + physical split |
| Van Dijk (3) | Defense 112, Stamina 88, Vision 95 — not fastest |
| Modrić (6) | Technique 105, Vision 102, balanced Stamina 78 |
| Pelé (42) | No stat below 82; no stat above 95 except balanced excellence — legend without broken single axis |
| Maradona (43) | Technique 115, Street Smarts identity via special-dominant AM profile |
| Ghiggia (41) | Pace 105, Clinical — underdog speed killer |
| Martínez (48) | Vision 105, Defense 82 — penalty-shootout GK identity |
| Neuer/Casillas/Buffon | Low atk (50–55), high def/spdef — GK identity |

---

## 5. Rarity Distribution

### 5.1 Tier definitions

| Tier | Count | profileIds | Scout weight | Stat ceiling (typical BST) |
|------|-------|------------|--------------|----------------------------|
| **common** | 0 | — | — | MVP roster has no commons; minimum uncommon for football fantasy |
| **uncommon** | 6 | 31, 33, 35, 39, … | 1.4× early maps | 440–470 |
| **rare** | 8 | 10–12, 15, 17–18, 28 | 1.0× default | 460–485 |
| **elite** | 31 | Most roster | 0.6× late maps; 0× until map 2 for top elites | 485–515 |
| **legend** | 5 | 42, 43, 46, 47, 50 | Legendary node only | 530–540 |

**Adjusted uncommon/rare:** Kubo (31), Rossi (33), Sánchez (35), Burruchaga (39) = uncommon; Bellingham, Musiala, Pedri, Ramos, Alisson, Marcelo, Robben = rare.

### 5.2 Rarity impact

| System | Behavior |
|--------|----------|
| **Scout probability** | Weighted roll within stage pool; legends excluded; starters excluded; elites down-weighted maps 0–1 |
| **Album excitement** | Elite = gold foil border; Legend = prismatic + hidden page section |
| **Boss usage** | Host city rosters use elites at +2–4 form levels above map band; legends only in knockout/legend nodes |
| **Stat ceiling** | Rarity is flavor + weighting; combat uses authored stats, not tier formulas |
| **Legend nodes** | Map 5+: 1-of-1 offer from {42, 43, 46, 47, 50}; 50 gated map 6+ optional |

---

## 6. Scout Pool

### 6.1 Global rules

- Starters (1–3) never appear in scout reports
- Knockout-only IDs 37–39, 41 not in normal scout pools (album via boss/knockout exposure)
- Pelé/Maradona (42, 43) legend nodes only — not in standard scout pools
- First run Map 0 second node: forced pool of **12, 15, 17** (Pedri, Ramos, Alisson) — all rare, no legends

### 6.2 Stage pools

**Early maps (0–1)** — exciting, not broken

| Weight | Eligible profileIds |
|--------|---------------------|
| High | 12, 15, 17, 18, 28, 31 |
| Medium | 10, 11, 14, 19, 20 |
| Low | 4, 5, 7, 8, 13, 16, 24, 25 |

**Mid maps (2–4)**

| Weight | Eligible profileIds |
|--------|---------------------|
| High | 4, 5, 6, 7, 8, 9, 13, 19, 20, 21, 22, 26, 27 |
| Medium | 16, 23, 29, 30, 32, 40, 44, 45 |
| Low | 10, 14, 18, 24, 28, 33, 34 |

**Late maps (5–7)**

| Weight | Eligible profileIds |
|--------|---------------------|
| High | 4, 6, 8, 9, 21, 22, 23, 26, 27, 40, 44, 45, 46, 47 |
| Medium | 5, 7, 13, 16, 19, 20, 24, 29–36 |
| Low | 50 (if first win unlocked meta) |

**Legendary nodes (map 5+)**

| Pool | profileIds |
|------|------------|
| Default | 46, 47, 42, 43 |
| After first campaign win | +50 (Cristiano Ronaldo) |

---

## 7. Host City Bosses

Eight nation-themed challenges. Not historical champion teams — federation identity + host city flavor.

| mapIndex | hostCity | nation | label | primaryStyle | stamp | difficulty | recommended form levels | boss fantasy |
|----------|----------|--------|-------|--------------|-------|------------|-------------------------|--------------|
| 0 | São Paulo | BRA | Brazil Federation Challenge | compact_block | São Paulo Stamp | ★★☆☆☆ | 12–16 | Samba structure — absorb then burst through Casemiro's shield |
| 1 | Berlin | GER | Germany Federation Challenge | possession_buildup | Berlin Stamp | ★★☆☆☆ | 18–22 | Mechanical control — Kroos dictates until you force errors |
| 2 | Tokyo | JPN | Japan Federation Challenge | rapid_counter | Tokyo Stamp | ★★★☆☆ | 22–27 | Precision transitions — Kubo leads lightning counters |
| 3 | Madrid | ESP | Spain Federation Challenge | wing_play | Madrid Stamp | ★★★☆☆ | 28–34 | Wide dominance — Figo orchestrates from the flank |
| 4 | Milan | ITA | Italy Federation Challenge | dark_arts | Milan Stamp | ★★★☆☆ | 36–44 | Catenaccio edge — Rossi poaches, defense frustrates |
| 5 | Amsterdam | NED | Netherlands Federation Challenge | tactical_control | Amsterdam Stamp | ★★★★☆ | 40–46 | Total football chess — Bergkamp's touch decides |
| 6 | Mexico City | MEX | Mexico Federation Challenge | high_press | Mexico City Stamp | ★★★★☆ | 48–54 | Aztec intensity — Sánchez finishes chaotic pressure |
| 7 | London | ENG | England Federation Challenge | aerial_threat | London Stamp | ★★★★☆ | 52–60 | Set-piece thunder — Charlton's range and physical duels |

### 7.1 Boss rosters

**Map 0 — São Paulo (BRA, compact_block)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 29 Casemiro | 14 | Boss anchor |
| 22 Cafu | 12 | Wing overlap |
| 17 Alisson | 13 | GK |

**Map 1 — Berlin (GER, possession_buildup)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 30 Kroos | 20 | Boss anchor |
| 16 Neuer | 18 | GK sweeper |
| 26 Beckenbauer | 19 | Libero |

**Map 2 — Tokyo (JPN, rapid_counter)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 31 Kubo | 25 | Boss anchor |
| 28 Robben | 23 | Cut inside |
| 7 Salah | 24 | Counter outlet |

**Map 3 — Madrid (ESP, wing_play)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 32 Figo | 32 | Boss anchor |
| 21 Roberto Carlos | 30 | Overlap |
| 19 Iniesta | 31 | Interior link |

**Map 4 — Milan (ITA, dark_arts)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 33 Rossi | 42 | Boss anchor |
| 23 Maldini | 40 | Iron wall |
| 24 Buffon | 41 | GK |

**Map 5 — Amsterdam (NED, tactical_control)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 34 Bergkamp | 44 | Boss anchor |
| 27 Cruyff | 42 | Total football |
| 3 Van Dijk | 43 | *NPC only if player didn't pick* — else 40 Thuram |

**Map 6 — Mexico City (MEX, high_press)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 35 Sánchez | 52 | Boss anchor |
| 14 Kanté | 50 | Press engine |
| 4 Haaland | 51 | Finisher |

**Map 7 — London (ENG, aerial_threat)**

| profileId | formLevel | role |
|-----------|-----------|------|
| 36 Charlton | 58 | Boss anchor |
| 13 Kane | 56 | Target |
| 25 Casillas | 57 | GK |

---

## 8. Historical Knockout Teams

### Gate 0 — Uruguay 1950 (Round of 16)

| Field | Value |
|-------|-------|
| gateIndex | 0 |
| gateName | Round of 16 |
| historicalTeam | Uruguay 1950 |
| nickname | La Celeste — Maracanazo |
| primaryStyle | `compact_block` |
| secondaryStyle | `rapid_counter` |
| kit colors | `#6CACE4` / `#FFFFFF` |
| signature player | Ghiggia (41) |
| recommended form levels | 38–44 |
| memorable why | Giant-killer myth; 200,000 silenced at Maracanã; underdog World Cup peak |

**Roster:** 41 Ghiggia (42), 37 Schiaffino (40), filler CB/DM/GK at 38–40 — use generic high-compact_block profiles from boss pool or authored NPCs at IDs reserved in implementation (not duplicate catalog IDs).

*Implementation note:* For MVP, roster uses catalog IDs 37, 41 + three **synthetic boss slots** (same stats, no album entry): Obdulio Varela (DM, compact_block), Roque Máspoli (GK), Eusebio (*era wrong — use* Néstor Carballo *CB*) — author as knockout-only JSON entries referencing temporary NPC ids OR reuse 29, 24, 23 at elevated levels without adding to 50 roster.

**Simplified MVP roster (catalog IDs only):**

| profileId | Player | formLevel |
|-----------|--------|-----------|
| 41 | Ghiggia | 42 |
| 37 | Schiaffino | 40 |
| 29 | Casemiro (stand-in enforcer) | 39 |
| 23 | Maldini (stand-in CB) | 38 |
| 24 | Buffon (stand-in GK) | 38 |

### Gate 1 — Brazil 1970 (Quarter-final)

| Field | Value |
|-------|-------|
| gateIndex | 1 |
| gateName | Quarter-final |
| historicalTeam | Brazil 1970 |
| nickname | The Beautiful Game |
| primaryStyle | `wing_play` |
| secondaryStyle | `high_intensity` |
| kit colors | `#FFDF00` / `#009C3B` |
| signature player | Pelé (42) |
| recommended form levels | 45–52 |
| memorable why | Peak aesthetic football; Jairzinho scored every knockout match |

**Roster:**

| profileId | Player | formLevel |
|-----------|--------|-----------|
| 42 | Pelé | 50 |
| 38 | Jairzinho | 48 |
| 49 | Carlos Alberto | 47 |
| 21 | Roberto Carlos | 46 |
| 47 | Ronaldinho (Tostão creative stand-in) | 48 |

### Gate 2 — Argentina 1986 (Semi-final)

| Field | Value |
|-------|-------|
| gateIndex | 2 |
| gateName | Semi-final |
| historicalTeam | Argentina 1986 |
| nickname | La Albiceleste — Hand of God |
| primaryStyle | `street_smarts` |
| secondaryStyle | `tactical_control` |
| kit colors | `#75AADB` / `#FFFFFF` |
| signature player | Maradona (43) |
| recommended form levels | 52–58 |
| memorable why | One man carried a nation; England quarter-final; Burruchaga final assist |

**Roster:**

| profileId | Player | formLevel |
|-----------|--------|-----------|
| 43 | Maradona | 58 |
| 39 | Burruchaga | 54 |
| 45 | Di María (Valdano-style) | 52 |
| 48 | Martínez | 53 |
| 9 | Rodri (Batista DM stand-in) | 52 |

### Gate 3 — France 1998 (Final)

| Field | Value |
|-------|-------|
| gateIndex | 3 |
| gateName | Final |
| historicalTeam | France 1998 |
| nickname | Les Bleus — Home Triumph |
| primaryStyle | `tactical_control` |
| secondaryStyle | `compact_block` |
| kit colors | `#002395` / `#FFFFFF` |
| signature player | Zidane (44) |
| recommended form levels | 60–66 |
| memorable why | Zidane double header final; first French World Cup; multicultural squad template |

**Roster:**

| profileId | Player | formLevel |
|-----------|--------|-----------|
| 44 | Zidane | 65 |
| 40 | Thuram | 62 |
| 14 | Kanté (Deschamps DM stand-in) | 61 |
| 13 | Kane (Guivarc'h ST stand-in) | 60 |
| 16 | Neuer (Barthez GK stand-in) | 61 |

### Gate 4 — Argentina 2022 (Trophy lift)

| Field | Value |
|-------|-------|
| gateIndex | 4 |
| gateName | Trophy lift |
| historicalTeam | Argentina 2022 |
| nickname | La Scaloneta — Qatar Crown |
| primaryStyle | `possession_buildup` |
| secondaryStyle | `high_press` |
| kit colors | `#75AADB` / `#FFFFFF` |
| signature player | Messi (2) |
| recommended form levels | 65–72 |
| memorable why | Messi's crowning moment; penalty shootout drama; Di María final goal |

**Roster:**

| profileId | Player | formLevel | skillTier |
|-----------|--------|-----------|-----------|
| 2 | Messi | 72 | 2 |
| 45 | Di María | 68 | 2 |
| 6 | Modrić (De Paul energy stand-in) | 66 | 1 |
| 48 | Martínez | 65 | 1 |
| 9 | Rodri (Fernández stand-in) | 65 | 1 |

---

## 9. Album Layout

**Volume title:** *Road to the Trophy — Vol. 1*

| pageId | title | slots (profileIds) | unlock rule | emotional purpose |
|--------|-------|-------------------|-------------|-------------------|
| marquee | Marquee Signings | 1, 2, 3 | Always visible | "Try all three icons across runs" |
| favorites | Fan Favorites | 4–28, 48 | Always visible | Core scout chase; silhouettes after reports |
| host_city | Host City Heroes | 29–36 | Always visible | Tie stamps to named players |
| legends | Legends | 42, 43, 46, 47, 50 | Hidden until any legend seen | Foil surprise — GOAT hunting |
| knockout | Knockout Immortals | 41, 42, 43, 44, 45 | Gate icons gray until gate reached | Preview boss faces; revenge motivation |

**Slot states:** 0 = seen silhouette, 1 = signed full color.

**Duplicate note:** Pelé (42) and Maradona (43) appear on both knockout and legends pages — same sticker, dual page placement for layout.

---

## 10. Achievements MVP

| id | title | description | unlock condition | icon concept |
|----|-------|-------------|------------------|--------------|
| stamp_0 | First Stamp | Secure your first host city stamp. | Win any host city boss | City stamp with ribbon |
| knockout_debut | Knockout Debut | Reach the knockout stage. | Earn 8 city stamps | Knockout bracket gate |
| world_cup_win | World Cup Lifted | Win the trophy. | Defeat Argentina 2022 gate | Golden trophy |
| album_25 | Half the Album | Sign 25 unique players across all runs. | 25 entries in game_album at 1 | Half-filled sticker page |
| album_50 | Complete Vol. 1 | Fill every slot in Road to the Trophy — Vol. 1. | All 50 profileIds at 1 | Full album holographic |
| brazil_1970 | Beautiful Game | Knock out Brazil 1970 in the knockout stage. | Win gate 1 | Brazil 1970 kit badge |

---

## 11. Item Rename Pack (Top 10)

| existing item id | football display name | description | why it fits |
|------------------|----------------------|-------------|-------------|
| life_orb | All-Out Boots | +30% duel damage; wearer loses 10% max stamina per hit | Risk-reward striker gear — full commitment every duel |
| leftovers | Recovery Straps | Restore 10% max stamina each round | Regeneration between phases — physio tape flavor |
| focus_sash | Last-Man Tackle | At full stamina, survive any hit with 1 HP once | Desperate goal-line clearance fantasy |
| choice_band | Power Contract | +40% physical damage, -20% Defense | Committed to physical duel win, exposed if outplayed |
| choice_specs | Playmaker Lens | +30% technical damage | Vision-focused creator gear |
| charcoal | Pressing Kit | +50% High Press skill damage | Style kit for gegenpress identity |
| mystic_water | Possession Kit | +50% Possession Build-up skill damage | Circulation and control boost |
| rocky_helmet | Hard Tackle Pads | Attacker takes 12% max stamina on each hit | Defensive enforcer — hurt the presser |
| eviolite | Youth Prospect Clause | +50% Defense & Vision if not at peak form tier | Young talent protection — Spec 006B form growth |
| full_restore | Full Recovery Spray | Fully restores stamina of one player | Sideline medical tent standard |

---

## 12. JSON Shape Preview

### 12.1 player_profiles.json

```json
{
  "schemaVersion": 1,
  "profiles": [
    {
      "profileId": 2,
      "slug": "lionel-messi",
      "displayName": "Lionel Messi",
      "commonName": "Messi",
      "nation": "ARG",
      "position": "AM",
      "primaryStyle": "possession_buildup",
      "secondaryStyle": "tactical_control",
      "baseStats": { "hp": 68, "atk": 72, "def": 62, "special": 118, "spdef": 112, "speed": 92 },
      "rarity": "elite",
      "portrait": "/assets/players/lionel-messi.png",
      "flavorText": "The ball obeys him. Slows the game down until the killer pass appears.",
      "flags": {
        "isMarquee": true,
        "isLegend": false,
        "scoutable": false,
        "bossExclusive": false
      },
      "album": { "pageId": "marquee", "slot": 1 },
      "legal": { "nameOk": true, "likenessTier": 1 }
    }
  ]
}
```

### 12.2 host_city_bosses.json

```json
{
  "schemaVersion": 1,
  "bosses": [
    {
      "mapIndex": 0,
      "hostCity": "São Paulo",
      "nation": "BRA",
      "label": "Brazil Federation Challenge",
      "managerName": null,
      "primaryStyle": "compact_block",
      "stamp": { "id": "stamp_sao_paulo", "displayName": "São Paulo Stamp" },
      "difficulty": 2,
      "recommendedFormRange": [12, 16],
      "roster": [
        { "profileId": 29, "formLevel": 14, "skillTier": 0, "heldItemId": null },
        { "profileId": 22, "formLevel": 12, "skillTier": 0, "heldItemId": null },
        { "profileId": 17, "formLevel": 13, "skillTier": 0, "heldItemId": null }
      ],
      "flavorText": "Samba structure — absorb pressure, then explode."
    }
  ]
}
```

### 12.3 knockout_teams.json

```json
{
  "schemaVersion": 1,
  "teams": [
    {
      "gateIndex": 4,
      "gateName": "Trophy lift",
      "historicalTeam": {
        "nation": "ARG",
        "year": 2022,
        "nickname": "La Scaloneta — Qatar Crown"
      },
      "primaryStyle": "possession_buildup",
      "secondaryStyle": "high_press",
      "kit": { "primary": "#75AADB", "secondary": "#FFFFFF" },
      "signatureProfileId": 2,
      "recommendedFormRange": [65, 72],
      "memorableWhy": "Messi's crowning moment; Di María final brilliance.",
      "roster": [
        { "profileId": 2, "formLevel": 72, "skillTier": 2, "heldItemId": "life_orb" },
        { "profileId": 45, "formLevel": 68, "skillTier": 2, "heldItemId": null }
      ]
    }
  ]
}
```

### 12.4 album_layout.json

```json
{
  "schemaVersion": 1,
  "volumeTitle": "Road to the Trophy — Vol. 1",
  "pages": [
    {
      "pageId": "marquee",
      "title": "Marquee Signings",
      "hiddenUntil": null,
      "slots": [
        { "profileId": 1, "label": "High Press Icon" },
        { "profileId": 2, "label": "Possession Maestro" },
        { "profileId": 3, "label": "Defensive Anchor" }
      ]
    },
    {
      "pageId": "legends",
      "title": "Legends",
      "hiddenUntil": "anyLegendSeen",
      "slots": [
        { "profileId": 42, "label": "The King" },
        { "profileId": 43, "label": "El Diego" },
        { "profileId": 46, "label": "The Phenomenon" },
        { "profileId": 47, "label": "Magic" },
        { "profileId": 50, "label": "CR7" }
      ]
    }
  ]
}
```

### 12.5 achievements_mvp.json

```json
{
  "schemaVersion": 1,
  "achievements": [
    {
      "id": "world_cup_win",
      "title": "World Cup Lifted",
      "description": "Win the trophy.",
      "condition": { "type": "campaignWin" },
      "iconConcept": "golden_trophy"
    }
  ]
}
```

---

## 13. Balance Notes

### Scout rarity weighting

| Map band | Common/uncommon weight | Elite weight | Legend |
|----------|------------------------|--------------|--------|
| 0–1 | 70% | 30% (no Haaland/Messi-tier) | 0% |
| 2–4 | 40% | 55% | 0% |
| 5–7 | 25% | 70% | legendary node separate |
| Legendary node | — | — | 1-of-1 from legend pool |

First scout forced pool prevents run-breaking picks (no Messi, CR7, Pelé at minute 2).

### Host city boss scaling

- Form levels match `MAP_LEVEL_RANGES` boss band from engine (+2 on signature hero)
- Each leg adds one roster member (maps 0–1: 3 players, map 7: 3 elites at 56–58)
- Primary style matches federation theme for prep-screen telegraph
- Signature hero gets +1 skill tier on maps 5–7

### Knockout team scaling

| Gate | Enemy count | Form band | Style synergy |
|------|-------------|-----------|---------------|
| 0 | 5 | 38–44 | Compact + counter |
| 1 | 5 | 45–52 | Wing + intensity |
| 2 | 5 | 52–58 | Street + tactical |
| 3 | 5 | 60–66 | Tactical + compact |
| 4 | 5 | 65–72 | Possession + press; Messi skill tier 2 |

Gate 4 should end **60–70%** of first-time runs. Player squad expected form 55–65 entering gate 4.

### Legend gating

- Map 5+ legendary nodes appear (weight 2 per Spec 003)
- Pool excludes already-signed legends
- Cristiano Ronaldo (50) requires meta unlock after first win OR map 6+ — prevents legend stacking run 1

### First-run difficulty feel

- Map 0 boss win rate target: **85%+**
- First knockout entry: minute 25–30
- Loss before map 3: **<15%**
- Ideal first loss: semi-final or final — "I almost had Messi"

---

## 14. Data Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Too many legends too early | High | Legends excluded from scout pools; CR7 gated map 6+/post-win; legendary node 1-of-1 |
| Weak starter fantasy | Medium | Messi replaces Modrić; keep Mbappé + Van Dijk; triangle tooltip on marquee screen |
| Overpowered scout pool | High | Map 0 forced rare pool; Haaland/Messi-tier elites low weight until map 3+ |
| Lack of defenders/keepers | Medium | 4 GKs, 8 CBs, full-backs, Rodri/Kanté/Casemiro DM anchors in mid/late pools |
| Legal/image considerations | High | Names only T0; stylized portraits T1; legal review before public alpha (006B §9) |
| Historical squad accuracy | Medium | Knockout uses catalog stand-ins for missing squad players; UI labels historical team + signature stars; document stand-ins in flavor text |
| Single profileId vs album duplicate slots | Medium | Pelé/Maradona one ID; album pages reference same ID twice with shared sticker state |
| Nation clustering (BRA 6) | Low | Brazil host + 1970 gate justifies count; scout weights cap Brazilian duplicates per report |
| Stand-in players break immersion | Medium | Prep screen shows historical team name; signature players use real IDs; fillers labeled in boss flavor only |
| 50-cap forces knockout filler compromises | Medium | Post-MVP expand to 60 for full historical XIs; MVP prioritizes signature immortals |

---

## 15. Final Recommendation

### Final starter set

**Mbappé (1) · Messi (2) · Van Dijk (3)**

Modrić remains a premium mid-map scout reward — better for long-term collection than marquee choice.

### Final 50-player roster summary

| Bucket | IDs | Headline names |
|--------|-----|----------------|
| Starters | 1–3 | Mbappé, Messi, Van Dijk |
| Scouts | 4–28 | Haaland, Modrić, Salah, De Bruyne, Iniesta, Xavi, Neuer, Buffon, Casillas, Cruyff, Beckenbauer, … |
| Host heroes | 29–36 | Casemiro, Kroos, Kubo, Figo, Rossi, Bergkamp, Sánchez, Charlton |
| Knockout depth | 37–40, 49 | Schiaffino, Jairzinho, Burruchaga, Thuram, Carlos Alberto |
| Knockout icons | 41–45 | Ghiggia, Pelé, Maradona, Zidane, Di María |
| Legends | 46, 47, 50 (+42, 43 shared) | Ronaldo Nazário, Ronaldinho, Cristiano Ronaldo |

### Final boss lineup

- **Host cities:** 8 federation challenges (São Paulo → London) with catalog hero anchors
- **Knockout:** Uruguay 1950 → Brazil 1970 → Argentina 1986 → France 1998 → Argentina 2022

### Final album structure

5 pages · 50 slots · legends hidden · knockout gates teased gray until reached

### Data pack confidence score

## **8.5 / 10**

| Dimension | Score | Note |
|-----------|-------|------|
| Football fantasy | 9/10 | Real icons, historical gates, Messi starter |
| Balance authorability | 8/10 | Stats authored; golden tests needed |
| Scout variety | 8/10 | 25 scouts + 18 styles; 50 cap tight for full historical squads |
| Album motivation | 9/10 | Clear pages, locked knockout tease, legend foil |
| SPEC 006B compliance | 9/10 | Single profileId, StyleId keys, JSON catalogs, no evolution rename |
| Historical accuracy | 7/10 | Signature stars accurate; some stand-ins required at 50 cap |
| Legal readiness | 8/10 | Tiered likeness plan documented; names require sign-off |

**Ship recommendation:** Proceed to JSON authoring with **Messi starter**, **Pelé/Maradona at ID 42/43**, and **legend pool 46/47/50 + 42/43**. Run golden battle fixtures on gate 2 (Maradona) and gate 4 (Messi) before playtest.

---

*End of SPEC 007 — Football Data Pack.*
