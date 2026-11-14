// Local stand-in for Vercel's per-file Node ESM runtime: transpile api/, server/ and src/lib/ file by file (no bundling, import
// specifiers kept as written), then import every api/ handler with plain Node. A missing ".js" extension fails here
// (ERR_MODULE_NOT_FOUND) instead of on the preview. Usage: node scripts/check-api-imports.mjs. Akash Sync Agent.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const files = execFileSync('git', ['ls-files', 'api', 'server', 'src/lib'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const ts = files.filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')); const json = files.filter((f) => f.endsWith('.json'));
const out = mkdtempSync(join(tmpdir(), 'jaos-api-'));
try {
  execFileSync(join(root, 'node_modules/.bin/esbuild'), [...ts, `--outdir=${out}`, '--outbase=.', '--format=esm', '--platform=node', '--log-level=warning'], { cwd: root, stdio: 'inherit' });
  for (const f of json) { mkdirSync(dirname(join(out, f)), { recursive: true }); cpSync(join(root, f), join(out, f)); }
  cpSync(join(root, 'package.json'), join(out, 'package.json')); symlinkSync(join(root, 'node_modules'), join(out, 'node_modules'));
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.js') ? [join(d, e.name)] : []));
  let bad = 0;
  for (const f of walk(join(out, 'api'))) {
    try { const m = await import(pathToFileURL(f).href); if (typeof m.default !== 'function') throw new Error('no default handler'); console.log('OK  ', f.slice(out.length + 1)); }
    catch (e) { bad++; console.log('FAIL', f.slice(out.length + 1), e.code || '', String(e.message).slice(0, 200)); }
  }
  if (bad) process.exitCode = 1;
} finally { rmSync(out, { recursive: true, force: true }); }
