import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// Vercel runs server code as plain Node ESM: every relative import reachable from api/ must carry a .js extension,
// or the function crashes at start (ERR_MODULE_NOT_FOUND). Akash Sync Agent.
test('every relative import reachable from api/ has a .js extension', () => {
  const seen = new Set<string>(); const bad: string[] = [];
  const visit = (file: string) => {
    if (seen.has(file)) return; seen.add(file);
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const spec = m[1];
      if (spec.endsWith('.json')) continue;
      if (!spec.endsWith('.js')) { bad.push(`${file}: ${spec}`); continue; }
      const ts = resolve(dirname(file), spec.replace(/\.js$/, '.ts'));
      if (existsSync(ts)) visit(ts);
    }
  };
  const walk = (d: string): void => { for (const e of readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.ts') && visit(resolve(join(d, e.name))); };
  walk('api');
  assert.deepEqual(bad, []);
});
