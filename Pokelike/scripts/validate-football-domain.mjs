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
  const context = {
    console,
    window,
    document: {
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
  return vm.createContext(context);
}

function runScript(context, relativePath) {
  const source = readText(relativePath);
  vm.runInContext(source, context, { filename: relativePath });
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

function getScriptOrder() {
  const html = readText("index.html");
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
}

const context = createBrowserLikeContext();
runScript(context, "js/domain/features.js");
runScript(context, "js/domain/styles.js");
runScript(context, "js/domain/profiles.js");
runScript(context, "js/domain/combat-adapter.js");

const catalogJson = readJson("data/football/player_profiles.json");
const catalog = context.window.DomainProfiles.loadCatalog(catalogJson);

runTest("script load order keeps football domain before data.js", () => {
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

runTest("feature gates default to football slice mode", () => {
  const features = context.window.FEATURES;
  assert(features.footballMode === true, "FEATURES.footballMode must be true");
  assert(features.sliceMode === true, "FEATURES.sliceMode must be true");
  assert(features.maxMapIndex === 2, "FEATURES.maxMapIndex must be 2 for Phase 1");
  assert(features.cloudSave === false, "FEATURES.cloudSave must be false for Phase 1");
});

runTest("style chart exposes 18 complete football styles", () => {
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

runTest("player catalog validates Phase 1 roster", () => {
  assert(catalog.profiles.length === 20, `expected 20 profiles, received ${catalog.profiles.length}`);
  for (const starterId of [1, 2, 3]) {
    const profile = context.window.DomainProfiles.getProfile(starterId);
    assert(profile, `missing starter profile ${starterId}`);
    assert(profile.flags.isMarquee === true, `starter profile ${starterId} must be marquee`);
  }
  assert(context.window.DomainProfiles.getProfile(2).commonName === "Messi", "profileId 2 must be Messi");
});

runTest("combat adapter creates browser-compatible football instances", () => {
  const instance = context.window.DomainCombatAdapter.createPlayerInstance(2, 5, { moveTier: 1 });
  assert(instance.profileId === 2, "instance.profileId must be 2");
  assert(instance.speciesId === 2, "legacy speciesId bridge must remain profileId");
  assert(instance.name.includes("Messi"), "instance name should use profile displayName");
  assert(instance.currentHp === instance.maxHp, "fresh instance must start at max HP");
  assert(Array.isArray(instance.types) && instance.types.length > 0, "instance must expose legacy battle types");
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
