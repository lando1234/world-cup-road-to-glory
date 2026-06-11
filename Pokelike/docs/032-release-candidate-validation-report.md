# Release Candidate Validation Report

**Status:** SPEC 014 complete — RC sign-off recorded  
**Date:** 2026-06-11  
**Branch:** `main`  
**Authority:** [027 — RC Task Breakdown](./027-release-candidate-hardening-task-breakdown.md) · [031 — Manual QA](./031-release-candidate-manual-qa-runbook.md)

---

## 1. Executive Summary

Phase 4 (SPEC 014) delivered **football-native Release Candidate** identity, full local asset pipeline, and automated validation gates. The 8-host-city campaign remains playable with all release invariants locked.

**RC verdict:** **GO** external demo · **GO** Phase 5 planning (knockout still off).

---

## 2. Automated Validation

| Command | Result | Notes |
|---------|--------|-------|
| `rtk npm run validate` | **PASS** | Domain + phase QA + identity + assets + docs |
| `rtk npm run smoke:http` | **PASS** | 33 routes incl. stamps, nodes, UI, portraits |
| `validate-identity-cleanup.mjs` | **PASS** | 9 checks — football surfaces + football-boot |
| `validate-asset-manifests.mjs` | **PASS** | 9 checks — 33 portraits, nodes, stamps, UI |

---

## 3. Identity Status

| Area | Status |
|------|--------|
| Scout / Squad / Slice / Settlement | **PASS** (P1-049) |
| Document `<title>` | **PASS** — `World Cup: Road to Glory` |
| Title screen (`football-boot`) | **PASS** — no Classic controls flash |
| Trainer / friendly battle NPCs | **PASS** — `buildFootballNpcTeam` |
| Battle / stamp HTML fallbacks | **PASS** |
| Collection entry | **PASS** — World Cup Album + local icon |
| Player portraits | **PASS** — 33 T1 jersey SVGs on disk |

**Player-facing blockers:** None open.

---

## 4. Asset Status

| Category | Status | Coverage |
|----------|--------|----------|
| Host city stamps (8) | **PASS** | On disk + manifest |
| Player portraits (33) | **PASS** | T1 jersey SVGs, local only |
| Node icons (13+) | **PASS** | SVG set + completed/locked states |
| UI icons | **PASS** | Logo, settlement, album slots/frames |
| Form-level PNGs | **DEFER** | T1 SVG covers runtime; form-1/2/3 PNG optional T2 |

---

## 5. Legacy Terms Remaining (justified)

See [030 — Bridge Retirement Plan](./030-release-candidate-bridge-retirement-plan.md).

| Term | Classification | Justification |
|------|----------------|---------------|
| `catch-screen`, `badge-screen` | Internal bridge (3) | DOM ids; football copy applied |
| `openPokedexModal()` | Internal bridge (3) | Delegates to album modal |
| `speciesId`, `poke_*` keys | Save compat (5) | Save v3; retire at v4 |
| `ui/pokedex.png` | Legacy fallback (9) | Manifest fallback only; glyph primary |
| Classic mode screens | Hidden (4) | Gated by `football-boot` + JS |

---

## 6. Manual QA ([031](./031-release-candidate-manual-qa-runbook.md))

**Verdict:** **PASS WITH FOLLOW-UP**

| Area | Result | Evidence |
|------|--------|----------|
| Title screen | **PASS** | Browser: `Road to Glory`, `New Campaign`, `World Cup Album`; no Nuzlocke/Gen toggle |
| Marquee signing | **PASS** | Browser: Mbappé/Messi/Van Dijk cards, Form Level labels |
| Map boot | **PASS** | Browser: map HUD after signing Messi |
| Scout/contract/battle/stamp | **PASS** | Harness: P1-049, domain football flow checks |
| Album/settlement/game over | **PASS** | Harness + smoke HTTP |
| Full 8-city path | **FOLLOW-UP** | Not executed end-to-end in browser this session; domain harness covers 8-city cap |

**Follow-up (non-blocking):** Human playthrough maps 0–7 once before public launch for visual polish confidence.

---

## 7. Release Invariants

| Policy | Status |
|--------|--------|
| `maxMapIndex: 7` | **PASS** |
| `knockoutEnabled: false` | **PASS** |
| `cloudSave: false` | **PASS** |
| No-live-API runtime | **PASS** |
| Battle math unchanged | **PASS** |
| Save schema v3 | **PASS** |

---

## 8. Go / No-Go

### External demo — **GO**

All automated gates green. Browser spot-check confirms football-native title and marquee signing. No player-facing identity blockers.

### Phase 5 entry — **GO** (planning only)

Knockout remains **disabled** until explicit Phase 5 feature decision.

---

## 9. Phase 5 Recommendations (not in scope)

1. Enable knockout gates only after save v4 + bridge retirement plan execution.
2. Replace T1 jersey SVGs with T2 approved stylized likeness where legal clears.
3. Retire `poke_*` / `speciesId` bridges via save v4 migration.
4. Split Classic mode to separate bundle or deep-hide remaining legacy screens.
5. Add signed stamp SVG variants (T2) if album HUD needs distinct art.

---

## 10. Sign-Off (RC-072)

| Field | Value |
|-------|-------|
| SPEC 014 status | **COMPLETE** |
| Commits | RC-050 through RC-072 |
| External demo | **GO** |
| Phase 5 kickoff | **ALLOWED** (planning; knockout off) |
| Signed | Engineering lead agent — 2026-06-11 |

---

*End of Release Candidate Validation Report.*
