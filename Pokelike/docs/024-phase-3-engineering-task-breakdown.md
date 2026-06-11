# SPEC 013A — Phase 3 Execution Plan and Task Breakdown

**Status:** Operational execution plan for Phase 3  
**Authority:** Executes [021 — SPEC 013 Phase 3 Plan](./021-phase-3-expansion-content-release-hardening-plan.md)  
**Date:** 2026-06-10  
**Mode:** One task, one validation pass, one commit  
**Branch:** `main` unless explicitly changed  
**Governance HTML:** [022-phase-3-assumptions-tradeoffs-assets-report.html](./022-phase-3-assumptions-tradeoffs-assets-report.html)  
**Last sync:** P3-016 (`b9b6d05`)

---

## Progress Summary

| Metric | Count |
|--------|------:|
| **Done** | 11 |
| **Partial** | 0 |
| **Not started** | 30 |
| **Total tickets** | 51 |

**Legend:** ✅ Done · 🟡 Partial · ⬜ Not started

## 1. Operating Principle

Phase 3 expands the playable campaign from 3 to 8 Host City Challenges while preserving every Phase 2 release-safety invariant. The game must remain playable after every commit.

The default task loop is:

```text
1. Pre-flight — dependency, files, stop condition
2. Implementation — smallest scoped change
3. Validation — rtk npm run validate (+ smoke:http when runtime/assets touched)
4. Manual QA — when listed in task or runbook
5. Docs — update this ledger + 022 governance HTML + 013 frictions if needed
6. Commit — atomic with evidence in message
```

**Hard rules:** `FEATURES.maxMapIndex` stays `2` until **P3-040** only. No cloud save, no live APIs, no battle math changes, no knockout enablement.

---

## 2. Execution Waves

| Wave | Goal | Tasks | Exit gate |
|------|------|-------|-----------|
| Wave 0 | Planning foundation | P3-001–P3-005 | Ledger, P3 QA harness, runbook, governance HTML |
| Wave 1 | Phase 2 follow-ups | P3-006–P3-008 | Title + manual QA follow-ups recorded |
| Wave 2 | Content completion | P3-009–P3-020 | 8-boss catalog validates offline |
| Wave 3 | Asset completion | P3-021–P3-033 | Stamps + portrait manifest |
| Wave 4 | Runtime guards | P3-034–P3-039 | 8-boss mode with cap still 2 |
| Wave 5 | Enable maps 3–7 | **P3-040** | `maxMapIndex: 7` |
| Wave 6 | Manual QA | P3-041–P3-043 | 8-city PASS |
| Wave 7 | Bugfix buffer | P3-044–P3-045 | Blockers cleared |
| Wave 8 | Sign-off | P3-050–P3-051 | Validation report + GO/NO-GO |

---

## 3. Task Registry

| Task | Status | Lane | Dependencies | Commit |
|------|--------|------|--------------|--------|
| P3-001 | ✅ | A | Phase 2 complete | `05690ee` |
| P3-002 | ✅ | A | P3-001 | this commit |
| P3-003 | ✅ | A | P3-001 | `3dc6620` |
| P3-004 | ⬜ | A | P3-001 | |
| P3-005 | ⬜ | A | P3-002 | |
| P3-006 | ⬜ | E | P3-002 | |
| P3-007 | ⬜ | A | P3-003 | |
| P3-008 | ⬜ | A | P3-003 | |
| P3-009 | ✅ | B | P3-002 | `8dbbf18` |
| P3-010 | ✅ | B | P3-009 | `7e6197a` |
| P3-011 | ✅ | B | P3-010 | `2810834` |
| P3-012 | ✅ | B | P3-011 | `1cf085a` |
| P3-013 | ✅ | B | P3-012 | `d6ccd10` |
| P3-014 | ✅ | B | P3-013 | `319cd42` |
| P3-015 | ✅ | B | P3-014 | `eb212ac` |
| P3-016 | ✅ | B | P3-015 | `b9b6d05` |
| P3-017 | ⬜ | B | P3-016 | |
| P3-018 | ⬜ | B | P3-017 | |
| P3-019 | ⬜ | B | P3-016 | |
| P3-020 | ⬜ | B | P3-013 | |
| P3-021 | ⬜ | C | P3-013 | |
| P3-022 | ⬜ | C | P3-016, P3-021 | |
| P3-029 | ⬜ | C | P3-014 | |
| P3-030 | ⬜ | C | P3-029 | |
| P3-031 | ⬜ | C | P3-030 | |
| P3-032 | ⬜ | C | P3-031 | |
| P3-033 | ⬜ | C | P3-032 | |
| P3-034 | ⬜ | D | P3-019 | |
| P3-035 | ⬜ | E | P3-034 | |
| P3-036 | ⬜ | E | P3-020, P3-035 | |
| P3-037 | ⬜ | D | P3-035 | |
| P3-038 | ⬜ | A | P3-037 | |
| P3-039 | ⬜ | A | P3-033, P3-019 | |
| P3-040 | ⬜ | D | P3-019–P3-039, P3-007–P3-008 | |
| P3-041 | ⬜ | A | P3-040 | |
| P3-042 | ⬜ | A | P3-041 | |
| P3-043 | ⬜ | C | P3-041 | |
| P3-044 | ⬜ | — | P3-041 blocker | |
| P3-045 | ⬜ | — | P3-044 | |
| P3-050 | ⬜ | A | P3-041 | |
| P3-051 | ⬜ | A | P3-050 | |

---

## 4. Commit Message Template

```text
<imperative summary>

Implementation: <what changed and why this task scope is complete>.

Validation: rtk npm run validate. <smoke if run>.

Test: <task-specific evidence>.

Smoke: <result or why not needed>.

Docs: <022 ledger / governance HTML updates>.
```

---

## 5. Stop Conditions

Stop and re-plan if:

- Battle math change required
- Save v4 or cloud save activation required
- Live runtime API introduced
- P3-040 requested before §17.1 checklist in SPEC 013 complete
- Knockout becomes reachable before Phase 4
- Blocker needs multi-scope single commit

---

*End of SPEC 013A — Phase 3 Execution Plan and Task Breakdown.*
