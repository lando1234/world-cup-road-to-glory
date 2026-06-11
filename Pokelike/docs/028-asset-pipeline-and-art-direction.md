# SPEC 014C — Asset Pipeline and Art Direction

**Status:** Planning baseline for Release Candidate Hardening  
**Date:** 2026-06-10  
**Authority:** [026](./026-release-candidate-identity-audit.md) · [027](./027-release-candidate-hardening-task-breakdown.md)  
**Prompts:** [029](./029-asset-generation-prompts.md)

---

## 1. Asset Philosophy

World Cup Road to Glory is a **football-native roguelike campaign**, not a monster-collection reskin. Assets must communicate:

- National team tournament energy (host cities, stamps, rival XIs)
- Squad building and scouting (not catching wild creatures)
- Manager career progression (**Form Level**, not evolution)
- Sticker-album collection pride (signed players, host city heroes)

**Principles:**

1. **Owned assets first** — every release-critical path resolves to local files or documented T0 fallback.
2. **Identity before polish** — remove Pokémon semantics before adding T2 likeness.
3. **Tiered delivery** — T0 silhouette → T1 stylized jersey → T2 approved likeness (future).
4. **One manifest per domain** — runtime reads manifests, not hardcoded paths in gameplay code.
5. **Playable gaps** — missing art never blocks campaign progress.

---

## 2. Legal / Release-Safe Constraints

| Rule | Rationale |
|------|-----------|
| No official federation logos or FIFA marks | Trademark |
| No club crests on public assets | Licensing |
| No hyperrealistic likeness without rights | Personality rights |
| No remote URLs on boot/gameplay hot path | Offline + CDN risk |
| No PokeAPI / Showdown sprites in football mode | IP + dependency |
| TheSportsDB sync scripts only — never runtime fetch | 018 strategy |
| Stamps: abstract city + nation palette only | Already shipped Phase 3 |

---

## 3. File Naming Conventions

| Asset type | Pattern | Example |
|------------|---------|---------|
| Player folder | `assets/players/{slug}/` | `assets/players/lionel-messi/` |
| Form image | `form-{n}.png` | `form-2.png` |
| Role-specific | `{role}.png` | `album.png`, `battle.png`, `squad.png` |
| Node icon | `assets/nodes/{kebab-name}.svg` | `scout-report.svg` |
| Host stamp | `assets/stamps/{city}-stamp.svg` | `madrid-stamp.svg` |
| UI icon | `assets/ui/{name}.svg` | `album-icon.svg` |
| Album state | `assets/ui/album/slot-{state}.svg` | `slot-signed.svg` |

**Slug source:** `player_profiles.json` → `slug` field (kebab-case, ASCII).

**Forbidden in filenames:** `pokemon`, `pokedex`, `poke`, `gym`, `badge`, `evolution`, `shiny`.

---

## 4. Folder Structure

```text
Pokelike/assets/
├── players/
│   └── {player-slug}/
│       ├── portrait.png      # optional hero
│       ├── form-1.png
│       ├── form-2.png
│       ├── form-3.png
│       ├── album.png
│       ├── battle.png
│       └── squad.png
├── nodes/
│   └── *.svg
├── stamps/
│   └── *-stamp.svg         # 8 host cities (shipped)
└── ui/
    ├── logo.svg
    ├── album-icon.svg
    ├── settlement-trophy.svg
    └── album/
        ├── slot-unknown.svg
        ├── slot-scouted.svg
        ├── slot-signed.svg
        ├── frame-marquee.svg
        ├── frame-favorites.svg
        └── frame-host-city.svg

Pokelike/data/football/
├── player_asset_manifest.json
├── node_asset_manifest.json
├── stamp_asset_manifest.json
├── ui_asset_manifest.json
└── portrait_manifest.json    # existing T0 tier registry
```

---

## 5. Required Asset Categories

### A. Player portraits

| Slot | Purpose | Tier target |
|------|---------|-------------|
| `portrait.png` | Hero / signing reveal | T1 |
| `form-1` … `form-3` | Career Form progression visuals | T1 |
| `album.png` | Album card thumbnail | T1 |
| `battle.png` | Battle HUD portrait | T1 |
| `squad.png` | Six-slot team bar | T1 |
| Jersey silhouette | Fallback when files missing | T0 |

**Player-facing labels:** Form Level, Career Form, Prime Form, Icon Form, Tournament Form — **never** evolution.

### B. Map nodes

| Node key | Football label | Asset |
|----------|----------------|-------|
| `catch` | Scout Report | `scout-report.svg` |
| `battle` | Friendly Match | `friendly-match.svg` |
| `trainer` / `silver` | Rival National Team | `rival-national-team.svg` |
| `pokecenter` | Recovery Center | `recovery-center.svg` |
| `item` | Gear Crate | `gear-crate.svg` |
| `move_tutor` | Specialist Coach | `specialist-coach.svg` |
| `boss` | Host City Challenge | `host-city-challenge.svg` |
| `question` | Tournament Event / Mystery | `mystery-event.svg` |
| `rest_site` | Rest Site | `rest-site.svg` |
| `final_locked` | Final Challenge Locked | `final-challenge-locked.svg` |

### C. Stamps

- Eight host city stamps (**shipped** Phase 3)
- Future: `unsigned` vs `signed` visual variants (RC-060)
- Campaign complete stamp (deferred)

### D. Album

| State | Visual |
|-------|--------|
| Unknown | Silhouette + nation hint |
| Scouted | Name visible, unsigned frame |
| Signed | Full card + page frame |
| Page frames | Marquee, Fan Favorites, Host City Heroes |

### E. UI

- Title logo (`Road to Glory` wordmark)
- Collection button (replace `ui/pokedex.png`)
- Settlement / trophy road icons
- Primary/secondary button skins (optional)

### F. Battle (presentation only)

- Faint state overlay (exhausted, not fainted)
- Style chips (reuse `type-badge` CSS — football styles)

---

## 6. Placeholder vs Final Tiers

| Tier | Name | Ship in RC? | Description |
|------|------|-------------|-------------|
| T0 | Jersey silhouette | Yes | Nation code + position; CSS/generated |
| T1 | Stylized non-likeness | RC target | Owned vector/raster, no real face |
| T2 | Approved stylized likeness | Post-RC | Legal sign-off required |
| T3 | Licensed photo | Post-MVP | 018 defer |

**RC minimum:** T0 everywhere + T1 for marquee trio and host city heroes (stretch).

---

## 7. Manifest Schema

All manifests share:

```json
{
  "schemaVersion": 1,
  "releaseCritical": false,
  "remoteRuntimeDependency": false,
  "defaultFallback": "<strategy>"
}
```

- **Paths:** relative to `Pokelike/` root; no leading slash required in manifests.
- **Fallback:** required when `releaseCritical: false` or file optional.
- **releaseCritical: true** — only `stamp_asset_manifest.json` host stamps today; validator requires files on disk.

See live files:

- `data/football/player_asset_manifest.json`
- `data/football/node_asset_manifest.json`
- `data/football/stamp_asset_manifest.json`
- `data/football/ui_asset_manifest.json`

---

## 8. Validation Rules

`validate-asset-manifests.mjs`:

1. Schema version present
2. No `http://` / `https://` in any manifest
3. Player manifest covers all catalog `profileId`s
4. Stamp manifest: 8 entries, files exist
5. Node manifest: football labels for active node types
6. UI manifest: fallbacks defined for collection + album slots
7. Asset scaffold directories exist

`validate-identity-cleanup.mjs`:

1. Release invariants (knockout, cloud, API, maxMapIndex)
2. P1-049 football surfaces + `GAME_THEME`
3. Document title football-branded
4. Blockers tracked in 026

---

## 9. Manual QA Checklist (assets)

- [ ] Title logo/icon local
- [ ] Album button uses World Cup Album icon
- [ ] Scout Report cards show jersey fallback or T1 art
- [ ] All 8 stamp ceremonies show SVG (not emoji-only)
- [ ] Album unknown/scouted/signed visually distinct
- [ ] Map tooltips use football labels
- [ ] No broken image icons on 8-city playthrough
- [ ] Network tab: no external image hosts during football session

---

## 10. Generation Prompt Guidelines

Use [029](./029-asset-generation-prompts.md) templates. Global rules:

- Flat or semi-flat vector friendly to pixel-scale UI
- Limited palette (3–5 colors + neutrals)
- Transparent background for icons/portraits
- 512×512 PNG for portraits; SVG for icons/stamps
- Include nation colors abstractly — no crests
- Negative prompts: Pokémon, monsters, pokeballs, evolution glow, copyrighted logos

---

*End of SPEC 014C — Asset Pipeline and Art Direction.*
