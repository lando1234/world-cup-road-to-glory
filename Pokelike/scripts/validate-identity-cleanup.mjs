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
  assert(startIndex !== -1, `missing marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(endIndex !== -1, `missing end marker after: ${start}`);
  return source.slice(startIndex, endIndex);
}

function stringLiterals(block) {
  const matches = [...block.matchAll(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g)];
  return matches.map(match => match[0].slice(1, -1));
}

const htmlSource = readText("index.html");
const uiSource = readText("js/ui.js");
const gameSource = readText("js/game.js");
const dataSource = readText("js/data.js");
const featuresSource = readText("js/domain/features.js");
const identityAudit = readText("docs/026-release-candidate-identity-audit.md");

const PROHIBITED_FOOTBALL_TERMS = [
  "Pokémon",
  "Pokemon",
  "Pokédex",
  "Pokedex",
  "Gym",
  "Elite Four",
  "Poké",
  "Nuzlocke",
  "Wild Pokémon",
  "Wild Pokemon"
];

const FOOTBALL_SURFACE_BLOCKS = [
  extractBetween(htmlSource, "<!-- ===== SCOUT REPORT / CATCH COMPATIBILITY SCREEN ===== -->", "<!-- ===== ITEM SCREEN ===== -->"),
  extractBetween(htmlSource, "<!-- ===== SQUAD REGISTRATION / SWAP COMPATIBILITY SCREEN ===== -->", "<!-- ===== TRADE SCREEN ===== -->"),
  extractBetween(htmlSource, "<!-- ===== SLICE COMPLETE SCREEN ===== -->", "<!-- ===== WIN SCREEN ===== -->"),
  stringLiterals(extractBetween(uiSource, "if (window.FEATURES?.footballMode === true && window.GAME_THEME)", "return {")).join("\n"),
  stringLiterals(extractBetween(gameSource, "async function doScoutReportNode(node)", "function isFootballRuntimeInstance")).join("\n"),
  stringLiterals(extractBetween(gameSource, "function showSliceCompleteScreen()", "async function showGameOver")).join("\n"),
  readText("js/data.js").match(/const GAME_THEME = Object\.freeze\({[\s\S]*?\n}\);/)?.[0] ?? ""
];

runTest("RC-004 SPEC 014 identity audit document exists", () => {
  assert(identityAudit.includes("SPEC 014A"), "identity audit should include SPEC 014A heading");
  assert(identityAudit.includes("Player-Facing Blockers"), "identity audit should list blockers");
  assert(identityAudit.includes("Football-Native Identity"), "identity audit should define acceptance criteria");
});

runTest("RC-004 release invariants remain locked", () => {
  assert(
    featuresSource.includes("knockoutEnabled: true") || featuresSource.includes("knockoutEnabled: false"),
    "knockoutEnabled must be explicitly set in features.js"
  );
  assert(featuresSource.includes("cloudSave: false"), "cloud save must stay disabled");
  assert(featuresSource.includes("useTheSportsDbPortraits: false"), "live portrait API must stay disabled");
  assert(featuresSource.includes("maxMapIndex: 7"), "eight-host-city cap must remain enabled");
});

runTest("RC-004 document title is football-native", () => {
  const titleMatch = htmlSource.match(/<title>([^<]+)<\/title>/);
  assert(titleMatch, "index.html should define a title");
  const title = titleMatch[1];
  for (const term of PROHIBITED_FOOTBALL_TERMS) {
    assert(!title.includes(term), `document title must not include ${term}`);
  }
  assert(title.includes("Road to Glory") || title.includes("World Cup"), "document title should be football-branded");
});

runTest("RC-004 football-active surfaces avoid forbidden terminology", () => {
  for (const block of FOOTBALL_SURFACE_BLOCKS) {
    for (const term of PROHIBITED_FOOTBALL_TERMS) {
      assert(!block.includes(term), `football surface block should not include ${term}`);
    }
  }
});

runTest("RC-004 GAME_THEME collection label is football-native", () => {
  assert(dataSource.includes('collectionLabel: "World Cup Album"'), "GAME_THEME collection label should be World Cup Album");
});

runTest("RC-004 tracked identity blockers remain documented", () => {
  for (const blockerId of ["RC-B01", "RC-B03", "RC-B07", "RC-B13", "RC-B16"]) {
    assert(identityAudit.includes(blockerId), `identity audit should track ${blockerId}`);
  }
});

runTest("RC-007 index.html static fallbacks are football-native", () => {
  assert(!htmlSource.includes("Pokemon Roguelike"), "index subtitle fallback should not say Pokemon Roguelike");
  assert(!htmlSource.includes(">POKELIKE<"), "index logo fallback should not say POKELIKE");
  assert(htmlSource.includes("World Cup Album"), "index should use World Cup Album label");
  assert(htmlSource.includes("Marquee Signing"), "starter fallback should be Marquee Signing");
  assert(htmlSource.includes("Friendly Match"), "battle title fallback should be Friendly Match");
  assert(htmlSource.includes("City Stamp earned"), "stamp ceremony fallback should be football-native");
  assert(htmlSource.includes("CITY STAMPS"), "map HUD should say CITY STAMPS");
  assert(htmlSource.includes('class="football-boot"'), "html should default to football-boot to hide classic controls");
  assert(!htmlSource.includes("Pokémon"), "index.html should not contain Pokémon in player-visible markup");
});

runTest("RC-010 GAME_THEME battle copy is football-native", () => {
  assert(dataSource.includes("rivalChallengeTitle"), "GAME_THEME should define rival challenge title");
  assert(dataSource.includes("friendlyMatchTitle"), "GAME_THEME should define friendly match title");
  assert(!dataSource.match(/rivalChallengeTitle:\s*"[^"]*Pokémon/), "rival challenge title must not mention Pokémon");
});

runTest("RC-010 trainer battle uses football NPC builder", () => {
  assert(gameSource.includes("function buildFootballNpcTeam"), "game.js should build football NPC teams");
  assert(gameSource.includes("getRivalNationalTeamBattleCopy"), "trainer battles should use football-native copy");
});

const failed = results.filter(result => result.status === "FAIL");
for (const result of results) {
  if (result.status === "PASS") {
    console.log(`PASS ${result.name}`);
  } else {
    console.error(`FAIL ${result.name}`);
    console.error(result.error?.message ?? result.error);
  }
}

if (failed.length) {
  process.exitCode = 1;
  console.error(`${failed.length} identity cleanup checks failed.`);
} else {
  console.log(`${results.length} identity cleanup checks passed.`);
}
