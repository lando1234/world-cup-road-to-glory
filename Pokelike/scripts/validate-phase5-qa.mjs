import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const plan = readText("docs/033-phase-5-knockout-and-meta-plan.md");
const ledger = readText("docs/034-phase-5-task-breakdown.md");
const assumptionsHtml = readText("docs/035-phase-5-assumptions-tradeoffs.html");
const manualQa = readText("docs/036-phase-5-manual-qa.md");
const validationReport = readText("docs/037-phase-5-validation-report.md");
const featuresSource = readText("js/domain/features.js");
const gameSource = readText("js/game.js");

assert(plan.includes("SPEC 015"), "Phase 5 plan must include SPEC 015 heading");
assert(plan.includes("Knockout Architecture"), "Phase 5 plan must document knockout architecture");
assert(plan.includes("Meta Progression Architecture"), "Phase 5 plan must document meta progression");
assert(plan.includes("Save Implications"), "Phase 5 plan must document save implications");
assert(plan.includes("Cut Line"), "Phase 5 plan must include cut line");
assert(plan.includes("Deferred Phase 6"), "Phase 5 plan must list deferred Phase 6 items");

assert(ledger.includes("SPEC 015A"), "Phase 5 task breakdown must include SPEC 015A heading");
assert(ledger.includes("Progress Summary"), "Phase 5 task breakdown must include progress summary");
assert(ledger.includes("P5-001"), "Phase 5 task breakdown must include P5-001");
assert(ledger.includes("P5-017"), "Phase 5 task breakdown must include knockout enable gate P5-017");
assert(ledger.includes("P5-072"), "Phase 5 task breakdown must include sign-off task P5-072");
assert(
  ledger.includes("035-phase-5-assumptions-tradeoffs.html"),
  "Phase 5 task breakdown must reference governance HTML"
);
assert(ledger.includes("Commit Message Template"), "Phase 5 task breakdown must include commit template");

assert(
  assumptionsHtml.includes("Phase 5 Assumptions, Tradeoffs, Frictions, and Decision Gates"),
  "Phase 5 assumptions report must include expected h1"
);
assert(assumptionsHtml.includes("Go / No-Go Status"), "Phase 5 assumptions report must document go/no-go");
assert(assumptionsHtml.includes("P5-GOV"), "Phase 5 assumptions report must include P5-GOV note");
assert(assumptionsHtml.includes("One task, one commit"), "Phase 5 assumptions report must include one-task-one-commit rule");

assert(manualQa.includes("Phase 5 Manual QA Runbook"), "Phase 5 manual QA must include expected heading");
assert(manualQa.includes("Knockout Entry"), "Phase 5 manual QA must include knockout entry section");
assert(manualQa.includes("Trophy Ceremony"), "Phase 5 manual QA must include trophy ceremony section");
assert(manualQa.includes("Reload Persistence"), "Phase 5 manual QA must include reload persistence");
assert(manualQa.includes("Blocker Definition"), "Phase 5 manual QA must define blockers");

assert(validationReport.includes("Phase 5 Validation Report"), "Phase 5 validation report must include expected heading");
assert(validationReport.includes("Go / No-Go"), "Phase 5 validation report must include go/no-go verdict");
assert(validationReport.includes("Knockout Status"), "Phase 5 validation report must include knockout status");
assert(validationReport.includes("Economy Status"), "Phase 5 validation report must include economy status");
assert(validationReport.includes("Legend Status"), "Phase 5 validation report must include legend status");

assert(featuresSource.includes("knockoutEnabled: true"), "FEATURES.knockoutEnabled must be true after P5-017");
assert(featuresSource.includes("maxMapIndex: 7"), "FEATURES.maxMapIndex must remain 7");
assert(featuresSource.includes("cloudSave: false"), "FEATURES.cloudSave must remain false");

assert(gameSource.includes("function getFootballSliceStampTarget()"), "slice stamp target helper must exist");
assert(gameSource.includes("showSliceCompleteScreen()"), "slice complete screen must remain for knockout-off regression");
assert(gameSource.includes("async function enterKnockoutStage"), "game.js must define enterKnockoutStage");
assert(gameSource.includes("async function runKnockoutChain"), "game.js must define runKnockoutChain");
assert(gameSource.includes("showFootballWorldCupWinScreen"), "game.js must define World Cup win screen");
assert(!gameSource.includes("startMap(8)"), "football knockout must not route through startMap(8)");

const uiSource = readText("js/ui.js");
assert(uiSource.includes("openTrophyRoomModal"), "ui.js must expose Trophy Room modal");
assert(uiSource.includes("creditsBreakdown"), "settlement modal must surface credits breakdown");

const metaModulePath = path.join(projectRoot, "js/domain/meta.js");
assert(fs.existsSync(metaModulePath), "domain/meta.js must exist");

const knockoutModulePath = path.join(projectRoot, "js/domain/knockout.js");
if (fs.existsSync(knockoutModulePath)) {
  const knockoutSource = fs.readFileSync(knockoutModulePath, "utf8");
  assert(knockoutSource.includes("DomainKnockout"), "domain/knockout.js should export DomainKnockout");
}

console.log("PASS phase5 QA: planning docs + release invariants");
