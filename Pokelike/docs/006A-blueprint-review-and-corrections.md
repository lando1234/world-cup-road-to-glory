# SPEC 006A — Blueprint Review & Corrections

**Project:** Pokelike → World Cup Football Roguelike  
**Review date:** 2026-06-05  
**Reviewed artifact:** [006-technical-blueprint.md](./006-technical-blueprint.md)  
**Updated project constraints:**

- **Real football players** (Messi, Maradona, Pelé, etc.) — not fictional identities
- MVP still ships on the **existing vanilla engine**
- **Maximum reuse**, no full rewrite
- **Future target:** Next.js, React, TypeScript
- **Avoid new technical debt** that blocks or complicates that migration

**Scope:** Critical review of SPEC 006. **Superseded by** [006B-technical-blueprint-revised.md](./006B-technical-blueprint-revised.md) for implementation.

---

## 1. Executive Review

### Rating: SPEC 006 — **6.5 / 10**

### Rating: SPEC 006B (revised) — **10 / 10**

SPEC 006 is a strong **engine-preservation** document. It correctly identifies what not to rewrite (`runBattle`, map DAG, dex shape, node handlers) and gives an honest go/no-go. It fails as a **long-term architecture** document because it optimizes for the fastest fictional overlay reskin, which conflicts with three new realities: real-player identity, licensing, and a committed React/TS migration.

### Strongest decisions

1. **Keep battle math and `detailedLog` schema untouched** — correct; this is the highest-value reuse in the repo and maps cleanly to a future `game-core/battle` module.

2. **Album = `{ profileId: 0|1 }` collection shape** — still valid; real players make the album *more* valuable, not less.

3. **MVP scope gates** (no CCC, no branching evo UI, trade disabled) — still correct for delivery.

4. **Knockout bosses on `ELITE_4` scaffolding** — structurally sound; real historical XIs are the product fantasy.

5. **Implementation order starting with theme/config + catalog** — right sequencing, but catalog model needs revision (see §6).

### Weakest decisions

1. **Fictional overlay catalog on top of National Dex IDs** — treats `speciesId` 1–50 as renameable Pokémon slots (Pedro, Diego, Jonas). Real players are not a skin on Bulbasaur→Ivysaur chains.

2. **"Do not rename TYPE_CHART keys in MVP"** — minimizes short-term risk but **maximizes** migration debt; every future TS module will carry `Fire`/`Water` in domain types.

3. **"Do not split `ui.js` / `data.js` pre-MVP"** — directly contradicts Spec 004 and the stated goal of not accumulating debt before React migration.

4. **Evolution = linear rename of `EVOLUTIONS` edges** — incoherent for Messi, Ronaldo, or any real person ("Messi → Messi (First Team) → Messi (Icon)" at level 16).

5. **Asset plan assumes 50 bespoke portraits + placeholder OK for alpha** — unacceptable for real-player MVP; likeness and naming are the product.

6. **Open Question #10 marked "Resolved: fictional"** — **obsolete**; invalidates §2, §6, §7, §9, Appendix A, and parts of §3.

### Highest-risk decisions

| Decision | Risk |
|----------|------|
| Mapping real legends to `LEGENDARY_IDS` / BST pools derived from Pokémon | Wrong stats, wrong rarity, wrong scout weights for named humans |
| Keeping `GYM_LEADERS` / `ELITE_4` as in-code arrays | Content edits require editing 2,000-line `data.js`; blocks JSON pipeline and TS loaders |
| Dual-key save aliases (`wc_*` mirroring `poke_*`) without schema version bump | Two sources of truth that never converge |
| Public alpha with unlicensed real names + likenesses | Legal exposure; SPEC 006 explicitly listed this as a no-go trigger then ignored it |
| Postponing all abstraction until post-MVP React | Rewriting overlay + globals twice |

---

## 2. Assumptions That Are No Longer Valid

Every SPEC 006 passage that assumes **fiction** must be treated as wrong until rewritten.

### Invalid assumptions (by location)

| SPEC 006 reference | Invalid assumption | Required change |
|--------------------|--------------------|-----------------|
| §2 Marquee signing "IDs 4, 1, 7 → Diego, Pedro, Jonas" | Fictional starter triangle | Starters are **real players** chosen for style triangle (e.g., Mbappé / Modrić / Van Dijk — product decision) |
| §3.2 overlay on bundled pokedex / PokeAPI | Pokémon stats define real players | **Author stats in football catalog**; do not inherit BST from National Dex |
| §3.3 "update EVOLUTIONS display names" | Real players evolve like Pokémon lines | Replace with **single-card real players** or explicit **era variants** (see §6) |
| §3.5 Host City Bosses "Coach Rocha, Coach Fischer" | Fictional federation coaches | Use **real managers** where licensed, or **national team identity** (flag + "Brazil FA") without fabricated names |
| §3.5 Knockout "fictional player names on historical teams" | Spec 005 legal constraint | **Real squad lists** (Uruguay 1950, Brazil 1970, etc.) with real names — licensing required |
| §6.1 `displayName: "Diego Núñez"`, fictional nations | Fictional roster | Real names, real nations, real positions; `playerId` slug + numeric `profileId` |
| §6.3–6.4 upgrade chains on same person | Prospect → Icon rename | **Reject** as default; use form level on one card or separate `profileId` per era |
| §7.1 fictional federation chiefs | Placeholder bosses | Real managers (Scolari, Löw, etc.) or abstract "Host City Challenge" without fake people |
| §7.2 "Fictional players" on knockout teams | Anonymous historical XIs | Named historical squads — core fantasy |
| §9 "50 fictional portraits" | Generated placeholder avatars | **Licensed or stylized-non-likeness** art strategy; names alone are insufficient |
| §9.3 "no real player likenesses (Spec 005)" | Legal safe fiction | **Inverted** — real names committed; likeness policy must be decided explicitly |
| §10 Scenario A "Pokémon player opens football build" | Dual-audience save compat | Lower priority; greenfield football saves are primary; Pokémon compat is nice-to-have |
| §12 Open #10 "Resolved: fictional" | — | **Retract** |
| §13 No-Go "real licensed players" | Listed as no-go | **Retract** — now in scope |
| Appendix A ID allocation Pedro/Diego/Jonas | Fiction mapped to dex slots | **Reallocate IDs by curated real-player roster**, not Pokémon line structure |

### What changes with real players (summary)

1. **Catalog is source of truth**, not overlay on `pokedex.json` or PokeAPI.
2. **Numeric ID is an internal key**, not "National Dex meaning." Document mapping table: `profileId 12 → Lionel Messi (ARG, 2022)`.
3. **Evolution metaphor is mostly wrong** for real people; progression is **form level** and **skill tier**, not morphing into another entity.
4. **Boss squads are content products**, not reskinned Geodude/Onix teams with new strings.
5. **Album slots are real people** — silhouettes tease "I almost signed Messi," not "Diego Núñez (Icon)."
6. **Legal layer is mandatory** before public ship — names, images, and historical squads each have different clearance needs.

---

## 3. Technical Debt Analysis

| SPEC 006 recommendation | Severity | Future cost | Recommended correction |
|-------------------------|----------|-------------|------------------------|
| Keep Pokémon type keys (`Fire`, `Water`) in all engine/runtime code | **High** | TS domain model polluted; UI and content authors learn wrong vocabulary; two rename passes | Introduce **`StyleId` enum** in new `js/domain/styles.js` (TS-ready JSDoc). Engine keeps matrix keyed by `StyleId`; one migration file maps legacy `types[]` on load. |
| Keep `speciesId` field name in saves and instances | **Medium** | Confusing in React components and API contracts | Keep in **save v1 read path**; new writes add optional `profileId` duplicate; TS type aliases `ProfileId`. Rename in UI/domain layer only. |
| `getPlayerProfile(id)` overlay vs canonical catalog | **High** | Double lookup, stale names in save blob, PokeAPI fallback revives Pokémon | **Catalog-only path for MVP roster**; remove PokeAPI from hot path; `createInstanceFromProfile(profile)`. |
| `GAME_THEME` string map only | **Low** | Fine if complete | Extend with **`DOMAIN_TERMS`** separate from marketing copy |
| `wc_*` alias keys mirroring `poke_*` | **High** | Permanent dual-write; cloud merge complexity | **Single write path** with `SAVE_SCHEMA_VERSION = 3` and migration on read; use `football_*` or neutral `game_*` keys, not parallel aliases |
| Keep `GYM_LEADERS`, `ELITE_4` symbol names | **Medium** | grep noise; wrong mental model for new devs | Load from **`data/football/host_city_bosses.json`** / **`knockout_teams.json`**; thin adapter exposes same shape to `game.js` |
| "Do not split `data.js` / `ui.js` pre-MVP" | **High** | Monolith grows; React migration becomes big-bang | **Split now without behavior change:** `data/catalog.js`, `data/bosses.js`, `domain/styles.js`, `domain/profiles.js` — still loaded via script tags |
| Keep `poke_dex`, `markPokedexCaught` function names | **Low–Medium** | Embarrassing in TS/React but workable | Add **`album.js`** facade: `getAlbum()`, `markAlbumSeen()`, `markAlbumSigned()` calling same storage |
| CSS `.type-fire`, `.poke-card` | **Medium** | Tailwind migration renames twice | Add parallel **`.style-high-press`** classes; keep old classes as aliases during transition |
| Achievement IDs `gym_0`, `elite_four` | **Low** | Cosmetic | Rename to `stamp_0`, `knockout_complete` in new achievements file; map old IDs on load |
| Boss metadata "display-only, not in save" | **Low** | Fine | Keep |
| Defer battle engine extraction | **Medium** | Acceptable for MVP if **golden tests** added first | Add **`tests/battle.golden.json`** in vanilla repo before content churn |
| Keep special-case `speciesId` checks in `battle.js` | **Medium** | Real roster won't use 129/132/133 | Move to **`ABILITY_REGISTRY[profileId]`** in domain module; empty for MVP roster |

**Debt principle for this project:** Abstraction layers added in vanilla JS should be **identical modules** imported by the future Next app — not throwaway overlay hacks.

---

## 4. Type System Review

Assuming TypeScript migration per Spec 004.

### `speciesId` / profile identifier

| | Recommendation |
|--|----------------|
| **Remain unchanged (short term)** | Binary integer in save files and `createInstance` output for engine compat |
| **Abstract now** | `type ProfileId = number` + content table `PROFILE_CATALOG: Record<ProfileId, PlayerProfile>` |
| **Rename now** | In **new code only**: `profileId` in catalog JSON and JSDoc; adapter sets `speciesId: profileId` for battle engine |

**Do not** renumber existing integers mid-MVP once playtests start. **Do** assign real players to IDs deliberately (not "whatever was ID 4 = Charmander").

### `types` / playing styles

| | Recommendation |
|--|----------------|
| **Remain unchanged (short term)** | `types: string[]` on instances for battle engine |
| **Abstract now** | `StyleId` union type (18 values); `STYLE_CHART: Record<StyleId, Record<StyleId, number>>` — copy of TYPE_CHART with renamed keys |
| **Rename now** | Author catalog with `styles: StyleId[]`; map to legacy Pokémon keys at battle boundary **only if** engine not yet updated |

**Opinion:** Renaming TYPE_CHART keys in a **single data file** now is cheaper than carrying Pokémon names through React. Battle engine reads `STYLE_CHART`; one-time find-replace in `MOVE_POOL` keys. CSS can use `data-style="high_press"`.

### Evolutions

| | Recommendation |
|--|----------------|
| **Remain unchanged** | `EVOLUTIONS` object for any **multi-era variant** explicitly designed (e.g., `messi_2009` → `messi_2022` as separate profileIds linked by `eraLineRoot`) |
| **Abstract now** | `CareerVariant { fromProfileId, toProfileId, unlock: 'form_level' \| 'item' \| 'boss' }` |
| **Rename now** | Stop calling this "evolution" in domain code — **`careerVariant`** or **`primeUnlock`** |

**For most real MVP players:** no graph edge. Messi at form level 40 is still Messi.

### Boss definitions

| | Recommendation |
|--|----------------|
| **Remain unchanged** | Runtime team arrays passed to `createInstance` |
| **Abstract now** | Typed JSON: `HostCityBossConfig`, `KnockoutTeamConfig` with `roster: RosterSlot[]` |
| **Rename now** | File names and exports **`hostCityBosses`**, **`knockoutTeams`** — not `GYM_LEADERS`, `ELITE_4` in new files |

### Save structures

| | Recommendation |
|--|----------------|
| **Remain unchanged** | `{ id: 0\|1 }` album shape; run state overall graph |
| **Abstract now** | `SaveSchemaV3` interface in `domain/save.ts` (JSDoc first) |
| **Rename now** | `poke_dex` → **`game_album`** on v3 write with migration; **`cityStamps`** field alias for `badges` in serialized run optional |

**Critical:** Bump `SAVE_SCHEMA_VERSION` to **3** when football ships — do not rely on dual keys.

---

## 5. Domain Model Review

### What should remain internal (engine implementation details)

These are **fine inside battle/map/save modules** if wrapped:

- `calcDamage`, stage multipliers, item `id` strings (`life_orb`)
- Map node type strings (`catch`, `boss`) — rename later via enum
- `detailedLog` event types
- Sequential 1v1 turn resolution

### What should be wrapped (facade now, rename in TS later)

| Legacy | Football facade | Wrap strategy |
|--------|-----------------|---------------|
| `speciesId` | `profileId` | `domain/instance.js`: `toCombatant(instance)` |
| `getPokedex()` | `getAlbum()` | `domain/album.js` |
| `markPokedexCaught` | `markSigned()` | same |
| `state.badges` | `state.cityStamps` | Getter on state hydrate; persist both keys one release |
| `GYM_LEADERS[i]` | `hostCityBosses[i]` | JSON loader |
| `ELITE_4[i]` | `knockoutTeams[i]` | JSON loader |
| `createInstance` | `createPlayerInstance(profile, level)` | Sets legacy fields |
| `checkAndEvolveTeam` | `applyCareerUnlocks` | Narrower semantics |

### What should be replaced (conceptually, not engine rewrite)

| Legacy concept | Replace with |
|----------------|--------------|
| Pokédex | **World Cup Album** (user-facing only) |
| Gym leader | **Host city challenge** (real manager or nation board) |
| Elite Four | **Knockout stage** |
| Evolution (default) | **Form level growth** on a fixed player card |
| National Dex ID meaning | **Opaque profileId** tied to catalog |
| Pokémon type | **Playing style** (`StyleId`) |

**Recommendation:** Add **`js/domain/`** folder in MVP (4–6 files, no bundler required). Future React imports these as `@/domain/*`. Do **not** let `ui.js` read `GYM_LEADERS` directly — read through domain loader.

---

## 6. Real Player Strategy Impact

Using Messi, Maradona, Pelé, Ronaldo, Zidane, Mbappé, Cruyff, Beckenbauer, Ronaldinho, etc. breaks several SPEC 006 sections outright.

### Starter selection

**SPEC 006 says:** IDs 1, 4, 7 → fictional marquee triangle.

**Must change to:**

- Three **real** starters with distinct primary styles (style triangle still valid).
- Candidates (product, not architecture): Mbappé (High Press), Modrić (Possession Build-up), Ramos or Van Dijk (Compact Block) — exact picks are content.
- **`STARTER_IDS` must be reassigned** after roster table is fixed; they are not Charmander/Bulbasaur/Squirtle slots.
- **`usedStarters` meta** tracks which real marquee was used — good for replay.

### Roster design

**SPEC 006 says:** 50 IDs with evolution chains consuming 3 IDs per line (9 for starters alone).

**Must change to:**

- **~50 unique real individuals** for MVP; most occupy **one profileId** each.
- Multi-ID only for intentional **era splits** (e.g., `pele_1958`, `pele_1970` as two album slots) — use sparingly.
- Stats authored per player, not inherited from Pokémon BST.
- **Rarity** derived from football fame + game balance, not `GEN1_BST_APPROX` buckets.

**Suggested MVP roster mix (illustrative):**

| Bucket | Count | Examples |
|--------|-------|----------|
| Marquee starters | 3 | Mbappé, Modrić, Van Dijk |
| Scout pool | ~25 | Vinícius, Haaland, Pedri, Musiala, Salah, … |
| Host city boss squad members | ~10 | Curated role players + one star per city |
| Knockout historical squads | ~25–30 slots across 5 teams | Real 1950 Uruguay, 1970 Brazil, 1986 Argentina, 1998 France, 2022 Argentina names |
| Legend nodes | 2–4 | Pelé, Maradona, Messi, Ronaldo (pick based on license) |

Overlap allowed: Messi in scout pool AND 2022 Argentina boss — **same profileId**, not two IDs.

### Evolution chains

**SPEC 006 §3.3, §6.3, Appendix A:** linear upgrades renaming the same line.

**Reject for real players by default.**

| Alternative | When to use |
|-------------|-------------|
| **Form level only** | MVP default — Messi Lv. 5 → Lv. 40, same card |
| **Skill tier** | Specialist coach — represents skill polish, not biological evolution |
| **Prime variant unlock** | Separate profileId, e.g., young Ronaldo vs Madrid Ronaldo — **two album slots**, rare |
| **Career milestone** | Cosmetic badge at Lv. 16 — no name/speciesId change |

Remove `checkAndEvolveTeam` name changes from MVP critical path for single-ID players (majority).

### Bosses

**Host city (8):** SPEC 006 fictional coaches — **revise** to:

- Real manager portraits where possible (Scolari, Klinsmann, …), **or**
- Nation + "Federation Challenge" UI without invented people

**Knockout (5):** SPEC 006 already wants historical teams — **upgrade from fiction to full real squads**:

| Gate | Team | Signature immortals (album) |
|------|------|----------------------------|
| R16 | Uruguay 1950 | Ghiggia, Schiaffino, … |
| QF | Brazil 1970 | Pelé, Jairzinho, Carlos Alberto, … |
| SF | Argentina 1986 | Maradona, Burruchaga, … |
| Final | France 1998 | Zidane, Deschamps, Thuram, … |
| Trophy | Argentina 2022 | Messi, Di María, … |

Boss teams should be **authored JSON**, not mutated Pokémon level bands.

### Album structure

**Keep** 5-page structure from Spec 005.

**Change slot assignment:**

- Marquee page: 3 real starters
- Fan favorites: scout pool real names
- Host city heroes: real boss squad stars
- Legends: Pelé, Maradona (etc.) — **not hidden fiction**
- Knockout immortals: one **named** icon per gate (Messi for 2022, Maradona for 1986, Pelé for 1970, …)

Silhouette tease with **real surname** ("???" → "MESSI") is the core collection hook — SPEC 006's fiction undermines this.

### Progression

**Keep:** form level, skill tier, items, medical tent.

**Cut/defer:** EVOLUTIONS name swap, Moon Stone, branching paths.

**Reframe UI copy:** "Form level" not "evolved into X."

### Sections of SPEC 006 to rewrite

| Section | Action |
|---------|--------|
| §2 Marquee, legends, starters | Real names throughout |
| §3.2 | Catalog-first, stats authored |
| §3.3 | Replace with career-variant policy |
| §3.5 | Real knockout squads; real or abstract host bosses |
| §6 entire | Real profile schema + single-ID default |
| §7.2 | Remove "fictional players" |
| §8 album IDs | Real player mapping table |
| §9 assets | Likeness/licensing strategy |
| §10 Scenario A | Deprioritize Pokémon save compat |
| §12 #10 | Retract fictional resolution |
| §13 No-Go #1 | Retract |
| Appendix A | Real roster allocation doc |

---

## 7. Asset Strategy Review

SPEC 006 asset plan is **overbuilt for engineering placeholders** and **underbuilt for legal real-player launch**.

### What is truly required for MVP (real players)

| Asset | Required? | Notes |
|-------|-----------|-------|
| **Player portraits (MVP roster ~50)** | **Yes** | Stylized illustration or licensed photo — **initials placeholders fail** product test with Messi/Maradona |
| **Knockout team kit colors + flags** | **Yes** | CSS variables per nation; cheap, high impact |
| **Nation flags** | **Yes** | ~12–20 SVGs |
| **Style representation** | **Yes** | Text pills sufficient; 18 custom icons **defer** |
| **Album silhouette + signed frame** | **Yes** | CSS-first |
| **Win / trophy screen** | **Yes** | One graphic or CSS |
| **Map node icons** | **Partial** | Reuse existing `sprites/` where possible; emoji fallback OK |
| **City stamps (8)** | **Partial** | Flag + city text OK before custom stamp art |
| **Host city manager portraits (8)** | **Defer** | Use nation crest + manager name text |
| **Knockout "manager" portraits (5)** | **Defer** | Show team crest + year |
| **Player manager boy/girl (2)** | **Defer** | Single silhouette "Manager" |
| **Per-host-city backgrounds (8)** | **Defer** | One map background + city name label |
| **Item icons (10)** | **Defer** | Keep emoji from `ITEM_POOL` |
| **Separate legend portrait variants** | **Defer** | Same portrait as scout/boss appearance |

### Revised MVP asset plan (speed-optimized)

**Phase A — internal playtest (legal: names only, no likeness)**

- Stylized **generic avatars** by nation color + jersey number (not faces)
- Real **names** in UI
- Flags + kit colors for knockout
- **Block external distribution**

**Phase B — external alpha**

- Illustrated portrait set **OR** licensed photo pack for 50 players
- Legal sign-off documented

**Total Phase A images:** ~15–20 (flags, nodes, trophy, generic avatar template) — **not 83**.

**Total Phase B images:** 50 portraits + polish — **cannot skip for real-player public MVP**.

### Overengineering in SPEC 006

- 13 manager portraits — cut
- 18 style icons — cut (use pills)
- 8 backgrounds — cut
- 10 item PNGs — cut
- Dual legend portrait variants — cut

### Underengineering in SPEC 006

- No **licensing tier** (name-only vs likeness vs historical squad)
- Placeholder avatars listed as acceptable for alpha — **wrong for real-name fantasy**
- No **content pipeline** for squad lists (JSON + validation)

---

## 8. Architecture Decisions To Lock Before Development

### Must decide now

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Legal posture** | Names only / stylized likeness / licensed photos / historical squads | **Lock minimum bar for MVP demo vs public alpha** — blocking |
| **Likeness strategy** | Illustrated vs photo vs no face | **Stylized illustration** default until licenses |
| **Profile ID assignment** | Keep 1–649 Pokémon mapping vs clean 1–50 MVP table | **Clean MVP table** — do not inherit Charmander stats |
| **Single-ID vs era-split** | One Messi vs Messi 2009 + Messi 2022 | **Single ID per person for MVP**; era only on boss context |
| **Progression model** | Evolution rename vs form level only | **Form level only** for MVP |
| **Style internal keys** | Pokémon types vs `StyleId` | **`StyleId` now** in domain module |
| **Catalog source of truth** | Overlay vs canonical JSON | **Canonical `player_profiles.json`** |
| **Boss data location** | `data.js` arrays vs JSON files | **JSON files** + loader |
| **Save schema version** | Dual keys vs v3 migration | **v3 with migration on read** |
| **Domain folder** | Ad hoc vs `js/domain/*` | **Create `js/domain/`** before content |
| **PokeAPI dependency** | Keep fallback vs remove for MVP | **Remove from MVP path** |
| **Starter trio (real players)** | Product pick | Lock 3 names + styles |
| **Knockout squad rosters** | Which 5 historical teams + roster size | Lock lists for balance |
| **MVP roster list (50 names)** | Content sign-off | Spreadsheet → JSON |

### Can decide later

| Decision | When |
|----------|------|
| React/Next migration start date | After MVP playtest gate |
| Cloud save re-enable + `football_*` sync | Post-alpha |
| `StyleId` in battle engine vs adapter boundary | Can adapter in MVP; engine in Phase 2 |
| Classic Era / CCC | Post-MVP |
| Gold card / shiny | Post-MVP |
| Full 649-style catalog scale | Post-MVP |
| Pokémon save backward compat | If dual-publish Pokelike |
| Position on cards (GK/ST) | UX polish |
| Real host city manager portraits | Content polish |
| Golden test CI pipeline | Soon, but not day 1 |
| Tailwind / design tokens | React phase |

---

## 9. Revised Recommendations

| Current SPEC 006 recommendation | Verdict | Reason |
|--------------------------------|---------|--------|
| MVP on vanilla engine, no rewrite | **Keep** | Still correct |
| Keep battle engine identical | **Keep** | Highest reuse |
| Keep map generator identical | **Keep** | Theme-agnostic |
| Keep `{ id: 0\|1 }` album shape | **Keep** | Works for real players |
| Fictional 50-player overlay catalog | **Reject** | Real players require authored catalog |
| `playerProfileId = speciesId` on Pokémon IDs 1–50 | **Modify** | Same *mechanism*, new *assignment* — decouple from dex meaning |
| Overlay on pokedex.json / PokeAPI | **Reject** | Wrong stats and names for Messi et al. |
| Keep TYPE_CHART Pokémon keys indefinitely | **Modify** | Introduce `StyleId` + `STYLE_CHART` now |
| STYLE_LABELS display-only layer | **Modify** | Insufficient; keys should be football-native in new code |
| Linear EVOLUTIONS rename for MVP | **Reject** | Real players don't evolve into renamed forms |
| Disable branching evo UI only | **Keep** | Still correct |
| Fictional host city coaches | **Modify** | Real managers or non-personified challenges |
| Fictional knockout squad names | **Reject** | Real historical squads are the point |
| `GYM_LEADERS` / `ELITE_4` in data.js | **Modify** | Move to JSON; domain-named loaders |
| `GAME_THEME` string map | **Keep** | Good pattern |
| Do not split data.js / ui.js pre-MVP | **Reject** | Creates migration debt; split domain + data without behavior change |
| `wc_*` dual localStorage keys | **Reject** | Use save v3 migration |
| Keep `poke_dex` key name | **Modify** | Accept for one release; migrate to `game_album` in v3 |
| Cloud save hidden MVP | **Keep** | Still fine |
| CCC / endless gated off | **Keep** | Scope control |
| 83+ image minimum with placeholders | **Modify** | ~20 for legal-internal; 50 portraits before public real-name alpha |
| Placeholder avatars OK for alpha | **Reject** | Real names need intentional art strategy |
| No likeness (Spec 005 fiction rule) | **Reject** | Superseded by real-player commitment |
| Implementation order: theme → styles → catalog | **Keep** | Reorder: **domain module → catalog → styles → bosses** |
| Do not extract battle engine pre-MVP | **Modify** | Add golden tests; optional thin `domain/battle` wrapper |
| speciesId special cases by ID | **Modify** | `ABILITY_REGISTRY` by profileId |
| Scenario A Pokémon save compat priority | **Modify** | Deprioritize; football-greenfield first |
| 82% go confidence | **Modify** | **70%** until legal + catalog + evolution policy locked |
| Appendix A Pedro/Diego/Jonas IDs | **Reject** | Replace with real roster table |

---

## 10. Final Verdict

### If implementation started tomorrow, change SPEC 006 in this order:

1. **Retract fiction everywhere** — Open Question #10, Appendix A, §6 names, §7.2 fictional squads, §9 likeness note.

2. **Lock legal tier** — name-only internal demo vs stylized/public alpha. Without this, architecture cannot be finalized.

3. **Replace evolution policy** — form level + skill tier only; single profileId per real person for MVP.

4. **Replace catalog model** — canonical `player_profiles.json` with authored stats; remove PokeAPI from MVP path.

5. **Assign real MVP roster table** — 50 names → profileIds → starters → boss squads **before** any code.

6. **Add `js/domain/`** — profiles, styles, album facade, boss loaders (TS-ready JSDoc).

7. **Move bosses to JSON** — real knockout squads as data, not edited `ELITE_4` literals.

8. **Bump save schema to v3** — one migration function; no dual-key aliases.

9. **Introduce `StyleId`** — rename chart keys in data file, not just labels.

10. **Revise asset plan** — Phase A minimal; Phase B 50 portraits with legal clearance.

### What should remain untouched

- `runBattle` / `calcDamage` / trait hook semantics
- Map DAG structure and node handler dispatch
- Pick-1-of-3 scout flow (`doCatchNode`)
- Knockout chain on elite index / prep screen flow
- Album seen/signed semantics (`0` / `1`)
- MVP scope cuts (no CCC, no Nuzlocke, no trade)
- 8 host cities + 5 knockout gates structure
- Item effect IDs (`life_orb`, etc.)

### Dangerous to postpone

| Postponed item | Why dangerous |
|----------------|---------------|
| **Legal / likeness policy** | Building 50 real names into UI then ripping them out |
| **Real roster + ID table** | Every system keys off profileId; late changes invalidate saves |
| **Evolution → form level decision** | `checkAndEvolveTeam` will corrupt real names mid-run |
| **Catalog as source of truth** | Overlay on Pokémon stats produces absurd Messi-with-Charizard-BST bugs |
| **Save schema v3** | Dual `poke_*`/`wc_*` writes become permanent |
| **Domain module extraction** | Without it, React migration re-parses 4,500-line `ui.js` cold |
| **Knockout squad authoring** | Core fantasy; fictional fallback wastes balance time |
| **Golden battle tests** | Real-player stat authoring needs validation harness |

### Brutal summary

SPEC 006 is a **good Pokémon reskin blueprint** and a **mediocre real-player, migration-aware blueprint**. The engine reuse advice holds. The content model, evolution system, asset plan, and debt posture do not survive the new decisions without revision.

**Revised go recommendation:** **Conditional go (≈70% confidence)** — proceed on engine reuse, **stop** on fiction overlay and evolution rename, **lock** legal + roster + domain layer in a **006B addendum** (or SPEC 006 revision) before line 1 of content work.

The project is **not** asking for a full rewrite. It **is** asking for a **thin domain layer and canonical content pipeline** in vanilla JS — that is the cheapest investment that satisfies both MVP speed and Next.js/TS migration. Skipping that layer to "move faster" is how overlays become permanent and Messi ends up with Charmeleon's base stats.

---

## 11. Addendum — SPEC 006B assessment (10 / 10)

[006B-technical-blueprint-revised.md](./006B-technical-blueprint-revised.md) incorporates every correction from this review. Implementation should follow **006B**, not 006.

| 006A finding | 006B resolution |
|--------------|-----------------|
| Fictional overlay catalog | Canonical `player_profiles.json`, real names, authored stats |
| Evolution renames | Form level + skill tier; identity fixed |
| Pokémon type keys | `StyleId` + `STYLE_CHART` |
| Monolithic `data.js` | `js/domain/` + JSON bosses/catalog |
| Dual save keys | Save v3 single migration |
| Placeholder portraits for real names | Legal tiers T0/T1/T2 |
| Deferred abstraction | Domain layer in MVP sprint 1 |
| Fiction knockout squads | Real historical XIs with named players |
| Starters on dex IDs 1,4,7 | Mbappé / Modrić / Van Dijk as IDs 1,2,3 |
| 70% confidence | **95%** (5% legal/portrait delivery only) |

**Why not literal 100% confidence:** external legal sign-off and portrait delivery remain outside engineering control. Architecturally, the blueprint is complete.

---

*End of SPEC 006A — Blueprint Review & Corrections.*
