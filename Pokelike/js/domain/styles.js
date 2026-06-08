/**
 * @module domain/styles
 * Style-system domain module for the World Cup vertical slice.
 *
 * STYLE_CHART values are projected from data.js TYPE_CHART through a stable
 * StyleId -> legacy type mapping so combat balance remains unchanged while the
 * battle engine still consumes legacy type names.
 */
const STYLE_IDS = Object.freeze([
  "balanced",
  "high_press",
  "possession_buildup",
  "wing_play",
  "rapid_counter",
  "ice_press",
  "physical_battle",
  "dark_arts",
  "aerial_threat",
  "wide_play",
  "tactical_control",
  "high_intensity",
  "compact_block",
  "clinical_finishing",
  "power_strike",
  "street_smarts",
  "iron_defense",
  "set_piece_master"
]);

const STYLE_LABELS = Object.freeze({
  balanced: "Balanced",
  high_press: "High Press",
  possession_buildup: "Possession Build-up",
  wing_play: "Wing Play",
  rapid_counter: "Rapid Counter",
  ice_press: "Ice Press",
  physical_battle: "Physical Battle",
  dark_arts: "Dark Arts",
  aerial_threat: "Aerial Threat",
  wide_play: "Wide Play",
  tactical_control: "Tactical Control",
  high_intensity: "High Intensity",
  compact_block: "Compact Block",
  clinical_finishing: "Clinical Finishing",
  power_strike: "Power Strike",
  street_smarts: "Street Smarts",
  iron_defense: "Iron Defense",
  set_piece_master: "Set Piece Master"
});

// Transitional mapping for the vanilla battle engine. The current TYPE_CHART in
// data.js has 17 legacy keys, while the football domain has 18 StyleIds; until
// P1-004 wires consumers to domain styles, set_piece_master intentionally shares
// the neutral Normal matchup profile to preserve existing combat balance.
const STYLE_LEGACY_TYPES = Object.freeze({
  balanced: "Normal",
  high_press: "Fire",
  possession_buildup: "Water",
  wing_play: "Electric",
  rapid_counter: "Grass",
  ice_press: "Ice",
  physical_battle: "Fighting",
  dark_arts: "Poison",
  aerial_threat: "Ground",
  wide_play: "Flying",
  tactical_control: "Psychic",
  high_intensity: "Bug",
  compact_block: "Rock",
  clinical_finishing: "Ghost",
  power_strike: "Dragon",
  street_smarts: "Dark",
  iron_defense: "Steel",
  set_piece_master: "Normal"
});

// Snapshot of data.js TYPE_CHART values for P1-003. Keep changes here paired
// with verifyStyleChartParity(TYPE_CHART) until P1-004 makes data.js consume the
// domain style system directly.
const LEGACY_TYPE_CHART_VALUES = Object.freeze({
  Normal: Object.freeze({ Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0, Dragon: 1, Dark: 1, Steel: 0.5 }),
  Fire: Object.freeze({ Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 2, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2, Rock: 0.5, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 2 }),
  Water: Object.freeze({ Normal: 1, Fire: 2, Water: 0.5, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1, Ground: 2, Flying: 1, Psychic: 1, Bug: 1, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1 }),
  Electric: Object.freeze({ Normal: 1, Fire: 1, Water: 2, Electric: 0.5, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1, Ground: 0, Flying: 2, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1 }),
  Grass: Object.freeze({ Normal: 1, Fire: 0.5, Water: 2, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 0.5, Ground: 2, Flying: 0.5, Psychic: 1, Bug: 0.5, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 0.5 }),
  Ice: Object.freeze({ Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 0.5, Fighting: 1, Poison: 1, Ground: 2, Flying: 2, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 2, Dark: 1, Steel: 0.5 }),
  Fighting: Object.freeze({ Normal: 2, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 2, Fighting: 1, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dragon: 1, Dark: 2, Steel: 2 }),
  Poison: Object.freeze({ Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 2, Ice: 1, Fighting: 1, Poison: 0.5, Ground: 0.5, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0.5, Dragon: 1, Dark: 1, Steel: 0 }),
  Ground: Object.freeze({ Normal: 1, Fire: 2, Water: 1, Electric: 2, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 2, Ground: 1, Flying: 0, Psychic: 1, Bug: 0.5, Rock: 2, Ghost: 1, Dragon: 1, Dark: 1, Steel: 2 }),
  Flying: Object.freeze({ Normal: 1, Fire: 1, Water: 1, Electric: 0.5, Grass: 2, Ice: 1, Fighting: 2, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2, Rock: 0.5, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5 }),
  Psychic: Object.freeze({ Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 2, Poison: 2, Ground: 1, Flying: 1, Psychic: 0.5, Bug: 1, Rock: 1, Ghost: 1, Dragon: 1, Dark: 0, Steel: 0.5 }),
  Bug: Object.freeze({ Normal: 1, Fire: 0.5, Water: 1, Electric: 1, Grass: 2, Ice: 1, Fighting: 0.5, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 2, Bug: 1, Rock: 1, Ghost: 0.5, Dragon: 1, Dark: 2, Steel: 0.5 }),
  Rock: Object.freeze({ Normal: 1, Fire: 2, Water: 1, Electric: 1, Grass: 1, Ice: 2, Fighting: 0.5, Poison: 1, Ground: 0.5, Flying: 2, Psychic: 1, Bug: 2, Rock: 1, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5 }),
  Ghost: Object.freeze({ Normal: 0, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1, Rock: 1, Ghost: 2, Dragon: 1, Dark: 0.5, Steel: 0.5 }),
  Dragon: Object.freeze({ Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 2, Dark: 1, Steel: 0.5 }),
  Dark: Object.freeze({ Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 0.5, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1, Rock: 1, Ghost: 2, Dragon: 1, Dark: 0.5, Steel: 0.5 }),
  Steel: Object.freeze({ Normal: 1, Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 1, Ice: 2, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 2, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5 })
});

function styleToLegacyType(styleId) {
  return STYLE_LEGACY_TYPES[styleId] || null;
}

/**
 * Return the CSS transition handles for a football style.
 *
 * @param {string} styleId
 * @returns {{ dataStyle: string, legacyClass: string }} `dataStyle` is the
 * value for a `data-style` attribute; `legacyClass` is the temporary `.type-*`
 * alias used by existing CSS.
 */
function styleCssClass(styleId) {
  const legacyType = styleToLegacyType(styleId);
  return {
    dataStyle: styleId,
    legacyClass: legacyType ? `type-${legacyType.toLowerCase()}` : ""
  };
}

/**
 * Compare STYLE_CHART against a legacy TYPE_CHART using STYLE_LEGACY_TYPES.
 *
 * This is intentionally side-effect free and unused at runtime; it exists so
 * P1-003 parity can be verified without wiring data.js in P1-004.
 *
 * @param {Record<string, Record<string, number>>} typeChart
 * @returns {{ ok: boolean, checked: number, errors: string[] }}
 */
function verifyStyleChartParity(typeChart) {
  const errors = [];
  let checked = 0;

  for (const attackStyle of STYLE_IDS) {
    const attackLegacyType = styleToLegacyType(attackStyle);

    for (const defendStyle of STYLE_IDS) {
      const defendLegacyType = styleToLegacyType(defendStyle);
      const actual = STYLE_CHART[attackStyle][defendStyle];
      const expected = typeChart?.[attackLegacyType]?.[defendLegacyType];
      checked += 1;

      if (actual !== expected) {
        errors.push(`${attackStyle} vs ${defendStyle}: ${actual} !== ${expected}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    checked,
    errors
  };
}

function buildStyleChart() {
  const chart = {};

  for (const attackStyle of STYLE_IDS) {
    const attackLegacyType = styleToLegacyType(attackStyle);
    const row = {};

    for (const defendStyle of STYLE_IDS) {
      const defendLegacyType = styleToLegacyType(defendStyle);
      row[defendStyle] = LEGACY_TYPE_CHART_VALUES[attackLegacyType][defendLegacyType];
    }

    chart[attackStyle] = Object.freeze(row);
  }

  return Object.freeze(chart);
}

const STYLE_CHART = buildStyleChart();

const DomainStyles = Object.freeze({
  STYLE_IDS,
  STYLE_LABELS,
  STYLE_CHART,
  STYLE_LEGACY_TYPES,
  verifyStyleChartParity,
  styleCssClass,
  styleToLegacyType
});

window.DomainStyles = DomainStyles;
window.STYLE_IDS = STYLE_IDS;
window.STYLE_LABELS = STYLE_LABELS;
window.STYLE_CHART = STYLE_CHART;
window.STYLE_LEGACY_TYPES = STYLE_LEGACY_TYPES;
window.verifyStyleChartParity = verifyStyleChartParity;
window.styleCssClass = styleCssClass;
window.styleToLegacyType = styleToLegacyType;
