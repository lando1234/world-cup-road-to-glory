import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
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

function createBrowserLikeContext() {
  const storage = new Map();
  const window = {};
  let rngSeed = 0x12345678;
  const context = {
    console,
    window,
    AbortController,
    setTimeout,
    clearTimeout,
    rng() {
      rngSeed = (rngSeed + 0x6D2B79F5) | 0;
      let t = Math.imul(rngSeed ^ (rngSeed >>> 15), 1 | rngSeed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    document: {
      __pokeVisibilityHooked: false,
      visibilityState: "visible",
      addEventListener() {},
      querySelectorAll() {
        return [];
      },
      getElementById() {
        return null;
      }
    },
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        storage.set(key, String(value));
      },
      removeItem(key) {
        storage.delete(key);
      }
    }
  };
  window.window = window;
  window.console = console;
  window.document = context.document;
  window.localStorage = context.localStorage;
  window.FEATURES = undefined;
  return vm.createContext(context);
}

function runScript(context, relativePath) {
  const source = readText(relativePath);
  vm.runInContext(source, context, { filename: relativePath });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runTest(name, fn) {
  try {
    await fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    results.push({ name, status: "FAIL", error });
  }
}

function getScriptOrder() {
  const html = readText("index.html");
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
}

const context = createBrowserLikeContext();
runScript(context, "js/domain/features.js");
runScript(context, "js/domain/styles.js");
runScript(context, "js/domain/profiles.js");
runScript(context, "js/domain/bosses.js");
runScript(context, "js/domain/combat-adapter.js");

context.window.GAME_THEME = {
  node: {
    scoutReport: "Scout Report",
    friendlyMatch: "Friendly Match",
    recoveryCenter: "Recovery Center",
    gearCrate: "Gear Crate",
    rivalNationalTeam: "Rival National Team",
    hostCityChallenge: "Host City Challenge"
  }
};
context.TRAINER_SPRITE_KEYS = ["aceTrainer", "fisher"];
context.GEN2_ONLY_TRAINER_KEYS = new Set();
context.GEN1_ONLY_TRAINER_KEYS = new Set();
context.TRAINER_SPRITE_NAMES = {};
context.TRAINER_SPECIALTIES = {};
context.TRAINER_SPECIALTIES_GEN2 = {};
runScript(context, "js/map.js");
runScript(context, "js/cloud-save.js");

const catalogJson = readJson("data/football/player_profiles.json");
const catalog = context.window.DomainProfiles.loadCatalog(catalogJson);
const hostCityBossesJson = readJson("data/football/host_city_bosses.json");
const hostCityBossCatalog = context.window.DomainBosses.loadHostCityBosses(hostCityBossesJson);

await runTest("script load order keeps football domain before data.js", () => {
  const expected = [
    "js/domain/features.js",
    "js/domain/styles.js",
    "js/domain/portrait-source.js",
    "js/domain/profiles.js",
    "js/domain/album.js",
    "js/domain/bosses.js",
    "js/domain/combat-adapter.js",
    "js/domain/save.js",
    "js/domain/recruit.js",
    "js/data.js"
  ];
  const actual = getScriptOrder();
  const firstDataIndex = actual.indexOf("js/data.js");
  assert(firstDataIndex !== -1, "index.html must load js/data.js");
  for (const script of expected) {
    assert(actual.includes(script), `index.html missing ${script}`);
    assert(actual.indexOf(script) <= firstDataIndex, `${script} must load before or at js/data.js`);
  }
});

await runTest("feature gates default to football slice mode", () => {
  const features = context.window.FEATURES;
  assert(features.footballMode === true, "FEATURES.footballMode must be true");
  assert(features.sliceMode === true, "FEATURES.sliceMode must be true");
  assert(features.maxMapIndex === 2, "FEATURES.maxMapIndex must be 2 for Phase 1");
  assert(features.cloudSave === false, "FEATURES.cloudSave must be false for Phase 1");
});

await runTest("style chart exposes 18 complete football styles", () => {
  const { STYLE_IDS, STYLE_CHART, STYLE_LABELS } = context.window.DomainStyles;
  assert(STYLE_IDS.length === 18, `expected 18 styles, received ${STYLE_IDS.length}`);
  for (const attackStyle of STYLE_IDS) {
    assert(STYLE_LABELS[attackStyle], `missing label for ${attackStyle}`);
    const row = STYLE_CHART[attackStyle];
    assert(row, `missing STYLE_CHART row for ${attackStyle}`);
    for (const defendStyle of STYLE_IDS) {
      assert(typeof row[defendStyle] === "number", `missing matchup ${attackStyle} vs ${defendStyle}`);
    }
  }
});

await runTest("player catalog validates Phase 1 roster", () => {
  assert(catalog.profiles.length === 20, `expected 20 profiles, received ${catalog.profiles.length}`);
  for (const starterId of [1, 2, 3]) {
    const profile = context.window.DomainProfiles.getProfile(starterId);
    assert(profile, `missing starter profile ${starterId}`);
    assert(profile.flags.isMarquee === true, `starter profile ${starterId} must be marquee`);
  }
  assert(context.window.DomainProfiles.getProfile(2).commonName === "Messi", "profileId 2 must be Messi");
});

await runTest("combat adapter creates browser-compatible football instances", () => {
  const instance = context.window.DomainCombatAdapter.createPlayerInstance(2, 5, { moveTier: 1 });
  assert(instance.profileId === 2, "instance.profileId must be 2");
  assert(instance.speciesId === 2, "legacy speciesId bridge must remain profileId");
  assert(instance.name.includes("Messi"), "instance name should use profile displayName");
  assert(instance.currentHp === instance.maxHp, "fresh instance must start at max HP");
  assert(Array.isArray(instance.types) && instance.types.length > 0, "instance must expose legacy battle types");
});

await runTest("host city boss catalog validates Phase 1 maps", () => {
  assert(hostCityBossCatalog.bosses.length === 3, `expected 3 host city bosses, received ${hostCityBossCatalog.bosses.length}`);
  const expected = [
    { mapIndex: 0, hostCity: "S\u00e3o Paulo", stampId: "stamp_sao_paulo", profileIds: [29, 22, 17], levels: [14, 12, 13], tiers: [0, 0, 0] },
    { mapIndex: 1, hostCity: "Berlin", stampId: "stamp_berlin", profileIds: [30, 16, 26], levels: [20, 18, 19], tiers: [1, 1, 1] },
    { mapIndex: 2, hostCity: "Tokyo", stampId: "stamp_tokyo", profileIds: [31, 28, 7], levels: [25, 23, 24], tiers: [1, 1, 1] }
  ];

  for (const bossSpec of expected) {
    const boss = context.window.DomainBosses.getHostCity(bossSpec.mapIndex);
    assert(boss, `missing boss for mapIndex ${bossSpec.mapIndex}`);
    assert(boss.hostCity === bossSpec.hostCity, `mapIndex ${bossSpec.mapIndex} hostCity mismatch`);
    assert(boss.stamp.id === bossSpec.stampId, `mapIndex ${bossSpec.mapIndex} stamp mismatch`);
    assert(boss.roster.map(slot => slot.profileId).join(",") === bossSpec.profileIds.join(","), `mapIndex ${bossSpec.mapIndex} roster ids mismatch`);
    assert(boss.roster.map(slot => slot.formLevel).join(",") === bossSpec.levels.join(","), `mapIndex ${bossSpec.mapIndex} roster levels mismatch`);
    assert(boss.roster.map(slot => slot.skillTier).join(",") === bossSpec.tiers.join(","), `mapIndex ${bossSpec.mapIndex} skill tiers mismatch`);
  }

  assert(context.window.DomainBosses.getHostCity(3) === null, "maxMapIndex gate should hide mapIndex 3");
});

await runTest("host city boss teams build battle-ready instances", () => {
  const berlin = context.window.DomainBosses.getHostCity(1);
  const team = context.window.DomainBosses.buildBossTeam(berlin);

  assert(team.length === 3, `expected 3 boss team members, received ${team.length}`);
  assert(team.map(player => player.profileId).join(",") === "30,16,26", "Berlin boss team profile ids mismatch");
  assert(team.map(player => player.level).join(",") === "20,18,19", "Berlin boss team levels mismatch");

  for (const member of team) {
    assert(member.currentHp === member.maxHp, `${member.name} should start at max HP`);
    assert(member.skillTier === 1, `${member.name} should preserve boss skillTier`);
    assert(member.moveTier === 1, `${member.name} should pass skillTier to combat moveTier`);
    assert(typeof member.bossRole === "string" && member.bossRole.length > 0, `${member.name} should preserve boss role`);
  }
});

await runTest("football slice gates trade and legendary map nodes", () => {
  const gated = context.applyFootballSliceNodeGates({
    battle: 1,
    catch: 1,
    trade: 99,
    legendary: 99
  });
  assert(gated.trade === 0, "football slice must set trade weight to 0");
  assert(gated.legendary === 0, "football slice must set legendary weight to 0");

  for (let mapIndex = 0; mapIndex <= 7; mapIndex += 1) {
    const map = context.generateMap(mapIndex, false, false);
    const nodeTypes = Object.values(map.nodes).map(node => node.type);
    assert(!nodeTypes.includes("trade"), `map ${mapIndex} should not include trade nodes in football slice`);
    assert(!nodeTypes.includes("legendary"), `map ${mapIndex} should not include legendary nodes in football slice`);
  }
});

await runTest("football map labels use football terminology", () => {
  assert(context.getNodeLabel({ type: "catch" }) === "Scout Report", "catch node should display Scout Report");
  assert(context.getNodeLabel({ type: "pokecenter" }) === "Recovery Center", "pokecenter node should display Recovery Center");
  assert(context.getNodeLabel({ type: "boss" }) === "Host City Challenge", "boss node should display Host City Challenge");
});

await runTest("cloud save is disabled by football feature gate", async () => {
  assert(context.isCloudSaveEnabled() === false, "cloud save should be disabled when FEATURES.cloudSave is false");
  const result = await context.initCloudSave();
  assert(result === false, "initCloudSave should no-op and return false when disabled");
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
  console.error(`\n${failed.length}/${results.length} football domain validation checks failed.`);
  process.exit(1);
}

console.log(`\n${results.length} football domain validation checks passed.`);
