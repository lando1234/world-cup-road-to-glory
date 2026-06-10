#!/usr/bin/env node
/**
 * Regenerates data/football/thesportsdb_portraits.json from TheSportsDB.
 *
 * Usage:
 *   node scripts/sync-thesportsdb-portraits.mjs
 *   THESPORTSDB_API_KEY=your_premium_key node scripts/sync-thesportsdb-portraits.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../data/football/thesportsdb_portraits.json");
const API_KEY = process.env.THESPORTSDB_API_KEY || "123";
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

/** profileId -> search term (free tier returns one hit per query) */
const SEARCHES = [
  [1, "Mbappe"],
  [2, "Messi"],
  [3, "Virgil van Dijk"],
  [4, "Erling Haaland"],
  [6, "Luka Modric"],
  [7, "Mohamed Salah"],
  [9, "Rodri"],
  [10, "Jude Bellingham"],
  [12, "Pedri Gonzalez"],
  [14, "N'Golo Kante"],
  [15, "Sergio Ramos"],
  [16, "Manuel Neuer"],
  [17, "Alisson Becker"],
  [18, "Marcelo"],
  [22, "Cafu"],
  [26, "Franz Beckenbauer"],
  [28, "Arjen Robben"],
  [29, "Casemiro"],
  [30, "Toni Kroos"],
  [31, "Takefusa Kubo"]
];

/** Manual overrides when search is ambiguous or wrong */
const OVERRIDES = {
  9: { portrait: null, missingReason: "Not indexed reliably on free-tier search; set idPlayer manually." },
  12: { idPlayer: "34172243", search: "Pedri Gonzalez", displayName: "Pedri" }
};

/** Known TheSportsDB idPlayer values — lookup returns fanart fields; search does not */
const PLAYER_IDS = Object.freeze({
  1: "34162098",
  2: "34146370",
  3: "34147021",
  4: "34169116",
  6: "34146306",
  7: "34145506",
  10: "34171882",
  12: "34172243",
  14: "34152545",
  15: "34146294",
  16: "34146681",
  17: "34163551",
  18: "34146296",
  22: "34161121",
  26: "34163558",
  28: "34146695",
  29: "34146573",
  30: "34146290",
  31: "34170278"
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url);
    if (response.status === 429 && attempt < retries) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (!response.ok) throw new Error(`request failed (${response.status}) for ${url}`);
    return response.json();
  }
  throw new Error(`request failed after retries for ${url}`);
}

async function searchPlayer(query) {
  const url = `${BASE}/searchplayers.php?p=${encodeURIComponent(query)}`;
  const json = await fetchJson(url);
  return json.player?.[0] || null;
}

async function lookupPlayer(idPlayer) {
  const url = `${BASE}/lookupplayer.php?id=${encodeURIComponent(idPlayer)}`;
  const json = await fetchJson(url);
  return json.players?.[0] || null;
}

function toEntry(player, search) {
  if (!player) {
    return { search, portrait: null, missingReason: "not found" };
  }

  const fanart = [1, 2, 3, 4].map(index => player[`strFanart${index}`] || null);
  const primaryFanart = fanart.find(Boolean) || null;

  return {
    idPlayer: player.idPlayer,
    search,
    displayName: player.strPlayer,
    portraitStyle: "cutout",
    portrait: player.strCutout || player.strThumb || primaryFanart || null,
    fanart1: fanart[0],
    fanart2: fanart[1],
    fanart3: fanart[2],
    fanart4: fanart[3],
    cutout: player.strCutout || null,
    thumb: player.strThumb || null
  };
}

async function resolvePlayer(profileId, query) {
  const override = OVERRIDES[profileId];
  if (override && !override.idPlayer && !PLAYER_IDS[profileId]) {
    return { search: query, ...override };
  }

  const idPlayer = override?.idPlayer || PLAYER_IDS[profileId];
  if (!idPlayer) {
    return toEntry(null, query);
  }

  const player = await lookupPlayer(idPlayer);
  const entry = toEntry(player, override?.search || query);
  if (override?.displayName) entry.displayName = override.displayName;
  if (override?.missingReason) entry.missingReason = override.missingReason;
  return entry;
}

async function main() {
  const players = {};
  for (const [profileId, query] of SEARCHES) {
    await sleep(700);
    const entry = await resolvePlayer(Number(profileId), query);
    players[String(profileId)] = entry;
    const label = entry.fanart1 ? "fanart" : entry.portrait ? "fallback" : "missing";
    console.log(profileId, entry.displayName || query, label);
  }

  const payload = {
    schemaVersion: 2,
    portraitStyle: "cutout",
    source: "https://www.thesportsdb.com/free_sports_api",
    apiKeyUsed: API_KEY,
    generatedAt: new Date().toISOString().slice(0, 10),
    notes: [
      "Primary portrait uses strFanart1 with fanart2–4, cutout, and thumb as fallbacks.",
      "Free tier search returns one player per query; ambiguous names need manual idPlayer overrides in OVERRIDES.",
      "Regenerate with: node scripts/sync-thesportsdb-portraits.mjs"
    ],
    players
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${OUT_PATH}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
