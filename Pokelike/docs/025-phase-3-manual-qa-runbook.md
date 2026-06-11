# Phase 3 Manual QA Runbook

**Status:** Active Phase 3 manual QA protocol  
**Scope:** Full 8-host-city campaign after P3-040 enable; 3-city regression spot-check  
**Authority:** [021 — SPEC 013](./021-phase-3-expansion-content-release-hardening-plan.md)

---

## 1. Pre-Flight

1. Confirm latest `main` with P3-040 merged (for 8-city pass) or pre-enable commit (for regression).
2. Run `rtk npm run validate`.
3. Run `rtk npm run smoke:http` when runtime/assets touched.
4. `rtk npm run serve` → open `http://127.0.0.1:4173/`.
5. Clear local storage; hard refresh.
6. Record: date, commit, browser, tester, network on/off.

| Field | Value |
|-------|-------|
| Date | |
| Commit | |
| Browser | |
| Tester | |
| Result | PASS WITH FOLLOW-UP |

---

## 2. Blocker Definition

- New Campaign cannot start
- Football JSON fails to load
- Scout / Contract / Squad Registration broken
- Any Host City Challenge cannot start or complete
- Eighth stamp does not show completion screen (not knockout)
- Knockout or map 8 unexpectedly starts
- Settlement does not return to title
- Album/account state lost after settlement or reload
- Cloud auth UI appears
- Player-facing legacy fantasy terms on football screens

---

## 3. Knockout Guard Assertion

| Step | Action | Expected |
|------|--------|----------|
| 1 | After stamp 8 / slice complete | Settlement Lite — **not** map 8 knockout |
| 2 | DevTools: `FEATURES.knockoutEnabled` | `false` until Phase 4 |

---

## 4. Core 8-City Path (post P3-040)

| Step | Action | Expected |
|------|--------|----------|
| 1 | New Campaign → Marquee Signing | Football flow starts |
| 2 | Map 0 scout forced pool | Pedri, Ramos, Alisson |
| 3 | Win maps 0–2 | Stamps 1–3; no slice-complete yet |
| 4 | Continue to map 3 Madrid | Boss shows Spain / Figo anchor |
| 5 | Win maps 3–6 | Stamps 4–7; Madrid stamp SVG visible |
| 6 | Win map 7 London | Stamp 8/8; completion screen (not knockout) |
| 7 | Settlement Lite → title | Run cleared; album persists |
| 8 | Album host_city page | Slots 29–36 visible when signed/seen |

---

## 5. Full-Squad QA (P3-007)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Squad size 6 | No crash |
| 2 | Scout with full squad | Squad Registration opens |
| 3 | Decline contract | Squad unchanged |
| 4 | Replace one member | Swap succeeds; album signed persists |

**Status:** PASS WITH FOLLOW-UP (harness-backed; browser spot-check recommended)

---

## 6. Game-Over QA (P3-008)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Reach game over | Football game-over path |
| 2 | Settlement Lite | Summary + return to title |
| 3 | Album | Seen/signed before loss retained |

**Status:** PASS WITH FOLLOW-UP (harness-backed; browser spot-check recommended)

---

## 7. Reload Persistence (map 4+)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Mid map 4+ with signings | State saved |
| 2 | Hard refresh → Continue | Squad, map, ledger restore |

**Status:** PASS WITH FOLLOW-UP (P3-042 — harness-backed; browser spot-check recommended)

---

## 8. Pass Summary

| Category | Result | Notes |
|----------|--------|-------|
| Core 8-city | PASS WITH FOLLOW-UP | Harness: 8 bosses, 8 stamps, maxMapIndex 7; full browser path recommended |
| Full squad | PASS WITH FOLLOW-UP | P3-007 harness + registration layout | |
| Game over | PASS WITH FOLLOW-UP | P3-008 settlement path via harness | |
| Reload map 4+ | PASS WITH FOLLOW-UP | P3-042 save v3 harness | |
| Stamp visuals 3–7 | PASS | HTTP smoke fetches Madrid–London SVGs | |
| Knockout blocked | PASS | knockoutEnabled false; guarded map 8 transition | |

Final: [x] PASS WITH FOLLOW-UP · [ ] BLOCKED

---

*End of Phase 3 Manual QA Runbook.*
