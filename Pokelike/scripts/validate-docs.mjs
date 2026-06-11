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
const phase2AssumptionsHtml = readText("docs/020-phase-2-assumptions-tradeoffs-assets-report.html");

const frictionEntries = (visualFrictionsHtml.match(/class="entry"/g) || []).length;

assert(
  visualFrictionsHtml.includes("<h1>Phase 2 Visual Frictions Registry</h1>"),
  "visual frictions registry must include the expected h1"
);
assert(frictionEntries >= 3, `visual frictions registry must include at least 3 entries; found ${frictionEntries}`);
assert(taskBreakdown.includes("Execution Protocol Addendum"), "task breakdown must include the execution protocol addendum");
assert(taskBreakdown.includes("npm run validate"), "task breakdown must document the npm validation command");
assert(assumptionsHtml.includes("T0-001"), "assumptions report must include T0-001");
assert(assumptionsHtml.includes("One task, one commit"), "assumptions report must include one-task-one-commit rule");
assert(
  phase2AssumptionsHtml.includes("Phase 2 Assumptions, Tradeoffs, Frictions, and Asset Gaps"),
  "Phase 2 assumptions report must include the expected h1"
);
assert(phase2AssumptionsHtml.includes("Missing Assets And Ownership"), "Phase 2 assumptions report must document missing assets");
assert(phase2AssumptionsHtml.includes("Decision Gates"), "Phase 2 assumptions report must document decision gates");
assert(phase2AssumptionsHtml.includes("P2-GOV"), "Phase 2 assumptions report must include the governance ledger note");

console.log(`PASS docs validation: ${frictionEntries} visual friction entries`);
