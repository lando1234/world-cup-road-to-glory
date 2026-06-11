/**
 * @module domain/bosses
 * Host city boss catalog domain module for the World Cup vertical slice.
 *
 * Owns loading, validation, lookup, and battle-engine instance creation for
 * data-driven federation challenges.
 */
const HOST_CITY_BOSSES_URL = "data/football/host_city_bosses.json";

const REQUIRED_BOSS_FIELDS = Object.freeze([
  "mapIndex",
  "hostCity",
  "nation",
  "label",
  "managerName",
  "primaryStyle",
  "stamp",
  "difficulty",
  "recommendedFormRange",
  "roster",
  "flavorText"
]);

const REQUIRED_ROSTER_FIELDS = Object.freeze([
  "profileId",
  "formLevel",
  "skillTier",
  "heldItemId",
  "role"
]);

let hostCityBosses = null;
let hostCityBossIndex = null;
let hostCityBossPromise = null;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getStyleIds() {
  return new Set(window.DomainStyles?.STYLE_IDS || window.STYLE_IDS || []);
}

function getMaxMapIndex() {
  return Number.isInteger(window.FEATURES?.maxMapIndex) ? window.FEATURES.maxMapIndex : Number.POSITIVE_INFINITY;
}

function assertProfileCatalogAvailable() {
  if (!window.DomainProfiles || typeof window.DomainProfiles.getProfile !== "function") {
    throw new Error("Player profile catalog is not available. Load DomainProfiles before DomainBosses.");
  }
}

function assertCombatAdapterAvailable() {
  if (!window.DomainCombatAdapter || typeof window.DomainCombatAdapter.createPlayerInstance !== "function") {
    throw new Error("Football combat adapter is not available. Load DomainCombatAdapter before DomainBosses.");
  }
}

function validateBossCatalog(catalog, options = {}) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(catalog)) {
    return { valid: false, errors: ["Boss catalog must be an object."], warnings };
  }

  if (catalog.schemaVersion !== 1) {
    errors.push(`schemaVersion must be 1; received ${catalog.schemaVersion}.`);
  }

  if (!Array.isArray(catalog.bosses)) {
    errors.push("bosses must be an array.");
    return { valid: errors.length === 0, errors, warnings };
  }

  const enforceSliceCount = options.enforceSliceCount ?? window.FEATURES?.sliceMode === true;
  if (enforceSliceCount && !Number.isInteger(options.expectedMapSpan) && catalog.bosses.length !== 3) {
    errors.push(`Phase 1 boss catalog must contain exactly 3 entries; received ${catalog.bosses.length}.`);
  }

  const expectedMapSpan = options.expectedMapSpan;
  if (Number.isInteger(expectedMapSpan) && expectedMapSpan >= 0) {
    const indexes = catalog.bosses.map(boss => boss.mapIndex).sort((a, b) => a - b);
    const expected = Array.from({ length: expectedMapSpan + 1 }, (_, index) => index);
    if (indexes.join(",") !== expected.join(",")) {
      errors.push(`boss mapIndex values must cover 0..${expectedMapSpan}; received ${indexes.join(", ")}.`);
    }
  }

  const mapIndexRange = options.mapIndexRange;
  if (isPlainObject(mapIndexRange) && Number.isInteger(mapIndexRange.min) && Number.isInteger(mapIndexRange.max)) {
    const indexes = catalog.bosses.map(boss => boss.mapIndex).sort((a, b) => a - b);
    const expected = Array.from(
      { length: mapIndexRange.max - mapIndexRange.min + 1 },
      (_, offset) => mapIndexRange.min + offset
    );
    if (indexes.join(",") !== expected.join(",")) {
      errors.push(`boss mapIndex values must cover ${mapIndexRange.min}..${mapIndexRange.max}; received ${indexes.join(", ")}.`);
    }
  }

  const validStyles = getStyleIds();
  if (validStyles.size === 0) {
    errors.push("DomainStyles.STYLE_IDS must be loaded before validating host city bosses.");
  }

  const seenMapIndexes = new Set();
  const seenStampIds = new Set();

  catalog.bosses.forEach((boss, bossIndex) => {
    const label = `bosses[${bossIndex}]`;

    if (!isPlainObject(boss)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    for (const field of REQUIRED_BOSS_FIELDS) {
      if (!(field in boss)) errors.push(`${label} is missing required field "${field}".`);
    }

    if (!Number.isInteger(boss.mapIndex) || boss.mapIndex < 0) {
      errors.push(`${label}.mapIndex must be a non-negative integer.`);
    } else if (seenMapIndexes.has(boss.mapIndex)) {
      errors.push(`Duplicate host city boss mapIndex ${boss.mapIndex}.`);
    } else {
      seenMapIndexes.add(boss.mapIndex);
    }

    for (const stringField of ["hostCity", "nation", "label", "primaryStyle", "flavorText"]) {
      if (typeof boss[stringField] !== "string" || boss[stringField].trim() === "") {
        errors.push(`${label}.${stringField} must be a non-empty string.`);
      }
    }

    if (boss.managerName !== null && typeof boss.managerName !== "string") {
      errors.push(`${label}.managerName must be null or a string.`);
    }

    if (!validStyles.has(boss.primaryStyle)) {
      errors.push(`${label}.primaryStyle "${boss.primaryStyle}" is not a valid StyleId.`);
    }

    if (!Number.isInteger(boss.difficulty) || boss.difficulty < 1 || boss.difficulty > 5) {
      errors.push(`${label}.difficulty must be an integer between 1 and 5.`);
    }

    if (!Array.isArray(boss.recommendedFormRange) || boss.recommendedFormRange.length !== 2 ||
        !boss.recommendedFormRange.every(Number.isInteger) ||
        boss.recommendedFormRange[0] > boss.recommendedFormRange[1]) {
      errors.push(`${label}.recommendedFormRange must be [min, max] integers.`);
    }

    if (!isPlainObject(boss.stamp)) {
      errors.push(`${label}.stamp must be an object.`);
    } else {
      if (typeof boss.stamp.id !== "string" || boss.stamp.id.trim() === "") {
        errors.push(`${label}.stamp.id must be a non-empty string.`);
      } else if (seenStampIds.has(boss.stamp.id)) {
        errors.push(`Duplicate stamp id "${boss.stamp.id}".`);
      } else {
        seenStampIds.add(boss.stamp.id);
      }
      if (typeof boss.stamp.displayName !== "string" || boss.stamp.displayName.trim() === "") {
        errors.push(`${label}.stamp.displayName must be a non-empty string.`);
      }
    }

    if (!Array.isArray(boss.roster) || boss.roster.length === 0) {
      errors.push(`${label}.roster must be a non-empty array.`);
      return;
    }

    boss.roster.forEach((slot, slotIndex) => {
      const slotLabel = `${label}.roster[${slotIndex}]`;

      if (!isPlainObject(slot)) {
        errors.push(`${slotLabel} must be an object.`);
        return;
      }

      for (const field of REQUIRED_ROSTER_FIELDS) {
        if (!(field in slot)) errors.push(`${slotLabel} is missing required field "${field}".`);
      }

      if (!Number.isInteger(slot.profileId)) {
        errors.push(`${slotLabel}.profileId must be an integer.`);
      } else {
        try {
          const profile = window.DomainProfiles?.getProfile?.(slot.profileId);
          if (!profile) errors.push(`${slotLabel}.profileId ${slot.profileId} does not exist in player catalog.`);
        } catch (_) {
          errors.push(`${slotLabel}.profileId ${slot.profileId} could not be checked against player catalog.`);
        }
      }

      if (!Number.isInteger(slot.formLevel) || slot.formLevel <= 0) {
        errors.push(`${slotLabel}.formLevel must be a positive integer.`);
      }

      if (!Number.isInteger(slot.skillTier) || slot.skillTier < 0 || slot.skillTier > 2) {
        errors.push(`${slotLabel}.skillTier must be an integer between 0 and 2.`);
      }

      if (slot.heldItemId !== null && typeof slot.heldItemId !== "string") {
        errors.push(`${slotLabel}.heldItemId must be null or a string.`);
      }

      if (typeof slot.role !== "string" || slot.role.trim() === "") {
        errors.push(`${slotLabel}.role must be a non-empty string.`);
      }
    });
  });

  const sortedIndexes = [...seenMapIndexes].sort((a, b) => a - b);
  const expectedIndexes = options.mapIndexRange
    ? Array.from(
      { length: options.mapIndexRange.max - options.mapIndexRange.min + 1 },
      (_, offset) => options.mapIndexRange.min + offset
    )
    : Array.from({ length: sortedIndexes.length }, (_, index) => index);
  if (sortedIndexes.join(",") !== expectedIndexes.join(",")) {
    const spanLabel = options.mapIndexRange
      ? `${options.mapIndexRange.min}..${options.mapIndexRange.max}`
      : "0";
    errors.push(`boss mapIndex values must be contiguous from ${spanLabel}; received ${sortedIndexes.join(", ")}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function cloneBossSlot(slot) {
  return Object.freeze({ ...slot });
}

function cloneBossConfig(boss) {
  return Object.freeze({
    ...boss,
    stamp: Object.freeze({ ...boss.stamp }),
    recommendedFormRange: Object.freeze([...boss.recommendedFormRange]),
    balance: boss.balance ? Object.freeze({ ...boss.balance }) : undefined,
    roster: Object.freeze(boss.roster.map(cloneBossSlot))
  });
}

function loadHostCityBosses(json) {
  assertProfileCatalogAvailable();

  const validation = validateBossCatalog(json, { enforceSliceCount: false, expectedMapSpan: 7 });
  if (!validation.valid) {
    throw new Error(`Host city boss catalog validation failed: ${validation.errors.join(" | ")}`);
  }

  const maxMapIndex = getMaxMapIndex();
  const bosses = Object.freeze(
    json.bosses
      .filter(boss => boss.mapIndex <= maxMapIndex)
      .map(cloneBossConfig)
  );
  const byMapIndex = Object.create(null);

  for (const boss of bosses) {
    byMapIndex[boss.mapIndex] = boss;
  }

  hostCityBosses = bosses;
  hostCityBossIndex = Object.freeze(byMapIndex);

  return Object.freeze({
    bosses: hostCityBosses,
    byMapIndex: hostCityBossIndex,
    warnings: Object.freeze([...validation.warnings])
  });
}

async function initHostCityBosses() {
  if (hostCityBosses) {
    return Object.freeze({ bosses: hostCityBosses, byMapIndex: hostCityBossIndex, warnings: Object.freeze([]) });
  }

  if (hostCityBossPromise) return hostCityBossPromise;

  hostCityBossPromise = fetch(HOST_CITY_BOSSES_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${HOST_CITY_BOSSES_URL}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(loadHostCityBosses)
    .catch(error => {
      hostCityBossPromise = null;
      throw error;
    });

  return hostCityBossPromise;
}

function getHostCity(mapIndex) {
  if (!hostCityBossIndex) return null;
  const numericMapIndex = Number(mapIndex);
  if (!Number.isInteger(numericMapIndex)) return null;
  if (numericMapIndex > getMaxMapIndex()) return null;
  return hostCityBossIndex[numericMapIndex] || null;
}

function getAllHostCities() {
  return hostCityBosses || Object.freeze([]);
}

function buildBossTeam(bossConfig) {
  assertCombatAdapterAvailable();

  if (!bossConfig || !Array.isArray(bossConfig.roster)) {
    throw new Error("buildBossTeam requires a boss config with a roster.");
  }

  return bossConfig.roster.map(slot => ({
    ...window.DomainCombatAdapter.createPlayerInstance(slot.profileId, slot.formLevel, {
      moveTier: slot.skillTier
    }),
    skillTier: slot.skillTier,
    bossRole: slot.role,
    heldItemId: slot.heldItemId
  }));
}

const DomainBosses = Object.freeze({
  initHostCityBosses,
  initCatalog: initHostCityBosses,
  loadHostCityBosses,
  validateBossCatalog,
  getHostCity,
  getAllHostCities,
  buildBossTeam
});

window.DomainBosses = DomainBosses;
