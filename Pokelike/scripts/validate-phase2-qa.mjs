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
const indexSource = readText("index.html");
const styleSource = readText("css/style.css");
const portraitManifest = JSON.parse(readText("data/football/portrait_manifest.json"));
const playerProfiles = JSON.parse(readText("data/football/player_profiles.json"));
const dataSource = readText("js/data.js");
const gameSource = readText("js/game.js");
const mapSource = readText("js/map.js");
const profilesSource = readText("js/domain/profiles.js");
const featuresSource = readText("js/domain/features.js");
const cloudSaveSource = readText("js/cloud-save.js");
const portraitSource = readText("js/domain/portrait-source.js");
const saveSource = readText("js/domain/save.js");

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

runTest("P2-010 football map node presentation uses native registry", () => {
  const spriteBlock = extractBetween(mapSource, "function getNodeSprite", "// Rendering");
  assert(mapSource.includes("FOOTBALL_NODE_PRESENTATION"), "map.js should define a football node presentation registry");
  assert(mapSource.includes("function getFootballNodePresentation"), "map.js should expose football node presentation lookup");
  assert(mapSource.includes("Scout Report"), "football node registry should include Scout Report");
  assert(mapSource.includes("Host City Challenge"), "football node registry should include Host City Challenge");
  assert(mapSource.includes("Recovery Center"), "football node registry should include Recovery Center");
  assert(spriteBlock.includes("if (getFootballNodePresentation(node)) return null;"), "football map nodes should avoid legacy sprite icons");
  assert(mapSource.includes("return footballPresentation.color"), "football node colors should come from the registry");
  assert(mapSource.includes("return footballPresentation.icon"), "football node icons should come from the registry");
});

runTest("P2-011 Scout Report surface uses football-native wrappers", () => {
  const scoutBlock = extractBetween(gameSource, "async function doScoutReportNode", "function isFootballRuntimeInstance");
  const classicCatchBlock = extractBetween(gameSource, "async function doCatchNode", "function setCatchSurfacePresentation");

  assert(indexSource.includes("scout-report-screen"), "Scout Report screen should have a football-native screen class");
  assert(indexSource.includes("scout-report-title"), "Scout Report title should have a football-native class");
  assert(indexSource.includes("scout-report-subtitle"), "Scout Report subtitle should have a football-native class");
  assert(indexSource.includes("scout-report-choices"), "Scout Report choices should have a football-native class");
  assert(indexSource.includes("scout-report-actions"), "Scout Report actions should have a football-native class");
  assert(styleSource.includes(".scout-report-screen"), "CSS should style the football-native Scout Report screen class");
  assert(styleSource.includes(".scout-report-choice"), "CSS should style individual Scout Report choices");
  assert(gameSource.includes("function setCatchSurfacePresentation"), "game.js should define the Scout/Catch compatibility presentation helper");
  assert(classicCatchBlock.includes("setCatchSurfacePresentation('classic')"), "Classic catch flow should explicitly set classic presentation");
  assert(scoutBlock.includes("setCatchSurfacePresentation('scout')"), "Scout Report flow should explicitly set scout presentation");
  assert(scoutBlock.includes("scout-report-choice"), "Scout Report slots should expose football-native choice wrappers");
  assert(scoutBlock.includes("for (const inst of instances)"), "Scout Report should still render each report instance");
});

runTest("P2-012 Contract Offer UX separates sign, skip, and duplicate states", () => {
  const contractBlock = extractBetween(gameSource, "function confirmScoutContract", "function signScoutPlayer");
  const signBlock = extractBetween(gameSource, "function signScoutPlayer", "function showSwapScreen");

  assert(contractBlock.includes("contract-offer-box"), "Contract Offer modal should expose a football-native box class");
  assert(contractBlock.includes("contract-offer-meta"), "Contract Offer should show player context metadata");
  assert(contractBlock.includes("window.DomainAlbum?.getEntryState"), "Contract Offer should read album state for seen/signed feedback");
  assert(contractBlock.includes("alreadySigned"), "Contract Offer should branch duplicate signed copy");
  assert(contractBlock.includes("Offer Again"), "Duplicate Contract Offer should have distinct CTA copy");
  assert(contractBlock.includes("Sign Player"), "New Contract Offer should have distinct signing CTA copy");
  assert(contractBlock.includes("Keep Scouting"), "Contract Offer should keep skip/back CTA copy");
  assert(styleSource.includes(".contract-offer-status-signed"), "CSS should style signed Contract Offer state");
  assert(styleSource.includes(".contract-offer-primary"), "CSS should style Contract Offer CTA hierarchy");
  assert(!contractBlock.includes("DomainRecruit.offerContract"), "Contract Offer modal should not change recruitment domain rules");
  assert(signBlock.includes("DomainRecruit.offerContract"), "Signing should remain delegated to DomainRecruit.offerContract");
});

runTest("P2-013 Squad Registration uses six-slot football layout", () => {
  const swapBlock = extractBetween(gameSource, "function showSwapScreen", "function doItemNode");

  assert(indexSource.includes("squad-registration-screen"), "Squad Registration screen should have a football-native class");
  assert(indexSource.includes("squad-registration-layout"), "Squad Registration should define a two-panel layout");
  assert(indexSource.includes("squad-registration-incoming"), "Squad Registration should expose incoming signing panel");
  assert(indexSource.includes("squad-registration-slots"), "Squad Registration should expose registered squad slots");
  assert(styleSource.includes(".squad-registration-slots"), "CSS should style Squad Registration slots");
  assert(styleSource.includes("repeat(3, minmax(160px, auto))"), "desktop Squad Registration should scan as six slots over two rows");
  assert(swapBlock.includes("squad-registration-incoming-card"), "runtime should render incoming signing in its panel");
  assert(swapBlock.includes("squad-registration-slot-label"), "runtime should label replacement slots");
  assert(swapBlock.includes("Replace squad slot"), "runtime should expose slot replacement aria labels");
  assert(swapBlock.includes("slot.addEventListener('click', replaceSlot)"), "slot wrapper should preserve click replacement");
  assert(swapBlock.includes("slot.addEventListener('keydown'"), "slot wrapper should preserve keyboard replacement");
  assert(swapBlock.includes("DomainRecruit.offerContract(newPoke.profileId, state, { forceAdd: true })"), "replacement should still force-add through DomainRecruit");
});

runTest("P2-014 City Stamp ceremony exposes football-native selectors", () => {
  const badgeBlock = extractBetween(gameSource, "function showBadgeScreen", "function showSliceCompleteScreen");

  assert(indexSource.includes("CITY STAMP / BADGE COMPATIBILITY SCREEN"), "City Stamp ceremony should document the compatibility surface");
  assert(indexSource.includes("city-stamp-screen"), "City Stamp ceremony should have a football-native screen class");
  assert(indexSource.includes("city-stamp-emblem"), "City Stamp ceremony should have a football-native emblem class");
  assert(indexSource.includes("city-stamp-message"), "City Stamp ceremony should have a football-native message class");
  assert(indexSource.includes("city-stamp-progress"), "City Stamp ceremony should have a football-native progress class");
  assert(styleSource.includes(".city-stamp-screen"), "CSS should style City Stamp screen aliases");
  assert(styleSource.includes(".city-stamp-emblem"), "CSS should style City Stamp emblem aliases");
  assert(badgeBlock.includes("city-stamp-screen-active"), "runtime should activate City Stamp presentation in football mode");
  assert(badgeBlock.includes("Stamps:"), "runtime should keep football stamp progress copy");
  assert(badgeBlock.includes("badgeImg.style.display = 'none'"), "runtime should still hide legacy badge sprites in football mode");
});

runTest("P2-015 City Stamp artwork uses owned local placeholders", () => {
  const badgeBlock = extractBetween(gameSource, "function showBadgeScreen", "function showSliceCompleteScreen");
  const mapHudBlock = extractBetween(gameSource, "function showMapScreen", "async function doBattleNode");
  const stampAssets = [
    "assets/stamps/sao-paulo-stamp.svg",
    "assets/stamps/berlin-stamp.svg",
    "assets/stamps/tokyo-stamp.svg"
  ];

  for (const assetPath of stampAssets) {
    const absolute = path.join(projectRoot, assetPath);
    assert(fs.existsSync(absolute), `${assetPath} should exist`);
    const assetSource = fs.readFileSync(absolute, "utf8");
    assert(assetSource.includes("Owned abstract football stamp placeholder"), `${assetPath} should document owned placeholder source`);
    assert(!assetSource.includes("Pokemon"), `${assetPath} should not reference Pokemon`);
    assert(!assetSource.includes("Poke"), `${assetPath} should not reference Poke naming`);
  }
  assert(gameSource.includes("FOOTBALL_STAMP_ASSETS"), "game.js should define local stamp asset mapping");
  assert(gameSource.includes("stamp_sao_paulo"), "stamp asset mapping should cover Sao Paulo");
  assert(gameSource.includes("stamp_berlin"), "stamp asset mapping should cover Berlin");
  assert(gameSource.includes("stamp_tokyo"), "stamp asset mapping should cover Tokyo");
  assert(badgeBlock.includes("city-stamp-asset"), "City Stamp ceremony should render local stamp asset images");
  assert(mapHudBlock.includes("city-stamp-hud-icon"), "map HUD should render local stamp asset images");
  assert(smokeHttpSource.includes("sao-paulo-stamp.svg"), "HTTP smoke should cover stamp assets");
});

runTest("P2-016 Album visual model distinguishes unknown, scouted, and signed", () => {
  const albumSlotBlock = extractBetween(gameSource + "\n" + readText("js/ui.js"), "function renderAlbumSlot", "async function openAlbumModal");
  const albumModalBlock = extractBetween(readText("js/ui.js"), "async function openAlbumModal", "function openPokedexModal");

  assert(albumSlotBlock.includes("album-card-status--unknown"), "Album unknown cards should expose explicit unknown status");
  assert(albumSlotBlock.includes("album-card-status--seen"), "Album seen cards should expose explicit scouted status");
  assert(albumSlotBlock.includes("album-card-status--signed"), "Album signed cards should expose explicit signed status");
  assert(albumSlotBlock.includes("Scouted"), "Album seen state should use football-native scouted copy");
  assert(albumModalBlock.includes("signedPct"), "Album modal should calculate signed percentage for progress display");
  assert(albumModalBlock.includes("% signed"), "Album modal should display signed percentage copy");
  assert(styleSource.includes(".album-card-status--signed"), "CSS should style signed album status");
  assert(styleSource.includes(".album-progress-copy"), "CSS should style album progress copy");
  assert(!albumSlotBlock.includes("localStorage.setItem"), "Album visual rendering should not write persistence");
});

runTest("P2-017 Slice Complete presents Trophy Road milestone and still routes to settlement", () => {
  const sliceBlock = extractBetween(gameSource, "function showSliceCompleteScreen", "async function showGameOver");

  assert(indexSource.includes("slice-complete-screen"), "Slice Complete should have a dedicated screen class");
  assert(indexSource.includes("Trophy Road Milestone"), "Slice Complete should present milestone kicker copy");
  assert(indexSource.includes("Continue to Settlement"), "Slice Complete CTA should name settlement");
  assert(indexSource.includes("slice-complete-team"), "Slice Complete should expose squad snapshot container class");
  assert(styleSource.includes(".slice-complete-kicker"), "CSS should style Slice Complete milestone kicker");
  assert(styleSource.includes(".slice-complete-team"), "CSS should style Slice Complete squad snapshot");
  assert(sliceBlock.includes("Trophy Road: First Leg Complete"), "runtime should use Trophy Road completion title");
  assert(sliceBlock.includes("Three Host City Challenges cleared"), "runtime should use milestone summary copy");
  assert(sliceBlock.includes("City Stamps"), "runtime stats should use City Stamps label");
  assert(sliceBlock.includes("Signed Album"), "runtime stats should use Signed Album label");
  assert(sliceBlock.includes("settleRunAndReturnToTitle();"), "Slice Complete CTA should continue through settlement helper");
});

runTest("P2-018 Settlement Lite UX clarifies patch summary and return flow", () => {
  const settlementBlock = extractBetween(readText("js/ui.js"), "function showSettlementLiteModal", "function openDexDetailModal");

  assert(settlementBlock.includes("settlement-lite-overlay"), "Settlement modal should use dedicated overlay class");
  assert(settlementBlock.includes("Run Settlement"), "Settlement modal should name the settlement step");
  assert(settlementBlock.includes("Road to Glory Summary"), "Settlement modal should use football-native summary title");
  assert(settlementBlock.includes("City Stamps"), "Settlement modal should label stamp summary");
  assert(settlementBlock.includes("Album Patch"), "Settlement modal should clarify account album patch");
  assert(settlementBlock.includes("Scout Reports"), "Settlement modal should label scout count");
  assert(settlementBlock.includes("New Signings Applied"), "Settlement modal should clarify applied signings");
  assert(settlementBlock.includes("Return to Title"), "Settlement modal CTA should name return destination");
  assert(settlementBlock.includes("onContinue();"), "Settlement modal should still call provided continuation callback");
  assert(styleSource.includes(".settlement-lite-grid"), "CSS should style settlement summary grid");
  assert(styleSource.includes(".settlement-lite-rewards"), "CSS should style settlement reward note");
});

runTest("P2-019 account model validator is pure and Phase 2 scoped", () => {
  const validatorBlock = extractBetween(saveSource, "function validateAccountModel", "function getProfileName");

  assert(saveSource.includes("function validateAccountModel"), "DomainSave should define validateAccountModel");
  assert(saveSource.includes("validateAccountModel,"), "DomainSave should export validateAccountModel");
  assert(validatorBlock.includes("footballCredits"), "validator should accept optional future footballCredits key");
  assert(validatorBlock.includes("legendFragments"), "validator should accept optional future legendFragments key");
  assert(validatorBlock.includes("lastSettledRunId"), "validator should validate optional lastSettledRunId key");
  assert(validatorBlock.includes("runsStarted"), "validator should validate optional run counters");
  assert(!validatorBlock.includes("localStorage.setItem"), "account validator should be pure and not write storage");
  assert(saveSource.includes("const DOMAIN_SAVE_SCHEMA_VERSION = 3"), "P2-019 must not introduce save v4 migration");
  assert(!cloudSaveSource.includes("game_album"), "cloud save should remain disconnected from album/account keys");
});

runTest("P2-020 settlement dedupe guard is local and run-id based", () => {
  const settleBlock = extractBetween(saveSource, "function settleRunLite", "function applyAccountPatch");
  const applyBlock = extractBetween(saveSource, "function applyAccountPatch", "const DomainSave");

  assert(saveSource.includes("LAST_SETTLED_RUN_ID_STORAGE_KEY"), "DomainSave should define local settled-run key");
  assert(saveSource.includes("football_last_settled_run_id"), "dedupe key should be local football-specific storage");
  assert(settleBlock.includes("lastSettledRunId"), "settlement patch should include lastSettledRunId when runId exists");
  assert(applyBlock.includes("skipped duplicate settlement"), "applyAccountPatch should log duplicate settlement skip");
  assert(applyBlock.includes("return false;"), "duplicate settlement should return false");
  assert(applyBlock.includes("localStorage.setItem(LAST_SETTLED_RUN_ID_STORAGE_KEY"), "first settlement should record settled run id locally");
  assert(!cloudSaveSource.includes("football_last_settled_run_id"), "settlement dedupe key should not be cloud-synced in Phase 2");
  assert(saveSource.includes("const DOMAIN_SAVE_SCHEMA_VERSION = 3"), "P2-020 must not introduce save v4 migration");
});

runTest("P2-022 manual QA runbook records a completed browser pass", () => {
  const manualQa = readText("docs/017-phase-2-manual-qa-runbook.md");
  assert(manualQa.includes("P2-022 Attempt 2"), "manual QA runbook should record the successful browser pass");
  assert(manualQa.includes("PASS WITH FOLLOW-UP"), "manual QA should end with pass-with-follow-up when non-blocking issues remain");
  assert(manualQa.includes("rtk npm run smoke:http"), "manual QA should record HTTP smoke evidence");
});

runTest("P2-024 eight-host-city expansion decision is prepare-only", () => {
  const validationReport = readText("docs/019-phase-2-validation-report.md");
  assert(validationReport.includes("prepare only"), "validation report should record prepare-only expansion decision");
  assert(validationReport.includes("P2-028"), "validation report should document deferred map-cap enablement");
  assert(featuresSource.includes("maxMapIndex: 2"), "runtime map cap must remain 2 after expansion decision");
});

runTest("P2-025 host city expansion guard validates maps 3-7 data contract", () => {
  const expansion = JSON.parse(readText("data/football/host_city_expansion.json"));
  assert(expansion.schemaVersion === 1, "host city expansion schemaVersion should be 1");
  assert(expansion.bosses.length === 5, "host city expansion should define five bosses for maps 3-7");
  assert(expansion.bosses.every(boss => boss.mapIndex >= 3 && boss.mapIndex <= 7), "expansion bosses should only cover maps 3-7");
  assert(smokeHttpSource.includes("host_city_expansion.json"), "HTTP smoke should verify host city expansion JSON");
});

runTest("P2-026 scout pool expansion guard validates late bands without runtime load", () => {
  const expansion = JSON.parse(readText("data/football/scout_pools_expansion.json"));
  assert(expansion.bands.some(band => band.mapMin === 3), "expansion scout pools should include map 3+ bands");
  assert(expansion.bands.some(band => band.mapMax === 7), "expansion scout pools should include map 7 coverage");
  const slicePools = JSON.parse(readText("data/football/scout_pools.json"));
  assert(slicePools.bands.some(band => band.bandId === "late"), "runtime scout pools should include merged late band after Phase 3");
  assert(smokeHttpSource.includes("scout_pools_expansion.json"), "HTTP smoke should verify scout pool expansion JSON");
});

runTest("P2-027 album page expansion guard prepares deferred pages", () => {
  const expansion = JSON.parse(readText("data/football/album_layout_expansion.json"));
  const sliceLayout = JSON.parse(readText("data/football/album_layout.json"));
  const expansionPageIds = expansion.pages.map(page => page.pageId);
  assert(expansionPageIds.includes("host_city"), "album expansion should prepare host_city page");
  assert(expansionPageIds.includes("knockout"), "album expansion should prepare knockout page");
  assert(expansionPageIds.includes("legends"), "album expansion should prepare legends page");
  assert(sliceLayout.deferredPages.includes("host_city"), "runtime album layout should keep host_city deferred");
  assert(smokeHttpSource.includes("album_layout_expansion.json"), "HTTP smoke should verify album layout expansion JSON");
});

runTest("P2-029 Phase 2 validation report exists with go/no-go summary", () => {
  const validationReport = readText("docs/019-phase-2-validation-report.md");
  assert(validationReport.includes("Phase 2 Validation Report"), "validation report should include expected heading");
  assert(validationReport.includes("Go / No-Go"), "validation report should include go/no-go verdict");
  assert(validationReport.includes("no-live-API"), "validation report should assert no-live-API policy");
  assert(validationReport.includes("cloud save"), "validation report should assert cloud-save policy");
});

runTest("P2-030 Phase 2 sign-off is recorded in the execution ledger", () => {
  assert(phase2Ledger.includes("P2-030 | ✅"), "Phase 2 ledger should mark P2-030 complete");
  assert(phase2Ledger.includes("**Done** | 30"), "Phase 2 progress summary should show 30 done tasks");
  assert(phase2Report.includes("P2-030"), "Phase 2 assumptions report should include sign-off notes");
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
