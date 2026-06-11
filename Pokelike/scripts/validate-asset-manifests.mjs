import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const results = [];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), "utf8"));
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

function collectPathStrings(value, bucket = []) {
  if (typeof value === "string") {
    if (value.startsWith("assets/") || value.startsWith("ui/")) bucket.push(value);
    return bucket;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPathStrings(item, bucket);
    return bucket;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectPathStrings(item, bucket);
  }
  return bucket;
}

function assertNoRemoteUrls(manifestName, manifest) {
  const json = JSON.stringify(manifest);
  assert(!json.includes("http://"), `${manifestName} must not include http URLs`);
  assert(!json.includes("https://"), `${manifestName} must not include https URLs`);
  assert(!json.includes("pokeapi"), `${manifestName} must not reference PokeAPI`);
  assert(!json.includes("pokemonshowdown"), `${manifestName} must not reference Showdown CDN`);
}

const catalog = readJson("data/football/player_profiles.json");
const playerManifest = readJson("data/football/player_asset_manifest.json");
const nodeManifest = readJson("data/football/node_asset_manifest.json");
const stampManifest = readJson("data/football/stamp_asset_manifest.json");
const uiManifest = readJson("data/football/ui_asset_manifest.json");

runTest("RC-005 player asset manifest schema", () => {
  assert(playerManifest.schemaVersion === 1, "player manifest schemaVersion must be 1");
  assert(playerManifest.remoteRuntimeDependency === false, "player manifest must be local-only");
  assert(playerManifest.formLabels?.forbidden?.includes("evolution"), "player manifest should forbid evolution label");
  assertNoRemoteUrls("player_asset_manifest", playerManifest);
  const ids = Object.keys(playerManifest.players ?? {});
  assert(ids.length === catalog.profiles.length, `player manifest should cover all catalog profiles (${catalog.profiles.length})`);
  for (const profile of catalog.profiles) {
    const entry = playerManifest.players[String(profile.profileId)];
    assert(entry, `player manifest missing profile ${profile.profileId}`);
    assert(entry.slug === profile.slug, `profile ${profile.profileId} slug mismatch`);
    assert(entry.fallback, `profile ${profile.profileId} must define fallback`);
    assert(entry.paths?.album?.includes(profile.slug), `profile ${profile.profileId} album path should use slug folder`);
  }
});

runTest("RC-005 node asset manifest schema", () => {
  assert(nodeManifest.schemaVersion === 1, "node manifest schemaVersion must be 1");
  assertNoRemoteUrls("node_asset_manifest", nodeManifest);
  const required = ["catch", "battle", "boss", "pokecenter", "item", "trainer"];
  for (const key of required) {
    assert(nodeManifest.nodes?.[key], `node manifest missing ${key}`);
    assert(nodeManifest.nodes[key].paths?.icon, `node ${key} must define icon path`);
    assert(nodeManifest.nodes[key].label, `node ${key} must define football label`);
  }
});

runTest("RC-050 football node icon SVGs exist on disk", () => {
  const footballKeys = [
    "start", "catch", "battle", "trainer", "pokecenter", "item",
    "move_tutor", "question", "boss", "rest_site", "final_locked"
  ];
  for (const key of footballKeys) {
    const iconPath = nodeManifest.nodes?.[key]?.paths?.icon;
    assert(iconPath, `node ${key} must define icon path`);
    assert(fs.existsSync(path.join(projectRoot, iconPath)), `missing node icon: ${iconPath}`);
  }
});

runTest("RC-005 stamp asset manifest references existing SVGs", () => {
  assert(stampManifest.schemaVersion === 1, "stamp manifest schemaVersion must be 1");
  assert(stampManifest.releaseCritical === true, "stamp manifest should be release critical");
  assertNoRemoteUrls("stamp_asset_manifest", stampManifest);
  const stampIds = Object.keys(stampManifest.stamps ?? {});
  assert(stampIds.length === 8, "stamp manifest should define eight host city stamps");
  for (const stamp of Object.values(stampManifest.stamps)) {
    const unsigned = stamp.paths?.unsigned;
    assert(unsigned, "each stamp must define unsigned path");
    assert(fs.existsSync(path.join(projectRoot, unsigned)), `missing stamp asset: ${unsigned}`);
  }
});

runTest("RC-005 ui asset manifest schema and fallbacks", () => {
  assert(uiManifest.schemaVersion === 1, "ui manifest schemaVersion must be 1");
  assertNoRemoteUrls("ui_asset_manifest", uiManifest);
  assert(uiManifest.ui?.collectionButton?.fallback, "collection button must define fallback");
  assert(uiManifest.ui?.album?.slotUnknown?.paths?.default, "album unknown slot path required");
});

runTest("RC-005 release-critical stamp paths are local", () => {
  const paths = collectPathStrings(stampManifest);
  for (const relativePath of paths) {
    if (!relativePath.includes("campaign-complete")) {
      assert(fs.existsSync(path.join(projectRoot, relativePath)), `stamp path should exist: ${relativePath}`);
    }
  }
});

runTest("RC-005 asset folder scaffold exists", () => {
  for (const dir of ["assets/players", "assets/nodes", "assets/ui"]) {
    assert(fs.existsSync(path.join(projectRoot, dir)), `missing asset directory: ${dir}`);
  }
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
  console.error(`${failed.length} asset manifest checks failed.`);
} else {
  console.log(`${results.length} asset manifest checks passed.`);
}
