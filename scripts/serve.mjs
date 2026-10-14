import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const index = process.argv.indexOf('--port');
const port = Number(index >= 0 ? process.argv[index + 1] : process.env.PORT || 8772);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Choose a port from 1 to 65535.');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary' };

const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const parts = pathname.split(/[\\/]/);
    if (parts.some(part => part.startsWith('.')) || pathname.includes('\0')) {
      res.writeHead(404); res.end('Not found'); return;
    }
    let file = path.resolve(root, '.' + pathname);
    if (file !== path.resolve(root) && !file.startsWith(root)) { res.writeHead(404); res.end('Not found'); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is busy. Use npm start -- --port 8780` : error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Dumpster Diver: http://127.0.0.1:${port}/ (Ctrl+C to stop)`));
