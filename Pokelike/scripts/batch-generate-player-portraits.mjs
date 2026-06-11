#!/usr/bin/env node
/** Generate T1 jersey SVGs for all catalog profiles missing portrait.svg */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/football/player_profiles.json"), "utf8"));
const generator = path.join(root, "scripts/generate-jersey-portrait.mjs");

let generated = 0;
for (const profile of catalog.profiles) {
  const portraitPath = path.join(root, "assets/players", profile.slug, "portrait.svg");
  if (fs.existsSync(portraitPath)) continue;
  const result = spawnSync(process.execPath, [
    generator,
    profile.slug,
    profile.nation,
    profile.position,
    String(profile.profileId)
  ], { stdio: "inherit" });
  if (result.status === 0) generated++;
}

const sync = spawnSync(process.execPath, [path.join(root, "scripts/sync-portrait-manifest.mjs")], { stdio: "inherit" });
process.exit(sync.status === 0 ? 0 : 1);
