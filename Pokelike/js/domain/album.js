/**
 * @module domain/album
 * Album persistence domain module for the World Cup vertical slice.
 *
 * Owns the compact account-level sticker state stored in localStorage.
 */
const ALBUM_STORAGE_KEY = "game_album";
const ALBUM_LAYOUT_URL = "data/football/album_layout.json";
const PHASE_1_ALBUM_PAGE_IDS = Object.freeze(["marquee", "favorites", "host_city", "knockout", "legends"]);
const PHASE_1_ALBUM_PROFILE_IDS = Object.freeze([1, 2, 3, 4, 6, 7, 9, 10, 12, 14, 15, 17, 18, 28, 29, 30, 31, 32, 33, 34, 35, 36]);

let albumLayout = null;
let albumLayoutPromise = null;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeProfileId(profileId) {
  if (typeof profileId === "number" && Number.isInteger(profileId)) return profileId;
  if (typeof profileId === "string" && profileId.trim() !== "") {
    const numericId = Number(profileId);
    if (Number.isInteger(numericId)) return numericId;
  }
  throw new Error(`Invalid album profileId: ${profileId}`);
}

function hasLoadedProfileCatalog() {
  try {
    return Boolean(window.DomainProfiles?.getAllProfiles?.());
  } catch (_) {
    return false;
  }
}

function getProfileOrNull(profileId) {
  if (!hasLoadedProfileCatalog()) return null;
  return window.DomainProfiles.getProfile(profileId);
}

function assertValidAlbumProfileId(profileId) {
  const normalizedProfileId = normalizeProfileId(profileId);
  const profile = getProfileOrNull(normalizedProfileId);

  if (hasLoadedProfileCatalog() && !profile) {
    throw new Error(`Unknown album profileId: ${profileId}`);
  }

  return normalizedProfileId;
}

function getSliceAlbumProfileIds() {
  if (!hasLoadedProfileCatalog()) return [...PHASE_1_ALBUM_PROFILE_IDS];

  return window.DomainProfiles.getAllProfiles()
    .filter(profile => PHASE_1_ALBUM_PAGE_IDS.includes(profile.album?.pageId))
    .map(profile => profile.profileId);
}

function freezeAlbumLayout(rawLayout) {
  const pages = rawLayout.pages.map(page => Object.freeze({
    ...page,
    slots: Object.freeze(page.slots.map(slot => Object.freeze({ ...slot })))
  }));

  return Object.freeze({
    ...rawLayout,
    pages: Object.freeze(pages),
    deferredPages: Object.freeze([...(rawLayout.deferredPages || [])])
  });
}

function loadAlbumLayout(rawLayout) {
  if (!isPlainObject(rawLayout)) {
    throw new Error("Album layout must be an object.");
  }
  if (!Array.isArray(rawLayout.pages) || rawLayout.pages.length === 0) {
    throw new Error("Album layout must define at least one page.");
  }

  const seenPageIds = new Set();
  for (const page of rawLayout.pages) {
    if (!isPlainObject(page) || typeof page.pageId !== "string" || page.pageId.trim() === "") {
      throw new Error("Album layout pageId must be a non-empty string.");
    }
    if (seenPageIds.has(page.pageId)) {
      throw new Error(`Duplicate album pageId: ${page.pageId}`);
    }
    seenPageIds.add(page.pageId);

    if (!Array.isArray(page.slots) || page.slots.length === 0) {
      throw new Error(`Album page ${page.pageId} must define slots.`);
    }

    page.slots.forEach((slot, index) => {
      const expectedSlot = index + 1;
      if (!isPlainObject(slot) || slot.slot !== expectedSlot) {
        throw new Error(`Album page ${page.pageId} slot ${expectedSlot} is not contiguous.`);
      }
      const profileId = assertValidAlbumProfileId(slot.profileId);
      const profile = getProfileOrNull(profileId);
      const dualLegendPlacement = page.pageId === "legends" && [42, 43].includes(profileId) && profile?.album?.pageId === "knockout";
      if (profile && !dualLegendPlacement && (profile.album?.pageId !== page.pageId || profile.album?.slot !== slot.slot)) {
        throw new Error(`Album slot mismatch for profileId ${profileId} on page ${page.pageId}.`);
      }
    });
  }

  albumLayout = freezeAlbumLayout(rawLayout);
  return albumLayout;
}

async function initAlbumLayout() {
  if (albumLayout) return albumLayout;
  if (albumLayoutPromise) return albumLayoutPromise;

  albumLayoutPromise = fetch(ALBUM_LAYOUT_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${ALBUM_LAYOUT_URL}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(loadAlbumLayout)
    .catch(error => {
      albumLayoutPromise = null;
      throw error;
    });

  return albumLayoutPromise;
}

function getAlbumLayoutConfig() {
  return albumLayout;
}

function getAlbumLayout() {
  return albumLayout?.pages || Object.freeze([]);
}

function readAlbumMeta() {
  try {
    const raw = localStorage.getItem("game_album_meta");
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function isPageUnlocked(page, meta = readAlbumMeta()) {
  if (!page?.hiddenUntil) return true;
  if (page.hiddenUntil === "knockout_enable") return Boolean(meta.knockoutPageUnlocked);
  if (page.hiddenUntil === "legends_enable") return Boolean(meta.legendsPageUnlocked);
  if (page.hiddenUntil === "expansion_enable") return true;
  return true;
}

function getVisiblePages(meta = readAlbumMeta()) {
  return Object.freeze(getAlbumLayout().filter(page => isPageUnlocked(page, meta)));
}

function getSlotProfileIds(pageId) {
  const page = getAlbumLayout().find(candidate => candidate.pageId === pageId);
  if (!page) return Object.freeze([]);
  return Object.freeze(page.slots.map(slot => slot.profileId));
}

function readStoredAlbum() {
  let parsed = {};

  try {
    parsed = JSON.parse(localStorage.getItem(ALBUM_STORAGE_KEY) || "{}");
  } catch (_) {
    parsed = {};
  }

  if (!isPlainObject(parsed)) return {};

  const album = {};
  for (const [profileId, state] of Object.entries(parsed)) {
    if (state === 0 || state === 1) {
      try {
        album[String(normalizeProfileId(profileId))] = state;
      } catch (_) {}
    }
  }

  return album;
}

function writeStoredAlbum(album) {
  localStorage.setItem(ALBUM_STORAGE_KEY, JSON.stringify(album));
}

function getAlbum() {
  return Object.freeze({ ...readStoredAlbum() });
}

function getEntryState(profileId) {
  const normalizedProfileId = assertValidAlbumProfileId(profileId);
  const album = readStoredAlbum();
  const state = album[String(normalizedProfileId)];

  if (state === 1) return "signed";
  if (state === 0) return "seen";
  return "unknown";
}

function markAlbumSeen(profileId) {
  const normalizedProfileId = assertValidAlbumProfileId(profileId);
  const key = String(normalizedProfileId);
  const album = readStoredAlbum();

  if (album[key] === 1) return Object.freeze({ ...album });
  if (album[key] !== 0) {
    album[key] = 0;
    writeStoredAlbum(album);
  }

  return Object.freeze({ ...album });
}

function markAlbumSigned(profileId) {
  const normalizedProfileId = assertValidAlbumProfileId(profileId);
  const key = String(normalizedProfileId);
  const album = readStoredAlbum();

  if (album[key] !== 1) {
    album[key] = 1;
    writeStoredAlbum(album);
  }

  return Object.freeze({ ...album });
}

function countSigned(profileIds = getSliceAlbumProfileIds()) {
  const album = readStoredAlbum();
  return profileIds
    .map(normalizeProfileId)
    .filter(profileId => album[String(profileId)] === 1)
    .length;
}

const DomainAlbum = Object.freeze({
  ALBUM_STORAGE_KEY,
  ALBUM_LAYOUT_URL,
  initAlbumLayout,
  initCatalog: initAlbumLayout,
  loadAlbumLayout,
  getAlbumLayoutConfig,
  getAlbumLayout,
  getSlotProfileIds,
  getAlbum,
  getEntryState,
  markAlbumSeen,
  markAlbumSigned,
  countSigned,
  getSliceAlbumProfileIds,
  readAlbumMeta,
  isPageUnlocked,
  getVisiblePages
});

window.DomainAlbum = DomainAlbum;
