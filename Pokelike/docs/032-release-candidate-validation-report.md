# Release Candidate Validation Report

**Status:** SPEC 014 in progress — Wave 0 complete, Wave 1 active  
**Date:** 2026-06-10  
**Branch:** `main`  
**Authority:** [027 — RC Task Breakdown](./027-release-candidate-hardening-task-breakdown.md) · [031 — Manual QA](./031-release-candidate-manual-qa-runbook.md)

---

## 1. Executive Summary

Phase 3 delivered **8-host-city GO**. SPEC 014 removes Pokelike/Pokémon identity residue and establishes the asset pipeline before external demo or Phase 4.

**Current RC verdict:** **NO-GO** external demo · **GO** RC Wave 1 execution.

---

## 2. Automated Validation

| Command | Result | Notes |
|---------|--------|-------|
| `rtk npm run validate` | PASS | Domain + phase QA + identity + assets + docs |
| `rtk npm run smoke:http` | PASS | Stamps + manifests + core JS |
| `validate-identity-cleanup.mjs` | PASS | Football surfaces; static HTML checks expanding |
| `validate-asset-manifests.mjs` | PASS | Local paths; 8 stamps on disk |

---

## 3. Identity Status

| Area | Status |
|------|--------|
| Scout / Squad / Slice / Settlement | PASS (P1-049) |
| Document `<title>` | PASS |
| Title screen static HTML | **IN PROGRESS** — RC-011 |
| Trainer / friendly battle NPCs | **FAIL** — RC-B16 (Psyduck / Fisherman) |
| Battle / stamp HTML fallbacks | **IN PROGRESS** — RC-016/017 |
| Collection entry | **IN PROGRESS** — RC-013 |
| Portrait assets | T0 fallback — RC-B14 |

---

## 4. Asset Status

| Category | Status |
|----------|--------|
| Host city stamps (8) | Shipped |
| Player portraits (33) | Manifest only; jersey fallback |
| Node icons | Manifest; SVGs pending |
| UI album icon | Glyph fallback + manifest |
| Manifests | RC-006–RC-009 complete |

---

## 5. Legacy Terms Remaining (justified)

See [030 — Bridge Retirement Plan](./030-release-candidate-bridge-retirement-plan.md).

---

## 6. Player-Facing Blockers

| ID | Status | Task |
|----|--------|------|
| RC-B01 | Open → RC-011 | Title subtitle HTML |
| RC-B03 | Open → RC-013 | Pokédex button |
| RC-B06–B11 | Open → RC-016/019 | Battle chrome + trainer path |
| RC-B07 | Open → RC-017 | Stamp fallbacks |
| RC-B14 | Open | Player portrait files |
| RC-B16 | Open → RC-019 | Trainer node Pokémon teams |

---

## 7. QA Pending

| Item | Status |
|------|--------|
| [031 — RC Manual QA Runbook](./031-release-candidate-manual-qa-runbook.md) | Created — execution pending |
| Full 8-city identity pass | Not started |
| Asset visual batch | Not started |

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

## 9. Go / No-Go

### External demo — **NO-GO**

Requires RC Wave 1 complete + manual QA PASS + portrait T1 batch (optional).

### Phase 4 entry — **NO-GO**

Blocked until RC-072 sign-off.

---

## 10. Sign-Off

| Field | Value |
|-------|-------|
| Wave 0 (audit, manifests, harnesses) | Complete |
| Wave 1 (player-facing cleanup) | In progress |
| External demo | NO-GO |
| Phase 4 | Blocked |

---

*End of Release Candidate Validation Report.*
