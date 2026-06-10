/**
 * @module domain/recruit
 * Recruitment domain module for the World Cup vertical slice.
 *
 * Owns contract-offer decisions and run-ledger append semantics.
 */
const RECRUIT_MAX_SQUAD_SIZE = 6;

function normalizeProfileId(profileId) {
  if (typeof profileId === "number" && Number.isInteger(profileId)) return profileId;
  if (typeof profileId === "string" && profileId.trim() !== "") {
    const numericId = Number(profileId);
    if (Number.isInteger(numericId)) return numericId;
  }
  throw new Error(`Invalid recruit profileId: ${profileId}`);
}

function assertAlbumApiAvailable() {
  if (!window.DomainAlbum ||
      typeof window.DomainAlbum.getEntryState !== "function" ||
      typeof window.DomainAlbum.markAlbumSigned !== "function") {
    throw new Error("DomainAlbum API is not available. Load DomainAlbum before DomainRecruit.");
  }
}

function assertProfileExists(profileId) {
  if (!window.DomainProfiles || typeof window.DomainProfiles.getProfile !== "function") return;
  const profile = window.DomainProfiles.getProfile(profileId);
  if (!profile) throw new Error(`Unknown recruit profileId: ${profileId}`);
}

function ensureRunLedger(runState) {
  if (!runState || typeof runState !== "object") {
    throw new Error("Recruitment requires a mutable runState object.");
  }

  if (!runState.ledger || typeof runState.ledger !== "object" || Array.isArray(runState.ledger)) {
    runState.ledger = {};
  }

  for (const key of ["seenProfileIds", "signedProfileIds", "duplicateSignProfileIds"]) {
    if (!Array.isArray(runState.ledger[key])) {
      runState.ledger[key] = [];
    }
  }

  return runState.ledger;
}

function getTeamSize(runState) {
  return Array.isArray(runState?.team) ? runState.team.length : 0;
}

function getMaxSquadSize(runState, opts = {}) {
  const configuredMax = opts.maxSquadSize ?? runState?.maxSquadSize ?? RECRUIT_MAX_SQUAD_SIZE;
  const numericMax = Number(configuredMax);
  if (!Number.isInteger(numericMax) || numericMax <= 0) return RECRUIT_MAX_SQUAD_SIZE;
  return Math.min(numericMax, RECRUIT_MAX_SQUAD_SIZE);
}

function offerContract(profileId, runState, opts = {}) {
  assertAlbumApiAvailable();

  const normalizedProfileId = normalizeProfileId(profileId);
  assertProfileExists(normalizedProfileId);
  const ledger = ensureRunLedger(runState);
  const teamSize = getTeamSize(runState);
  const maxSquadSize = getMaxSquadSize(runState, opts);
  const needsSwap = !opts.forceAdd && teamSize >= maxSquadSize;
  const wasAlreadySigned = window.DomainAlbum.getEntryState(normalizedProfileId) === "signed";

  if (needsSwap) {
    return Object.freeze({
      added: false,
      needsSwap: true,
      profileId: normalizedProfileId,
      duplicate: wasAlreadySigned
    });
  }

  ledger.signedProfileIds.push(normalizedProfileId);
  if (wasAlreadySigned) {
    ledger.duplicateSignProfileIds.push(normalizedProfileId);
  }
  window.DomainAlbum.markAlbumSigned(normalizedProfileId);

  return Object.freeze({
    added: true,
    needsSwap: false,
    profileId: normalizedProfileId,
    duplicate: wasAlreadySigned
  });
}

function passOnReport() {
  return Object.freeze({
    added: false,
    needsSwap: false,
    passed: true
  });
}

const DomainRecruit = Object.freeze({
  offerContract,
  passOnReport,
  ensureRunLedger
});

window.DomainRecruit = DomainRecruit;
