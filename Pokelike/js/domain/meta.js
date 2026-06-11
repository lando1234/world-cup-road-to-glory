/**
 * @module domain/meta
 * Run settlement and permanent account progression (SPEC 008 §18).
 */
const RUN_ECONOMY_URL = "data/football/run_economy.json";

let runEconomyConfig = null;
let runEconomyPromise = null;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeProfileId(profileId) {
  const numericId = Number(profileId);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;
  return numericId;
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

function getDefaultEconomy() {
  return {
    credits: {
      newAlbumEntry: 50,
      duplicateByRarity: { uncommon: 15, rare: 25, elite: 40, legend: 75 },
      perHostCityStamp: 25,
      perKnockoutGate: 40,
      reachedKnockoutBonus: 30,
      reachedFinalBonus: 50,
      wonWorldCupBonus: 150,
      lossParticipation: 20
    },
    maxCreditsPerRun: 400,
    legendFragmentThreshold: 20,
    fragmentPerKnockoutGate: 2,
    fragmentPerWorldCupWin: 5
  };
}

async function initRunEconomy() {
  if (runEconomyConfig) return runEconomyConfig;
  if (runEconomyPromise) return runEconomyPromise;

  runEconomyPromise = fetch(RUN_ECONOMY_URL)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ${RUN_ECONOMY_URL}`);
      return response.json();
    })
    .then(json => {
      runEconomyConfig = Object.freeze({ ...getDefaultEconomy(), ...json });
      return runEconomyConfig;
    })
    .catch(() => {
      runEconomyConfig = Object.freeze(getDefaultEconomy());
      runEconomyPromise = null;
      return runEconomyConfig;
    });

  return runEconomyPromise;
}

function getRunEconomyConfig() {
  return runEconomyConfig || getDefaultEconomy();
}

function readAccountState() {
  const album = window.DomainSave?.readAlbumState?.() || readJsonStorage("game_album", {});
  return {
    album: isPlainObject(album) ? { ...album } : {},
    footballCredits: Number(readJsonStorage("footballCredits", 0)) || 0,
    legendFragments: readJsonStorage("legendFragments", {}),
    unlockedLegends: readJsonStorage("unlockedLegends", []),
    accountFlags: readJsonStorage("accountFlags", {}),
    runCount: Number(readJsonStorage("runCount", 0)) || 0,
    campaignWins: Number(readJsonStorage("campaignWins", 0)) || 0,
    runHistory: readJsonStorage("runHistory", []),
    gameAlbumMeta: readJsonStorage("game_album_meta", {}),
    lastSettledRunId: readJsonStorage("football_last_settled_run_id", null)
  };
}

function getProfileRarity(profileId) {
  try {
    return window.DomainProfiles?.getProfile?.(profileId)?.rarity || "elite";
  } catch (_) {
    return "elite";
  }
}

function getProfileName(profileId) {
  try {
    const profile = window.DomainProfiles?.getProfile?.(profileId);
    return profile?.commonName || profile?.displayName || `Profile ${profileId}`;
  } catch (_) {
    return `Profile ${profileId}`;
  }
}

function buildRunSnapshot(runState = {}, overrides = {}) {
  const badges = Number(runState.badges || 0);
  const gatesCleared = Number(runState.knockoutGatesCleared || 0);
  const knockoutPhase = Boolean(runState.knockoutPhase);
  return Object.freeze({
    runId: typeof runState.runId === "string" ? runState.runId : "",
    abandoned: Boolean(overrides.abandoned),
    won: Boolean(overrides.won ?? runState.wonWorldCup),
    badgeCount: badges,
    knockoutGatesCleared: gatesCleared,
    reachedKnockout: knockoutPhase || gatesCleared > 0 || badges >= 8,
    reachedFinal: gatesCleared >= 3,
    wonWorldCup: Boolean(overrides.won ?? runState.wonWorldCup),
    ledger: runState.ledger || {}
  });
}

function settleRun(runSnapshot = {}, accountState = readAccountState(), economy = getRunEconomyConfig()) {
  if (accountState.lastSettledRunId && runSnapshot.runId && accountState.lastSettledRunId === runSnapshot.runId) {
    return Object.freeze({ patch: Object.freeze({}), summary: Object.freeze({ deduped: true }) });
  }

  const currentAlbum = { ...accountState.album };
  const signedProfileIds = Array.isArray(runSnapshot.ledger?.signedProfileIds)
    ? runSnapshot.ledger.signedProfileIds
    : [];
  const duplicateSignProfileIds = Array.isArray(runSnapshot.ledger?.duplicateSignProfileIds)
    ? runSnapshot.ledger.duplicateSignProfileIds
    : [];

  const albumPatch = { ...currentAlbum };
  const newSignIds = [];
  for (const profileId of signedProfileIds) {
    const normalized = normalizeProfileId(profileId);
    if (!normalized) continue;
    const key = String(normalized);
    if (albumPatch[key] !== 1) {
      albumPatch[key] = 1;
      newSignIds.push(normalized);
    }
  }

  const creditsBreakdown = [];
  let creditsEarned = 0;

  const addCredits = (label, amount) => {
    if (!amount) return;
    creditsEarned += amount;
    creditsBreakdown.push({ label, amount });
  };

  for (const profileId of newSignIds) {
    addCredits(`New signing: ${getProfileName(profileId)}`, economy.credits.newAlbumEntry);
  }

  for (const profileId of [...new Set(duplicateSignProfileIds.map(Number).filter(Number.isInteger))]) {
    const rarity = getProfileRarity(profileId);
    const amount = economy.credits.duplicateByRarity[rarity] || economy.credits.duplicateByRarity.elite;
    addCredits(`Duplicate: ${getProfileName(profileId)}`, amount);
  }

  addCredits("City stamps", runSnapshot.badgeCount * economy.credits.perHostCityStamp);
  addCredits("Knockout gates", runSnapshot.knockoutGatesCleared * economy.credits.perKnockoutGate);

  if (runSnapshot.reachedKnockout) addCredits("Knockout debut", economy.credits.reachedKnockoutBonus);
  if (runSnapshot.reachedFinal) addCredits("Final reached", economy.credits.reachedFinalBonus);
  if (runSnapshot.wonWorldCup) addCredits("World Cup lifted", economy.credits.wonWorldCupBonus);
  if (!runSnapshot.wonWorldCup) addCredits("Run participation", economy.credits.lossParticipation);

  creditsEarned = Math.min(creditsEarned, economy.maxCreditsPerRun);

  const legendFragments = { ...(accountState.legendFragments || {}) };
  const fragmentGrants = [];
  const applyFragments = (legendId, amount, source) => {
    if (!Number.isInteger(legendId) || amount <= 0) return;
    const key = String(legendId);
    legendFragments[key] = (Number(legendFragments[key]) || 0) + amount;
    fragmentGrants.push({ legendId, amount, source });
  };

  if (runSnapshot.knockoutGatesCleared > 0) {
    applyFragments(42, runSnapshot.knockoutGatesCleared * economy.fragmentPerKnockoutGate, "knockout");
    applyFragments(43, runSnapshot.knockoutGatesCleared * economy.fragmentPerKnockoutGate, "knockout");
  }
  if (runSnapshot.wonWorldCup) {
    applyFragments(42, economy.fragmentPerWorldCupWin, "world_cup");
    applyFragments(43, economy.fragmentPerWorldCupWin, "world_cup");
    applyFragments(46, economy.fragmentPerWorldCupWin, "world_cup");
    applyFragments(47, economy.fragmentPerWorldCupWin, "world_cup");
    applyFragments(50, economy.fragmentPerWorldCupWin, "world_cup");
  }

  const unlockedLegends = [...(accountState.unlockedLegends || [])];
  const legendsUnlocked = [];
  const threshold = economy.legendFragmentThreshold;
  for (const legendId of [42, 43, 46, 47, 50]) {
    const count = Number(legendFragments[String(legendId)]) || 0;
    if (count >= threshold && !unlockedLegends.includes(legendId)) {
      unlockedLegends.push(legendId);
      legendsUnlocked.push(legendId);
    }
  }

  const accountFlags = {
    ...(accountState.accountFlags || {}),
    reachedKnockout: Boolean(accountState.accountFlags?.reachedKnockout || runSnapshot.reachedKnockout),
    reachedFinal: Boolean(accountState.accountFlags?.reachedFinal || runSnapshot.reachedFinal),
    wonWorldCup: Boolean(accountState.accountFlags?.wonWorldCup || runSnapshot.wonWorldCup)
  };

  const gameAlbumMeta = {
    ...(accountState.gameAlbumMeta || {}),
    knockoutPageUnlocked: Boolean(
      accountState.gameAlbumMeta?.knockoutPageUnlocked || runSnapshot.reachedKnockout
    ),
    legendsPageUnlocked: Boolean(
      accountState.gameAlbumMeta?.legendsPageUnlocked || fragmentGrants.length > 0 || legendsUnlocked.length > 0
    )
  };

  const runCount = (Number(accountState.runCount) || 0) + 1;
  const campaignWins = (Number(accountState.campaignWins) || 0) + (runSnapshot.wonWorldCup ? 1 : 0);

  const historyEntry = Object.freeze({
    runId: runSnapshot.runId,
    endedAt: new Date().toISOString(),
    stamps: runSnapshot.badgeCount,
    gatesCleared: runSnapshot.knockoutGatesCleared,
    wonWorldCup: runSnapshot.wonWorldCup,
    creditsEarned
  });
  const runHistory = [historyEntry, ...(accountState.runHistory || [])].slice(0, 50);

  const sliceProfileIds = window.DomainAlbum?.getSliceAlbumProfileIds?.() || [];
  const hostCityProfileIds = window.DomainAlbum?.getSlotProfileIds?.("host_city") || [];

  const summary = Object.freeze({
    stampsEarned: runSnapshot.badgeCount,
    gatesCleared: runSnapshot.knockoutGatesCleared,
    wonWorldCup: runSnapshot.wonWorldCup,
    creditsEarned,
    creditsBreakdown: Object.freeze(creditsBreakdown.map(row => Object.freeze({ ...row }))),
    newSigns: Object.freeze(newSignIds.map(profileId => Object.freeze({
      profileId,
      name: getProfileName(profileId)
    }))),
    fragments: Object.freeze(fragmentGrants.map(row => Object.freeze({ ...row }))),
    legendsUnlocked: Object.freeze([...legendsUnlocked]),
    albumSignedCount: window.DomainAlbum?.countSigned?.(sliceProfileIds) || Object.values(albumPatch).filter(v => v === 1).length,
    albumTotal: sliceProfileIds.length || Object.keys(albumPatch).length,
    hostCitySignedCount: window.DomainAlbum?.countSigned?.(hostCityProfileIds) || 0,
    hostCityTotal: hostCityProfileIds.length,
    battles: Number(runSnapshot.ledger?.battleCount || 0),
    scouts: Number(runSnapshot.ledger?.scoutCount || runSnapshot.ledger?.scoutReportsSeen?.length || 0),
    runCount,
    campaignWins,
    metaRewardsLabel: creditsEarned > 0 ? `${creditsEarned} Football Credits earned` : "Account progress updated"
  });

  const patch = Object.freeze({
    album: Object.freeze(albumPatch),
    footballCredits: (Number(accountState.footballCredits) || 0) + creditsEarned,
    legendFragments: Object.freeze(legendFragments),
    unlockedLegends: Object.freeze(unlockedLegends),
    accountFlags: Object.freeze(accountFlags),
    gameAlbumMeta: Object.freeze(gameAlbumMeta),
    runCount,
    campaignWins,
    runHistory: Object.freeze(runHistory),
    ...(runSnapshot.runId ? { lastSettledRunId: runSnapshot.runId } : {})
  });

  return Object.freeze({ patch, summary });
}

const DomainMeta = Object.freeze({
  RUN_ECONOMY_URL,
  initRunEconomy,
  getRunEconomyConfig,
  readAccountState,
  buildRunSnapshot,
  settleRun
});

window.DomainMeta = DomainMeta;
