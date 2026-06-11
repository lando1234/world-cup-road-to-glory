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

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
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

function stringLiterals(source) {
  return [...source.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/gs)].map(match => match[2]).join("\n");
}

const gameSource = readText("js/game.js");
const uiSource = readText("js/ui.js");
const mapSource = readText("js/map.js");
const featuresSource = readText("js/domain/features.js");
const battleSource = readText("js/battle.js");
const htmlSource = readText("index.html");
const profiles = readJson("data/football/player_profiles.json");
const bosses = readJson("data/football/host_city_bosses.json");
const scoutPools = readJson("data/football/scout_pools.json");
const albumLayout = readJson("data/football/album_layout.json");

runTest("P1-046 happy path structure is complete for all marquee starters", () => {
  const starterIds = [1, 2, 3];
  for (const starterId of starterIds) {
    const profile = profiles.profiles.find(entry => entry.profileId === starterId);
    assert(profile?.flags?.isMarquee === true, `starter ${starterId} should be a marquee profile`);
    assert(profile?.flags?.scoutable === false, `starter ${starterId} should be excluded from scout pool`);
  }
  assert(gameSource.includes("function getFootballSliceStampTarget()"), "slice stamp target helper should exist");
  assert(gameSource.includes("return 3;"), "slice stamp target should be 3");
  assert(bosses.bosses.length === 8, "catalog should define eight host city bosses after Phase 3");
  const sliceBosses = bosses.bosses.filter(boss => boss.mapIndex <= 2);
  assert(sliceBosses.length === 3, "slice maps 0-2 should still define three host city bosses");
  assert(sliceBosses.every((boss, index) => boss.mapIndex === index), "slice host city bosses should cover maps 0, 1, and 2");
  assert(gameSource.includes("showSliceCompleteScreen();"), "third stamp should route to slice complete screen");
});

runTest("P1-047 album persistence gate preserves album and avoids poke_dex writes", () => {
  assert(uiSource.includes("return openAlbumModal"), "football collection should open album modal");
  assert(gameSource.includes("state = normalizeRunIdentity(saved, { assignRunId: true });"), "loadRun should preserve normalized run ledger");
  assert(gameSource.includes("saveRun();"), "run flow should still persist current run state");
  assert(readText("js/data.js").includes("markAlbumSigned"), "football dex facade should write album signed state");
  assert(readText("js/data.js").includes("return;"), "football dex facade should return before legacy poke_dex writes");
});

runTest("P1-048 game over settlement applies account patch before clearing run", () => {
  const settleBlock = extractBetween(gameSource, "function settleRunAndReturnToTitle", "function showWinScreen");
  const gameOverBlock = extractBetween(gameSource, "async function showGameOver()", "function showWinScreen");
  assert(settleBlock.includes("DomainSave?.settleRunLite"), "settlement helper should calculate lite settlement");
  assert(settleBlock.includes("DomainSave?.applyAccountPatch"), "settlement helper should apply account patch");
  assert(settleBlock.indexOf("applyAccountPatch") < settleBlock.indexOf("clearSavedRun"), "account patch should apply before clearSavedRun");
  assert(gameOverBlock.includes("settleRunAndReturnToTitle();"), "football game over should route through settlement helper");
});

runTest("P1-049 slice-facing terminology grep gate passes", () => {
  const prohibited = ["Pokémon", "Pokemon", "Pokédex", "Gym", "Elite Four", "Poké"];
  const blocks = [
    extractBetween(htmlSource, "<!-- ===== SCOUT REPORT / CATCH COMPATIBILITY SCREEN ===== -->", "<!-- ===== ITEM SCREEN ===== -->"),
    extractBetween(htmlSource, "<!-- ===== SQUAD REGISTRATION / SWAP COMPATIBILITY SCREEN ===== -->", "<!-- ===== TRADE SCREEN ===== -->"),
    extractBetween(htmlSource, "<!-- ===== SLICE COMPLETE SCREEN ===== -->", "<!-- ===== WIN SCREEN ===== -->"),
    stringLiterals(extractBetween(uiSource, "if (window.FEATURES?.footballMode === true && window.GAME_THEME)", "return {")),
    stringLiterals(extractBetween(gameSource, "async function doScoutReportNode(node)", "function isFootballRuntimeInstance")),
    stringLiterals(extractBetween(gameSource, "function showSliceCompleteScreen()", "async function showGameOver"))
  ];
  for (const block of blocks) {
    for (const term of prohibited) {
      assert(!block.includes(term), `slice-facing block should not include ${term}`);
    }
  }
});

runTest("P1-050 battle regression smoke keeps engine domain-agnostic", () => {
  assert(battleSource.includes("function calcDamage"), "battle.js should still expose calcDamage");
  assert(battleSource.includes("function runBattle"), "battle.js should still expose runBattle");
  assert(!battleSource.includes("GAME_THEME"), "battle engine should not depend on football presentation theme");
  assert(!battleSource.includes("DomainCombatAdapter"), "battle engine should not depend on football adapter");
  assert(gameSource.includes("DomainCombatAdapter.createPlayerInstance"), "football integration should stay in game/domain adapter boundary");
});

runTest("P1-051 map 0 forced scout script is locked", () => {
  const map0Forced = scoutPools.forcedOverrides.find(report =>
    report.mapIndex === 0 && report.layer === 1 && report.nodeType === "catch"
  );
  assert(map0Forced, "Map 0 layer-1 catch forced report should exist");
  assert(map0Forced.profileIds.join(",") === "12,15,17", "Map 0 forced scout should be Pedri, Ramos, Alisson");
  const excluded = scoutPools.rules.excludedStarterProfileIds;
  assert(excluded.join(",") === "1,2,3", "forced scout should exclude marquee starters");
});

runTest("P1-052 sign-off prerequisites are present", () => {
  assert(albumLayout.pages.length >= 2, "album layout should include Phase 1 pages");
  assert(uiSource.includes("showSettlementLiteModal"), "settlement modal should be present");
  assert(featuresSource.includes("maxMapIndex: 2"), "slice map cap should be configured");
  assert(mapSource.includes("applyFootballSliceNodeGates"), "football map gates should be present");
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
  console.error(`\n${failed.length}/${results.length} Phase 1 QA checks failed.`);
  process.exit(1);
}

console.log(`${results.length} Phase 1 QA checks passed.`);
