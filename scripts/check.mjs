import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const errors = [];
async function walk(folder) {
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isSymbolicLink()) { errors.push(`Symlink is not portable: ${path.relative(root, file)}`); continue; }
    if (entry.isDirectory()) files.push(...await walk(file));
    else files.push(file);
  }
  return files;
}
const files = await walk(root);
const known = new Set(files);
let links = 0, models = 0, scripts = 0;
function localReference(from, raw) {
  if (!raw || /^(?:[a-z]+:|\/\/|#)/i.test(raw) || raw.includes('${')) return;
  let clean;
  try { clean = decodeURIComponent(raw.split(/[?#]/)[0]); } catch { errors.push(`Malformed URL in ${path.relative(root, from)}`); return; }
  if (!clean || clean.startsWith('#')) return;
  let target = path.resolve(clean.startsWith('/') ? root : path.dirname(from), clean.replace(/^\//, ''));
  if (clean.endsWith('/')) target = path.join(target, 'index.html');
  links++;
  if (!known.has(target)) errors.push(`Missing local reference: ${path.relative(root, from)} → ${raw}`);
}
for (const file of files) {
  const relative = path.relative(root, file);
  if (relative.split(path.sep).some(p => p.startsWith('.'))) errors.push(`Hidden file in public output: ${relative}`);
  if ((await stat(file)).size > 95 * 1024 * 1024) errors.push(`File too large for ordinary Git: ${relative}`);
  if (/\.(html|css|js)$/.test(file)) {
    const text = await readFile(file, 'utf8');
    if (file.endsWith('.html')) for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']/g)) localReference(file, match[1]);
    if (file.endsWith('.css')) for (const match of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) localReference(file, match[1]);
    if (file.endsWith('.js')) {
      const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      if (result.status !== 0) errors.push(`JavaScript syntax: ${relative}\n${result.stderr}`);
      scripts++;
      if (!relative.startsWith('vendor/')) for (const match of text.matchAll(/["'](assets\/[^"']+\.(?:png|jpg|glb))(?:\?[^"']*)?["']/g)) localReference(file, match[1]);
    }
  }
  if (file.endsWith('.glb')) {
    models++;
    try {
      const data = await readFile(file);
      if (data.readUInt32LE(0) !== 0x46546c67 || data.readUInt32LE(4) !== 2 || data.readUInt32LE(8) !== data.length) throw new Error('invalid GLB header');
      const length = data.readUInt32LE(12);
      if (data.readUInt32LE(16) !== 0x4e4f534a || length + 20 > data.length) throw new Error('invalid GLB JSON chunk');
      const json = JSON.parse(data.subarray(20, 20 + length).toString('utf8'));
      if (!json.meshes?.length) throw new Error('no meshes');
      for (const item of [...(json.buffers || []), ...(json.images || [])]) {
        if (item.uri && !item.uri.startsWith('data:')) {
          if (/^[a-z]+:|^\/\//i.test(item.uri)) throw new Error('remote model dependency');
          localReference(file, item.uri);
        }
      }
    } catch (error) { errors.push(`${relative}: ${error.message}`); }
  }
}
// Model filenames are stored relative to the shared models directory at runtime.
const registry = await readFile(path.join(root, 'models.js'), 'utf8');
for (const match of registry.matchAll(/["']([^"']+\.glb)["']/g)) localReference(path.join(root, 'index.html'), 'assets/models/' + match[1]);
for (const required of ['index.html', 'model-credits.html', 'art-lab.html', 'vendor/THREE-LICENSE.txt', 'assets/models/manifest.json', 'assets/models/v6/SKUNK-ATTRIBUTION.txt']) {
  if (!known.has(path.join(root, required))) errors.push(`Required release file missing: ${required}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Release check passed: ${files.length} public files, ${scripts} scripts, ${models} GLB models, ${links} local references. Credits included.`);
