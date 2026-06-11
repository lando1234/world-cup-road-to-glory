import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const results = [];

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function createBrowserLikeContext() {
  const storage = new Map();
  const window = {};
  let rngSeed = 0x12345678;
  const context = {
    console,
    window,
    AbortController,
    setTimeout,
    clearTimeout,
    rng() {
      rngSeed = (rngSeed + 0x6D2B79F5) | 0;
      let t = Math.imul(rngSeed ^ (rngSeed >>> 15), 1 | rngSeed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    document: {
      __pokeVisibilityHooked: false,
      visibilityState: "visible",
      addEventListener() {},
      querySelectorAll() {
        return [];
      },
      getElementById() {
        return null;
      }
    },
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        storage.set(key, String(value));
      },
      removeItem(key) {
        storage.delete(key);
      }
    }
  };
  window.window = window;
  window.console = console;
  window.document = context.document;
  window.localStorage = context.localStorage;
  window.FEATURES = undefined;
  return vm.createContext(context);
}

function runScript(context, relativePath) {
  const source = readText(relativePath);
  vm.runInContext(source, context, { filename: relativePath });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runTest(name, fn) {
  try {
    await fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    results.push({ name, status: "FAIL", error });
  }
}

function getScriptOrder() {
  const html = readText("index.html");
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
}

const context = createBrowserLikeContext();
runScript(context, "js/domain/features.js");
runScript(context, "js/domain/styles.js");
runScript(context, "js/domain/profiles.js");
runScript(context, "js/domain/album.js");
runScript(context, "js/domain/bosses.js");
runScript(context, "js/domain/combat-adapter.js");
runScript(context, "js/domain/save.js");
runScript(context, "js/domain/scout.js");
runScript(context, "js/domain/recruit.js");

context.window.GAME_THEME = {
  node: {
    scoutReport: "Scout Report",
    friendlyMatch: "Friendly Match",
    recoveryCenter: "Recovery Center",
    gearCrate: "Gear Crate",
    rivalNationalTeam: "Rival National Team",
    hostCityChallenge: "Host City Challenge"
  }
};
context.TRAINER_SPRITE_KEYS = ["aceTrainer", "fisher"];
context.GEN2_ONLY_TRAINER_KEYS = new Set();
context.GEN1_ONLY_TRAINER_KEYS = new Set();
context.TRAINER_SPRITE_NAMES = {};
context.TRAINER_SPECIALTIES = {};
context.TRAINER_SPECIALTIES_GEN2 = {};
runScript(context, "js/map.js");
runScript(context, "js/cloud-save.js");

const catalogJson = readJson("data/football/player_profiles.json");
const catalog = context.window.DomainProfiles.loadCatalog(catalogJson);
const hostCityBossesJson = readJson("data/football/host_city_bosses.json");
const hostCityBossCatalog = context.window.DomainBosses.loadHostCityBosses(hostCityBossesJson);
const albumLayoutJson = readJson("data/football/album_layout.json");
const scoutPoolsJson = readJson("data/football/scout_pools.json");
const scoutPoolCatalog = context.window.DomainScout.loadScoutPools(scoutPoolsJson);

await runTest("script load order keeps football domain before data.js", () => {
  const expected = [
    "js/domain/features.js",
    "js/domain/styles.js",
    "js/domain/portrait-source.js",
    "js/domain/profiles.js",
    "js/domain/album.js",
    "js/domain/bosses.js",
    "js/domain/combat-adapter.js",
    "js/domain/save.js",
    "js/domain/scout.js",
    "js/domain/recruit.js",
    "js/data.js"
  ];
  const actual = getScriptOrder();
  const firstDataIndex = actual.indexOf("js/data.js");
  assert(firstDataIndex !== -1, "index.html must load js/data.js");
  for (const script of expected) {
    assert(actual.includes(script), `index.html missing ${script}`);
    assert(actual.indexOf(script) <= firstDataIndex, `${script} must load before or at js/data.js`);
  }
});

await runTest("game boot migrates save before run reads", () => {
  const gameSource = readText("js/game.js");
  assert(gameSource.includes("migrateAccountSaveOnBoot();"), "initGame should call migrateAccountSaveOnBoot");
  assert(gameSource.includes("DomainAlbum.initAlbumLayout"), "football boot gate should initialize album layout");

  const initGameIndex = gameSource.indexOf("async function initGame()");
  const migrationIndex = gameSource.indexOf("migrateAccountSaveOnBoot();", initGameIndex);
  const continueRunReadIndex = gameSource.indexOf("localStorage.getItem('poke_current_run')", initGameIndex);
  assert(initGameIndex !== -1, "game.js should define initGame");
  assert(migrationIndex !== -1, "initGame should call migrateAccountSaveOnBoot");
  assert(continueRunReadIndex !== -1, "initGame should read poke_current_run for Continue Run");
  assert(migrationIndex < continueRunReadIndex, "save migration must run before initGame reads poke_current_run");
});

await runTest("new and loaded runs carry run identity ledger shape", () => {
  const gameSource = readText("js/game.js");
  const persistenceIndex = gameSource.indexOf("// ---- Run persistence ----");
  const initGameIndex = gameSource.indexOf("async function initGame()");
  const startNewRunIndex = gameSource.indexOf("async function startNewRun");
  const showTrainerIndex = gameSource.indexOf("async function showTrainerSelect()");
  assert(persistenceIndex !== -1, "game.js should have run persistence section");
  assert(startNewRunIndex !== -1, "game.js should define startNewRun");
  assert(showTrainerIndex !== -1, "game.js should define showTrainerSelect after startNewRun");

  const persistenceBlock = gameSource.slice(persistenceIndex, initGameIndex);
  const startNewRunBlock = gameSource.slice(startNewRunIndex, showTrainerIndex);

  assert(persistenceBlock.includes("function createRunId()"), "run persistence should define createRunId");
  assert(persistenceBlock.includes("crypto.randomUUID"), "createRunId should prefer crypto.randomUUID when available");
  assert(persistenceBlock.includes("function createEmptyRunLedger()"), "run persistence should define createEmptyRunLedger");
  assert(persistenceBlock.includes("seenProfileIds: []"), "empty ledger should include seenProfileIds");
  assert(persistenceBlock.includes("signedProfileIds: []"), "empty ledger should include signedProfileIds");
  assert(persistenceBlock.includes("duplicateSignProfileIds: []"), "empty ledger should include duplicateSignProfileIds");
  assert(persistenceBlock.includes("state = normalizeRunIdentity(saved, { assignRunId: true });"), "loadRun should normalize older saves before restoring state");
  assert(startNewRunBlock.includes("normalizeRunIdentity({"), "startNewRun should normalize new run state");
  assert(startNewRunBlock.includes("{ assignRunId: true }"), "new runs should receive a runId");
});

await runTest("run identity ledger persists through current run save shape", () => {
  const gameSource = readText("js/game.js");
  const saveRunIndex = gameSource.indexOf("function saveRun()");
  const loadRunIndex = gameSource.indexOf("function loadRun()");
  const clearRunIndex = gameSource.indexOf("function clearSavedRun()");
  assert(saveRunIndex !== -1, "game.js should define saveRun");
  assert(loadRunIndex !== -1, "game.js should define loadRun");
  assert(clearRunIndex !== -1, "game.js should define clearSavedRun");

  const saveRunBlock = gameSource.slice(saveRunIndex, loadRunIndex);
  const loadRunBlock = gameSource.slice(loadRunIndex, clearRunIndex);

  assert(saveRunBlock.includes("const saved = { ...state,"), "saveRun should serialize the full state object");
  assert(!saveRunBlock.includes("delete saved.runId"), "saveRun must not strip runId");
  assert(!saveRunBlock.includes("delete saved.ledger"), "saveRun must not strip ledger");
  assert(loadRunBlock.includes("state = normalizeRunIdentity(saved, { assignRunId: true });"), "loadRun should restore and normalize saved run identity");
  assert(loadRunBlock.includes("delete state.currentNodeId"), "loadRun should keep transient currentNodeId cleanup");
  assert(loadRunBlock.includes("delete state.rngSeed"), "loadRun should keep transient rngSeed cleanup");
});

await runTest("football catch node is wired to scout recruitment flow", () => {
  const gameSource = readText("js/game.js");
  const htmlSource = readText("index.html");
  const cssSource = readText("css/style.css");
  const doCatchIndex = gameSource.indexOf("async function doCatchNode(node)");
  const doScoutIndex = gameSource.indexOf("async function doScoutReportNode(node)");
  const confirmScoutIndex = gameSource.indexOf("function confirmScoutContract");
  const signScoutIndex = gameSource.indexOf("function signScoutPlayer(player, node)");
  const catchPokemonIndex = gameSource.indexOf("function catchPokemon(pokemon, node)");

  assert(doCatchIndex !== -1, "game.js should define doCatchNode");
  assert(doScoutIndex !== -1, "game.js should define doScoutReportNode");
  assert(confirmScoutIndex !== -1, "game.js should define confirmScoutContract");
  assert(signScoutIndex !== -1, "game.js should define signScoutPlayer");
  assert(catchPokemonIndex !== -1, "game.js should define legacy catchPokemon");

  const doCatchBlock = gameSource.slice(doCatchIndex, doScoutIndex);
  const scoutBlock = gameSource.slice(doScoutIndex, confirmScoutIndex);
  const confirmBlock = gameSource.slice(confirmScoutIndex, signScoutIndex);
  const signBlock = gameSource.slice(signScoutIndex, catchPokemonIndex);

  assert(htmlSource.includes('<h2 class="scout-report-title">Scout Report</h2>'), "catch screen HTML should default to Scout Report");
  assert(htmlSource.includes('id="catch-screen-subtitle" class="scout-report-subtitle"'), "catch screen should expose a Scout Report subtitle element");
  assert(htmlSource.includes('Pass on report'), "catch screen skip button should default to Pass on report");
  assert(doCatchBlock.includes("if (isFootballModeEnabled())"), "doCatchNode should branch for football mode");
  assert(doCatchBlock.includes("await doScoutReportNode(node);"), "football doCatchNode should delegate to doScoutReportNode");
  assert(scoutBlock.includes("DomainScout.initScoutPools"), "doScoutReportNode should initialize scout pools");
  assert(scoutBlock.includes("DomainScout.buildSliceReport"), "doScoutReportNode should build scout report");
  assert(scoutBlock.includes("DomainCombatAdapter.createPlayerInstance"), "doScoutReportNode should create football player instances");
  assert(scoutBlock.includes("markAlbumSeen(profileId)"), "doScoutReportNode should mark displayed profiles as seen through album facade");
  assert(scoutBlock.includes("Shortlist from"), "doScoutReportNode should render host city scout flavor");
  assert(scoutBlock.includes("confirmScoutContract"), "scout cards should open a contract confirmation modal");
  assert(scoutBlock.includes("scout-duplicate-hint"), "signed players should show a duplicate hint");
  assert(scoutBlock.includes("Pass on report"), "football skip label should be Pass on report");
  assert(confirmBlock.includes("Offer contract to"), "contract modal should ask for confirmation");
  assert(confirmBlock.includes("contract-stamp-pulse"), "contract confirmation should trigger stamp animation hook");
  assert(cssSource.includes("@keyframes contractStampPulse"), "contract stamp animation CSS should exist");
  assert(signBlock.includes("DomainRecruit.offerContract"), "signScoutPlayer should offer contract through DomainRecruit");
  assert(signBlock.includes("showSwapScreen(player, node)"), "signScoutPlayer should route full squads to swap screen");
  assert(!signBlock.includes("markPokedexCaught"), "football scout signing should not write poke_dex");
});

await runTest("football swap screen is reskinned as squad registration", () => {
  const gameSource = readText("js/game.js");
  const htmlSource = readText("index.html");
  const swapIndex = gameSource.indexOf("function showSwapScreen(newPoke, node)");
  const itemIndex = gameSource.indexOf("function doItemNode(node)");
  assert(swapIndex !== -1, "game.js should define showSwapScreen");
  assert(itemIndex !== -1, "game.js should define doItemNode after showSwapScreen");

  const swapBlock = gameSource.slice(swapIndex, itemIndex);

  assert(htmlSource.includes('<h2 class="squad-registration-title">Squad Registration</h2>'), "swap screen HTML should default to Squad Registration");
  assert(htmlSource.includes("Decline contract"), "swap screen cancel button should default to Decline contract");
  assert(swapBlock.includes("isFootballRuntimeInstance(newPoke)"), "swap screen should detect football incoming players");
  assert(swapBlock.includes("'Squad Registration'"), "football swap title should be Squad Registration");
  assert(swapBlock.includes("Select a squad slot to replace, or decline this contract."), "football full-squad prompt should avoid release/Pokemon copy");
  assert(swapBlock.includes("Register this signing or decline the contract."), "football add-with-room prompt should use registration copy");
  assert(swapBlock.includes("Decline contract"), "football swap cancel action should be decline contract");
  assert(swapBlock.includes("Register ${newPoke.name}"), "football direct add button should use registration copy");
  assert(swapBlock.includes("DomainRecruit.offerContract(newPoke.profileId, state, { forceAdd: true })"), "football swap should force-add through DomainRecruit");
  assert(swapBlock.includes("signed to the squad"), "football swap notification should use squad signing copy");
});

await runTest("football boss node is wired to host city domain flow", () => {
  const gameSource = readText("js/game.js");
  const doBossIndex = gameSource.indexOf("async function doBossNode(node)");
  const leaderViewIndex = gameSource.indexOf("function buildHostCityLeaderView(boss)");
  const doEliteIndex = gameSource.indexOf("async function doElite4()");

  assert(doBossIndex !== -1, "game.js should define doBossNode");
  assert(leaderViewIndex !== -1, "game.js should define buildHostCityLeaderView");
  assert(doEliteIndex !== -1, "game.js should define doElite4");

  const doBossBlock = gameSource.slice(doBossIndex, leaderViewIndex);
  const footballBranchStart = doBossBlock.indexOf("if (isFootballModeEnabled())");
  const legacyBranchStart = doBossBlock.indexOf("const leader = GYM_LEADERS[state.currentMap]");

  assert(footballBranchStart !== -1, "doBossNode should branch for football mode");
  assert(legacyBranchStart !== -1, "doBossNode should retain legacy GYM_LEADERS branch");
  assert(footballBranchStart < legacyBranchStart, "football boss branch should run before legacy GYM_LEADERS path");

  const footballBranch = doBossBlock.slice(footballBranchStart, legacyBranchStart);
  assert(footballBranch.includes("DomainBosses?.getHostCity(state.currentMap)"), "football boss branch should load host city by current map");
  assert(footballBranch.includes("DomainBosses.buildBossTeam(boss)"), "football boss branch should build team through DomainBosses");
  assert(footballBranch.includes("runBattleScreen(enemyTeam, true"), "football boss branch should use existing boss battle flow");
  assert(footballBranch.includes("state.badges++"), "football boss win should increment the engine stamp counter");
  assert(footballBranch.includes("showBadgeScreen(leader)"), "football boss win should reuse ceremony flow until stamp UI task");
  assert(footballBranch.includes("showGameOver()"), "football boss loss should trigger game over");
  assert(!footballBranch.includes("GYM_LEADERS"), "football boss branch must not read legacy GYM_LEADERS");
});

await runTest("football slice map cap is enforced before map generation", () => {
  const gameSource = readText("js/game.js");
  const maxIndex = gameSource.indexOf("function getFootballMaxMapIndex()");
  const normalizeIndex = gameSource.indexOf("function normalizePlayableMapIndex(mapIndex)");
  const startMapIndex = gameSource.indexOf("function startMap(mapIndex)");

  assert(maxIndex !== -1, "game.js should define getFootballMaxMapIndex");
  assert(normalizeIndex !== -1, "game.js should define normalizePlayableMapIndex");
  assert(startMapIndex !== -1, "game.js should define startMap");

  const maxBlock = gameSource.slice(maxIndex, normalizeIndex);
  const normalizeBlock = gameSource.slice(normalizeIndex, startMapIndex);
  const startMapBlock = gameSource.slice(startMapIndex, gameSource.indexOf("function showMapScreen()"));
  assert(maxBlock.includes("window.FEATURES?.maxMapIndex"), "getFootballMaxMapIndex should read FEATURES.maxMapIndex");
  assert(normalizeBlock.includes("getFootballMaxMapIndex()"), "normalizePlayableMapIndex should use getFootballMaxMapIndex");
  assert(normalizeBlock.includes("safeMapIndex > maxMapIndex"), "normalizePlayableMapIndex should cap maps above the slice max");
  assert(startMapBlock.includes("mapIndex = normalizePlayableMapIndex(mapIndex);"), "startMap should normalize before assigning state.currentMap");
  assert(startMapBlock.indexOf("normalizePlayableMapIndex") < startMapBlock.indexOf("generateMap"), "startMap must normalize before generateMap");
});

await runTest("football slice complete interrupts post-third-stamp map advance", () => {
  const gameSource = readText("js/game.js");
  const htmlSource = readText("index.html");
  const targetIndex = gameSource.indexOf("function getFootballSliceStampTarget()");
  const completeIndex = gameSource.indexOf("function isFootballSliceComplete()");
  const badgeIndex = gameSource.indexOf("function showBadgeScreen(leader)");
  const sliceScreenIndex = gameSource.indexOf("function showSliceCompleteScreen()");
  const gameOverIndex = gameSource.indexOf("async function showGameOver()");

  assert(targetIndex !== -1, "game.js should define getFootballSliceStampTarget");
  assert(completeIndex !== -1, "game.js should define isFootballSliceComplete");
  assert(badgeIndex !== -1, "game.js should define showBadgeScreen");
  assert(sliceScreenIndex !== -1, "game.js should define showSliceCompleteScreen");
  assert(gameOverIndex !== -1, "game.js should define showGameOver after slice completion helpers");

  const completeBlock = gameSource.slice(completeIndex, badgeIndex);
  const badgeBlock = gameSource.slice(badgeIndex, sliceScreenIndex);
  const sliceBlock = gameSource.slice(sliceScreenIndex, gameOverIndex);

  assert(completeBlock.includes("state.badges >= getFootballSliceStampTarget()"), "slice completion should key off earned stamps");
  assert(badgeBlock.includes("if (isFootballSliceComplete())"), "badge advance should check slice completion");
  assert(badgeBlock.includes("showSliceCompleteScreen();"), "badge advance should show slice complete screen");
  assert(badgeBlock.indexOf("showSliceCompleteScreen();") < badgeBlock.indexOf("startMap(state.currentMap + 1)"), "slice complete must happen before next-map start");
  assert(sliceBlock.includes("settleRunAndReturnToTitle();"), "slice completion should flow through settlement helper");
  assert(sliceBlock.includes("DomainAlbum?.getSliceAlbumProfileIds"), "slice completion should calculate slice album total");
  assert(sliceBlock.includes("DomainAlbum?.countSigned"), "slice completion should calculate signed album count");
  assert(sliceBlock.includes("albumPct"), "slice completion should calculate album percentage");
  assert(sliceBlock.includes("window.GAME_THEME?.sliceCompleteTitle"), "slice completion should use GAME_THEME title");
  assert(!sliceBlock.includes("doElite4"), "slice completion should not call elite flow");
  assert(htmlSource.includes('id="slice-complete-screen"'), "index.html should define slice-complete-screen");
  assert(htmlSource.includes('id="slice-complete-stats"'), "slice complete screen should define stats container");
  assert(htmlSource.includes("Vertical Slice — 3 of 8 host cities"), "slice complete message should use honest vertical slice label");
  assert(!htmlSource.slice(htmlSource.indexOf('id="slice-complete-screen"'), htmlSource.indexOf("<!-- ===== WIN SCREEN ===== -->")).includes("Elite Four"), "slice complete screen must not use Elite Four copy");
});

await runTest("football stamp ceremony uses host city stamp presentation", () => {
  const gameSource = readText("js/game.js");
  const htmlSource = readText("index.html");
  const cssSource = readText("css/style.css");
  const flagIndex = gameSource.indexOf("function flagEmojiFromCountryCode(countryCode)");
  const badgeIndex = gameSource.indexOf("function showBadgeScreen(leader)");
  const settleIndex = gameSource.indexOf("function createRunSnapshot()");

  assert(flagIndex !== -1, "game.js should define flagEmojiFromCountryCode");
  assert(badgeIndex !== -1, "game.js should define showBadgeScreen");
  assert(settleIndex !== -1, "game.js should define createRunSnapshot after showBadgeScreen");

  const badgeBlock = gameSource.slice(badgeIndex, settleIndex);
  const footballBranch = badgeBlock.slice(
    badgeBlock.indexOf("if (isFootballModeEnabled())"),
    badgeBlock.indexOf("} else {")
  );
  assert(footballBranch.includes("leader.badge"), "football ceremony should use stamp display name");
  assert(footballBranch.includes("leader.hostCity"), "football ceremony should display host city");
  assert(footballBranch.includes("leader.nation"), "football ceremony should use nation metadata");
  assert(footballBranch.includes("Stamps:"), "football ceremony should label progress as stamps");
  assert(footballBranch.includes("badgeImg.style.display = 'none'"), "football ceremony should hide legacy badge image");
  assert(footballBranch.includes("stampFlag.style.display = 'flex'"), "football ceremony should show stamp flag");
  assert(!footballBranch.includes("sprites/badges"), "football ceremony must not load badge sprites");

  const mapSource = gameSource.slice(gameSource.indexOf("function showMapScreen()"), badgeIndex);
  const footballHudBranch = mapSource.slice(mapSource.indexOf("} else if (isFootballModeEnabled())"), mapSource.indexOf("} else {", mapSource.indexOf("} else if (isFootballModeEnabled())")));
  assert(footballHudBranch.includes("flagEmojiFromCountryCode"), "football HUD should use nation flag for earned stamps");
  assert(!footballHudBranch.includes("<img"), "football HUD should not render badge sprite images");
  assert(htmlSource.includes('id="badge-stamp-flag"'), "index.html should include badge-stamp-flag element");
  assert(cssSource.includes(".badge-stamp-flag"), "style.css should define badge-stamp-flag styles");
});

await runTest("football album modal replaces pokedex collection surface", () => {
  const uiSource = readText("js/ui.js");
  const cssSource = readText("css/style.css");
  const albumLayoutSource = readText("data/football/album_layout.json");

  assert(uiSource.includes("async function openAlbumModal"), "ui.js should define openAlbumModal");
  assert(uiSource.includes("return openAlbumModal"), "openPokedexModal should delegate to openAlbumModal in football mode");
  assert(uiSource.includes("DomainAlbum?.initAlbumLayout"), "album modal should initialize layout through DomainAlbum");
  assert(uiSource.includes("DomainAlbum?.getAlbumLayout"), "album modal should read layout through DomainAlbum");
  assert(uiSource.includes("DomainAlbum?.getEntryState"), "album modal should read album entry states");
  assert(uiSource.includes("album-card--unknown"), "album modal should render unknown state");
  assert(uiSource.includes("album-card--seen"), "album modal should render seen state");
  assert(uiSource.includes("album-card--signed"), "album modal should render signed state");
  assert(albumLayoutSource.includes("Marquee Signings"), "album layout should include Marquee Signings page");
  assert(albumLayoutSource.includes("Fan Favorites"), "album layout should include Fan Favorites page");
  assert(uiSource.includes("Vol. 1 complete in full campaign"), "album modal should render full campaign footer note");
  assert(uiSource.includes("window.GAME_THEME.collectionLabel"), "collection buttons should use GAME_THEME.collectionLabel in football mode");
  assert(uiSource.includes("hideMilestones: true"), "football title/map chrome should hide achievements");
  assert(uiSource.includes("hideArchive: true"), "football title chrome should hide archive");
  assert(uiSource.includes("button[onclick=\"openAchievementsModal()\"]"), "football chrome should target achievement buttons");
  assert(uiSource.includes("football-album-button"), "football collection buttons should get album button styling");
  assert(uiSource.includes("album-icon-glyph"), "football map collection buttons should replace pokedex image with album glyph");
  assert(cssSource.includes(".album-modal-box"), "style.css should define album modal shell");
  assert(cssSource.includes(".album-icon-glyph"), "style.css should define album icon glyph");
  assert(cssSource.includes(".album-grid"), "style.css should define album grid");
  assert(cssSource.includes(".album-style-chip"), "style.css should define album style chips");
});

await runTest("feature gates default to football slice mode", () => {
  const features = context.window.FEATURES;
  assert(features.footballMode === true, "FEATURES.footballMode must be true");
  assert(features.sliceMode === true, "FEATURES.sliceMode must be true");
  assert(features.maxMapIndex === 2, "FEATURES.maxMapIndex must be 2 for Phase 1");
  assert(features.cloudSave === false, "FEATURES.cloudSave must be false for Phase 1");
});

await runTest("style chart exposes 18 complete football styles", () => {
  const { STYLE_IDS, STYLE_CHART, STYLE_LABELS } = context.window.DomainStyles;
  assert(STYLE_IDS.length === 18, `expected 18 styles, received ${STYLE_IDS.length}`);
  for (const attackStyle of STYLE_IDS) {
    assert(STYLE_LABELS[attackStyle], `missing label for ${attackStyle}`);
    const row = STYLE_CHART[attackStyle];
    assert(row, `missing STYLE_CHART row for ${attackStyle}`);
    for (const defendStyle of STYLE_IDS) {
      assert(typeof row[defendStyle] === "number", `missing matchup ${attackStyle} vs ${defendStyle}`);
    }
  }
});

await runTest("player catalog validates Phase 1 roster", () => {
  assert(catalog.profiles.length === 20, `expected 20 profiles, received ${catalog.profiles.length}`);
  for (const starterId of [1, 2, 3]) {
    const profile = context.window.DomainProfiles.getProfile(starterId);
    assert(profile, `missing starter profile ${starterId}`);
    assert(profile.flags.isMarquee === true, `starter profile ${starterId} must be marquee`);
  }
  assert(context.window.DomainProfiles.getProfile(2).commonName === "Messi", "profileId 2 must be Messi");
});

await runTest("marquee signing screen exposes core six style triangle", () => {
  const gameSource = readText("js/game.js");
  const cssSource = readText("css/style.css");

  assert(gameSource.includes("core-six-style-triangle"), "starter screen should render Core Six style triangle panel");
  assert(gameSource.includes("High Press"), "style triangle should describe High Press");
  assert(gameSource.includes("Possession Build-up"), "style triangle should describe Possession Build-up");
  assert(gameSource.includes("Compact Block"), "style triangle should describe Compact Block");
  assert(cssSource.includes(".core-six-style-triangle"), "style.css should style Core Six triangle panel");
  assert(cssSource.includes(".core-six-triangle-grid"), "style.css should define Core Six triangle grid");
});

await runTest("football player cards expose tier and football stat labels", () => {
  const uiSource = readText("js/ui.js");
  const cssSource = readText("css/style.css");

  assert(uiSource.includes("function renderPlayerCard"), "ui.js should define renderPlayerCard");
  assert(uiSource.includes("player-tier-bar"), "player cards should render a skill tier bar");
  for (const label of ["Stamina", "Power", "Defense", "Technique", "Vision", "Pace"]) {
    assert(uiSource.includes(label), `player cards should render ${label} stat label`);
  }
  assert(cssSource.includes(".player-stat-grid"), "style.css should define football stat grid");
  assert(cssSource.includes(".poke-card.player-card .player-tier-bar"), "style.css should define player tier bar");
});

await runTest("football portrait fallback renders jersey placeholder", () => {
  const uiSource = readText("js/ui.js");
  const cssSource = readText("css/style.css");

  assert(uiSource.includes("data-nation"), "player card fallback should carry nation metadata");
  assert(uiSource.includes("<strong>#${fallbackNumber}</strong>"), "player card fallback should render jersey number placeholder");
  assert(uiSource.includes("getBattlePortraitFallbackLabel"), "battle portrait fallback helper should exist");
  assert(uiSource.includes("<strong>#${number}</strong>"), "battle fallback should render jersey number placeholder");
  assert(cssSource.includes(".poke-card.player-card .player-portrait-fallback strong"), "card fallback should style jersey number");
  assert(cssSource.includes(".battle-portrait-fallback strong"), "battle fallback should style jersey number");
});

await runTest("combat adapter creates browser-compatible football instances", () => {
  const instance = context.window.DomainCombatAdapter.createPlayerInstance(2, 5, { moveTier: 1 });
  assert(instance.profileId === 2, "instance.profileId must be 2");
  assert(instance.speciesId === 2, "legacy speciesId bridge must remain profileId");
  assert(instance.name.includes("Messi"), "instance name should use profile displayName");
  assert(instance.currentHp === instance.maxHp, "fresh instance must start at max HP");
  assert(Array.isArray(instance.types) && instance.types.length > 0, "instance must expose legacy battle types");
});

await runTest("host city boss catalog validates Phase 1 maps", () => {
  assert(hostCityBossCatalog.bosses.length === 3, `expected 3 host city bosses, received ${hostCityBossCatalog.bosses.length}`);
  const expected = [
    { mapIndex: 0, hostCity: "S\u00e3o Paulo", stampId: "stamp_sao_paulo", profileIds: [29, 22, 17], levels: [14, 12, 13], tiers: [0, 0, 0] },
    { mapIndex: 1, hostCity: "Berlin", stampId: "stamp_berlin", profileIds: [30, 16, 26], levels: [20, 18, 19], tiers: [1, 1, 1] },
    { mapIndex: 2, hostCity: "Tokyo", stampId: "stamp_tokyo", profileIds: [31, 28, 7], levels: [25, 23, 24], tiers: [1, 1, 1] }
  ];

  for (const bossSpec of expected) {
    const boss = context.window.DomainBosses.getHostCity(bossSpec.mapIndex);
    assert(boss, `missing boss for mapIndex ${bossSpec.mapIndex}`);
    assert(boss.hostCity === bossSpec.hostCity, `mapIndex ${bossSpec.mapIndex} hostCity mismatch`);
    assert(boss.stamp.id === bossSpec.stampId, `mapIndex ${bossSpec.mapIndex} stamp mismatch`);
    assert(boss.roster.map(slot => slot.profileId).join(",") === bossSpec.profileIds.join(","), `mapIndex ${bossSpec.mapIndex} roster ids mismatch`);
    assert(boss.roster.map(slot => slot.formLevel).join(",") === bossSpec.levels.join(","), `mapIndex ${bossSpec.mapIndex} roster levels mismatch`);
    assert(boss.roster.map(slot => slot.skillTier).join(",") === bossSpec.tiers.join(","), `mapIndex ${bossSpec.mapIndex} skill tiers mismatch`);
  }

  assert(context.window.DomainBosses.getHostCity(3) === null, "maxMapIndex gate should hide mapIndex 3");
});

await runTest("host city boss teams build battle-ready instances", () => {
  const berlin = context.window.DomainBosses.getHostCity(1);
  const team = context.window.DomainBosses.buildBossTeam(berlin);

  assert(team.length === 3, `expected 3 boss team members, received ${team.length}`);
  assert(team.map(player => player.profileId).join(",") === "30,16,26", "Berlin boss team profile ids mismatch");
  assert(team.map(player => player.level).join(",") === "20,18,19", "Berlin boss team levels mismatch");

  for (const member of team) {
    assert(member.currentHp === member.maxHp, `${member.name} should start at max HP`);
    assert(member.skillTier === 1, `${member.name} should preserve boss skillTier`);
    assert(member.moveTier === 1, `${member.name} should pass skillTier to combat moveTier`);
    assert(typeof member.bossRole === "string" && member.bossRole.length > 0, `${member.name} should preserve boss role`);
  }
});

await runTest("album layout defines Phase 1 slice pages", () => {
  assert(albumLayoutJson.schemaVersion === 1, "album layout schemaVersion must be 1");
  assert(albumLayoutJson.volumeTitle === "Road to the Trophy \u2014 Vol. 1", "album layout volumeTitle mismatch");
  assert(Array.isArray(albumLayoutJson.pages), "album layout pages must be an array");

  const pageIds = albumLayoutJson.pages.map(page => page.pageId);
  assert(pageIds.join(",") === "marquee,favorites", `album layout pages mismatch: ${pageIds.join(",")}`);
  assert(!pageIds.includes("host_city"), "Phase 1 album layout must not include host_city page");
  assert(!pageIds.includes("knockout"), "Phase 1 album layout must not include knockout page");
  assert(!pageIds.includes("legends"), "Phase 1 album layout must not include legends page");

  const expectedSlotsByPage = {
    marquee: [1, 2, 3],
    favorites: [4, 6, 7, 9, 10, 12, 14, 15, 17, 18, 28]
  };
  const seenProfileIds = new Set();

  for (const page of albumLayoutJson.pages) {
    assert(typeof page.title === "string" && page.title.length > 0, `${page.pageId} title must be present`);
    assert(page.hiddenUntil === null, `${page.pageId} should be always visible in Phase 1`);
    assert(Array.isArray(page.slots), `${page.pageId} slots must be an array`);

    const expectedProfileIds = expectedSlotsByPage[page.pageId];
    assert(expectedProfileIds, `unexpected album page ${page.pageId}`);
    assert(page.slots.map(slot => slot.profileId).join(",") === expectedProfileIds.join(","), `${page.pageId} profileIds mismatch`);

    page.slots.forEach((slot, index) => {
      const expectedSlot = index + 1;
      assert(slot.slot === expectedSlot, `${page.pageId} slot ${index} must be numbered ${expectedSlot}`);
      assert(typeof slot.label === "string" && slot.label.length > 0, `${page.pageId} slot ${expectedSlot} label must be present`);
      assert(!seenProfileIds.has(slot.profileId), `album profileId ${slot.profileId} appears more than once in Phase 1 layout`);
      seenProfileIds.add(slot.profileId);

      const profile = context.window.DomainProfiles.getProfile(slot.profileId);
      assert(profile, `${page.pageId} slot ${expectedSlot} profileId ${slot.profileId} must exist in player catalog`);
      assert(profile.album.pageId === page.pageId, `profileId ${slot.profileId} album page mismatch`);
      assert(profile.album.slot === expectedSlot, `profileId ${slot.profileId} album slot mismatch`);
    });
  }
});

await runTest("album domain loads layout and exposes ordered slot ids", () => {
  const layout = context.window.DomainAlbum.loadAlbumLayout(albumLayoutJson);
  const pages = context.window.DomainAlbum.getAlbumLayout();
  const marqueeIds = context.window.DomainAlbum.getSlotProfileIds("marquee");
  const favoriteIds = context.window.DomainAlbum.getSlotProfileIds("favorites");

  assert(layout.pages.length === 2, "loaded album layout should expose 2 pages");
  assert(pages.map(page => page.pageId).join(",") === "marquee,favorites", "getAlbumLayout should expose ordered pages");
  assert(marqueeIds.join(",") === "1,2,3", "getSlotProfileIds should return marquee slots in order");
  assert(favoriteIds.join(",") === "4,6,7,9,10,12,14,15,17,18,28", "getSlotProfileIds should return favorite slots in order");
  assert(context.window.DomainAlbum.getSlotProfileIds("missing").length === 0, "missing album page should return empty slot list");
});

await runTest("scout pools define Phase 1 stage bands", () => {
  assert(scoutPoolCatalog.config.bands.length === 2, `expected 2 scout bands, received ${scoutPoolCatalog.config.bands.length}`);
  const early = context.window.DomainScout.getBandForMap(0);
  const mid = context.window.DomainScout.getBandForMap(2);
  assert(early.bandId === "early", "mapIndex 0 should use early scout band");
  assert(mid.bandId === "mid", "mapIndex 2 should use mid scout band");
  assert(early.profileIds.join(",") === "10,12,15,17,18,28", "early scout band profileIds mismatch");
  assert(mid.profileIds.join(",") === "4,6,7,9,10,12,14,15,17,18,28", "mid scout band profileIds mismatch");
  assert(scoutPoolCatalog.config.rules.excludedStarterProfileIds.join(",") === "1,2,3", "scout pools should exclude marquee starters");
});

await runTest("scout reports return three unique slice profiles", () => {
  const sequence = [0.01, 0.99, 0.35, 0.72, 0.18, 0.55];
  let index = 0;
  const report = context.window.DomainScout.buildSliceReport(2, { flags: {} }, {
    rng: () => sequence[index++ % sequence.length]
  });

  assert(report.mapIndex === 2, "scout report mapIndex should be preserved");
  assert(report.bandId === "mid", "mapIndex 2 report should use mid band");
  assert(report.profileIds.length === 3, "scout report should contain exactly 3 choices");
  assert(new Set(report.profileIds).size === 3, "scout report choices should be unique");

  for (const starterId of [1, 2, 3]) {
    assert(!report.profileIds.includes(starterId), `scout report must exclude starter ${starterId}`);
  }

  for (const profileId of report.profileIds) {
    const profile = context.window.DomainProfiles.getProfile(profileId);
    assert(profile, `scout report profileId ${profileId} must exist`);
    assert(profile.flags.scoutable === true, `scout report profileId ${profileId} must be scoutable`);
  }
});

await runTest("scout reports enforce Brazil nation cap before padding", () => {
  const report = context.window.DomainScout.buildSliceReport(2, { flags: {} }, {
    rng: () => 0.999
  });

  const brazilCount = report.profileIds
    .map(profileId => context.window.DomainProfiles.getProfile(profileId))
    .filter(profile => profile.nation === "BRA")
    .length;

  assert(brazilCount <= 1, `scout report should include at most 1 Brazil player, received ${brazilCount}`);
});

await runTest("map 0 layer 1 catch scout uses forced report pool", () => {
  const map = context.generateMap(0, false, false);
  const forcedNode = Object.values(map.nodes).find(node => node.layer === 1 && node.type === "catch");
  assert(forcedNode, "map 0 should expose a layer 1 catch node");

  const report = context.window.DomainScout.buildSliceReport(0, { flags: {} }, {
    node: forcedNode,
    rng: () => 0.25
  });
  const sortedProfileIds = [...report.profileIds].sort((a, b) => a - b);

  assert(report.flags.forcedOverrideApplied === true, "map 0 layer 1 catch report should apply forced override");
  assert(sortedProfileIds.join(",") === "12,15,17", `forced scout pool mismatch: ${sortedProfileIds.join(",")}`);
  assert(!report.profileIds.some(profileId => [1, 2, 3].includes(profileId)), "forced scout pool must not include starters");

  const includesLegendOrElite = report.profileIds.some(profileId => {
    const profile = context.window.DomainProfiles.getProfile(profileId);
    return profile.flags.isLegend || profile.rarity === "elite";
  });
  assert(includesLegendOrElite === false, "forced scout pool must not include legends or elite breakers");
});

await runTest("map 0 forced scout override does not affect later catch nodes", () => {
  const laterNode = { layer: 2, type: "catch" };
  const report = context.window.DomainScout.buildSliceReport(0, { flags: {} }, {
    node: laterNode,
    rng: () => 0.01
  });

  assert(report.flags.forcedOverrideApplied === false, "map 0 non-layer-1 catch should not apply forced override");
});

await runTest("album API persists seen and signed states monotonically", () => {
  context.localStorage.removeItem("game_album");
  context.localStorage.removeItem("poke_dex");

  const { DomainAlbum } = context.window;
  assert(DomainAlbum.ALBUM_STORAGE_KEY === "game_album", "album storage key must be game_album");
  assert(DomainAlbum.getEntryState(4) === "unknown", "profileId 4 should start unknown");
  assert(DomainAlbum.countSigned() === 0, "empty album should have zero signed entries");

  DomainAlbum.markAlbumSeen(4);
  assert(DomainAlbum.getEntryState(4) === "seen", "markAlbumSeen should set profileId 4 to seen");
  assert(JSON.parse(context.localStorage.getItem("game_album"))["4"] === 0, "seen profile should be stored as 0");

  DomainAlbum.markAlbumSigned(4);
  assert(DomainAlbum.getEntryState(4) === "signed", "markAlbumSigned should set profileId 4 to signed");
  assert(JSON.parse(context.localStorage.getItem("game_album"))["4"] === 1, "signed profile should be stored as 1");
  assert(DomainAlbum.countSigned() === 1, "one signed slice album profile should be counted");

  DomainAlbum.markAlbumSeen(4);
  assert(DomainAlbum.getEntryState(4) === "signed", "markAlbumSeen must not downgrade signed entries");
  assert(context.localStorage.getItem("poke_dex") === null, "album API must not write poke_dex");

  let rejectedUnknownProfile = false;
  try {
    DomainAlbum.markAlbumSeen(999);
  } catch (_) {
    rejectedUnknownProfile = true;
  }
  assert(rejectedUnknownProfile, "album API should reject profileIds outside the loaded catalog");
});

await runTest("football dex facades write album instead of poke_dex", () => {
  const dataSource = readText("js/data.js");
  const seenIndex = dataSource.indexOf("function markPokedexSeen");
  const caughtIndex = dataSource.indexOf("function markPokedexCaught");
  const shinyIndex = dataSource.indexOf("function getShinyDex");
  assert(dataSource.includes("function _isFootballAlbumProfileId"), "data.js should define football album profile guard");
  assert(seenIndex !== -1, "data.js should define markPokedexSeen");
  assert(caughtIndex !== -1, "data.js should define markPokedexCaught");
  assert(shinyIndex !== -1, "data.js should define getShinyDex after dex write facades");

  const seenBlock = dataSource.slice(seenIndex, caughtIndex);
  const caughtBlock = dataSource.slice(caughtIndex, shinyIndex);
  assert(seenBlock.includes("_isFootballAlbumProfileId(id)"), "markPokedexSeen should branch for football profile ids");
  assert(seenBlock.includes("DomainAlbum?.markAlbumSeen?.(id)"), "markPokedexSeen should write album seen state in football mode");
  assert(seenBlock.indexOf("DomainAlbum?.markAlbumSeen?.(id)") < seenBlock.indexOf("localStorage.setItem('poke_dex'"), "football seen branch should return before poke_dex write");
  assert(caughtBlock.includes("_isFootballAlbumProfileId(id)"), "markPokedexCaught should branch for football profile ids");
  assert(caughtBlock.includes("DomainAlbum?.markAlbumSigned?.(id)"), "markPokedexCaught should write album signed state in football mode");
  assert(caughtBlock.indexOf("DomainAlbum?.markAlbumSigned?.(id)") < caughtBlock.indexOf("localStorage.setItem('poke_dex'"), "football caught branch should return before poke_dex write");
});

await runTest("recruit contract signs player and appends ledger", () => {
  context.localStorage.removeItem("game_album");
  const runState = { team: [{ profileId: 1 }], ledger: {} };

  const result = context.window.DomainRecruit.offerContract(12, runState);

  assert(result.added === true, "contract offer should add when squad has room");
  assert(result.needsSwap === false, "contract offer should not require swap when squad has room");
  assert(result.duplicate === false, "new contract should not be marked duplicate");
  assert(runState.ledger.signedProfileIds.join(",") === "12", "signedProfileIds should append signed profile");
  assert(runState.ledger.duplicateSignProfileIds.length === 0, "new sign should not append duplicate ledger");
  assert(context.window.DomainAlbum.getEntryState(12) === "signed", "contract offer should mark album signed");
});

await runTest("recruit contract tracks duplicate signs", () => {
  context.localStorage.setItem("game_album", JSON.stringify({ "12": 1 }));
  const runState = { team: [], ledger: { signedProfileIds: [], duplicateSignProfileIds: [] } };

  const result = context.window.DomainRecruit.offerContract(12, runState);

  assert(result.added === true, "duplicate contract should still be accepted when squad has room");
  assert(result.duplicate === true, "duplicate contract should be marked duplicate");
  assert(runState.ledger.signedProfileIds.join(",") === "12", "duplicate sign should still append signedProfileIds");
  assert(runState.ledger.duplicateSignProfileIds.join(",") === "12", "duplicate sign should append duplicateSignProfileIds");
});

await runTest("recruit contract full squad requests swap without signing", () => {
  context.localStorage.removeItem("game_album");
  const runState = {
    team: Array.from({ length: 6 }, (_, index) => ({ profileId: index + 1 })),
    ledger: { signedProfileIds: [], duplicateSignProfileIds: [] }
  };

  const result = context.window.DomainRecruit.offerContract(14, runState);

  assert(result.added === false, "full squad contract should not add immediately");
  assert(result.needsSwap === true, "full squad contract should request swap");
  assert(runState.ledger.signedProfileIds.length === 0, "full squad pending swap should not append signed ledger");
  assert(context.window.DomainAlbum.getEntryState(14) === "unknown", "full squad pending swap should not mark album signed");
});

await runTest("recruit forceAdd signs after swap confirmation", () => {
  context.localStorage.removeItem("game_album");
  const runState = {
    team: Array.from({ length: 6 }, (_, index) => ({ profileId: index + 1 })),
    ledger: { signedProfileIds: [], duplicateSignProfileIds: [] }
  };

  const result = context.window.DomainRecruit.offerContract(14, runState, { forceAdd: true });

  assert(result.added === true, "forceAdd contract should sign after swap confirmation");
  assert(result.needsSwap === false, "forceAdd contract should not request another swap");
  assert(runState.ledger.signedProfileIds.join(",") === "14", "forceAdd should append signedProfileIds");
  assert(context.window.DomainAlbum.getEntryState(14) === "signed", "forceAdd should mark album signed");
});

await runTest("recruit pass on report does not sign", () => {
  const result = context.window.DomainRecruit.passOnReport();
  assert(result.added === false, "pass on report should not add");
  assert(result.needsSwap === false, "pass on report should not request swap");
  assert(result.passed === true, "pass on report should return passed flag");
});

await runTest("save v3 migration copies legacy dex to album idempotently", () => {
  context.localStorage.removeItem("game_album");
  context.localStorage.removeItem("saveVersion");
  context.localStorage.removeItem("footballCredits");
  context.localStorage.removeItem("legendFragments");
  context.localStorage.setItem("poke_dex", JSON.stringify({
    "4": 0,
    "6": 1,
    "7": { caught: true },
    "not-a-profile": 1
  }));
  const activeRun = JSON.stringify({ team: [{ speciesId: 4 }], currentNodeId: "node-1" });
  context.localStorage.setItem("poke_current_run", activeRun);

  const result = context.window.DomainSave.migrateSaveV2toV3();
  assert(result.migrated === true, "first v3 migration should run");
  assert(result.albumCopied === true, "first v3 migration should copy album when absent");
  assert(context.localStorage.getItem("saveVersion") === "3", "saveVersion should be set to 3");

  const album = JSON.parse(context.localStorage.getItem("game_album"));
  assert(album["4"] === 0, "legacy seen dex entry should migrate as album seen");
  assert(album["6"] === 1, "legacy caught dex entry should migrate as album signed");
  assert(album["7"] === 1, "legacy object caught entry should compact to album signed");
  assert(!("not-a-profile" in album), "invalid legacy dex keys should not migrate");
  assert(context.localStorage.getItem("poke_current_run") === activeRun, "migration must not mutate active run save");
  assert(context.localStorage.getItem("footballCredits") === null, "album-only migration must not initialize footballCredits");
  assert(context.localStorage.getItem("legendFragments") === null, "album-only migration must not initialize legendFragments");

  const secondResult = context.window.DomainSave.migrateSaveV2toV3();
  assert(secondResult.migrated === false, "second v3 migration should be a no-op");
  assert(context.localStorage.getItem("game_album") === JSON.stringify(album), "second v3 migration should not change album");
  assert(context.localStorage.getItem("poke_dex") !== null, "legacy poke_dex should be retained for one release");
});

await runTest("save v3 migration preserves existing album", () => {
  context.localStorage.removeItem("saveVersion");
  context.localStorage.setItem("game_album", JSON.stringify({ "4": 1 }));
  context.localStorage.setItem("poke_dex", JSON.stringify({ "4": 0, "6": 1 }));

  const result = context.window.DomainSave.migrateSaveV2toV3();
  assert(result.migrated === true, "migration should still set saveVersion when album exists");
  assert(result.albumCopied === false, "migration should not copy legacy dex over an existing album");
  assert(context.localStorage.getItem("game_album") === JSON.stringify({ "4": 1 }), "existing album must not be overwritten");
});

await runTest("save v3 migration initializes fresh account album", () => {
  context.localStorage.removeItem("saveVersion");
  context.localStorage.removeItem("game_album");
  context.localStorage.removeItem("poke_dex");

  const result = context.window.DomainSave.migrateSaveV2toV3();
  assert(result.migrated === true, "fresh account migration should run");
  assert(result.albumCopied === true, "fresh account migration should initialize album storage");
  assert(context.localStorage.getItem("saveVersion") === "3", "fresh account migration should set saveVersion 3");
  assert(context.localStorage.getItem("game_album") === "{}", "fresh account migration should initialize game_album as an empty object");
});

await runTest("settleRunLite returns album patch and summary without currency rewards", () => {
  context.localStorage.setItem("game_album", JSON.stringify({ "12": 1 }));
  const result = context.window.DomainSave.settleRunLite({
    badges: 3,
    ledger: {
      signedProfileIds: [14, 15],
      battleCount: 7,
      scoutReportsSeen: ["n1", "n2"]
    }
  });

  assert(result.patch.album["14"] === 1, "settlement patch should include signed profile 14");
  assert(result.patch.album["15"] === 1, "settlement patch should include signed profile 15");
  assert(result.summary.stampsEarned === 3, "settlement summary should include stamps earned");
  assert(result.summary.newSigns.length === 2, "settlement summary should list new signs");
  assert(result.summary.albumSignedCount >= 1, "settlement summary should include album signed count");
  assert(result.summary.battles === 7, "settlement summary should include battle count");
  assert(result.summary.scouts === 2, "settlement summary should include scout count");
  assert(result.summary.metaRewardsLabel === "Meta rewards coming soon", "settlement summary should avoid currency rewards");

  const applied = context.window.DomainSave.applyAccountPatch(result.patch);
  const album = JSON.parse(context.localStorage.getItem("game_album"));
  assert(applied === true, "applyAccountPatch should return true when album patch is applied");
  assert(album["14"] === 1 && album["15"] === 1, "applyAccountPatch should write game_album patch");
});

await runTest("applyAccountPatch merges album monotonically without touching active run", () => {
  const activeRun = JSON.stringify({ runId: "run-a", ledger: { signedProfileIds: [12] } });
  context.localStorage.setItem("game_album", JSON.stringify({ "12": 1, "14": 0 }));
  context.localStorage.setItem("poke_current_run", activeRun);

  const applied = context.window.DomainSave.applyAccountPatch({
    album: {
      "12": 0,
      "14": 1,
      "15": true,
      "bad-id": 1
    }
  });
  const album = JSON.parse(context.localStorage.getItem("game_album"));

  assert(applied === true, "applyAccountPatch should return true for valid album patches");
  assert(album["12"] === 1, "signed album state must not regress to seen");
  assert(album["14"] === 1, "seen album state should upgrade to signed");
  assert(album["15"] === 1, "truthy patch state should normalize to signed");
  assert(!("bad-id" in album), "invalid profile ids should be ignored");
  assert(context.localStorage.getItem("poke_current_run") === activeRun, "applyAccountPatch must not touch active run save");
  assert(context.window.DomainSave.applyAccountPatch({}) === false, "applyAccountPatch should return false when no account key is applied");
});

await runTest("settlement modal is wired before run clear", () => {
  const gameSource = readText("js/game.js");
  const uiSource = readText("js/ui.js");
  const settleIndex = gameSource.indexOf("function settleRunAndReturnToTitle");
  const sliceIndex = gameSource.indexOf("function showSliceCompleteScreen");
  const gameOverIndex = gameSource.indexOf("async function showGameOver");

  assert(settleIndex !== -1, "game.js should define settleRunAndReturnToTitle");
  assert(uiSource.includes("function showSettlementLiteModal"), "ui.js should define settlement lite modal");
  const settleBlock = gameSource.slice(settleIndex, sliceIndex);
  assert(settleBlock.includes("DomainSave?.settleRunLite"), "game settlement helper should call DomainSave.settleRunLite");
  assert(settleBlock.includes("DomainSave?.applyAccountPatch"), "game settlement helper should call DomainSave.applyAccountPatch");
  assert(settleBlock.includes("Order invariant"), "settlement helper should document patch-before-clear invariant");
  assert(settleBlock.indexOf("applyAccountPatch") < settleBlock.indexOf("clearSavedRun"), "account patch should apply before clearSavedRun");
  const gameOverBlock = gameSource.slice(gameOverIndex, gameSource.indexOf("function showWinScreen"));
  assert(gameOverBlock.includes("if (isFootballModeEnabled())"), "football game over should use settlement flow");
  assert(gameOverBlock.includes("settleRunAndReturnToTitle();"), "football game over should render settlement before title return");
});

await runTest("football slice gates trade and legendary map nodes", () => {
  const gated = context.applyFootballSliceNodeGates({
    battle: 1,
    catch: 1,
    trade: 99,
    legendary: 99
  });
  assert(gated.trade === 0, "football slice must set trade weight to 0");
  assert(gated.legendary === 0, "football slice must set legendary weight to 0");

  for (let mapIndex = 0; mapIndex <= 7; mapIndex += 1) {
    const map = context.generateMap(mapIndex, false, false);
    const nodeTypes = Object.values(map.nodes).map(node => node.type);
    assert(!nodeTypes.includes("trade"), `map ${mapIndex} should not include trade nodes in football slice`);
    assert(!nodeTypes.includes("legendary"), `map ${mapIndex} should not include legendary nodes in football slice`);
  }
});

await runTest("football map pacing keeps slice-safe weights and question routing", () => {
  const mapSource = readText("js/map.js");
  const gameSource = readText("js/game.js");

  assert(mapSource.includes("{ battle: 25, catch: 30"), "layer 1 catch weight should be 30 for scout bias");
  assert(mapSource.includes("function applyFootballSliceNodeGates(weights)"), "map.js should define football node gate helper");
  assert(mapSource.includes("gatedWeights.trade = 0"), "football node gates should disable trade");
  assert(mapSource.includes("gatedWeights.legendary = 0"), "football node gates should disable legendary");
  assert(mapSource.includes("ci === contentCount - 1"), "map generation should preserve last content layer recovery center guarantee");

  const resolveIndex = gameSource.indexOf("function resolveQuestionMark()");
  const handlersIndex = gameSource.indexOf("// ---- Node Handlers ----");
  assert(resolveIndex !== -1, "game.js should define resolveQuestionMark");
  const resolveBlock = gameSource.slice(resolveIndex, handlersIndex);
  assert(resolveBlock.includes("if (isFootballModeEnabled())"), "resolveQuestionMark should branch for football mode");
  assert(resolveBlock.includes("NODE_TYPES.BATTLE : NODE_TYPES.TRAINER"), "football question routing should only choose battle or trainer");
  const footballQuestionBranch = resolveBlock.slice(resolveBlock.indexOf("if (isFootballModeEnabled())"), resolveBlock.indexOf("const r = rng();"));
  assert(!footballQuestionBranch.includes("shiny"), "football question routing must not include shiny events");
  assert(!footballQuestionBranch.includes("mega"), "football question routing must not include mega events");
});

await runTest("football map labels use football terminology", () => {
  assert(context.getNodeLabel({ type: "catch" }) === "Scout Report", "catch node should display Scout Report");
  assert(context.getNodeLabel({ type: "pokecenter" }) === "Recovery Center", "pokecenter node should display Recovery Center");
  assert(context.getNodeLabel({ type: "boss" }) === "Host City Challenge", "boss node should display Host City Challenge");

  const bossLabel = context.getNodeLabel({ type: "boss", mapIndex: 1 });
  assert(bossLabel.includes("Berlin"), "boss tooltip should include host city name");
  assert(bossLabel.includes("Host City Challenge"), "boss tooltip should include host city challenge label");
  assert(bossLabel.includes("Form 20"), "boss tooltip should include JSON roster form levels");
  assert(!bossLabel.includes("Gym"), "football boss tooltip should not include legacy gym terminology");
});

await runTest("football battle presentation uses theme faint copy", () => {
  const uiSource = readText("js/ui.js");
  const battleSource = readText("js/battle.js");

  assert(uiSource.includes("function formatBattleFaintLog"), "ui.js should define formatBattleFaintLog");
  assert(uiSource.includes("window.GAME_THEME?.battle?.faint"), "football faint log should read GAME_THEME.battle.faint");
  assert(uiSource.includes("return `${name} fainted!`;"), "legacy faint log should remain available outside football mode");
  assert(uiSource.includes("addLogEntry(formatBattleFaintLog(event.name), 'log-faint')"), "visual battle log should use themed faint formatter");
  assert(!battleSource.includes("GAME_THEME"), "battle.js damage engine should remain theme-agnostic");
});

await runTest("cloud save is disabled by football feature gate", async () => {
  const cloudSource = readText("js/cloud-save.js");
  const gameSource = readText("js/game.js");
  let fetchCalls = 0;
  context.localStorage.setItem("poke_save_uuid", "slice-demo");
  context.fetch = async () => {
    fetchCalls += 1;
    throw new Error("cloud save should not fetch while disabled");
  };

  assert(context.isCloudSaveEnabled() === false, "cloud save should be disabled when FEATURES.cloudSave is false");
  assert(!context.localStorage.__pokePatched, "cloud disabled should not patch localStorage.setItem");
  assert(!cloudSource.includes("'game_album'"), "game_album must stay out of cloud SYNC_KEYS while cloud save is disabled");
  assert(
    gameSource.includes("window.FEATURES?.cloudSave !== false && typeof initCloudSave === 'function'"),
    "game boot should gate initCloudSave when cloudSave is false"
  );

  const result = await context.initCloudSave();
  assert(result === false, "initCloudSave should no-op and return false when disabled");
  await context.syncToCloud();
  assert(fetchCalls === 0, "syncToCloud should not fetch while cloud save is disabled");
});

const failed = results.filter(result => result.status === "FAIL");
for (const result of results) {
  if (result.status === "PASS") {
    console.log(`PASS ${result.name}`);
  } else {
    console.error(`FAIL ${result.name}`);
    console.error(`  ${result.error.message}`);
  }
}

if (failed.length > 0) {
  console.error(`\n${failed.length}/${results.length} football domain validation checks failed.`);
  process.exit(1);
}

console.log(`\n${results.length} football domain validation checks passed.`);
