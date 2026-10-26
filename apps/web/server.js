// =====================================================================
// AR Trust Web — production entry point for hosts that need a plain JS
// "startup file" (e.g. Hostinger's Node.js App panel) instead of running
// `next start` through npm. Must run against an already-built app
// (`npm run build`), same as `next start`.
// =====================================================================

const { createServer } = require('node:http');
const next = require('next');

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, host, () => {
    console.log(`AR Trust web server listening on http://${host}:${port}`);
  });
});
