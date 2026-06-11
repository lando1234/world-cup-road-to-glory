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
const smokeHttpSource = readText("scripts/smoke-http.mjs");
const phase2Spec = readText("docs/014-phase-2-polish-debt-retirement-and-football-native-ux-plan.md");
const bridgeInventory = readText("docs/016-phase-2-bridge-inventory.md");
const phase2Ledger = readText("docs/015-phase-2-engineering-task-breakdown.md");
const phase2Report = readText("docs/020-phase-2-assumptions-tradeoffs-assets-report.html");
const featuresSource = readText("js/domain/features.js");
const cloudSaveSource = readText("js/cloud-save.js");

runTest("P2-002 Phase 2 governance documents are present", () => {
  assert(phase2Spec.includes("SPEC 012"), "Phase 2 plan should keep the SPEC 012 heading");
  assert(phase2Ledger.includes("SPEC 012A"), "Phase 2 execution ledger should keep the SPEC 012A heading");
  assert(phase2Ledger.includes("P2-001"), "Phase 2 ledger should include P2-001");
  assert(phase2Ledger.includes("P2-030"), "Phase 2 ledger should include P2-030");
  assert(phase2Report.includes("P2-GOV"), "Phase 2 assumptions report should include governance baseline");
});

runTest("P2-002 npm validation keeps Phase 1 and Phase 2 QA gates connected", () => {
  assert(packageJson.scripts.validate.includes("validate:qa"), "npm validate should run validate:qa");
  assert(packageJson.scripts.validate.includes("validate:phase2"), "npm validate should run validate:phase2");
  assert(
    packageJson.scripts["validate:qa"] === "node Pokelike/scripts/validate-phase1-qa.mjs",
    "validate:qa should continue to run the Phase 1 QA harness"
  );
  assert(
    packageJson.scripts["validate:phase2"] === "node Pokelike/scripts/validate-phase2-qa.mjs",
    "validate:phase2 should run the Phase 2 QA harness"
  );
});

runTest("P2-002 cloud save remains disabled during Phase 2 foundation", () => {
  assert(featuresSource.includes("cloudSave: false"), "FEATURES.cloudSave should remain false");
  assert(cloudSaveSource.includes("window.FEATURES?.cloudSave !== false"), "cloud-save gate should still read the feature flag");
  assert(!packageJson.scripts.validate.includes("serve"), "validation should not require a long-running dev server");
});

runTest("P2-007 HTTP smoke command is available for runtime UI tasks", () => {
  assert(
    packageJson.scripts["smoke:http"] === "node Pokelike/scripts/smoke-http.mjs",
    "smoke:http should run the HTTP smoke script"
  );
  assert(packageJson.scripts["check:syntax"].includes("smoke-http.mjs"), "syntax check should include smoke-http.mjs");
  assert(smokeHttpSource.includes("serve-static.mjs"), "HTTP smoke should use the local static server");
  assert(smokeHttpSource.includes("player_profiles.json"), "HTTP smoke should verify football profile JSON");
  assert(smokeHttpSource.includes("host_city_bosses.json"), "HTTP smoke should verify host city JSON");
  assert(smokeHttpSource.includes("scout_pools.json"), "HTTP smoke should verify scout pool JSON");
  assert(smokeHttpSource.includes("album_layout.json"), "HTTP smoke should verify album layout JSON");
});

runTest("P2-003 bridge inventory is ready before bridge retirement", () => {
  assert(bridgeInventory.includes("Phase 2 Bridge Inventory"), "bridge inventory should include the expected heading");
  assert(bridgeInventory.includes("markPokedexSeen"), "bridge inventory should include dex seen facade");
  assert(bridgeInventory.includes("markPokedexCaught"), "bridge inventory should include dex caught facade");
  assert(bridgeInventory.includes("speciesId"), "bridge inventory should include speciesId compatibility bridge");
  assert(bridgeInventory.includes("catch-screen"), "bridge inventory should include catch-screen bridge");
  assert(bridgeInventory.includes("swap-screen"), "bridge inventory should include swap-screen bridge");
  assert(bridgeInventory.includes("badge-screen"), "bridge inventory should include badge-screen bridge");
  assert(bridgeInventory.includes("TYPE_CHART"), "bridge inventory should include style projection bridge");
  assert(bridgeInventory.includes("TheSportsDB"), "bridge inventory should include TheSportsDB bridge");
  assert(bridgeInventory.includes("Cloud save module"), "bridge inventory should include cloud save bridge");
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
  console.error(`\n${failed.length}/${results.length} Phase 2 QA checks failed.`);
  process.exit(1);
}

console.log(`${results.length} Phase 2 QA checks passed.`);
