/**
 * @module domain/scout
 * Scout report pool module for the World Cup vertical slice.
 *
 * Owns data-driven scout pool validation and three-player report generation.
 */
const SCOUT_POOLS_URL = "data/football/scout_pools.json";
const SCOUT_DEFAULT_CHOICES = 3;

let scoutPoolConfig = null;
let scoutPoolPromise = null;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeMapIndex(mapIndex) {
  const numericMapIndex = Number(mapIndex);
  if (!Number.isInteger(numericMapIndex) || numericMapIndex < 0) {
    throw new Error(`Invalid scout mapIndex: ${mapIndex}`);
  }
  return numericMapIndex;
}

function getRandomFn(opts = {}) {
  if (typeof opts.rng === "function") return opts.rng;
  if (typeof rng === "function") return rng;
  return Math.random;
}

function assertProfileCatalogAvailable() {
  if (!window.DomainProfiles || typeof window.DomainProfiles.getProfile !== "function") {
    throw new Error("Player profile catalog is not available. Load DomainProfiles before DomainScout.");
  }
}

function getProfileOrNull(profileId) {
  try {
    return window.DomainProfiles.getProfile(profileId);
  } catch (_) {
    return null;
  }
}

function getAllProfileIds() {
  if (!window.DomainProfiles || typeof window.DomainProfiles.getAllProfiles !== "function") return new Set();
  try {
    return new Set(window.DomainProfiles.getAllProfiles().map(profile => profile.profileId));
  } catch (_) {
    return new Set();
  }
}

function validateProfileIdList(label, profileIds, validProfileIds, errors) {
  if (!Array.isArray(profileIds) || profileIds.length === 0) {
    errors.push(`${label} must be a non-empty profileId array.`);
    return;
  }

  const seen = new Set();
  for (const profileId of profileIds) {
    if (!Number.isInteger(profileId)) {
      errors.push(`${label} contains non-integer profileId ${profileId}.`);
    } else if (seen.has(profileId)) {
      errors.push(`${label} contains duplicate profileId ${profileId}.`);
    } else if (validProfileIds.size > 0 && !validProfileIds.has(profileId)) {
      errors.push(`${label} contains profileId ${profileId} outside the loaded slice catalog.`);
    }
    seen.add(profileId);
  }
}

function validateScoutPools(json) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(json)) {
    return { valid: false, errors: ["Scout pool config must be an object."], warnings };
  }

  if (json.schemaVersion !== 1) {
    errors.push(`schemaVersion must be 1; received ${json.schemaVersion}.`);
  }

  const validProfileIds = getAllProfileIds();
  if (validProfileIds.size === 0) {
    errors.push("DomainProfiles catalog must be loaded before validating scout pools.");
  }

  if (!Array.isArray(json.bands) || json.bands.length === 0) {
    errors.push("bands must be a non-empty array.");
  } else {
    const seenBandIds = new Set();
    json.bands.forEach((band, index) => {
      const label = `bands[${index}]`;
      if (!isPlainObject(band)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (typeof band.bandId !== "string" || band.bandId.trim() === "") {
        errors.push(`${label}.bandId must be a non-empty string.`);
      } else if (seenBandIds.has(band.bandId)) {
        errors.push(`Duplicate scout bandId "${band.bandId}".`);
      } else {
        seenBandIds.add(band.bandId);
      }
      if (!Number.isInteger(band.mapMin) || !Number.isInteger(band.mapMax) || band.mapMin < 0 || band.mapMin > band.mapMax) {
        errors.push(`${label} must define valid mapMin/mapMax integers.`);
      }
      validateProfileIdList(`${label}.profileIds`, band.profileIds, validProfileIds, errors);
      if (!isPlainObject(band.rarityMultipliers)) {
        errors.push(`${label}.rarityMultipliers must be an object.`);
      }
    });
  }

  if (!isPlainObject(json.rules)) {
    errors.push("rules must be an object.");
  } else {
    if (!Number.isInteger(json.rules.choicesPerReport) || json.rules.choicesPerReport !== SCOUT_DEFAULT_CHOICES) {
      errors.push(`rules.choicesPerReport must be ${SCOUT_DEFAULT_CHOICES}.`);
    }
    validateProfileIdList("rules.excludedStarterProfileIds", json.rules.excludedStarterProfileIds, validProfileIds, errors);
    if (!isPlainObject(json.rules.maxPlayersPerNation)) {
      errors.push("rules.maxPlayersPerNation must be an object.");
    }
  }

  if (json.forcedOverrides !== undefined) {
    if (!Array.isArray(json.forcedOverrides)) {
      errors.push("forcedOverrides must be an array when present.");
    } else {
      json.forcedOverrides.forEach((override, index) => {
        const label = `forcedOverrides[${index}]`;
        if (!isPlainObject(override)) {
          errors.push(`${label} must be an object.`);
          return;
        }
        if (!Number.isInteger(override.mapIndex) || override.mapIndex < 0) {
          errors.push(`${label}.mapIndex must be a non-negative integer.`);
        }
        if (!Number.isInteger(override.layer) || override.layer < 0) {
          errors.push(`${label}.layer must be a non-negative integer.`);
        }
        if (typeof override.nodeType !== "string" || override.nodeType.trim() === "") {
          errors.push(`${label}.nodeType must be a non-empty string.`);
        }
        validateProfileIdList(`${label}.profileIds`, override.profileIds, validProfileIds, errors);
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function cloneBand(band) {
  return Object.freeze({
    ...band,
    profileIds: Object.freeze([...band.profileIds]),
    rarityMultipliers: Object.freeze({ ...band.rarityMultipliers })
  });
}

function cloneConfig(json) {
  return Object.freeze({
    schemaVersion: json.schemaVersion,
    bands: Object.freeze(json.bands.map(cloneBand)),
    rules: Object.freeze({
      choicesPerReport: json.rules.choicesPerReport,
      excludedStarterProfileIds: Object.freeze([...json.rules.excludedStarterProfileIds]),
      maxPlayersPerNation: Object.freeze({ ...json.rules.maxPlayersPerNation })
    }),
    forcedOverrides: Object.freeze((json.forcedOverrides || []).map(override => Object.freeze({
      ...override,
      profileIds: Object.freeze([...override.profileIds])
    })))
  });
}

function loadScoutPools(json) {
  assertProfileCatalogAvailable();

  const validation = validateScoutPools(json);
  if (!validation.valid) {
    throw new Error(`Scout pool validation failed: ${validation.errors.join(" | ")}`);
  }

  scoutPoolConfig = cloneConfig(json);
  return Object.freeze({
    config: scoutPoolConfig,
    warnings: Object.freeze([...validation.warnings])
  });
}

async function initScoutPools() {
  if (scoutPoolConfig) {
    return Object.freeze({ config: scoutPoolConfig, warnings: Object.freeze([]) });
  }

  if (scoutPoolPromise) return scoutPoolPromise;

  scoutPoolPromise = fetch(SCOUT_POOLS_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${SCOUT_POOLS_URL}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(loadScoutPools)
    .catch(error => {
      scoutPoolPromise = null;
      throw error;
    });

  return scoutPoolPromise;
}

function getScoutPoolConfig() {
  if (!scoutPoolConfig) {
    throw new Error("Scout pools have not been loaded. Call DomainScout.initScoutPools() first.");
  }
  return scoutPoolConfig;
}

function getBandForMap(mapIndex) {
  const config = getScoutPoolConfig();
  const normalizedMapIndex = normalizeMapIndex(mapIndex);
  const band = config.bands.find(candidate => normalizedMapIndex >= candidate.mapMin && normalizedMapIndex <= candidate.mapMax);
  if (!band) {
    throw new Error(`No scout pool band configured for mapIndex ${normalizedMapIndex}.`);
  }
  return band;
}

function passesNationCap(profileId, selectedProfileIds, maxPlayersPerNation) {
  const profile = getProfileOrNull(profileId);
  if (!profile) return false;
  const maxForNation = maxPlayersPerNation[profile.nation];
  if (!Number.isInteger(maxForNation)) return true;

  const currentNationCount = selectedProfileIds
    .map(selectedProfileId => getProfileOrNull(selectedProfileId))
    .filter(selectedProfile => selectedProfile?.nation === profile.nation)
    .length;

  return currentNationCount < maxForNation;
}

function getProfileWeight(profileId, rarityMultipliers) {
  const profile = getProfileOrNull(profileId);
  if (!profile) return 0;
  const multiplier = rarityMultipliers[profile.rarity] ?? 1;
  return Math.max(0, Number(multiplier) || 0);
}

function weightedPick(candidates, rarityMultipliers, randomFn) {
  const weighted = candidates
    .map(profileId => ({ profileId, weight: getProfileWeight(profileId, rarityMultipliers) }))
    .filter(entry => entry.weight > 0);

  if (weighted.length === 0) return null;

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = randomFn() * totalWeight;

  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.profileId;
  }

  return weighted[weighted.length - 1].profileId;
}

function buildCandidatePool(band, config) {
  const excluded = new Set(config.rules.excludedStarterProfileIds);
  return band.profileIds.filter(profileId => {
    if (excluded.has(profileId)) return false;
    const profile = getProfileOrNull(profileId);
    return Boolean(profile && profile.flags?.scoutable && !profile.flags?.isMarquee && !profile.flags?.isLegend);
  });
}

function buildSliceReport(mapIndex, runState = {}, opts = {}) {
  const config = opts.config || getScoutPoolConfig();
  const band = getBandForMap(mapIndex);
  const randomFn = getRandomFn(opts);
  const choicesPerReport = config.rules.choicesPerReport || SCOUT_DEFAULT_CHOICES;
  const selectedProfileIds = [];
  const baseCandidates = buildCandidatePool(band, config);

  while (selectedProfileIds.length < choicesPerReport) {
    const candidates = baseCandidates.filter(profileId => {
      if (selectedProfileIds.includes(profileId)) return false;
      return passesNationCap(profileId, selectedProfileIds, config.rules.maxPlayersPerNation);
    });

    let pick = weightedPick(candidates, band.rarityMultipliers, randomFn);

    if (pick === null) {
      const paddingCandidates = baseCandidates.filter(profileId => !selectedProfileIds.includes(profileId));
      pick = weightedPick(paddingCandidates, band.rarityMultipliers, randomFn);
    }

    if (pick === null) break;
    selectedProfileIds.push(pick);
  }

  if (selectedProfileIds.length !== choicesPerReport) {
    throw new Error(`Scout report expected ${choicesPerReport} choices, received ${selectedProfileIds.length}.`);
  }

  return Object.freeze({
    mapIndex: normalizeMapIndex(mapIndex),
    bandId: band.bandId,
    profileIds: Object.freeze(selectedProfileIds),
    flags: Object.freeze({
      eliteGuaranteeApplied: false,
      forcedOverrideApplied: false,
      eliteGuaranteeUsed: Boolean(runState?.flags?.eliteGuaranteeUsed)
    })
  });
}

const DomainScout = Object.freeze({
  initScoutPools,
  loadScoutPools,
  validateScoutPools,
  getScoutPoolConfig,
  getBandForMap,
  buildSliceReport
});

window.DomainScout = DomainScout;
