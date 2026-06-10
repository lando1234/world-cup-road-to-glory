/**
 * @module domain/portrait-source
 * TheSportsDB portrait integration for football mode.
 *
 * Docs: https://www.thesportsdb.com/free_sports_api
 * Free API key: 123 (or 3). Premium key from your profile replaces it in FEATURES.
 */
const PORTRAIT_MAP_URL = "data/football/thesportsdb_portraits.json";
const DEFAULT_API_KEY = "123";
const DEFAULT_BASE_URL = "https://www.thesportsdb.com/api/v1/json";
const PORTRAIT_STYLES = Object.freeze(["fanart", "cutout"]);

let portraitMap = null;
let portraitMapPromise = null;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizePortraitStyle(style) {
  const normalized = String(style || "fanart").toLowerCase();
  return PORTRAIT_STYLES.includes(normalized) ? normalized : "fanart";
}

function getConfig() {
  const features = window.FEATURES || {};
  return Object.freeze({
    enabled: features.useTheSportsDbPortraits === true,
    apiKey: String(features.theSportsDbApiKey || DEFAULT_API_KEY).trim() || DEFAULT_API_KEY,
    baseUrl: String(features.theSportsDbBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, ""),
    portraitStyle: normalizePortraitStyle(features.theSportsDbPortraitStyle),
    mapUrl: features.theSportsDbPortraitMapUrl || PORTRAIT_MAP_URL
  });
}

function pickFanartUrl(entry) {
  if (!isPlainObject(entry)) return null;
  for (let index = 1; index <= 4; index += 1) {
    const key = `fanart${index}`;
    const url = typeof entry[key] === "string" ? entry[key].trim() : "";
    if (url) return url;
  }
  const legacyPortrait = typeof entry.portrait === "string" ? entry.portrait.trim() : "";
  if (legacyPortrait && /\/player\/fanart\//i.test(legacyPortrait)) return legacyPortrait;
  return null;
}

function pickCutoutUrl(entry) {
  if (!isPlainObject(entry)) return null;
  const cutout = typeof entry.cutout === "string" ? entry.cutout.trim() : "";
  const portrait = typeof entry.portrait === "string" ? entry.portrait.trim() : "";
  const thumb = typeof entry.thumb === "string" ? entry.thumb.trim() : "";
  if (cutout) return cutout;
  if (portrait && /\/player\/cutout\//i.test(portrait)) return portrait;
  if (thumb) return thumb;
  if (portrait) return portrait;
  return null;
}

function pickPortraitUrl(entry, portraitStyle = getConfig().portraitStyle) {
  if (!isPlainObject(entry)) return null;
  if (portraitStyle === "fanart") {
    return pickFanartUrl(entry) || pickCutoutUrl(entry);
  }
  return pickCutoutUrl(entry) || pickFanartUrl(entry);
}

function buildApiUrl(path, apiKey) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getConfig().baseUrl}/${encodeURIComponent(apiKey)}${normalizedPath}`;
}

function playerArtworkFromApi(player) {
  if (!player) return null;
  const fanart = [1, 2, 3, 4].map(index => player[`strFanart${index}`] || null);
  return Object.freeze({
    idPlayer: player.idPlayer,
    displayName: player.strPlayer,
    portraitStyle: "fanart",
    portrait: fanart.find(Boolean) || player.strCutout || player.strThumb || null,
    fanart1: fanart[0],
    fanart2: fanart[1],
    fanart3: fanart[2],
    fanart4: fanart[3],
    cutout: player.strCutout || null,
    thumb: player.strThumb || null
  });
}

async function fetchPortraitMap() {
  const config = getConfig();
  if (!config.enabled) return null;

  if (portraitMap) return portraitMap;
  if (portraitMapPromise) return portraitMapPromise;

  portraitMapPromise = fetch(config.mapUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${config.mapUrl}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(json => {
      if (!isPlainObject(json) || !isPlainObject(json.players)) {
        throw new Error("TheSportsDB portrait map must include a players object.");
      }
      portraitMap = Object.freeze(json);
      return portraitMap;
    })
    .catch(error => {
      portraitMapPromise = null;
      console.warn("[portrait-source] Could not load portrait map:", error.message);
      return null;
    });

  return portraitMapPromise;
}

function getMappedPortraitUrl(profileId, portraitStyle = getConfig().portraitStyle) {
  if (!portraitMap?.players) return null;
  const entry = portraitMap.players[String(profileId)];
  return pickPortraitUrl(entry, portraitStyle);
}

function applyPortraitMapToCatalog(catalog, map) {
  if (!isPlainObject(catalog) || !Array.isArray(catalog.profiles) || !isPlainObject(map?.players)) {
    return catalog;
  }

  const portraitStyle = getConfig().portraitStyle;
  const profiles = catalog.profiles.map(profile => {
    const remoteUrl = pickPortraitUrl(map.players[String(profile.profileId)], portraitStyle);
    if (!remoteUrl) return profile;
    return { ...profile, portrait: remoteUrl };
  });

  return { ...catalog, profiles };
}

async function lookupPlayerById(idPlayer, apiKey = getConfig().apiKey) {
  const url = buildApiUrl(`/lookupplayer.php?id=${encodeURIComponent(idPlayer)}`, apiKey);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TheSportsDB lookup failed (${response.status}) for id ${idPlayer}`);
  }
  const json = await response.json();
  return playerArtworkFromApi(json.players?.[0]);
}

async function searchPlayer(query, apiKey = getConfig().apiKey) {
  const url = buildApiUrl(`/searchplayers.php?p=${encodeURIComponent(query)}`, apiKey);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TheSportsDB search failed (${response.status}) for "${query}"`);
  }
  const json = await response.json();
  return playerArtworkFromApi(json.player?.[0]);
}

function resolvePortraitUrl(profile) {
  if (!profile) return "";
  const mapped = getMappedPortraitUrl(profile.profileId);
  if (mapped) return mapped;
  return profile.portrait || "";
}

function applyPortraitPresentationClass() {
  const style = getConfig().portraitStyle;
  document.documentElement.classList.toggle("football-portraits-fanart", style === "fanart");
  document.documentElement.classList.toggle("football-portraits-cutout", style === "cutout");
}

const DomainPortraitSource = Object.freeze({
  getConfig,
  fetchPortraitMap,
  getMappedPortraitUrl,
  applyPortraitMapToCatalog,
  lookupPlayerById,
  searchPlayer,
  resolvePortraitUrl,
  pickPortraitUrl,
  applyPortraitPresentationClass
});

window.DomainPortraitSource = DomainPortraitSource;
applyPortraitPresentationClass();
