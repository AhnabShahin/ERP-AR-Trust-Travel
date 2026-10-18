// =====================================================================
// AR Trust Travel & Tourism — Pure Node.js production server
// Zero external dependencies (no Express). Serves the Vite build in
// ./dist as a Single Page Application with history-fallback routing.
// =====================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------
// Lightweight .env loader (no dependency).
// Reads ./.env if present. Values already set in the real environment
// (e.g. the Hostinger panel) are NOT overwritten.
// ---------------------------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  try {
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    console.warn('⚠️  Could not read .env file:', err.message);
  }
}

loadEnv();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const ASSET_RE = /\.(js|mjs|css|png|jpe?g|gif|ico|svg|webp|woff2?|ttf|eot|map)$/i;

function end(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendFile(res, filePath, { status = 200, extraHeaders = {} } = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || 'application/octet-stream';
  const headers = {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...extraHeaders,
  };
  // Immutable long-term caching for hashed build assets; HTML stays fresh.
  if (ASSET_RE.test(filePath)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'no-cache';
  }

  res.writeHead(status, headers);
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal Server Error');
  });
  stream.pipe(res);
}

function serveIndexFallback(res) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    sendFile(res, indexPath, { status: 200 });
  } else {
    end(
      res,
      500,
      'Application build not found. Please run "npm run build".',
      { 'Content-Type': 'text/plain; charset=utf-8' }
    );
  }
}

const server = http.createServer((req, res) => {
  // Only GET/HEAD are relevant for a static SPA.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return end(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  // Health check endpoint for Hostinger / uptime monitors.
  if (req.url === '/health') {
    return end(res, 200, 'OK', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  let pathname;
  try {
    pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    return end(res, 400, 'Bad Request');
  }

  if (pathname === '/' || pathname === '') pathname = '/index.html';

  // Resolve inside DIST_DIR and guard against path traversal.
  const resolved = path.normalize(path.join(DIST_DIR, pathname));
  if (resolved !== DIST_DIR && !resolved.startsWith(DIST_DIR + path.sep)) {
    return end(res, 403, 'Forbidden');
  }

  fs.stat(resolved, (err, stats) => {
    if (!err && stats.isFile()) {
      return sendFile(res, resolved);
    }
    // Not a real file → SPA history fallback.
    serveIndexFallback(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 AR Trust Travel & Tourism server listening on http://${HOST}:${PORT}`);
});
