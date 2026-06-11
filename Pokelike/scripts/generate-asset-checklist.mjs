#!/usr/bin/env node
/**
 * Generates docs/asset-checklist.csv from football asset manifests + disk scan.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "asset-checklist.csv");

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function row(cells) {
  return cells.map(csvEscape).join(",");
}

const rows = [
  row(["category", "id", "slug", "asset_type", "tier", "path", "status", "notes"])
];

// Players
const playerManifest = readJson("data/football/player_asset_manifest.json");
const profiles = readJson("data/football/player_profiles.json");
const profileById = Object.fromEntries(profiles.profiles.map(p => [String(p.profileId), p]));

for (const [id, entry] of Object.entries(playerManifest.players)) {
  const profile = profileById[id];
  const slug = entry.slug || profile?.slug || id;
  const tier = entry.assetTier || "T1";
  for (const [assetType, relPath] of Object.entries(entry.paths || {})) {
    rows.push(row([
      "player",
      id,
      slug,
      assetType,
      tier,
      relPath,
      exists(relPath) ? "present" : "missing",
      profile?.displayName || ""
    ]));
  }
}

// Nodes
const nodeManifest = readJson("data/football/node_asset_manifest.json");
for (const [nodeType, entry] of Object.entries(nodeManifest.nodes)) {
  const relPath = entry.paths?.icon;
  if (!relPath) continue;
  rows.push(row([
    "node",
    nodeType,
    entry.label || nodeType,
    "icon",
    "T1",
    relPath,
    exists(relPath) ? "present" : "missing",
    entry.iconCode || ""
  ]));
}

// UI / misc
const uiManifest = readJson("data/football/ui_asset_manifest.json");
function walkUi(prefix, obj) {
  if (!obj || typeof obj !== "object") return;
  if (obj.paths?.default) {
    const relPath = obj.paths.default;
    rows.push(row([
      "ui",
      prefix,
      prefix,
      "asset",
      "T1",
      relPath,
      exists(relPath) ? "present" : "missing",
      ""
    ]));
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    walkUi(prefix ? `${prefix}.${key}` : key, value);
  }
}
walkUi("", uiManifest.ui);

// Stamps
const stampManifestPath = "data/football/stamp_asset_manifest.json";
if (exists(stampManifestPath)) {
  const stampManifest = readJson(stampManifestPath);
  for (const [stampId, entry] of Object.entries(stampManifest.stamps || {})) {
    const relPath = entry.paths?.default || entry.paths?.icon;
    if (!relPath) continue;
    rows.push(row([
      "stamp",
      stampId,
      entry.slug || stampId,
      "icon",
      entry.assetTier || "T1",
      relPath,
      exists(relPath) ? "present" : "missing",
      entry.cityName || ""
    ]));
  }
}

// Backgrounds referenced in code
const mapBackgrounds = [];
for (let i = 1; i <= 8; i += 1) {
  mapBackgrounds.push(`ui/mapsNormalMode/map${i}.png`);
}
mapBackgrounds.push("ui/background.png", "ui/background.jpg");
for (const relPath of mapBackgrounds) {
  rows.push(row([
    "background",
    relPath,
    path.basename(relPath, path.extname(relPath)),
    "image",
    "legacy",
    relPath,
    exists(relPath) ? "present" : "missing",
    "Referenced in legacy map UI; football maps may use CSS theme"
  ]));
}

// Coaches / characters
rows.push(row([
  "coach",
  "player-manager",
  "showdown-trainer-cdn",
  "sprite",
  "legacy",
  "cdn:play.pokemonshowdown.com/sprites/trainers",
  "external",
  "TRAINER_SVG in data.js — replace with local manager portrait"
]));
for (const boss of profiles.profiles.filter(p => p.flags?.isHostCityBoss)) {
  rows.push(row([
    "coach",
    boss.profileId,
    boss.slug,
    "host-city-boss",
    "T1",
    boss.portrait || "",
    boss.portrait && exists(boss.portrait.replace(/^\//, "")) ? "present" : "missing",
    boss.displayName
  ]));
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${rows.join("\n")}\n`, "utf8");
const missing = rows.filter(line => line.includes(",missing,")).length;
const present = rows.filter(line => line.includes(",present,")).length;
console.log(`Wrote ${OUT}`);
console.log(`Rows: ${rows.length - 1} (${present} present, ${missing} missing)`);
