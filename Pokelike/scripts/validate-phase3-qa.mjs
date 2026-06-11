import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const results = [];

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runTest(name, fn) {
  try {
    fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    results.push({ name, status: "FAIL", error });
  }
}

const packageJson = JSON.parse(readText("../package.json"));
const phase3Plan = readText("docs/021-phase-3-expansion-content-release-hardening-plan.md");
const phase3Ledger = readText("docs/024-phase-3-engineering-task-breakdown.md");
const phase3Governance = readText("docs/022-phase-3-assumptions-tradeoffs-assets-report.html");
const featuresSource = readText("js/domain/features.js");
const cloudSaveSource = readText("js/cloud-save.js");

runTest("P3-002 Phase 3 governance documents are present", () => {
  assert(phase3Plan.includes("SPEC 013"), "Phase 3 plan should include SPEC 013 heading");
  assert(phase3Ledger.includes("SPEC 013A"), "Phase 3 ledger should include SPEC 013A heading");
  assert(phase3Ledger.includes("P3-001"), "Phase 3 ledger should include P3-001");
  assert(phase3Ledger.includes("P3-040"), "Phase 3 ledger should include P3-040 enable gate");
  assert(phase3Governance.includes("P3-GOV"), "Phase 3 governance HTML should include governance marker");
});

runTest("P3-002 npm validation keeps prior QA gates and adds Phase 3", () => {
  assert(packageJson.scripts.validate.includes("validate:phase3"), "npm validate should run validate:phase3");
  assert(packageJson.scripts.validate.includes("validate:phase2"), "npm validate should keep validate:phase2");
  assert(packageJson.scripts.validate.includes("validate:qa"), "npm validate should keep validate:qa");
  assert(
    packageJson.scripts["validate:phase3"] === "node Pokelike/scripts/validate-phase3-qa.mjs",
    "validate:phase3 should run the Phase 3 QA harness"
  );
});

runTest("P3-002 cloud save remains disabled during Phase 3 foundation", () => {
  assert(featuresSource.includes("cloudSave: false"), "FEATURES.cloudSave should remain false");
  assert(cloudSaveSource.includes("window.FEATURES?.cloudSave !== false"), "cloud-save gate should still read feature flag");
});

runTest("P3-002 runtime map cap remains 2 until explicit P3-040 enable", () => {
  assert(featuresSource.includes("maxMapIndex: 2"), "FEATURES.maxMapIndex must stay 2 during Phase 3 prep waves");
});

runTest("P3-002 no-live-API and TheSportsDB remain disabled", () => {
  assert(featuresSource.includes("useTheSportsDbPortraits: false"), "TheSportsDB portraits must stay disabled");
});

const failed = results.filter(result => result.status === "FAIL");
for (const result of results) {
  if (result.status === "PASS") {
    console.log(`PASS ${result.name}`);
  } else {
    console.error(`FAIL ${result.name}`);
    console.error(`  ${result.error.message}`);
  }
}

if (failed.length > 0) {
  console.error(`\n${failed.length}/${results.length} Phase 3 QA checks failed.`);
  process.exit(1);
}

console.log(`${results.length} Phase 3 QA checks passed.`);
