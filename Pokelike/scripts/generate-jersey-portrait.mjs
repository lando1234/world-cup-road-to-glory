#!/usr/bin/env node
/**
 * Generates T1 stylized jersey SVG portraits (no likeness) for player asset batches.
 * Usage: node scripts/generate-jersey-portrait.mjs <slug> <nation> <position> <profileId>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const NATION_COLORS = {
  FRA: { primary: "#1f4f8a", secondary: "#ffffff", accent: "#c8102e" },
  ARG: { primary: "#74acdf", secondary: "#ffffff", accent: "#f6b40e" },
  NED: { primary: "#ff6600", secondary: "#ffffff", accent: "#21468b" },
  POR: { primary: "#006600", secondary: "#ff0000", accent: "#ffd54f" },
  ITA: { primary: "#0066aa", secondary: "#ffffff", accent: "#00aa44" },
  MEX: { primary: "#006847", secondary: "#ffffff", accent: "#ce1126" },
  ENG: { primary: "#ffffff", secondary: "#c8102e", accent: "#012169" },
  NOR: { primary: "#ba0c2f", secondary: "#ffffff", accent: "#00205b" },
  CRO: { primary: "#ff0000", secondary: "#ffffff", accent: "#171796" },
  EGY: { primary: "#ce1126", secondary: "#ffffff", accent: "#000000" },
  ESP: { primary: "#aa151b", secondary: "#f1bf00", accent: "#ffffff" },
  BRA: { primary: "#009c3b", secondary: "#ffdf00", accent: "#002776" },
  GER: { primary: "#000000", secondary: "#dd0000", accent: "#ffce00" },
  BEL: { primary: "#000000", secondary: "#fae042", accent: "#ed2939" },
  COL: { primary: "#fcd116", secondary: "#003893", accent: "#ce1126" },
  URU: { primary: "#55a5ff", secondary: "#ffffff", accent: "#000000" },
  SEN: { primary: "#00853f", secondary: "#fdef42", accent: "#e31b23" },
  JPN: { primary: "#ffffff", secondary: "#bc002d", accent: "#000000" },
  KOR: { primary: "#ffffff", secondary: "#cd2e3a", accent: "#0047a0" },
  USA: { primary: "#ffffff", secondary: "#b22234", accent: "#3c3b6e" },
  CAN: { primary: "#ff0000", secondary: "#ffffff", accent: "#ff0000" },
  POL: { primary: "#ffffff", secondary: "#dc143c", accent: "#ffffff" },
  SUI: { primary: "#ff0000", secondary: "#ffffff", accent: "#ff0000" },
  WAL: { primary: "#ffffff", secondary: "#d30731", accent: "#00ab39" },
  SCO: { primary: "#0065bd", secondary: "#ffffff", accent: "#0065bd" },
  AUT: { primary: "#ed2939", secondary: "#ffffff", accent: "#ed2939" },
  DEN: { primary: "#c60c30", secondary: "#ffffff", accent: "#c60c30" },
  SWE: { primary: "#006aa7", secondary: "#fecc00", accent: "#006aa7" },
  CHI: { primary: "#d52b1e", secondary: "#ffffff", accent: "#0039a6" },
  PER: { primary: "#d91023", secondary: "#ffffff", accent: "#d91023" },
  ECU: { primary: "#ffdd00", secondary: "#034ea2", accent: "#ed1c24" },
  MAR: { primary: "#c1272d", secondary: "#006233", accent: "#c1272d" },
  NGA: { primary: "#008751", secondary: "#ffffff", accent: "#008751" },
  CMR: { primary: "#007a5e", secondary: "#fcd116", accent: "#ce1126" },
  GHA: { primary: "#006b3f", secondary: "#fcd116", accent: "#ce1126" },
  RSA: { primary: "#007749", secondary: "#ffb81c", accent: "#000000" },
  AUS: { primary: "#ffcd00", secondary: "#00843d", accent: "#ffffff" },
  IRN: { primary: "#ffffff", secondary: "#239f40", accent: "#da0000" },
  SAU: { primary: "#006c35", secondary: "#ffffff", accent: "#006c35" },
  QAT: { primary: "#8d1b3d", secondary: "#ffffff", accent: "#8d1b3d" },
  CRC: { primary: "#002b7f", secondary: "#ffffff", accent: "#ce1126" },
  PAN: { primary: "#ffffff", secondary: "#da121a", accent: "#005293" },
  SRB: { primary: "#c6363c", secondary: "#0c4076", accent: "#ffffff" },
  UKR: { primary: "#005bbb", secondary: "#ffd500", accent: "#005bbb" },
  TUR: { primary: "#e30a17", secondary: "#ffffff", accent: "#e30a17" },
  XI: { primary: "#1a2a4a", secondary: "#7ec8ff", accent: "#ffd54f" }
};

function jerseySvg({ slug, nation, position, profileId }) {
  const colors = NATION_COLORS[nation] || NATION_COLORS.XI;
  const label = `${nation} ${position}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" role="img" aria-label="${label} stylized jersey">
  <title>${label} T1 placeholder</title>
  <rect x="8" y="6" width="48" height="68" rx="4" fill="${colors.primary}" stroke="#1a2a4a" stroke-width="2"/>
  <path d="M8 20 L20 14 L32 20 L44 14 L56 20" fill="none" stroke="${colors.secondary}" stroke-width="2"/>
  <rect x="26" y="28" width="12" height="14" rx="1" fill="${colors.secondary}" opacity="0.85"/>
  <text x="32" y="38" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="${colors.primary}">${profileId}</text>
  <text x="32" y="58" text-anchor="middle" font-family="monospace" font-size="8" fill="${colors.secondary}">${nation}</text>
  <text x="32" y="70" text-anchor="middle" font-family="monospace" font-size="7" fill="${colors.accent}">${position}</text>
</svg>
`;
}

const [slug, nation, position, profileId] = process.argv.slice(2);
if (!slug || !nation || !position || !profileId) {
  console.error("Usage: generate-jersey-portrait.mjs <slug> <nation> <position> <profileId>");
  process.exit(1);
}

const dir = path.join(projectRoot, "assets/players", slug);
fs.mkdirSync(dir, { recursive: true });
const svg = jerseySvg({ slug, nation, position, profileId: String(profileId) });
for (const name of ["album.svg", "portrait.svg", "battle.svg", "squad.svg"]) {
  fs.writeFileSync(path.join(dir, name), svg);
}
console.log(`Wrote T1 jersey SVGs for ${slug} (${nation} ${position})`);
