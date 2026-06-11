/**
 * @module domain/profiles
 * Player profile catalog domain module for the World Cup vertical slice.
 *
 * This file owns catalog loading and lookup only. Runtime player instances are
 * created later by the combat adapter task.
 */
const PROFILE_CATALOG_URL = "data/football/player_profiles.json";
const PORTRAIT_MANIFEST_URL = "data/football/portrait_manifest.json";

/** Authoritative catalog order after Phase 3 eight-city expansion (33 profiles). */
const CATALOG_PROFILE_IDS = Object.freeze([
  1, 2, 3, 4, 6, 7, 9, 10, 12, 14, 15, 17, 18, 28, 29, 30, 31, 16, 22, 26,
  32, 33, 34, 35, 36, 13, 19, 21, 23, 24, 25, 27, 40
]);

const REQUIRED_PROFILE_FIELDS = Object.freeze([
  "profileId",
  "slug",
  "displayName",
  "commonName",
  "nation",
  "position",
  "primaryStyle",
  "secondaryStyle",
  "baseStats",
  "rarity",
  "portrait",
  "flavorText",
  "flags",
  "album",
  "legal"
]);

const RUNTIME_PROFILE_FIELDS = Object.freeze([
  "speciesId",
  "level",
  "formLevel",
  "currentHp",
  "maxHp",
  "types",
  "spriteUrl",
  "shinySpriteUrl",
  "moveTier",
  "skillTier",
  "heldItem"
]);

const BASE_STAT_KEYS = Object.freeze(["hp", "atk", "def", "special", "spdef", "speed"]);
const VALID_RARITIES = Object.freeze(["common", "uncommon", "rare", "elite", "legend"]);
const VALID_POSITIONS = Object.freeze(["GK", "CB", "FB", "DM", "CM", "AM", "W", "ST"]);
const REQUIRED_FLAG_KEYS = Object.freeze(["isMarquee", "isLegend", "scoutable", "bossExclusive"]);
const VALID_LEGAL_TIERS = Object.freeze([0, 1, 2]);
const VALID_PORTRAIT_TIERS = Object.freeze(["T0", "T1", "T2", "T3"]);

let profileCatalog = null;
let profileIndex = null;
let catalogPromise = null;
let portraitManifest = null;
let portraitManifestPromise = null;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeProfileId(id) {
  if (typeof id === "number") return Number.isInteger(id) ? id : null;
  if (typeof id === "string" && id.trim() !== "") {
    const numericId = Number(id);
    return Number.isInteger(numericId) ? numericId : null;
  }
  return null;
}

function getStyleIds() {
  const styles = window.DomainStyles?.STYLE_IDS || window.STYLE_IDS || [];
  return new Set(styles);
}

function getProfileLabel(profile, fallbackIndex) {
  return profile?.profileId !== undefined ? `profile ${profile.profileId}` : `profiles[${fallbackIndex}]`;
}

function validatePlayerCatalog(catalog, options = {}) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(catalog)) {
    return {
      valid: false,
      errors: ["Catalog must be an object."],
      warnings
    };
  }

  if (catalog.schemaVersion !== 1) {
    errors.push(`schemaVersion must be 1; received ${catalog.schemaVersion}.`);
  }

  if (!Array.isArray(catalog.profiles)) {
    errors.push("profiles must be an array.");
    return { valid: errors.length === 0, errors, warnings };
  }

  const expectedProfileIds = Array.isArray(options.expectedProfileIds)
    ? options.expectedProfileIds
    : [...CATALOG_PROFILE_IDS];
  const profileIds = catalog.profiles.map(profile => profile?.profileId);

  if (catalog.profiles.length !== expectedProfileIds.length) {
    errors.push(
      `profiles must contain exactly ${expectedProfileIds.length} entries; received ${catalog.profiles.length}.`
    );
  }

  if (profileIds.join(",") !== expectedProfileIds.join(",")) {
    errors.push(`profileIds must match catalog order: ${expectedProfileIds.join(", ")}.`);
  }

  const seenIds = new Set();
  const seenSlugs = new Set();
  const validStyles = getStyleIds();

  if (validStyles.size === 0) {
    errors.push("DomainStyles.STYLE_IDS must be loaded before validating player profiles.");
  }

  catalog.profiles.forEach((profile, index) => {
    const label = getProfileLabel(profile, index);

    if (!isPlainObject(profile)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    for (const field of REQUIRED_PROFILE_FIELDS) {
      if (!(field in profile)) {
        errors.push(`${label} is missing required field "${field}".`);
      }
    }

    for (const field of RUNTIME_PROFILE_FIELDS) {
      if (field in profile) {
        errors.push(`${label} must not include runtime field "${field}".`);
      }
    }

    if (!Number.isInteger(profile.profileId)) {
      errors.push(`${label} profileId must be an integer.`);
    } else if (seenIds.has(profile.profileId)) {
      errors.push(`Duplicate profileId ${profile.profileId}.`);
    } else {
      seenIds.add(profile.profileId);
    }

    if (typeof profile.slug !== "string" || profile.slug.trim() === "") {
      errors.push(`${label} slug must be a non-empty string.`);
    } else if (seenSlugs.has(profile.slug)) {
      errors.push(`Duplicate slug "${profile.slug}".`);
    } else {
      seenSlugs.add(profile.slug);
    }

    if (!isPlainObject(profile.baseStats)) {
      errors.push(`${label} baseStats must be an object.`);
    } else {
      const statKeys = Object.keys(profile.baseStats);
      if (statKeys.join(",") !== BASE_STAT_KEYS.join(",")) {
        errors.push(`${label} baseStats keys must be exactly ${BASE_STAT_KEYS.join(", ")}.`);
      }

      for (const statKey of BASE_STAT_KEYS) {
        if (!Number.isInteger(profile.baseStats[statKey])) {
          errors.push(`${label} baseStats.${statKey} must be an integer.`);
        }
      }
    }

    if (!VALID_RARITIES.includes(profile.rarity)) {
      errors.push(`${label} rarity must be one of ${VALID_RARITIES.join(", ")}.`);
    }

    if (!VALID_POSITIONS.includes(profile.position)) {
      errors.push(`${label} position must be one of ${VALID_POSITIONS.join(", ")}.`);
    }

    if (!validStyles.has(profile.primaryStyle)) {
      errors.push(`${label} primaryStyle "${profile.primaryStyle}" is not a valid StyleId.`);
    }

    if (profile.secondaryStyle !== null && !validStyles.has(profile.secondaryStyle)) {
      errors.push(`${label} secondaryStyle "${profile.secondaryStyle}" is not a valid StyleId.`);
    }

    if (!isPlainObject(profile.flags)) {
      errors.push(`${label} flags must be an object.`);
    } else {
      for (const flagKey of REQUIRED_FLAG_KEYS) {
        if (typeof profile.flags[flagKey] !== "boolean") {
          errors.push(`${label} flags.${flagKey} must be a boolean.`);
        }
      }
    }

    if (!isPlainObject(profile.album)) {
      errors.push(`${label} album must be an object.`);
    } else {
      if (typeof profile.album.pageId !== "string" || profile.album.pageId.trim() === "") {
        errors.push(`${label} album.pageId must be a non-empty string.`);
      }
      if (!Number.isInteger(profile.album.slot) || profile.album.slot <= 0) {
        errors.push(`${label} album.slot must be a positive integer.`);
      }
    }

    if (!isPlainObject(profile.legal)) {
      errors.push(`${label} legal must be an object.`);
    } else {
      if (profile.legal.nameOk !== true) {
        errors.push(`${label} legal.nameOk must be true.`);
      }
      if (!VALID_LEGAL_TIERS.includes(profile.legal.likenessTier)) {
        errors.push(`${label} legal.likenessTier must be one of ${VALID_LEGAL_TIERS.join(", ")}.`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function cloneAndFreezeProfile(profile) {
  return Object.freeze({
    ...profile,
    baseStats: Object.freeze({ ...profile.baseStats }),
    flags: Object.freeze({ ...profile.flags }),
    album: Object.freeze({ ...profile.album }),
    legal: Object.freeze({ ...profile.legal })
  });
}

function loadCatalog(json, options = {}) {
  const validation = validatePlayerCatalog(json, options);
  if (!validation.valid) {
    throw new Error(`Player profile catalog validation failed: ${validation.errors.join(" | ")}`);
  }

  const profiles = Object.freeze(json.profiles.map(cloneAndFreezeProfile));
  const byId = Object.create(null);

  for (const profile of profiles) {
    byId[profile.profileId] = profile;
  }

  profileCatalog = profiles;
  profileIndex = Object.freeze(byId);

  return Object.freeze({
    profiles: profileCatalog,
    byId: profileIndex,
    warnings: Object.freeze([...validation.warnings])
  });
}

function validatePortraitManifest(manifest, catalogJson) {
  const errors = [];

  if (!isPlainObject(manifest)) {
    return ["Portrait manifest must be an object."];
  }
  if (manifest.schemaVersion !== 1) {
    errors.push(`Portrait manifest schemaVersion must be 1; received ${manifest.schemaVersion}.`);
  }
  if (manifest.strategy !== "stylized_non_likeness_jersey_avatars") {
    errors.push("Portrait manifest strategy must be stylized_non_likeness_jersey_avatars.");
  }
  if (manifest.remoteRuntimeDependency !== false) {
    errors.push("Portrait manifest must not require a remote runtime dependency.");
  }
  if (!isPlainObject(manifest.players)) {
    errors.push("Portrait manifest players must be an object.");
  }

  if (isPlainObject(manifest.players) && Array.isArray(catalogJson?.profiles)) {
    for (const profile of catalogJson.profiles) {
      const entry = manifest.players[String(profile.profileId)];
      if (!isPlainObject(entry)) {
        errors.push(`Portrait manifest missing profileId ${profile.profileId}.`);
        continue;
      }
      if (!VALID_PORTRAIT_TIERS.includes(entry.assetTier)) {
        errors.push(`Portrait manifest profileId ${profile.profileId} has invalid assetTier ${entry.assetTier}.`);
      }
      if (typeof entry.portrait !== "string") {
        errors.push(`Portrait manifest profileId ${profile.profileId} portrait must be a string.`);
      }
    }
  }

  return errors;
}

function applyPortraitManifestToCatalog(catalogJson, manifest) {
  const errors = validatePortraitManifest(manifest, catalogJson);
  if (errors.length > 0) {
    throw new Error(`Portrait manifest validation failed: ${errors.join(" | ")}`);
  }

  const profiles = catalogJson.profiles.map(profile => {
    const entry = manifest.players[String(profile.profileId)];
    return {
      ...profile,
      portrait: entry.portrait || manifest.defaultPortrait || ""
    };
  });

  return { ...catalogJson, profiles };
}

async function initPortraitManifest(catalogJson) {
  if (portraitManifest) return applyPortraitManifestToCatalog(catalogJson, portraitManifest);
  if (portraitManifestPromise) {
    const manifest = await portraitManifestPromise;
    return applyPortraitManifestToCatalog(catalogJson, manifest);
  }

  portraitManifestPromise = fetch(PORTRAIT_MANIFEST_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${PORTRAIT_MANIFEST_URL}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(manifest => {
      const errors = validatePortraitManifest(manifest, catalogJson);
      if (errors.length > 0) {
        throw new Error(`Portrait manifest validation failed: ${errors.join(" | ")}`);
      }
      portraitManifest = Object.freeze({
        ...manifest,
        assetTiers: Object.freeze({ ...manifest.assetTiers }),
        players: Object.freeze({ ...manifest.players })
      });
      return portraitManifest;
    })
    .catch(error => {
      portraitManifestPromise = null;
      throw error;
    });

  const manifest = await portraitManifestPromise;
  return applyPortraitManifestToCatalog(catalogJson, manifest);
}

async function enrichCatalogPortraits(catalogJson) {
  const portraitSource = window.DomainPortraitSource;
  if (!portraitSource?.fetchPortraitMap || !portraitSource?.applyPortraitMapToCatalog) {
    return catalogJson;
  }
  const map = await portraitSource.fetchPortraitMap();
  if (!map) return catalogJson;
  return portraitSource.applyPortraitMapToCatalog(catalogJson, map);
}

async function initCatalog() {
  if (profileCatalog) {
    return Object.freeze({ profiles: profileCatalog, byId: profileIndex, warnings: Object.freeze([]) });
  }

  if (catalogPromise) return catalogPromise;

  catalogPromise = fetch(PROFILE_CATALOG_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${PROFILE_CATALOG_URL}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(initPortraitManifest)
    .then(enrichCatalogPortraits)
    .then(loadCatalog)
    .catch(error => {
      catalogPromise = null;
      throw error;
    });

  return catalogPromise;
}

function assertCatalogLoaded() {
  if (!profileCatalog || !profileIndex) {
    throw new Error("Player profile catalog has not been loaded. Call DomainProfiles.initCatalog() first.");
  }
}

function getProfile(id) {
  assertCatalogLoaded();
  const profileId = normalizeProfileId(id);
  if (profileId === null) return null;
  return profileIndex[profileId] || null;
}

function getProfileOrThrow(id) {
  const profile = getProfile(id);
  if (!profile) {
    throw new Error(`Unknown football profileId: ${id}`);
  }
  return profile;
}

function getAllProfiles() {
  assertCatalogLoaded();
  return profileCatalog;
}

function isFootballProfileId(id) {
  const profileId = normalizeProfileId(id);
  if (profileId === null || !profileIndex) return false;
  return Boolean(profileIndex[profileId]);
}

function getScoutableProfileIds(excludeProfileIds = []) {
  assertCatalogLoaded();
  const excluded = new Set(excludeProfileIds);
  return profileCatalog
    .filter(profile => profile.flags?.scoutable && !profile.flags?.bossExclusive && !excluded.has(profile.profileId))
    .map(profile => profile.profileId);
}

const DomainProfiles = Object.freeze({
  initCatalog,
  loadCatalog,
  initPortraitManifest,
  getProfile,
  getProfileOrThrow,
  getAllProfiles,
  getScoutableProfileIds,
  isFootballProfileId,
  validatePlayerCatalog
});

window.DomainProfiles = DomainProfiles;
