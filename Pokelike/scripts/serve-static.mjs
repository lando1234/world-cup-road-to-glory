import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRoot = path.resolve(__dirname, "..");

const MIME_TYPES = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
});

function parseArgs(argv) {
  const args = {
    root: defaultRoot,
    host: "127.0.0.1",
    port: 4173
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") {
      args.root = path.resolve(argv[i + 1] || args.root);
      i += 1;
    } else if (arg === "--host") {
      args.host = argv[i + 1] || args.host;
      i += 1;
    } else if (arg === "--port") {
      args.port = Number(argv[i + 1] || args.port);
      i += 1;
    }
  }

  if (!Number.isInteger(args.port) || args.port <= 0) {
    throw new Error(`Invalid --port value: ${args.port}`);
  }

  return args;
}

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function resolveRequestPath(root, requestUrl) {
  const url = new URL(requestUrl, "http://localhost");
  const decodedPath = decodeURIComponent(url.pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const candidate = path.resolve(root, relativePath);

  if (!candidate.startsWith(root + path.sep) && candidate !== root) {
    return null;
  }

  return candidate;
}

function createStaticServer(root) {
  return http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, "Method Not Allowed", { "content-type": "text/plain; charset=utf-8" });
      return;
    }

    const filePath = resolveRequestPath(root, req.url || "/");
    if (!filePath) {
      send(res, 403, "Forbidden", { "content-type": "text/plain; charset=utf-8" });
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        send(res, 404, "Not Found", { "content-type": "text/plain; charset=utf-8" });
        return;
      }

      const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, {
        "content-type": contentType,
        "cache-control": "no-store"
      });

      if (req.method === "HEAD") {
        res.end();
        return;
      }

      fs.createReadStream(filePath).pipe(res);
    });
  });
}

const args = parseArgs(process.argv.slice(2));
const server = createStaticServer(args.root);

server.listen(args.port, args.host, () => {
  console.log(`Serving ${args.root} at http://${args.host}:${args.port}/`);
});
