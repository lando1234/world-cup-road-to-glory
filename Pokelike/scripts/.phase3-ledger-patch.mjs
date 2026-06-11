import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const taskId = process.argv[2];
const commit = process.argv[3];
const pill = process.argv[4] || '';

if (!taskId || !commit) {
  console.error('Usage: node .phase3-ledger-patch.mjs P3-017 <hash> [pill text]');
  process.exit(1);
}

const ledgerPath = path.join(root, 'docs/024-phase-3-engineering-task-breakdown.md');
let ledger = fs.readFileSync(ledgerPath, 'utf8');
ledger = ledger.replace(/\*\*Last sync:\*\* P3-\d+ \(`[0-9a-f]+`\)/, `**Last sync:** ${taskId} (\`${commit.slice(0, 7)}\`)`);
const doneMatch = ledger.match(/\| \*\*Done\*\* \| (\d+) \|/);
if (doneMatch) {
  const n = Number(doneMatch[1]) + 1;
  ledger = ledger.replace(/\| \*\*Done\*\* \| \d+ \|/, `| **Done** | ${n} |`);
  ledger = ledger.replace(/\| \*\*Not started\*\* \| (\d+) \|/, (_, x) => `| **Not started** | ${Number(x) - 1} |`);
}
ledger = ledger.replace(
  new RegExp(`\\| ${taskId} \\| ⬜ \\|`, 'm'),
  `| ${taskId} | ✅ |`
);
ledger = ledger.replace(
  new RegExp(`(\\| ${taskId} \\| ✅ \\| [^|]+ \\| [^|]+ \\|) \\|`, 'm'),
  `$1 \`${commit.slice(0, 7)}\` |`
);
fs.writeFileSync(ledgerPath, ledger);

if (pill) {
  const htmlPath = path.join(root, 'docs/022-phase-3-assumptions-tradeoffs-assets-report.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const pillLine = `        <span class="pill">P3-GOV: ${pill}</span>\n`;
  if (!html.includes(`P3-GOV: ${pill}`)) {
    html = html.replace(
      /(<span class="pill">P3-GOV: P3-001 baseline<\/span>\n)/,
      `$1${pillLine}`
    );
  }
  fs.writeFileSync(htmlPath, html);
}
