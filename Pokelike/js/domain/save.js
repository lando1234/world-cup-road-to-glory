/**
 * @module domain/save
 * Account and run-save domain module for the World Cup vertical slice.
 *
 * Owns schema-level account migrations. Active run persistence remains in
 * game.js for Phase 1.
 */
const DOMAIN_SAVE_SCHEMA_VERSION = 3;
const LEGACY_DEX_STORAGE_KEY = "poke_dex";
const SAVE_ALBUM_STORAGE_KEY = "game_album";
const SAVE_VERSION_STORAGE_KEY = "saveVersion";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function readSaveVersion() {
  const version = Number(localStorage.getItem(SAVE_VERSION_STORAGE_KEY) || 0);
  return Number.isFinite(version) ? Math.trunc(version) : 0;
}

function normalizeDexState(entry) {
  if (entry === 1 || entry === "1" || entry === true) return 1;
  if (entry === 0 || entry === "0" || entry === false) return 0;
  if (isPlainObject(entry)) return entry.caught ? 1 : 0;
  return null;
}

function normalizeAlbumProfileId(profileId) {
  if (typeof profileId !== "string" && typeof profileId !== "number") return null;
  const numericId = Number(profileId);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;
  return String(numericId);
}

function compactLegacyDexToAlbum(legacyDex) {
  if (!isPlainObject(legacyDex)) return {};

  const album = {};
  for (const [profileId, entry] of Object.entries(legacyDex)) {
    const normalizedProfileId = normalizeAlbumProfileId(profileId);
    const state = normalizeDexState(entry);
    if (normalizedProfileId && (state === 0 || state === 1)) {
      album[normalizedProfileId] = state;
    }
  }

  return album;
}

function migrateSaveV2toV3() {
  const beforeVersion = readSaveVersion();

  if (beforeVersion >= DOMAIN_SAVE_SCHEMA_VERSION) {
    return Object.freeze({
      migrated: false,
      fromVersion: beforeVersion,
      toVersion: DOMAIN_SAVE_SCHEMA_VERSION,
      albumCopied: false
    });
  }

  const hadAlbum = localStorage.getItem(SAVE_ALBUM_STORAGE_KEY) !== null;
  let albumCopied = false;

  if (!hadAlbum) {
    const legacyDex = readJsonStorage(LEGACY_DEX_STORAGE_KEY, {});
    const album = compactLegacyDexToAlbum(legacyDex);
    localStorage.setItem(SAVE_ALBUM_STORAGE_KEY, JSON.stringify(album));
    albumCopied = true;
  }

  localStorage.setItem(SAVE_VERSION_STORAGE_KEY, String(DOMAIN_SAVE_SCHEMA_VERSION));

  return Object.freeze({
    migrated: true,
    fromVersion: beforeVersion,
    toVersion: DOMAIN_SAVE_SCHEMA_VERSION,
    albumCopied
  });
}

function readAlbumState() {
  return readJsonStorage(SAVE_ALBUM_STORAGE_KEY, {});
}

function getProfileName(profileId) {
  try {
    const profile = window.DomainProfiles?.getProfile?.(profileId);
    return profile?.commonName || profile?.displayName || `Profile ${profileId}`;
  } catch (_) {
    return `Profile ${profileId}`;
  }
}

function getScoutCount(ledger = {}) {
  if (Number.isFinite(Number(ledger.scoutCount))) return Number(ledger.scoutCount);
  if (Array.isArray(ledger.scoutReportsSeen)) return ledger.scoutReportsSeen.length;
  return 0;
}

function settleRunLite(runSnapshot = {}, accountState = {}) {
  const currentAlbum = isPlainObject(accountState.album)
    ? { ...accountState.album }
    : readAlbumState();
  const signedProfileIds = Array.isArray(runSnapshot.ledger?.signedProfileIds)
    ? runSnapshot.ledger.signedProfileIds
    : [];

  const albumPatch = { ...currentAlbum };
  for (const profileId of signedProfileIds) {
    const normalizedProfileId = normalizeAlbumProfileId(profileId);
    if (normalizedProfileId) albumPatch[normalizedProfileId] = 1;
  }

  const sliceProfileIds = window.DomainAlbum?.getSliceAlbumProfileIds?.() || [];
  const signedCount = window.DomainAlbum?.countSigned?.(sliceProfileIds) || Object.values(albumPatch).filter(state => state === 1).length;
  const newSignIds = [...new Set(signedProfileIds.map(Number).filter(Number.isInteger))];

  return Object.freeze({
    patch: Object.freeze({
      album: Object.freeze(albumPatch)
    }),
    summary: Object.freeze({
      stampsEarned: Number(runSnapshot.badges || 0),
      newSigns: Object.freeze(newSignIds.map(profileId => Object.freeze({
        profileId,
        name: getProfileName(profileId)
      }))),
      albumSignedCount: signedCount,
      albumTotal: sliceProfileIds.length || Object.keys(albumPatch).length,
      battles: Number(runSnapshot.ledger?.battleCount || 0),
      scouts: getScoutCount(runSnapshot.ledger),
      metaRewardsLabel: "Meta rewards coming soon"
    })
  });
}

function applyAccountPatch(patch = {}) {
  if (!isPlainObject(patch.album)) return false;

  const currentAlbum = readAlbumState();
  const mergedAlbum = { ...currentAlbum };
  let changedCount = 0;

  for (const [profileId, patchState] of Object.entries(patch.album)) {
    const normalizedProfileId = normalizeAlbumProfileId(profileId);
    const normalizedPatchState = patchState === 1 || patchState === "1" || patchState === true ? 1 : 0;
    if (!normalizedProfileId) continue;

    const currentState = mergedAlbum[normalizedProfileId] === 1 ? 1 : 0;
    const nextState = Math.max(currentState, normalizedPatchState);
    if (mergedAlbum[normalizedProfileId] !== nextState) changedCount += 1;
    mergedAlbum[normalizedProfileId] = nextState;
  }

  localStorage.setItem(SAVE_ALBUM_STORAGE_KEY, JSON.stringify(mergedAlbum));
  console.info?.(`[DomainSave] applyAccountPatch wrote ${changedCount} game_album keys.`);
  return true;
}

const DomainSave = Object.freeze({
  SAVE_SCHEMA_VERSION: DOMAIN_SAVE_SCHEMA_VERSION,
  migrateSaveV2toV3,
  compactLegacyDexToAlbum,
  settleRunLite,
  applyAccountPatch
});

window.DomainSave = DomainSave;
