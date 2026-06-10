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

const DomainSave = Object.freeze({
  SAVE_SCHEMA_VERSION: DOMAIN_SAVE_SCHEMA_VERSION,
  migrateSaveV2toV3,
  compactLegacyDexToAlbum
});

window.DomainSave = DomainSave;
