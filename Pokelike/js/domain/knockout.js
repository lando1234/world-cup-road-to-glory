/**
 * @module domain/knockout
 * Historical knockout gate catalog for Phase 5 football campaign.
 */
const KNOCKOUT_TEAMS_URL = "data/football/knockout_teams.json";

const KNOCKOUT_REQUIRED_GATE_FIELDS = Object.freeze([
  "gateIndex",
  "gateName",
  "historicalTeam",
  "nickname",
  "nation",
  "primaryStyle",
  "secondaryStyle",
  "kitColors",
  "signatureProfileId",
  "recommendedFormRange",
  "roster",
  "flavorText"
]);

const KNOCKOUT_REQUIRED_ROSTER_FIELDS = Object.freeze([
  "profileId",
  "formLevel",
  "skillTier",
  "heldItemId",
  "role"
]);

let knockoutGates = null;
let knockoutGateIndex = null;
let knockoutPromise = null;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getStyleIds() {
  return new Set(window.DomainStyles?.STYLE_IDS || window.STYLE_IDS || []);
}

function assertProfileCatalogAvailable() {
  if (!window.DomainProfiles || typeof window.DomainProfiles.getProfile !== "function") {
    throw new Error("Player profile catalog is not available. Load DomainProfiles before DomainKnockout.");
  }
}

function assertCombatAdapterAvailable() {
  if (!window.DomainCombatAdapter || typeof window.DomainCombatAdapter.createPlayerInstance !== "function") {
    throw new Error("Football combat adapter is not available. Load DomainCombatAdapter before DomainKnockout.");
  }
}

function validateKnockoutCatalog(catalog) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(catalog)) {
    return { valid: false, errors: ["Knockout catalog must be an object."], warnings };
  }

  if (catalog.schemaVersion !== 1) {
    errors.push(`schemaVersion must be 1; received ${catalog.schemaVersion}.`);
  }

  if (!Array.isArray(catalog.gates)) {
    errors.push("gates must be an array.");
    return { valid: false, errors, warnings };
  }

  if (catalog.gates.length !== 5) {
    errors.push(`Knockout catalog must contain exactly 5 gates; received ${catalog.gates.length}.`);
  }

  const validStyles = getStyleIds();
  const seenIndexes = new Set();

  catalog.gates.forEach((gate, gateIdx) => {
    const label = `gates[${gateIdx}]`;

    if (!isPlainObject(gate)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    for (const field of KNOCKOUT_REQUIRED_GATE_FIELDS) {
      if (!(field in gate)) errors.push(`${label} is missing required field "${field}".`);
    }

    if (!Number.isInteger(gate.gateIndex) || gate.gateIndex < 0 || gate.gateIndex > 4) {
      errors.push(`${label}.gateIndex must be an integer 0..4.`);
    } else if (seenIndexes.has(gate.gateIndex)) {
      errors.push(`${label}.gateIndex ${gate.gateIndex} is duplicated.`);
    } else {
      seenIndexes.add(gate.gateIndex);
    }

    if (validStyles.size && gate.primaryStyle && !validStyles.has(gate.primaryStyle)) {
      errors.push(`${label}.primaryStyle "${gate.primaryStyle}" is not a known style.`);
    }

    if (!Array.isArray(gate.roster) || gate.roster.length < 3 || gate.roster.length > 6) {
      errors.push(`${label}.roster must contain 3–6 players.`);
      return;
    }

    gate.roster.forEach((slot, slotIdx) => {
      const slotLabel = `${label}.roster[${slotIdx}]`;
      if (!isPlainObject(slot)) {
        errors.push(`${slotLabel} must be an object.`);
        return;
      }
      for (const field of KNOCKOUT_REQUIRED_ROSTER_FIELDS) {
        if (!(field in slot)) errors.push(`${slotLabel} is missing required field "${field}".`);
      }
      if (!Number.isInteger(slot.profileId) || slot.profileId <= 0) {
        errors.push(`${slotLabel}.profileId must be a positive integer.`);
      }
      if (!Number.isInteger(slot.formLevel) || slot.formLevel < 1) {
        errors.push(`${slotLabel}.formLevel must be a positive integer.`);
      }
      if (!Number.isInteger(slot.skillTier) || slot.skillTier < 0 || slot.skillTier > 2) {
        errors.push(`${slotLabel}.skillTier must be an integer between 0 and 2.`);
      }
    });
  });

  const sorted = [...seenIndexes].sort((a, b) => a - b);
  if (sorted.join(",") !== "0,1,2,3,4") {
    errors.push(`gateIndex values must be contiguous 0..4; received ${sorted.join(", ")}.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

function cloneGate(gate) {
  return Object.freeze({
    ...gate,
    kitColors: Object.freeze([...gate.kitColors]),
    recommendedFormRange: Object.freeze([...gate.recommendedFormRange]),
    roster: Object.freeze(gate.roster.map(slot => Object.freeze({ ...slot })))
  });
}

function loadKnockoutTeams(json) {
  assertProfileCatalogAvailable();

  const validation = validateKnockoutCatalog(json);
  if (!validation.valid) {
    throw new Error(`Knockout catalog validation failed: ${validation.errors.join(" | ")}`);
  }

  for (const gate of json.gates) {
    for (const slot of gate.roster) {
      const profile = window.DomainProfiles.getProfile(slot.profileId);
      if (!profile) {
        throw new Error(`Knockout roster references unknown profileId ${slot.profileId} in gate ${gate.gateIndex}.`);
      }
    }
  }

  const gates = Object.freeze(json.gates.map(cloneGate));
  const byIndex = Object.create(null);
  for (const gate of gates) {
    byIndex[gate.gateIndex] = gate;
  }

  knockoutGates = gates;
  knockoutGateIndex = Object.freeze(byIndex);

  return Object.freeze({
    gates: knockoutGates,
    byIndex: knockoutGateIndex,
    warnings: Object.freeze([...validation.warnings])
  });
}

async function initKnockoutTeams() {
  if (knockoutGates) {
    return Object.freeze({ gates: knockoutGates, byIndex: knockoutGateIndex, warnings: Object.freeze([]) });
  }

  if (knockoutPromise) return knockoutPromise;

  knockoutPromise = fetch(KNOCKOUT_TEAMS_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${KNOCKOUT_TEAMS_URL}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(loadKnockoutTeams)
    .catch(error => {
      knockoutPromise = null;
      throw error;
    });

  return knockoutPromise;
}

function getGate(gateIndex) {
  if (!knockoutGateIndex) return null;
  const numericIndex = Number(gateIndex);
  if (!Number.isInteger(numericIndex)) return null;
  return knockoutGateIndex[numericIndex] || null;
}

function getAllGates() {
  return knockoutGates || Object.freeze([]);
}

function buildGateTeam(gateConfig) {
  assertCombatAdapterAvailable();

  if (!gateConfig || !Array.isArray(gateConfig.roster)) {
    throw new Error("buildGateTeam requires a gate config with a roster.");
  }

  return gateConfig.roster.map(slot => ({
    ...window.DomainCombatAdapter.createPlayerInstance(slot.profileId, slot.formLevel, {
      moveTier: slot.skillTier
    }),
    skillTier: slot.skillTier,
    gateRole: slot.role,
    heldItemId: slot.heldItemId
  }));
}

const DomainKnockout = Object.freeze({
  KNOCKOUT_TEAMS_URL,
  initKnockoutTeams,
  initCatalog: initKnockoutTeams,
  loadKnockoutTeams,
  validateKnockoutCatalog,
  getGate,
  getAllGates,
  buildGateTeam
});

window.DomainKnockout = DomainKnockout;
