/**
 * @module domain/combat-adapter
 * Battle-engine adapter domain module for the World Cup vertical slice.
 *
 * Creates plain runtime objects that match the existing battle engine shape
 * while keeping football catalog data as the source of truth.
 */
function normalizeProfileId(profileId) {
  if (typeof profileId === "number" && Number.isInteger(profileId)) return profileId;
  if (typeof profileId === "string" && profileId.trim() !== "") {
    const numericId = Number(profileId);
    if (Number.isInteger(numericId)) return numericId;
  }
  throw new Error(`Invalid football profileId: ${profileId}`);
}

function normalizeFormLevel(formLevel) {
  const level = formLevel === undefined || formLevel === null || formLevel === ""
    ? 5
    : Number(formLevel);

  if (!Number.isInteger(level) || level <= 0) {
    throw new Error(`Invalid football formLevel: ${formLevel}`);
  }

  return level;
}

function normalizeMoveTier(moveTier) {
  const tier = Number(moveTier || 0);
  if (!Number.isFinite(tier)) {
    throw new Error(`Invalid football moveTier: ${moveTier}`);
  }
  return Math.max(0, Math.min(2, Math.trunc(tier)));
}

function calcPlayerHp(baseHp, level) {
  if (!Number.isInteger(baseHp) || baseHp <= 0) {
    throw new Error(`Invalid football baseStats.hp: ${baseHp}`);
  }

  const normalizedLevel = normalizeFormLevel(level);

  if (typeof window.calcHp === "function") {
    return window.calcHp(baseHp, normalizedLevel);
  }

  return Math.floor(baseHp * normalizedLevel / 50) + normalizedLevel + 10;
}

function assertProfileCatalogAvailable() {
  if (!window.DomainProfiles || typeof window.DomainProfiles.getProfileOrThrow !== "function") {
    throw new Error("Player profile catalog is not available. Load DomainProfiles before using DomainCombatAdapter.");
  }
}

function assertStyleMapperAvailable() {
  if (!window.DomainStyles || typeof window.DomainStyles.styleToLegacyType !== "function") {
    throw new Error("Football style mapper is not available. Load DomainStyles before using DomainCombatAdapter.");
  }
}

function buildRuntimeTypes(profile) {
  assertStyleMapperAvailable();

  const styleIds = [profile?.primaryStyle, profile?.secondaryStyle].filter(Boolean);
  if (styleIds.length === 0) {
    throw new Error(`Football profile ${profile?.profileId ?? "(unknown)"} has no runtime styles.`);
  }

  const legacyTypes = [];
  for (const styleId of styleIds) {
    const legacyType = window.DomainStyles.styleToLegacyType(styleId);
    if (!legacyType) {
      throw new Error(`Football style "${styleId}" cannot be mapped to a legacy battle type.`);
    }
    if (!legacyTypes.includes(legacyType)) legacyTypes.push(legacyType);
  }

  return legacyTypes;
}

function copyBaseStats(profile) {
  const baseStats = profile?.baseStats;
  const requiredStats = ["hp", "atk", "def", "special", "spdef", "speed"];

  if (!baseStats || typeof baseStats !== "object" || Array.isArray(baseStats)) {
    throw new Error(`Football profile ${profile?.profileId ?? "(unknown)"} has invalid baseStats.`);
  }

  for (const stat of requiredStats) {
    if (!Number.isInteger(baseStats[stat])) {
      throw new Error(`Football profile ${profile?.profileId ?? "(unknown)"} has invalid baseStats.${stat}.`);
    }
  }

  return { ...baseStats };
}

function createPlayerInstance(profileId, formLevel, opts = {}) {
  assertProfileCatalogAvailable();

  const normalizedProfileId = normalizeProfileId(profileId);
  const profile = window.DomainProfiles.getProfileOrThrow(normalizedProfileId);
  const level = normalizeFormLevel(formLevel);
  const baseStats = copyBaseStats(profile);
  const maxHp = calcPlayerHp(baseStats.hp, level);
  const currentHp = opts.currentHp !== undefined ? Number(opts.currentHp) : maxHp;

  if (!Number.isFinite(currentHp) || currentHp < 0) {
    throw new Error(`Invalid football currentHp: ${opts.currentHp}`);
  }

  return {
    speciesId: normalizedProfileId,
    profileId: normalizedProfileId,
    name: profile.displayName,
    nickname: null,
    level,
    currentHp: Math.min(currentHp, maxHp),
    maxHp,
    isShiny: false,
    types: buildRuntimeTypes(profile),
    baseStats,
    spriteUrl: profile.portrait || "",
    shinySpriteUrl: null,
    megaStone: null,
    heldItem: opts.heldItem || null,
    moveTier: normalizeMoveTier(opts.moveTier),
  };
}

const DomainCombatAdapter = Object.freeze({
  createPlayerInstance,
  calcPlayerHp,
  normalizeFormLevel,
  buildRuntimeTypes
});

window.DomainCombatAdapter = DomainCombatAdapter;
