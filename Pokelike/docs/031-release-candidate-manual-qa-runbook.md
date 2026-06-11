# Release Candidate Manual QA Runbook

**Status:** SPEC 014 Wave 6 — identity + assets sign-off  
**Date:** 2026-06-10  
**Authority:** [027 — Task Breakdown](./027-release-candidate-hardening-task-breakdown.md) · [026 — Identity Audit](./026-release-candidate-identity-audit.md)

**Environment:** `rtk npm run serve` → `http://127.0.0.1:4173/`  
**Prerequisites:** `rtk npm run validate` PASS · `rtk npm run smoke:http` PASS

---

## Blocker Definition

A **blocker** is any player-visible string, asset, or flow that:

- Uses Pokémon / Pokelike / monster-game terminology on the football campaign path
- Shows broken remote sprites on football-critical surfaces
- Prevents boot, save, settlement, or 8-city completion
- Violates release invariants (`maxMapIndex: 7`, knockout off, cloud off)

---

## 1. Title Screen

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Hard reload | Logo/subtitle football-native; no `POKELIKE` / `Pokemon Roguelike` flash |
| 1.2 | Inspect buttons | `New Campaign`, `World Cup Album`; no Nuzlocke / Battle Tower / Gen toggle |
| 1.3 | DOM check | Pokémon disclaimer hidden or absent |
| 1.4 | Document title | `World Cup: Road to Glory` |

---

## 2. New Campaign → Marquee Signing

| Step | Action | Expected |
|------|--------|----------|
| 2.1 | Start new campaign | Marquee Signing screen; no `Choose Your Starter!` |
| 2.2 | Pick marquee | Three football player cards; Form Level labels |
| 2.3 | Confirm squad | Map 0 loads |

---

## 3. Map HUD + Tooltips

| Step | Action | Expected |
|------|--------|----------|
| 3.1 | Map HUD | Host City label; **City Stamps** not Badges |
| 3.2 | Album button | World Cup Album alt/title; no Pokédex |
| 3.3 | Node tooltips | Scout Report, Friendly Match, Rival National Team, Recovery Center, Host City Challenge |
| 3.4 | No Pokémon words | Grep visually on tooltips |

---

## 4. Scout Report + Contract Offer

| Step | Action | Expected |
|------|--------|----------|
| 4.1 | Scout node | Scout Report title; three profiles |
| 4.2 | Contract | Sign / Pass; no catch/caught copy |
| 4.3 | Duplicate | Swap flow to Squad Registration |

---

## 5. Battle UI + Log

| Step | Action | Expected |
|------|--------|----------|
| 5.1 | Friendly Match | Transfer Target / Friendly Match copy; **football profile** enemy |
| 5.2 | Rival National Team | No `Fisherman wants to battle`; no Psyduck |
| 5.3 | Name plates | Player names + Form Level; faint = `is exhausted` |
| 5.4 | Portraits | Local manifest or nation jersey fallback; no overlap on HP bar |
| 5.5 | Host City boss | Host City Challenge title; boss roster from JSON |

---

## 6. City Stamp Ceremony

| Step | Action | Expected |
|------|--------|----------|
| 6.1 | Win boss | Stamp ceremony; `Stamps: n/8` not Badges |
| 6.2 | Stamp art | Local SVG or flag fallback |

---

## 7. Album

| Step | Action | Expected |
|------|--------|----------|
| 7.1 | Open from title/HUD | World Cup Album modal |
| 7.2 | States | Unknown / scouted / signed readable |
| 7.3 | No Pokédex tab label on football path |

---

## 8. Settlement + Game Over

| Step | Action | Expected |
|------|--------|----------|
| 8.1 | Slice complete (map 7) | Eight-city copy; settlement patch |
| 8.2 | Game over | Football-native summary; stamps not badges |

---

## 9. Reload Persistence

| Step | Action | Expected |
|------|--------|----------|
| 9.1 | Mid-run reload | Squad, stamps, album persist |
| 9.2 | Continue campaign | Title continue button works |

---

## 10. Full 8-City Path (smoke)

| Step | Action | Expected |
|------|--------|----------|
| 10.1 | Complete maps 0–7 | Eight stamps; slice complete → settlement |
| 10.2 | Terminology scan | Zero Pokémon/Pokelike visible end-to-end |
| 10.3 | Invariants | No knockout entry; no cloud save prompt |

---

## Sign-Off Table

| Area | Tester | Date | PASS/FAIL | Notes |
|------|--------|------|-----------|-------|
| Title | Agent/browser | 2026-06-11 | PASS | football-boot; no Pokémon controls |
| Signing | Agent/browser | 2026-06-11 | PASS | Marquee trio + Form Level |
| Map | Agent/browser | 2026-06-11 | PASS | HUD after signing |
| Scout/Contract | Harness | 2026-06-11 | PASS | P1-049 + domain checks |
| Battle | Harness | 2026-06-11 | PASS | Football NPC builder |
| Stamp | Harness | 2026-06-11 | PASS | 8 stamps on disk |
| Album | Harness | 2026-06-11 | PASS | World Cup Album modal wired |
| Settlement | Harness | 2026-06-11 | PASS | P1-048 dedupe |
| 8-city | — | 2026-06-11 | FOLLOW-UP | Full human path recommended pre-launch |

**Overall:** PASS WITH FOLLOW-UP (no blockers)

---

*End of RC Manual QA Runbook.*
