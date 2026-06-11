#!/usr/bin/env node
/** Sync portrait_manifest + player_asset_manifest for profiles with on-disk portrait.svg */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/football/player_profiles.json"), "utf8"));
const portraitManifest = JSON.parse(fs.readFileSync(path.join(root, "data/football/portrait_manifest.json"), "utf8"));
const playerManifest = JSON.parse(fs.readFileSync(path.join(root, "data/football/player_asset_manifest.json"), "utf8"));

const profileIds = process.argv.slice(2).map(Number).filter(n => Number.isInteger(n));
const targets = profileIds.length
  ? catalog.profiles.filter(p => profileIds.includes(p.profileId))
  : catalog.profiles;

let synced = 0;
for (const profile of targets) {
  const id = String(profile.profileId);
  const portraitPath = `assets/players/${profile.slug}/portrait.svg`;
  if (!fs.existsSync(path.join(root, portraitPath))) continue;

  portraitManifest.players[id] = {
    ...portraitManifest.players[id],
    assetTier: "T1",
    portrait: portraitPath
  };

  const entry = playerManifest.players[id];
  if (entry) {
    entry.assetTier = "T1";
    entry.paths.portrait = portraitPath;
    entry.paths.album = `assets/players/${profile.slug}/album.svg`;
    entry.paths.battle = `assets/players/${profile.slug}/battle.svg`;
    entry.paths.squad = `assets/players/${profile.slug}/squad.svg`;
  }
  synced++;
}

fs.writeFileSync(path.join(root, "data/football/portrait_manifest.json"), `${JSON.stringify(portraitManifest, null, 2)}\n`);
fs.writeFileSync(path.join(root, "data/football/player_asset_manifest.json"), `${JSON.stringify(playerManifest, null, 2)}\n`);
console.log(`Synced ${synced} profile(s) to T1 portrait paths.`);
