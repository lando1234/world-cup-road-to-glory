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

const visualFrictionsHtml = readText("docs/013-phase-2-visual-frictions.html");
const taskBreakdown = readText("docs/011-engineering-task-breakdown.md");
const assumptionsHtml = readText("docs/012-phase-1-assumptions-tradeoffs-report.html");
const phase2TaskBreakdown = readText("docs/015-phase-2-engineering-task-breakdown.md");
const phase2ManualQaRunbook = readText("docs/017-phase-2-manual-qa-runbook.md");
const portraitAssetStrategy = readText("docs/018-portrait-asset-strategy.md");
const phase2AssumptionsHtml = readText("docs/020-phase-2-assumptions-tradeoffs-assets-report.html");
const phase2ValidationReport = readText("docs/019-phase-2-validation-report.md");
const phase3Plan = readText("docs/021-phase-3-expansion-content-release-hardening-plan.md");
const phase3Ledger = readText("docs/024-phase-3-engineering-task-breakdown.md");
const phase2BridgeInventory = readText("docs/016-phase-2-bridge-inventory.md");
const phase3ManualQaRunbook = readText("docs/025-phase-3-manual-qa-runbook.md");
const phase3AssumptionsHtml = readText("docs/022-phase-3-assumptions-tradeoffs-assets-report.html");
const phase3ValidationReport = readText("docs/023-phase-3-validation-report.md");
const rcIdentityAudit = readText("docs/026-release-candidate-identity-audit.md");
const rcTaskBreakdown = readText("docs/027-release-candidate-hardening-task-breakdown.md");
const rcAssetPipeline = readText("docs/028-asset-pipeline-and-art-direction.md");
const rcValidationReport = readText("docs/030-release-candidate-validation-report.md");

const frictionEntries = (visualFrictionsHtml.match(/class="entry"/g) || []).length;

assert(
  visualFrictionsHtml.includes("<h1>Phase 2 Visual Frictions Registry</h1>"),
  "visual frictions registry must include the expected h1"
);
assert(frictionEntries >= 3, `visual frictions registry must include at least 3 entries; found ${frictionEntries}`);
assert(taskBreakdown.includes("Execution Protocol Addendum"), "task breakdown must include the execution protocol addendum");
assert(taskBreakdown.includes("npm run validate"), "task breakdown must document the npm validation command");
assert(phase2TaskBreakdown.includes("SPEC 012A"), "Phase 2 task breakdown must include the SPEC 012A heading");
assert(phase2TaskBreakdown.includes("Progress Summary"), "Phase 2 task breakdown must include a progress summary");
assert(phase2TaskBreakdown.includes("Task Registry"), "Phase 2 task breakdown must include the task registry");
assert(phase2TaskBreakdown.includes("Commit Message Template"), "Phase 2 task breakdown must include the commit template");
assert(phase2TaskBreakdown.includes("Stop Conditions"), "Phase 2 task breakdown must include stop conditions");
assert(phase2TaskBreakdown.includes("P2-001"), "Phase 2 task breakdown must include P2-001");
assert(phase2TaskBreakdown.includes("P2-030"), "Phase 2 task breakdown must include P2-030");
assert(
  phase2TaskBreakdown.includes("020-phase-2-assumptions-tradeoffs-assets-report.html"),
  "Phase 2 task breakdown must reference the Phase 2 assumptions report"
);
assert(phase2ManualQaRunbook.includes("Phase 2 Manual QA Runbook"), "Phase 2 manual QA runbook must include the expected heading");
assert(phase2ManualQaRunbook.includes("Blocker Definition"), "Phase 2 manual QA runbook must define blockers");
assert(phase2ManualQaRunbook.includes("Core Path QA"), "Phase 2 manual QA runbook must include core path QA");
assert(phase2ManualQaRunbook.includes("Full-Squad QA"), "Phase 2 manual QA runbook must include full-squad QA");
assert(phase2ManualQaRunbook.includes("Reload Persistence QA"), "Phase 2 manual QA runbook must include reload persistence QA");
assert(phase2ManualQaRunbook.includes("Game-Over QA"), "Phase 2 manual QA runbook must include game-over QA");
assert(phase2ManualQaRunbook.includes("Legacy Terminology QA"), "Phase 2 manual QA runbook must include legacy terminology QA");
assert(portraitAssetStrategy.includes("Phase 2 Portrait Asset Strategy"), "portrait strategy must include the expected heading");
assert(
  portraitAssetStrategy.includes("local stylized non-likeness jersey avatars"),
  "portrait strategy must record the public-safe default"
);
assert(portraitAssetStrategy.includes("TheSportsDB remains internal-demo/reference only"), "portrait strategy must restrict TheSportsDB");
assert(visualFrictionsHtml.includes("018-portrait-asset-strategy.md"), "visual frictions registry must link the portrait strategy");
assert(assumptionsHtml.includes("T0-001"), "assumptions report must include T0-001");
assert(assumptionsHtml.includes("One task, one commit"), "assumptions report must include one-task-one-commit rule");
assert(
  phase2AssumptionsHtml.includes("Phase 2 Assumptions, Tradeoffs, Frictions, and Asset Gaps"),
  "Phase 2 assumptions report must include the expected h1"
);
assert(phase2AssumptionsHtml.includes("Missing Assets And Ownership"), "Phase 2 assumptions report must document missing assets");
assert(phase2AssumptionsHtml.includes("Decision Gates"), "Phase 2 assumptions report must document decision gates");
assert(phase2AssumptionsHtml.includes("P2-GOV"), "Phase 2 assumptions report must include the governance ledger note");
assert(phase2ValidationReport.includes("Phase 2 Validation Report"), "Phase 2 validation report must include the expected heading");
assert(phase2ValidationReport.includes("Go / No-Go"), "Phase 2 validation report must include go/no-go verdict");
assert(phase2ValidationReport.includes("prepare only"), "Phase 2 validation report must record expansion decision");
assert(phase2AssumptionsHtml.includes("Phase 2 Sign-Off"), "Phase 2 assumptions report must include sign-off section");
assert(phase3Plan.includes("SPEC 013"), "Phase 3 plan must include the SPEC 013 heading");
assert(phase3Plan.includes("P3-040"), "Phase 3 plan must include the maxMapIndex enable gate task");
assert(phase3Ledger.includes("SPEC 013A"), "Phase 3 task breakdown must include the SPEC 013A heading");
assert(phase3Ledger.includes("Progress Summary"), "Phase 3 task breakdown must include a progress summary");
assert(phase3Ledger.includes("Task Registry"), "Phase 3 task breakdown must include the task registry");
assert(phase3Ledger.includes("P3-001"), "Phase 3 task breakdown must include P3-001");
assert(phase3Ledger.includes("P3-040"), "Phase 3 task breakdown must include P3-040");
assert(
  phase3Ledger.includes("022-phase-3-assumptions-tradeoffs-assets-report.html"),
  "Phase 3 task breakdown must reference the Phase 3 governance HTML"
);
assert(
  phase3AssumptionsHtml.includes("Phase 3 Assumptions, Tradeoffs, Frictions, and Asset Gaps"),
  "Phase 3 assumptions report must include the expected h1"
);
assert(phase3AssumptionsHtml.includes("Go / No-Go Status"), "Phase 3 assumptions report must document go/no-go");
assert(phase3AssumptionsHtml.includes("Expansion Readiness"), "Phase 3 assumptions report must document expansion readiness");
assert(phase2BridgeInventory.includes("Phase 3 Policy"), "bridge inventory must document Phase 3 policy");
assert(phase3ManualQaRunbook.includes("Phase 3 Manual QA Runbook"), "Phase 3 manual QA runbook must include the expected heading");
assert(phase3ManualQaRunbook.includes("Knockout Guard Assertion"), "Phase 3 manual QA runbook must include knockout guard checks");
assert(phase3ManualQaRunbook.includes("Core 8-City Path"), "Phase 3 manual QA runbook must include 8-city path");
assert(phase3ManualQaRunbook.includes("Blocker Definition"), "Phase 3 manual QA runbook must define blockers");
assert(phase3AssumptionsHtml.includes("P3-GOV"), "Phase 3 assumptions report must include the governance ledger note");
assert(
  phase3AssumptionsHtml.includes("Post-Phase 3 Reality Check"),
  "Phase 3 assumptions report must include post-sign-off reality check"
);
assert(phase3ValidationReport.includes("Phase 3 Validation Report"), "Phase 3 validation report must include the expected heading");
assert(phase3ValidationReport.includes("Go / No-Go"), "Phase 3 validation report must include go/no-go verdict");
assert(rcIdentityAudit.includes("SPEC 014A"), "RC identity audit must include SPEC 014A heading");
assert(rcTaskBreakdown.includes("SPEC 014B"), "RC task breakdown must include SPEC 014B heading");
assert(rcTaskBreakdown.includes("RC-001"), "RC task breakdown must include RC-001");
assert(rcAssetPipeline.includes("SPEC 014C"), "RC asset pipeline must include SPEC 014C heading");
assert(rcValidationReport.includes("Release Candidate Validation Report"), "RC validation report must include expected heading");
assert(fs.existsSync(path.join(projectRoot, "data/football/player_asset_manifest.json")), "player asset manifest must exist");
assert(fs.existsSync(path.join(projectRoot, "scripts/validate-identity-cleanup.mjs")), "identity cleanup harness must exist");
assert(fs.existsSync(path.join(projectRoot, "scripts/validate-asset-manifests.mjs")), "asset manifest harness must exist");

console.log(`PASS docs validation: ${frictionEntries} visual friction entries`);
