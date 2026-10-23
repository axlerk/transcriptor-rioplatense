import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

test('build: every inline script and style is allowed by the CSP hash', () => {
  execFileSync(process.execPath, [new URL('scripts/build.js', root).pathname], { stdio: 'pipe' });
  const html = read('dist/site/index.html');
  const headers = read('dist/site/_headers');
  for (const tag of ['script', 'style']) {
    const blocks = [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))];
    assert.ok(blocks.length > 0, `inline ${tag} present`);
    for (const [, body] of blocks) {
      const hash = createHash('sha256').update(body).digest('base64');
      assert.ok(headers.includes(`'sha256-${hash}'`), `${tag} hash in CSP`);
    }
  }
  for (const m of html.matchAll(/\/fonts\/([\w.-]+\.woff2)/g)) {
    assert.ok(existsSync(new URL(`dist/site/fonts/${m[1]}`, root)), m[1]);
  }
  assert.doesNotMatch(html, /fonts\.googleapis|src="app\.js"/);
});
