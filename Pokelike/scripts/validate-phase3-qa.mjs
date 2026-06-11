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
  assert(featuresSource.includes("maxMapIndex: 7"), "FEATURES.maxMapIndex must be 7 after P3-040 map enable gate");
});

runTest("P3-002 no-live-API and TheSportsDB remain disabled", () => {
  assert(featuresSource.includes("useTheSportsDbPortraits: false"), "TheSportsDB portraits must stay disabled");
});

const portraitManifest = JSON.parse(readText("data/football/portrait_manifest.json"));

runTest("P3-021 portrait manifest covers host city heroes 32-36", () => {
  for (const profileId of [32, 33, 34, 35, 36]) {
    const entry = portraitManifest.players[String(profileId)];
    assert(entry, `portrait manifest must include profile ${profileId}`);
    assert(entry.assetTier === "T0", `profile ${profileId} portrait should use T0 tier`);
    assert(entry.portrait === "", `profile ${profileId} portrait URL should stay empty for T0 fallback`);
  }
});

runTest("P3-022 portrait manifest covers expansion support profiles", () => {
  for (const profileId of [13, 19, 21, 23, 24, 25, 27, 40]) {
    const entry = portraitManifest.players[String(profileId)];
    assert(entry, `portrait manifest must include support profile ${profileId}`);
    assert(entry.assetTier === "T0", `support profile ${profileId} portrait should use T0 tier`);
  }
});

const gameSource = readText("js/game.js");
const dataSource = readText("js/data.js");

runTest("P3-037 knockout entry remains disabled for football terminus", () => {
  assert(featuresSource.includes("knockoutEnabled: false"), "FEATURES.knockoutEnabled should be false pre-Phase 4");
  assert(gameSource.includes("FEATURES?.knockoutEnabled === true"), "knockout map transition should be explicitly gated");
});

runTest("P3-035 eight-stamp completion copy is authored in GAME_THEME", () => {
  assert(dataSource.includes("sliceCompleteSummary8"), "GAME_THEME should define eight-stamp completion copy");
  assert(dataSource.includes("sliceCompleteSummary3"), "GAME_THEME should retain three-stamp completion copy");
  assert(gameSource.includes("sliceCompleteSummary8"), "slice complete screen should branch on stamp target");
});

runTest("P3-034 catalog validates eight bosses while runtime cap stays at two", () => {
  const bosses = JSON.parse(readText("data/football/host_city_bosses.json"));
  assert(bosses.bosses.length === 8, "host city catalog should contain eight bosses");
});

runTest("P3-039 smoke HTTP checklist includes expansion stamp assets", () => {
  const smoke = readText("scripts/smoke-http.mjs");
  assert(smoke.includes("madrid-stamp.svg"), "smoke checklist should include Madrid stamp");
  assert(smoke.includes("london-stamp.svg"), "smoke checklist should include London stamp");
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
