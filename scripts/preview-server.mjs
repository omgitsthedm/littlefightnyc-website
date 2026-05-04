import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4321);

const typeByExtension = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com https://challenges.cloudflare.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://challenges.cloudflare.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function isAssetPath(filePath) {
  return /\/(assets|css|fonts|images|js)\//.test(filePath) || /\.(?:css|js|png|jpg|jpeg|svg|webp|woff2?|ico)$/i.test(filePath);
}

function cacheHeaderFor(filePath) {
  if (isAssetPath(filePath)) {
    return "public, max-age=31536000, immutable";
  }
  return "no-cache";
}

function etagFor(stats) {
  return `W/\"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}\"`;
}

async function canAccess(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolvePath(urlPathname) {
  const safePath = path.normalize(decodeURIComponent(urlPathname)).replace(/^(\.\.[/\\])+/, "");
  const relativePath = safePath.replace(/^\/+/, "");
  const exactPath = path.join(rootDir, relativePath);

  if (await canAccess(exactPath) && statSync(exactPath).isFile()) {
    return exactPath;
  }

  const htmlPath = path.join(rootDir, `${relativePath}.html`);
  if (await canAccess(htmlPath) && statSync(htmlPath).isFile()) {
    return htmlPath;
  }

  const indexPath = path.join(rootDir, relativePath, "index.html");
  if (await canAccess(indexPath) && statSync(indexPath).isFile()) {
    return indexPath;
  }

  if (safePath === "/" || safePath === "") {
    return path.join(rootDir, "index.html");
  }

  return null;
}

function sendNotFound(response) {
  response.writeHead(404, {
    ...securityHeaders,
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  response.end("Not found");
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `localhost:${port}`}`);
    const resolvedPath = await resolvePath(url.pathname);

    if (!resolvedPath || !existsSync(resolvedPath)) {
      sendNotFound(response);
      return;
    }

    const extension = path.extname(resolvedPath).toLowerCase();
    const contentType = typeByExtension[extension] || "application/octet-stream";
    const stats = statSync(resolvedPath);
    const headers = {
      ...securityHeaders,
      "Content-Type": contentType,
      "Cache-Control": cacheHeaderFor(resolvedPath),
      ETag: etagFor(stats),
      "Last-Modified": stats.mtime.toUTCString(),
      Vary: "Accept-Encoding",
    };

    const shouldGzip =
      request.method !== "HEAD" &&
      /gzip/.test(request.headers["accept-encoding"] || "") &&
      !/\.(?:png|jpg|jpeg|webp|woff2?|ico)$/i.test(resolvedPath);

    if (shouldGzip) {
      headers["Content-Encoding"] = "gzip";
    }

    response.writeHead(200, headers);

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    if (shouldGzip) {
      createReadStream(resolvedPath).pipe(zlib.createGzip()).pipe(response);
      return;
    }

    if (extension === ".html") {
      const html = await readFile(resolvedPath);
      response.end(html);
      return;
    }

    createReadStream(resolvedPath).pipe(response);
  } catch (error) {
    response.writeHead(500, {
      ...securityHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    response.end("Preview server error");
  }
});

server.listen(port, () => {
  console.log(`LiFi preview server running at http://127.0.0.1:${port}`);
});
