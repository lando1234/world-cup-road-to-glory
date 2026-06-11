import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const host = "127.0.0.1";
const port = Number(process.env.SMOKE_HTTP_PORT || 4174);
const baseUrl = `http://${host}:${port}`;

const routes = [
  { path: "/", includes: "title-screen" },
  { path: "/css/style.css", includes: "title-screen" },
  { path: "/js/domain/features.js", includes: "cloudSave: false" },
  { path: "/js/domain/profiles.js", includes: "DomainProfiles" },
  { path: "/js/domain/album.js", includes: "DomainAlbum" },
  { path: "/js/domain/save.js", includes: "DomainSave" },
  { path: "/js/game.js", includes: "showSliceCompleteScreen" },
  { path: "/js/ui.js", includes: "openAlbumModal" },
  { path: "/data/football/player_profiles.json", includes: "\"profiles\"" },
  { path: "/data/football/portrait_manifest.json", includes: "stylized_non_likeness_jersey_avatars" },
  { path: "/data/football/host_city_bosses.json", includes: "\"mapIndex\": 7" },
  { path: "/data/football/scout_pools.json", includes: "\"forcedOverrides\"" },
  { path: "/data/football/album_layout.json", includes: "\"pages\"" },
  { path: "/data/football/host_city_expansion.json", includes: "\"merged_to_runtime\"" },
  { path: "/data/football/scout_pools_expansion.json", includes: "\"late\"" },
  { path: "/data/football/album_layout_expansion.json", includes: "\"host_city\"" },
  { path: "/data/football/player_asset_manifest.json", includes: "\"players\"" },
  { path: "/data/football/node_asset_manifest.json", includes: "\"nodes\"" },
  { path: "/data/football/stamp_asset_manifest.json", includes: "\"stamp_london\"" },
  { path: "/data/football/ui_asset_manifest.json", includes: "\"collectionButton\"" },
  { path: "/assets/stamps/sao-paulo-stamp.svg", includes: "Sao Paulo City Stamp" },
  { path: "/assets/stamps/berlin-stamp.svg", includes: "Berlin City Stamp" },
  { path: "/assets/stamps/tokyo-stamp.svg", includes: "Tokyo City Stamp" },
  { path: "/assets/stamps/madrid-stamp.svg", includes: "Madrid City Stamp" },
  { path: "/assets/stamps/milan-stamp.svg", includes: "Milan City Stamp" },
  { path: "/assets/stamps/amsterdam-stamp.svg", includes: "Amsterdam City Stamp" },
  { path: "/assets/stamps/mexico-city-stamp.svg", includes: "Mexico City Stamp" },
  { path: "/assets/stamps/london-stamp.svg", includes: "London City Stamp" },
  { path: "/assets/nodes/scout-report.svg", includes: "Scout Report" },
  { path: "/assets/nodes/host-city-challenge.svg", includes: "Host City Challenge" },
  { path: "/assets/ui/logo.svg", includes: "Road to Glory" },
  { path: "/assets/ui/settlement-trophy.svg", includes: "Settlement Trophy" }
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/`, { method: "HEAD" });
      if (response.ok) return;
    } catch {
      // Server not ready yet.
    }
    await wait(100);
  }
  throw new Error(`HTTP smoke server did not become ready at ${baseUrl}`);
}

async function assertRoute(route) {
  const response = await fetch(`${baseUrl}${route.path}`);
  if (!response.ok) {
    throw new Error(`${route.path} returned ${response.status}`);
  }
  const body = await response.text();
  if (!body.includes(route.includes)) {
    throw new Error(`${route.path} did not include expected marker ${route.includes}`);
  }
  console.log(`PASS HTTP ${route.path}`);
}

const server = spawn(process.execPath, [
  "Pokelike/scripts/serve-static.mjs",
  "--root",
  "Pokelike",
  "--host",
  host,
  "--port",
  String(port)
], {
  cwd: projectRoot,
  stdio: ["ignore", "pipe", "pipe"]
});

let serverOutput = "";
server.stdout.on("data", chunk => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", chunk => {
  serverOutput += chunk.toString();
});

try {
  await waitForServer();
  for (const route of routes) {
    await assertRoute(route);
  }
  console.log(`${routes.length} HTTP smoke checks passed.`);
} catch (error) {
  console.error("FAIL HTTP smoke");
  if (serverOutput.trim()) {
    console.error(serverOutput.trim());
  }
  console.error(error.message);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
