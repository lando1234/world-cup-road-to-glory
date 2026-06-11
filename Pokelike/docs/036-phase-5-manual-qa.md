# Phase 5 Manual QA Runbook

**Status:** Draft — execute at P5-070  
**Authority:** [033 — Phase 5 Plan](./033-phase-5-knockout-and-meta-plan.md) · [034 — Task Breakdown](./034-phase-5-task-breakdown.md)  
**Date:** 2026-06-11  
**Environment:** Local static server — `rtk npm run serve` → `http://127.0.0.1:4173`

---

## 1. Purpose

Manual QA verifies the **production gameplay loop** after Phase 5 implementation:

- 8-city campaign regression (knockout off and on)  
- Knockout bracket entry through World Cup win  
- Full settlement, meta unlocks, album pages, persistence  
- Reload safety mid-knockout and post-settlement  

Record results in [037 — Phase 5 Validation Report](./037-phase-5-validation-report.md).

---

## 2. Blocker Definition

A **blocker** is any issue that:

- Prevents starting or completing a campaign run  
- Causes silent save loss or double settlement  
- Shows Pokemon-branded copy on football-critical surfaces  
- Crashes boot or leaves the player on a dead screen with no exit  
- Enables knockout when `FEATURES.knockoutEnabled === false`  

**Non-blockers:** Visual polish, balance tuning, missing T2 assets, trophy room layout preferences.

---

## 3. Pre-Flight Checklist

| # | Check | Pass |
|---|-------|------|
| 1 | `rtk npm run validate` green | ☐ |
| 2 | `rtk npm run smoke:http` green | ☐ |
| 3 | Fresh browser profile or cleared `localStorage` for account tests | ☐ |
| 4 | Note `FEATURES.knockoutEnabled` value under test | ☐ |
| 5 | DevTools console open for errors | ☐ |

---

## 4. Regression — 8-City Path (knockout OFF)

**Setup:** `FEATURES.knockoutEnabled === false` (default until P5-017).

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | New Campaign → Marquee Signing | Three marquee cards; football copy | ☐ |
| 2 | Complete maps 0–7 | City stamps increment; host city battles | ☐ |
| 3 | After stamp 8 | **Slice Complete** screen — not knockout | ☐ |
| 4 | Continue | Settlement Lite modal | ☐ |
| 5 | Return to title | Album signs persisted | ☐ |
| 6 | Reload mid-map 3 | Run restores correctly | ☐ |

---

## 5. Knockout Entry

**Setup:** `FEATURES.knockoutEnabled === true` (post P5-017).

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Fresh run → reach stamp 8 | Knockout Draw Ceremony — not slice complete | ☐ |
| 2 | Ceremony | Bracket / gate outline visible; skippable | ☐ |
| 3 | After ceremony | Matchday Squad Selection (prep) for Gate 0 | ☐ |
| 4 | Prep screen | Historical team name, kit hint, football portraits | ☐ |
| 5 | DevTools | `state.knockoutPhase === true`, `eliteIndex === 0` | ☐ |

---

## 6. Knockout Rounds

| Round | Gate | Step | Expected | Pass |
|-------|------|------|----------|------|
| R16 | 0 | Win gate 0 | Transition to gate 1 prep | ☐ |
| QF | 1 | Win gate 1 | Quarter-final copy; eliteIndex 1 | ☐ |
| SF | 2 | Win gate 2 | Semi-final copy; Maradona gate | ☐ |
| Final | 3 | Win gate 3 | Final copy; Zidane gate | ☐ |
| Trophy | 4 | Win gate 4 | World Cup Trophy ceremony | ☐ |

**Loss path (any gate):**

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Lose at gate 1+ | Game over → settlement (not soft-lock) | ☐ |
| 2 | Settlement | Shows gates cleared, credits (if economy on) | ☐ |
| 3 | Title | `reachedKnockout` flag reflected in trophy room | ☐ |

---

## 7. Trophy Ceremony and Settlement

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Win gate 4 | Trophy screen with World Cup copy | ☐ |
| 2 | Continue | Full settlement modal (post P5-041) | ☐ |
| 3 | Credits | Breakdown lines visible if earned | ☐ |
| 4 | Album | New signs listed | ☐ |
| 5 | Achievements | Toast or list for new unlocks | ☐ |
| 6 | Dedupe | Second continue does not double-grant | ☐ |
| 7 | Title | `campaignWins` incremented; trophy room updated | ☐ |

---

## 8. Reload Persistence

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Mid-knockout prep (gate 2) — reload | Resume gate 2; squad order preserved | ☐ |
| 2 | Mid-battle — reload | Resume battle or gate per design | ☐ |
| 3 | Post-settlement reload | Account meta persists; no active run | ☐ |
| 4 | `localStorage` inspect | `game_album`, credits, flags present | ☐ |

---

## 9. Meta Unlocks

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Reach knockout, lose | `accountFlags.reachedKnockout === true` | ☐ |
| 2 | Reach gate 3+, lose | `reachedFinal` or best-gate recorded | ☐ |
| 3 | Win World Cup | `wonWorldCup`, `campaignWins++` | ☐ |
| 4 | Trophy room | Displays wins and best gate | ☐ |
| 5 | Run history | Last run appears with outcome | ☐ |

---

## 10. Album

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Before knockout | Host City Heroes page populated | ☐ |
| 2 | Enter knockout | Knockout album page unlocks | ☐ |
| 3 | See gate signature | Seen/signed state updates | ☐ |
| 4 | Legends page | Hidden until fragment or unlock | ☐ |
| 5 | After legend unlock | Legends vault shows owned legend | ☐ |

---

## 11. Achievements

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | First knockout reach | Knockout achievement unlocks once | ☐ |
| 2 | World Cup win | Win achievement unlocks once | ☐ |
| 3 | Reload | Achievements persist in `poke_achievements` | ☐ |

---

## 12. Economy (post P5-041)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | First-time album sign | Credits in breakdown | ☐ |
| 2 | Duplicate sign | Duplicate credit line | ☐ |
| 3 | Failed run with depth | Non-zero credits possible | ☐ |
| 4 | Title | `footballCredits` total matches sum | ☐ |

---

## 13. Legends (post P5-050)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Earn fragments | `legendFragments` increments | ☐ |
| 2 | Reach 20 fragments | Legend unlock notification | ☐ |
| 3 | Album | Legend marked owned | ☐ |

---

## 14. Save Compatibility (post P5-061 if v4 ships)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Load v3 save fixture | Migrates to v4; album intact | ☐ |
| 2 | Active run mid-campaign | Run continues after migration | ☐ |
| 3 | Rollback reader | v4 save readable if downgraded build | ☐ |

---

## 15. Knockout Guard (release invariant)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Pre-P5-017 build | `knockoutEnabled: false`; stamp 8 → slice complete | ☐ |
| 2 | Harness | `validate-phase5-qa.mjs` enforces expected flag state | ☐ |

---

## 16. Attempt Log

| Attempt | Date | Build / commit | Tester | Verdict | Notes |
|---------|------|----------------|--------|---------|-------|
| 1 | | | | | |
| 2 | | | | | |

**Verdict values:** PASS · PASS WITH FOLLOW-UP · FAIL

---

## 17. Sign-Off Checklist (P5-072)

- [ ] 8-city regression (knockout off) PASS  
- [ ] Full knockout win path PASS  
- [ ] Loss settlement PASS  
- [ ] Reload persistence PASS  
- [ ] Meta + album + achievements PASS  
- [ ] No open blockers  
- [ ] 037 updated with GO/NO-GO  

---

*End of Phase 5 Manual QA Runbook.*
