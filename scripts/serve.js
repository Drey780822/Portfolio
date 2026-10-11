/**
 * Zero-Dependency Node.js HTTP Server for Local Testing & Preview
 * Supports:
 * - Static file serving with proper MIME types
 * - Clean URLs & directory indexes (e.g. /work -> /work/index.html)
 * - /api/chat mock/relay endpoint
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  // API endpoint routing
  if (pathname === '/api/chat') {
    try {
      const handler = require('../api/chat.js');
      // Collect body for POST
      let bodyData = '';
      req.on('data', chunk => { bodyData += chunk; });
      req.on('end', () => {
        req.body = bodyData;
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        handler(req, res);
      });
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Static files handling
  let filePath = path.join(ROOT_DIR, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<h1>404 Not Found</h1><p>The path <code>${pathname}</code> does not exist.</p><p><a href="/">Return to Home</a></p>`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`Portfolio Server Running at: http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to terminate server`);
  console.log(`======================================================\n`);
});
