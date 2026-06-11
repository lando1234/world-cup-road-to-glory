# Phase 2 Portrait Asset Strategy

**Status:** Decision gate baseline for P2-008  
**Date:** 2026-06-10  
**Applies to:** Starter cards, Scout Report, Contract Offer, Squad Registration, battle portraits, Album, Slice Complete, Settlement Lite  
**Runtime rule:** No live external API dependency for critical display paths

---

## 1. Decision

Use **local stylized non-likeness jersey avatars** as the default Phase 2 public-release-safe portrait strategy.

This means:

- No real-player face likeness is required for any critical runtime path.
- No TheSportsDB URL is required for boot, cards, album, battle, save/load, or settlement.
- Player identity remains names, nation, position, style, stats, rarity, and jersey-like presentation.
- Real likeness packs can be added later only if explicitly licensed or approved.

This is a product/legal safety decision, not an art-quality ceiling.

---

## 2. Options Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Keep TheSportsDB cutouts | Fast, recognizable, already works for internal demo | Third-party likeness, club-kit imagery, rate/CDN ambiguity, not release-safe | Reject for public-critical path |
| Licensed photo pack | Highest recognition and quality | Requires legal/commercial clearance, asset management, potential cost | Defer until approval |
| Commissioned/stylized portraits with likeness | Strong product identity | Still likeness-sensitive; needs art/legal review | Defer until approval |
| Stylized non-likeness jersey avatars | Owned, scalable, safe default, works offline | Less recognizable than real faces; needs strong card design | Accept for Phase 2 |
| Nation/position silhouettes only | Very safe and cheap | Too generic for product polish if used as final everywhere | Use as fallback tier only |

---

## 3. Asset Tiers

| Tier | Name | Allowed in public runtime? | Usage |
|------|------|----------------------------|-------|
| T0 | Nation/position silhouette | Yes | Missing asset fallback |
| T1 | Stylized jersey avatar without likeness | Yes | Phase 2 default target |
| T2 | Commissioned stylized likeness | Only after approval | Optional future premium pack |
| T3 | Licensed photo/cutout | Only after license | Optional future release pack |
| T-Internal | TheSportsDB remote cutout | No public-critical path | Internal demo/reference only |

---

## 4. Implementation Rules

- Runtime must read local asset paths or fallbacks, not live TheSportsDB URLs.
- Saved games must never store portrait URLs or remote asset state.
- Missing portraits must degrade to T0 without blocking gameplay.
- `player_profiles.json` may reference logical portrait keys, but the concrete file path should resolve through a local manifest.
- Any future likeness-bearing asset requires an explicit approval note in this document before implementation.
- The local manifest should support all 50 profile IDs even if many initially point to shared fallback assets.
- UI tasks should render identity from football metadata first: name, nation, position, style, stats, rarity.

---

## 5. Phase 2 Work Unblocked

This decision unblocks:

- P2-009 — local portrait manifest contract.
- P2-016 — Album visual model pass.
- Player-card polish in Scout Report, Contract Offer, Squad Registration, Slice Complete, and Settlement Lite.
- No-live-API runtime gate in P2-021.

This decision does not require:

- Drawing final art immediately.
- Removing internal TheSportsDB sync scripts.
- Changing save schema.
- Changing battle math.
- React/Next migration.

---

## 6. P2-009 Manifest Baseline

P2-009 creates `data/football/portrait_manifest.json` as the runtime contract for release-safe portraits.

Current baseline:

- Covers every profile currently present in `player_profiles.json`.
- Uses `strategy: stylized_non_likeness_jersey_avatars`.
- Sets `remoteRuntimeDependency: false`.
- Uses T0 fallback entries until final T1 artwork exists.
- Disables `FEATURES.useTheSportsDbPortraits` by default.
- Keeps TheSportsDB tooling as internal/demo-only reference, not a critical runtime display path.

P2-021 adds a validation gate for this rule: football runtime-critical display must use the local manifest/fallback path, and optional TheSportsDB helpers must no-op while disabled.

This is intentionally a contract-first implementation. Final avatar art can land later without changing save shape or profile identity.

---

## 7. Open Questions

| Question | Owner | Blocks |
|----------|-------|--------|
| Should T1 avatars be generated per nation, per position, or per player? | Product/art | Final visual quality |
| Should jersey numbers appear on all placeholders? | Product/art | Card consistency |
| Do nation color palettes need legal review? | Product/legal | Public polish |
| Should future licensed packs coexist with T1 assets as optional override? | Engineering/product | Phase 3 asset architecture |

---

## 8. Acceptance For P2-008

- Decision recorded: T1 local stylized non-likeness jersey avatars.
- TheSportsDB remains internal-demo/reference only.
- Public-critical runtime paths must not depend on live remote portraits.
- Future likeness-bearing work is blocked on explicit legal/product approval.
- Visual frictions registry and Phase 2 assumptions report reference this decision.

---

*End of Phase 2 Portrait Asset Strategy.*
