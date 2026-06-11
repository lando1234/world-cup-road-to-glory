# Phase 2 Validation Report

**Status:** Final validation report for SPEC 012 closeout  
**Date:** 2026-06-10  
**Branch:** `main`  
**Authority:** [015 — Phase 2 Execution Plan](./015-phase-2-engineering-task-breakdown.md)

---

## 1. Executive Summary

Phase 2 polish, bridge retirement, and football-native UX work is complete for the current 3-city vertical slice. Automated validation is green, HTTP smoke passes, and manual QA recorded a **PASS WITH FOLLOW-UP** for the playable loop. Eight-host-city runtime expansion is **prepare only** — data contracts exist, but `FEATURES.maxMapIndex` remains `2`.

**Go / No-Go:** **GO** for Phase 2 sign-off on the 3-city slice. **NO-GO** for enabling maps 3–7 in runtime until Phase 3 content, final boss rosters (profiles 32–36), and a full manual 3-stamp boss playthrough are complete.

---

## 2. Automated Validation

| Command | Result | Notes |
|---------|--------|-------|
| `rtk npm run validate` | PASS | 50 domain checks, 7 Phase 1 QA, 27 Phase 2 QA, docs validation, syntax checks |
| `rtk npm run smoke:http` | PASS | Static boot + football JSON + expansion guard files + stamp assets |

### Phase 2 QA coverage highlights

- Bridge inventory and album-named APIs
- Football gameplay writes avoid dex-named paths
- Local portrait manifest + no-live-API gate
- Scout Report, Contract Offer, Squad Registration UX
- City Stamp selectors and owned stamp SVGs
- Album visual states, Slice Complete, Settlement Lite
- Account model validator + settlement dedupe guard
- Manual QA ledger + expansion prepare-only guards (P2-025–P2-027)
- Validation report + sign-off markers (P2-029–P2-030)

---

## 3. Manual QA (P2-022)

Recorded in [017 — Phase 2 Manual QA Runbook](./017-phase-2-manual-qa-runbook.md), Attempt 2.

| Category | Result | Notes |
|----------|--------|-------|
| Core path | PASS | Boot, New Campaign, Marquee Signing (Mbappé), Map 0 Scout Report forced pool `{12,15,17}`, sign flow, album write |
| Full squad | FOLLOW-UP | Squad Registration layout validated by harness; full six-slot replacement not manually exercised end-to-end |
| Reload persistence | PASS | Continue Campaign restored squad/map after hard refresh |
| Game over | FOLLOW-UP | Settlement game-over path covered by Phase 1 QA harness; not manually replayed in browser this pass |
| Legacy terminology | FOLLOW-UP | Player-facing football screens read correctly; document `<title>` still says `Pokemon Roguelike` and hidden legacy headings remain in DOM for Classic compatibility |

**Final manual result:** PASS WITH FOLLOW-UP — no product blockers found.

---

## 4. Release-Safety Assertions

| Policy | Status | Evidence |
|--------|--------|----------|
| Cloud save disabled | PASS | cloud save remains off; `FEATURES.cloudSave: false`; `game_album` absent from cloud sync keys |
| No-live-API runtime | PASS | TheSportsDB disabled; local `portrait_manifest.json` covers all profiles |
| Battle math unchanged | PASS | No Phase 2 task modified combat formulas |
| Save schema v3 only | PASS | No save v4 migration introduced |
| Local settlement dedupe | PASS | `football_last_settled_run_id` prevents duplicate patch application |

---

## 5. Expansion Decision (P2-024)

**Decision:** **Prepare only** — do not enable maps 3–7 in runtime during Phase 2.

| Artifact | Purpose | Runtime enabled? |
|----------|---------|------------------|
| `host_city_expansion.json` | Boss contracts for maps 3–7 (stub rosters) | No |
| `scout_pools_expansion.json` | Late/finale scout bands | No |
| `album_layout_expansion.json` | Deferred host_city/knockout/legends pages | No |
| `FEATURES.maxMapIndex` | Slice map cap | Stays `2` |

**P2-028:** Deferred to Phase 3. Enabling the cap requires final boss profiles, stamp art for maps 3–7, and a green manual 8-city QA pass.

---

## 6. Unresolved Risks (Non-Blocking for Phase 2)

1. **Portrait art** — T0 jersey fallbacks only; final T1 stylized avatars still missing.
2. **Document title / hidden legacy DOM** — `Pokemon Roguelike` title and Classic screen headings remain for compatibility.
3. **Expansion boss rosters** — Maps 3–7 use provisional placeholders, not final 007 federation teams.
4. **Knockout / legends album pages** — Schema prepared; profile-to-page mapping finalized in Phase 3.
5. **Cloud save / meta economy** — Explicitly deferred to Phase 3.

---

## 7. Deferred to Phase 3

- Enable `FEATURES.maxMapIndex` from `2` to `7` (P2-028)
- Author profiles 32–36 and final expansion boss rosters
- Stamp artwork for Madrid, Milan, Amsterdam, Mexico City, London
- Knockout gate teams and continental cup flow
- Cloud save v3 policy + account meta rewards
- Retire remaining legacy bridge IDs (`catch-screen`, `badge-screen`, `speciesId`, etc.)
- React/Next migration evaluation (out of Phase 2 scope)

---

## 8. Sign-Off Inputs

- **Must-do Phase 2 tasks:** Complete or explicitly deferred with rationale in ledger
- **Manual QA:** PASS WITH FOLLOW-UP recorded
- **Expansion:** Prepare-only decision recorded
- **Validation harness:** Green on `main`

*End of Phase 2 Validation Report.*
