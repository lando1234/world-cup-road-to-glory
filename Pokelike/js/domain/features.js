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
  trade: false
});

window.FEATURES = FEATURES;
