/**
 * @module domain/features
 * Phase 1 feature gates for the World Cup vertical slice.
 *
 * Keep this file dependency-free so it can load before data.js and every other
 * domain module in the current browser-global runtime.
 */
const FEATURES = Object.freeze({
  footballMode: true,
  sliceMode: true,
  maxMapIndex: 2,
  continentalCup: false,
  cloudSave: false,
  nuzlocke: false,
  trade: false,
  /** Internal/demo-only shortcut. Public-critical runtime uses local portrait_manifest.json. */
  useTheSportsDbPortraits: false,
  /** Free tier keys: "123" or "3". Replace with your premium key from thesportsdb.com profile. */
  theSportsDbApiKey: "123",
  theSportsDbBaseUrl: "https://www.thesportsdb.com/api/v1/json",
  /** "fanart" (strFanart1–4) or "cutout" (transparent PNG) */
  theSportsDbPortraitStyle: "cutout"
});

window.FEATURES = FEATURES;
