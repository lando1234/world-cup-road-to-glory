# Phase 2 Manual QA Runbook

**Status:** Active Phase 2 manual QA protocol  
**Owner:** Phase 2 execution lane A  
**Created:** 2026-06-10  
**Scope:** Current 3-city football slice unless a later task explicitly enables 8 host cities  
**Screenshots:** Optional; not required by default

---

## 1. Purpose

This runbook records the manual checks that scripts cannot fully prove: player comprehension, UI state clarity, real reload behavior, full-squad decision flow, win/loss settlement, and whether the football presentation still leaks legacy fantasy.

Use it for P2-022 and for any UI task that lists a manual QA step.

---

## 2. Pre-Flight

Before each manual pass:

1. Confirm latest `main` is checked out.
2. Run `rtk npm run validate`.
3. Start the local static server with `rtk npm run serve`.
4. Open the served URL in a browser.
5. Clear local storage for the app origin.
6. Hard refresh.
7. Record date, browser, commit hash, and whether network access is enabled.

Evidence fields:

| Field | Value |
|-------|-------|
| Date | |
| Commit | |
| Browser | |
| Local server URL | |
| Network enabled? | |
| Tester | |
| Result | Pending |

---

## 3. Blocker Definition

Mark the pass blocked if any item is true:

- New Run cannot start.
- A required football data catalog fails to load.
- Scout Report cannot sign or skip.
- Squad Registration cannot resolve a full-squad signing.
- Host City Challenge cannot start or complete.
- Slice Complete does not appear after the third City Stamp.
- Settlement does not return to title.
- Album/account state is lost after settlement or reload.
- Cloud save/auth UI appears in football mode.
- A player-facing football screen displays Pokémon, Pokédex, Gym, Elite Four, catch, badge, or similar legacy fantasy.

Non-blocking visual polish should be recorded in [013](./013-phase-2-visual-frictions.html) or [020](./020-phase-2-assumptions-tradeoffs-assets-report.html).

---

## 4. Core Path QA

| Step | Action | Expected result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 1 | Boot app after clearing storage | Football title loads; New Run is available; cloud auth is absent | Pending | |
| 2 | Start New Run | Manager/start flow reaches Marquee Signing | Pending | |
| 3 | Pick Mbappe | Squad starts with Mbappe at form level 5 | Pending | |
| 4 | Restart from cleared storage and pick Messi | Squad starts with Messi at form level 5 | Pending | |
| 5 | Restart from cleared storage and pick Van Dijk | Squad starts with Van Dijk at form level 5 | Pending | |
| 6 | On Map 0, take the first available Scout Report path | Forced pool offers Pedri, Ramos, and Alisson | Pending | |
| 7 | Select one scout candidate and sign | Player joins squad; album seen/signed state updates | Pending | |
| 8 | Trigger another Scout Report and skip | No player is added; run continues | Pending | |
| 9 | Continue to first Host City Challenge | Boss label, city, nation, and roster read as football | Pending | |
| 10 | Win first Host City Challenge | City Stamp ceremony appears; stamp count increments | Pending | |
| 11 | Continue through three Host City Challenges | Third stamp routes to Slice Complete, not map 3 | Pending | |
| 12 | Continue from Slice Complete to Settlement Lite | Settlement summary appears and returns to title | Pending | |
| 13 | Open Album from title | Signed player remains signed; seen states remain visible | Pending | |

---

## 5. Full-Squad QA

| Step | Action | Expected result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 1 | Build squad to six players | Squad reaches cap without crash | Pending | |
| 2 | Trigger Scout Report with full squad | Squad Registration replacement flow opens | Pending | |
| 3 | Decline incoming contract | Existing squad remains unchanged; run continues | Pending | |
| 4 | Trigger another full-squad offer | Replacement flow opens again | Pending | |
| 5 | Replace one squad member | Incoming player joins; removed player leaves active squad; album signed state persists | Pending | |

---

## 6. Reload Persistence QA

| Step | Action | Expected result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 1 | Start run and sign at least one player | Active run has starter plus signing | Pending | |
| 2 | Reload browser mid-map | Continue Run is available | Pending | |
| 3 | Continue Run | Squad, map, ledger, and current HP/form state restore | Pending | |
| 4 | Open Album during continued run | Seen/signed state matches before reload | Pending | |
| 5 | Complete settlement | Active run clears; account album remains | Pending | |

---

## 7. Game-Over QA

Manual forced loss can be done through normal play or temporary dev setup if a later task documents it. Do not commit dev-only loss shortcuts.

| Step | Action | Expected result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 1 | Enter a losing battle path | Team can reach game-over state | Pending | |
| 2 | Confirm game over | Football game over routes through Settlement Lite | Pending | |
| 3 | Return to title | Active run clears after account patch | Pending | |
| 4 | Open Album | Seen/signed state earned before loss remains | Pending | |

---

## 8. Legacy Terminology QA

Review the visible copy on:

- Title screen.
- Marquee Signing.
- Map HUD and node tooltips.
- Scout Report.
- Contract Offer.
- Squad Registration.
- Battle log.
- City Stamp ceremony.
- Album.
- Slice Complete.
- Settlement Lite.

Expected result: no player-facing Pokémon, Pokédex, Gym, Elite Four, catch, badge, Poké, or monster-collection fantasy terms in football mode.

Record any leak:

| Surface | Term | Severity | Follow-up |
|---------|------|----------|-----------|
| | | | |

---

## 9. Pass Summary

| Category | Result | Notes |
|----------|--------|-------|
| Core path | Pending | |
| Full squad | Pending | |
| Reload persistence | Pending | |
| Game over | Pending | |
| Legacy terminology | Pending | |
| Visual frictions recorded | Pending | |
| Blockers found | Pending | |

Final result:

- [ ] PASS — no blockers.
- [ ] PASS WITH FOLLOW-UP — no blockers, non-blocking issues recorded.
- [ ] BLOCKED — one or more blocker definitions met.

---

*End of Phase 2 Manual QA Runbook.*
