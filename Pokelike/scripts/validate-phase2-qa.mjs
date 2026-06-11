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

function extractBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(startIndex !== -1, `missing start marker ${start}`);
  assert(endIndex !== -1, `missing end marker ${end}`);
  return source.slice(startIndex, endIndex);
}

const packageJson = JSON.parse(readText("../package.json"));
const smokeHttpSource = readText("scripts/smoke-http.mjs");
const phase2Spec = readText("docs/014-phase-2-polish-debt-retirement-and-football-native-ux-plan.md");
const bridgeInventory = readText("docs/016-phase-2-bridge-inventory.md");
const phase2Ledger = readText("docs/015-phase-2-engineering-task-breakdown.md");
const phase2Report = readText("docs/020-phase-2-assumptions-tradeoffs-assets-report.html");
const portraitManifest = JSON.parse(readText("data/football/portrait_manifest.json"));
const playerProfiles = JSON.parse(readText("data/football/player_profiles.json"));
const dataSource = readText("js/data.js");
const gameSource = readText("js/game.js");
const profilesSource = readText("js/domain/profiles.js");
const featuresSource = readText("js/domain/features.js");
const cloudSaveSource = readText("js/cloud-save.js");
const portraitSource = readText("js/domain/portrait-source.js");

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

runTest("P2-004 album-named facade APIs exist alongside legacy dex aliases", () => {
  assert(dataSource.includes("function markAlbumSeen"), "data.js should expose markAlbumSeen");
  assert(dataSource.includes("function markAlbumSigned"), "data.js should expose markAlbumSigned");
  assert(dataSource.includes("DomainAlbum?.markAlbumSeen?.(id)"), "markAlbumSeen should delegate to DomainAlbum.markAlbumSeen");
  assert(dataSource.includes("DomainAlbum?.markAlbumSigned?.(id)"), "markAlbumSigned should delegate to DomainAlbum.markAlbumSigned");
  assert(dataSource.includes("function markPokedexSeen"), "legacy markPokedexSeen alias should remain");
  assert(dataSource.includes("function markPokedexCaught"), "legacy markPokedexCaught alias should remain");
});

runTest("P2-005 football gameplay writes prefer album-named APIs", () => {
  const selectStarterBlock = extractBetween(gameSource, "async function selectStarter", "// ---- Map Management ----");
  const scoutBlock = extractBetween(gameSource, "async function doScoutReportNode", "function isFootballRuntimeInstance");

  assert(selectStarterBlock.includes("markAlbumSigned"), "football starter selection should write through markAlbumSigned");
  assert(selectStarterBlock.includes("markPokedexCaught"), "legacy starter selection should keep markPokedexCaught");
  assert(
    selectStarterBlock.indexOf("markAlbumSigned") < selectStarterBlock.indexOf("markPokedexCaught"),
    "football starter album write should happen before legacy dex fallback branch"
  );
  assert(scoutBlock.includes("markAlbumSeen(profileId)"), "Scout Report should mark seen profiles through markAlbumSeen");
  assert(!scoutBlock.includes("markPokedexSeen"), "Scout Report football branch should not call markPokedexSeen");
  assert(!scoutBlock.includes("markPokedexCaught"), "Scout Report football branch should not call markPokedexCaught");
});

runTest("P2-009 local portrait manifest covers the runtime profile catalog", () => {
  assert(portraitManifest.schemaVersion === 1, "portrait manifest schemaVersion should be 1");
  assert(
    portraitManifest.strategy === "stylized_non_likeness_jersey_avatars",
    "portrait manifest should use the approved Phase 2 strategy"
  );
  assert(portraitManifest.remoteRuntimeDependency === false, "portrait manifest should not require remote runtime dependency");
  for (const profile of playerProfiles.profiles) {
    const entry = portraitManifest.players[String(profile.profileId)];
    assert(entry, `portrait manifest should include profileId ${profile.profileId}`);
    assert(["T0", "T1", "T2", "T3"].includes(entry.assetTier), `profileId ${profile.profileId} should have a valid asset tier`);
    assert(typeof entry.portrait === "string", `profileId ${profile.profileId} portrait should be a string`);
  }
  assert(featuresSource.includes("useTheSportsDbPortraits: false"), "TheSportsDB portraits should be disabled by default");
  assert(profilesSource.includes("PORTRAIT_MANIFEST_URL"), "DomainProfiles should define a portrait manifest URL");
  assert(profilesSource.includes("initPortraitManifest"), "DomainProfiles should initialize the local portrait manifest");
  assert(smokeHttpSource.includes("portrait_manifest.json"), "HTTP smoke should verify portrait_manifest.json");
});

runTest("P2-021 football runtime-critical display path does not require live APIs", () => {
  const selectStarterBlock = extractBetween(gameSource, "async function selectStarter", "// ---- Map Management ----");
  const footballStarterBranch = extractBetween(selectStarterBlock, "if (window.FEATURES?.footballMode === true", "} else {");

  assert(featuresSource.includes("useTheSportsDbPortraits: false"), "TheSportsDB portrait enrichment should be disabled by default");
  assert(portraitManifest.remoteRuntimeDependency === false, "portrait manifest should declare no remote runtime dependency");
  assert(profilesSource.indexOf("initPortraitManifest") < profilesSource.indexOf("enrichCatalogPortraits"), "profile loader should apply local manifest before optional portrait enrichment");
  assert(portraitSource.includes("if (!config.enabled) return null;"), "portrait source should no-op when disabled");
  assert(!profilesSource.includes("lookupPlayerById("), "DomainProfiles should not call live TheSportsDB lookup");
  assert(!profilesSource.includes("searchPlayer("), "DomainProfiles should not call live TheSportsDB search");
  assert(!footballStarterBranch.includes("https://"), "football starter branch should not build remote sprite URLs");
  assert(footballStarterBranch.includes("markAlbumSigned"), "football starter branch should use local album write path");
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
