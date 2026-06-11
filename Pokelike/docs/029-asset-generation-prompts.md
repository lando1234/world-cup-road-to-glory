# SPEC 014D — Asset Generation Prompts

**Status:** Reusable prompt library for RC asset production  
**Date:** 2026-06-10  
**Authority:** [028 — Asset Pipeline](./028-asset-pipeline-and-art-direction.md)

---

## Global Rules (apply to every prompt)

**Always include:**

- Style: stylized sports illustration, non-photorealistic, no identifiable real face unless T2 approved
- Football / soccer context only
- Transparent background (PNG) or flat SVG
- No official federation logos, FIFA marks, club crests, or sponsor marks
- No Pokémon, monsters, creatures, pokeballs, evolution effects, or RPG fantasy tropes

**Negative prompt block (append):**

```text
Avoid: Pokémon, pocket monsters, creatures, pokeball, evolution aura, gym badge, 
trademark logos, FIFA World Cup logo, national federation crest, club badge, 
hyperrealistic celebrity likeness, watermarks, text overlays, blurry edges.
```

**Export:** PNG 512×512 (portraits), SVG or 256×256 PNG (icons), SVG (stamps).

---

## 1. Player Portrait Prompt

```text
Create a stylized football player portrait for a mobile roguelike squad builder.
Subject: {NATION} national team player, position {POSITION}, archetype {STYLE_LABEL}.
Composition: chest-up, slight 3/4 angle, confident expression (generic, not a real person).
Wardrobe: abstract national-team inspired kit using {PRIMARY_COLORS} — no crests or logos.
Art style: clean vector-shaded illustration, bold outlines, game UI friendly, high contrast.
Background: transparent.
Mood: tournament energy, professional athlete, World Cup campaign.
{GLOBAL_NEGATIVE}
```

**Variables:** `NATION`, `POSITION`, `STYLE_LABEL`, `PRIMARY_COLORS` from `player_profiles.json`.

---

## 2. Player Form Progression Prompt

```text
Create a stylized football player illustration showing CAREER FORM progression (not evolution).
Same character identity as base portrait: {PLAYER_SLUG}, nation {NATION}.
Form stage: {FORM_LABEL} (e.g. Form Level 2 / Prime Form) — slightly stronger posture, 
sharper kit accents, subtle prestige glow in team colors only.
No creature transformation, no morphing, no monster traits — same human athlete, elevated presence.
Transparent background. Vector-friendly. UI card crop safe.
{GLOBAL_NEGATIVE}
```

**Forbidden words in deliverable metadata:** evolution, evolve, evolved.

---

## 3. Jersey Silhouette Fallback Prompt (T0)

```text
Minimal football jersey silhouette icon for UI fallback.
Nation palette: {PRIMARY_COLORS}. Position hint: {POSITION} (optional subtle number area).
No face, no likeness — flat geometric jersey shape only.
512×512 PNG, transparent background, readable at 48px.
{GLOBAL_NEGATIVE}
```

---

## 4. Battle Portrait Prompt

```text
Stylized football battle portrait for duel HUD, tight crop head-and-shoulders.
Nation: {NATION}. Position: {POSITION}. Energy: competitive, mid-match intensity.
Simpler detail than album art — must read at 64px. Transparent background.
{GLOBAL_NEGATIVE}
```

---

## 5. Album Card Prompt

```text
Sticker-album trading card illustration for a football World Cup collector album.
Player archetype: {NATION} {POSITION}, style {STYLE_LABEL}.
Layout: portrait centered, subtle decorative frame with nation color bands — no logos.
Card feel: collectible sticker, slightly rounded corners suggestion, empty margin for UI frame.
Transparent PNG, 512×512, consistent with other album cards.
{GLOBAL_NEGATIVE}
```

---

## 6. Node Icon Prompt

```text
Flat SVG-style icon for football campaign map node: "{NODE_LABEL}".
Concept: {NODE_CONCEPT} (e.g. scout report clipboard, friendly match crossed boots, 
recovery cross, gear crate, host city stadium silhouette).
Single color line + 2-tone fill max. Readable at 24px on dark map background.
No text inside icon. Square canvas. Football-native only.
{GLOBAL_NEGATIVE}
```

**NODE_LABEL / NODE_CONCEPT** from `node_asset_manifest.json`.

---

## 7. City Stamp Prompt

```text
Abstract host city stamp badge for football roguelike campaign.
City: {HOST_CITY}. Nation palette: {NATION_COLORS}.
Design: circular or shield-like stamp with city name text "{HOST_CITY}" and abstract skyline or landmark hint.
No federation crest, no FIFA branding. Matches existing stamp set: flat vector, bold border, collectible passport stamp.
SVG output, transparent outside stamp shape.
{GLOBAL_NEGATIVE}
```

**Reference:** existing `assets/stamps/sao-paulo-stamp.svg` visual language.

---

## 8. UI Icon Prompt

```text
Minimal UI icon for football manager roguelike: {ICON_PURPOSE}.
Examples: World Cup album book, settlement trophy, empty squad slot, continue campaign arrow.
Flat vector, 2-color + neutral, consistent stroke width with existing UI.
256×256 PNG or SVG. Transparent background. No words unless logo task.
{GLOBAL_NEGATIVE}
```

---

## 9. Title Logo Prompt

```text
Wordmark logo for football manager roguelike "Road to Glory".
Typography: bold retro sports poster, World Cup tournament energy.
No FIFA logo, no federation crests, no club marks, no Pokémon references.
SVG preferred; flat 2–3 colors on transparent background.
Readable at 32px height in title screen.
{GLOBAL_NEGATIVE}
```

---

## 10. Empty State Illustration Prompt

```text
Empty-state illustration for football campaign UI: {CONTEXT}.
Examples: empty squad slot, unsigned album page, no stamps yet, settlement with zero patches.
Minimal flat vector, hopeful tone, single focal object (jersey silhouette, blank sticker, passport page).
No text in artwork. Transparent PNG 512×512.
{GLOBAL_NEGATIVE}
```

---

## Consistency Batch Checklist

When generating a batch:

1. Same stroke width and corner radius across node icons
2. Same album card border style for all players in a page
3. Export filenames per [028 §3](./028-asset-pipeline-and-art-direction.md)
4. Register paths in appropriate manifest before merge
5. Run `rtk npm run validate` + `rtk npm run smoke:http`

---

*End of SPEC 014D — Asset Generation Prompts.*
