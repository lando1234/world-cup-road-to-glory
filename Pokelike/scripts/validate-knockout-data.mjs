import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createContext() {
  const window = {};
  const context = vm.createContext({
    console,
    window,
    document: { getElementById() { return null; } },
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    }
  });
  window.window = window;
  window.console = console;
  window.document = context.document;
  window.localStorage = context.localStorage;
  return context;
}

function runScript(context, relativePath) {
  vm.runInContext(readText(relativePath), context, { filename: relativePath });
}

const context = createContext();
runScript(context, "js/domain/features.js");
runScript(context, "js/domain/styles.js");
runScript(context, "js/domain/profiles.js");
runScript(context, "js/domain/combat-adapter.js");
runScript(context, "js/domain/knockout.js");

const catalogJson = readJson("data/football/player_profiles.json");
const expectedProfileIds = catalogJson.profiles.map(profile => profile.profileId);
context.window.DomainProfiles.loadCatalog(catalogJson, { expectedProfileIds });

const knockoutJson = readJson("data/football/knockout_teams.json");
const economyJson = readJson("data/football/run_economy.json");

const validation = context.window.DomainKnockout.validateKnockoutCatalog(knockoutJson);
assert(validation.valid, `knockout catalog invalid: ${validation.errors.join(" | ")}`);

const loaded = context.window.DomainKnockout.loadKnockoutTeams(knockoutJson);
assert(loaded.gates.length === 5, "knockout catalog must contain 5 gates");

for (const gate of loaded.gates) {
  const team = context.window.DomainKnockout.buildGateTeam(gate);
  assert(team.length === gate.roster.length, `gate ${gate.gateIndex} roster size mismatch`);
  assert(team.every(player => Number.isFinite(player.level) && player.level > 0), `gate ${gate.gateIndex} must expose positive form levels`);
}

assert(economyJson.credits?.wonWorldCupBonus > 0, "run economy must define wonWorldCupBonus");
assert(economyJson.legendFragmentThreshold >= 1, "run economy must define legendFragmentThreshold");

const gameSource = readText("js/game.js");
assert(gameSource.includes("async function enterKnockoutStage"), "game.js must define enterKnockoutStage");
assert(gameSource.includes("async function runKnockoutChain"), "game.js must define runKnockoutChain");
assert(!gameSource.includes("startMap(8)"), "football knockout must not route through startMap(8)");

console.log("PASS knockout data: catalog, economy, and runner wiring");
