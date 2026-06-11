# Release Candidate Validation Report

**Status:** Planning baseline — SPEC 014 not started  
**Date:** 2026-06-10  
**Branch:** `main`  
**Authority:** [027 — RC Task Breakdown](./027-release-candidate-hardening-task-breakdown.md) · [026 — Identity Audit](./026-release-candidate-identity-audit.md)

---

## 1. Executive Summary

Phase 3 delivered an **8-host-city GO** campaign with harness-backed manual QA. SPEC 014 Release Candidate Hardening addresses **identity cleanup** and **asset pipeline** before external demo or Phase 4 (knockout).

**Current RC verdict:** **NO-GO** for external demo · **GO** to begin RC Wave 0 planning execution.

---

## 2. Automated Validation

| Command | Result | Notes |
|---------|--------|-------|
| `rtk npm run validate` | PASS | Includes new identity + asset manifest harnesses |
| `rtk npm run smoke:http` | PASS | 8 stamps + catalogs |
| `validate-identity-cleanup.mjs` | PASS | Football surfaces + title; blockers tracked |
| `validate-asset-manifests.mjs` | PASS | Stamps on disk; player paths scaffolded |

---

## 3. Identity Status

| Area | Status |
|------|--------|
| Scout / Squad / Slice / Settlement strings | PASS (P1-049) |
| Document `<title>` | PASS — `World Cup: Road to Glory` |
| Title screen subtitle / collection / battle fallbacks | **FAIL** — RC-B01–B13 open |
| Remote URLs on football path | **TRACK** — RC-022 |
| `GAME_THEME` collection label | PASS — World Cup Album |

---

## 4. Asset Status

| Category | Status |
|----------|--------|
| Host city stamps (8) | Shipped |
| Player portraits (33) | T0 fallback only — no `assets/players/*` art |
| Node icons | Manifest only — SVGs pending RC-050 |
| UI logo / album icon | Manifest + legacy `ui/pokedex.png` fallback |
| Manifests | Created RC-006–RC-009 |

---

## 5. Legacy Terms Remaining (justified)

| Term | Classification | Justification |
|------|----------------|---------------|
| `catch-screen`, `badge-screen` | Bridge (2) | DOM ids; football copy applied via JS |
| `speciesId`, `poke_*` keys | Bridge (2) | Save v3 compat |
| `openPokedexModal` | Bridge (2) | Album delegate |
| Classic mode screens | Legacy (3) | Gated off football path |
| Phase 1–3 docs | Historical (4) | Migration record |

---

## 6. Player-Facing Blockers (external demo)

1. RC-B01 — Title subtitle `Pokemon Roguelike` in HTML
2. RC-B03 — Pokédex collection button + icon
3. RC-B06/B07 — Battle/stamp fallback copy
4. RC-B14 — No owned player portrait files (T0 only)
5. RC-B12 — `ui/pokedex.png` filename

**Minimum to flip demo to GO:** RC Wave 1 (RC-011–RC-019) + marquee portrait batch RC-040.

---

## 7. QA Pending

| Item | Status |
|------|--------|
| Full 8-city browser playthrough | Phase 3 PASS WITH FOLLOW-UP |
| RC identity visual pass | Not started |
| RC asset visual pass | Not started |
| RC-070 manual runbook | Not created |

---

## 8. Release Invariants

| Policy | Status |
|--------|--------|
| `maxMapIndex: 7` | PASS |
| `knockoutEnabled: false` | PASS |
| `cloudSave: false` | PASS |
| No-live-API runtime | PASS |
| Battle math unchanged | PASS |
| Save schema v3 | PASS |

---

## 9. Go / No-Go Gates

### External demo

**NO-GO** until:

- [ ] RC-011–RC-019 complete
- [ ] Identity harness extended to title/battle/stamp blocks
- [ ] Collection icon football-native
- [ ] RC-071 sign-off PASS

### Phase 4 (knockout) entry

**NO-GO** until:

- [ ] RC-072 complete
- [ ] Phase 3 invariants still green
- [ ] Separate Phase 4 plan approved

---

## 10. Sign-Off

| Field | Value |
|-------|-------|
| **RC planning** | Complete (SPEC 014 Wave 0 docs + manifests + harnesses) |
| **RC execution** | Not started |
| **External demo** | NO-GO |
| **Phase 4** | Blocked on RC GO |

---

*End of Release Candidate Validation Report.*
