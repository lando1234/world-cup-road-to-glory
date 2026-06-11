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

console.log(`PASS docs validation: ${frictionEntries} visual friction entries`);
