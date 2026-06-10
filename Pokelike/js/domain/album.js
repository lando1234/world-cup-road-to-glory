/**
 * @module domain/album
 * Album persistence domain module for the World Cup vertical slice.
 *
 * Owns the compact account-level sticker state stored in localStorage.
 */
const ALBUM_STORAGE_KEY = "game_album";
const PHASE_1_ALBUM_PAGE_IDS = Object.freeze(["marquee", "favorites"]);
const PHASE_1_ALBUM_PROFILE_IDS = Object.freeze([1, 2, 3, 4, 6, 7, 9, 10, 12, 14, 15, 17, 18, 28]);

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
  getAlbum,
  getEntryState,
  markAlbumSeen,
  markAlbumSigned,
  countSigned,
  getSliceAlbumProfileIds
});

window.DomainAlbum = DomainAlbum;
