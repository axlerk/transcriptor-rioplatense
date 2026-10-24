#!/usr/bin/env node
// Build two outputs from index.html, style.css, fonts/ and the JS modules:
//   dist/site/      the production site: one index.html with inlined CSS and JS,
//                   fonts with content hashes, and _headers with a hash-based CSP.
//   dist/artifact.html  the same page as a claude.ai Artifact body (the host adds
//                   the <html>/<head>/<body> wrapper; fonts become data: URIs
//                   because the Artifact CSP only admits data: and Google fonts).
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// The Piper runtime must be in vendor/ (idempotent; checks sha256).
await import('./fetch-vendor.mjs');

const root = new URL('../', import.meta.url);
const read = (p, enc = 'utf8') => readFileSync(new URL(p, root), enc);
const write = (p, data) => writeFileSync(new URL(p, root), data);
const sha = (data, enc) => createHash('sha256').update(data).digest(enc);

const html = read('index.html');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/<script type="module" src="app\.js"><\/script>\s*/, '')
  .trim();
const css = read('style.css');

// The modules share no top-level names, so they can be concatenated once
// their import lines and export keywords are removed.
const modules = ['src/rules.js', 'src/numbers.js', 'src/transcriber.js', 'src/tts-piper.js', 'app.js'];
const script = modules.map((p) => `// ${p}\n` + read(p)
  .replace(/^import .*;\n/gm, '')
  .replace(/^export (const|function|class) /gm, '$1 ')).join('\n');

rmSync(new URL('dist/', root), { recursive: true, force: true });
mkdirSync(new URL('dist/site/fonts/', root), { recursive: true });
write('dist/bundle.mjs', script);
execFileSync(process.execPath, ['--check', new URL('dist/bundle.mjs', root).pathname]);

const fonts = readdirSync(new URL('fonts/', root)).filter((f) => f.endsWith('.woff2'));

// ---- Production site
const hashed = {};
for (const f of fonts) {
  const data = read(`fonts/${f}`, null);
  hashed[f] = f.replace('.woff2', `.${sha(data, 'hex').slice(0, 10)}.woff2`);
  write(`dist/site/fonts/${hashed[f]}`, data);
}
const renameFonts = (s) => s.replace(/href="icon\.svg"/, 'href="/icon.svg"').replace(/fonts\/([\w-]+\.woff2)/g, (_, f) => `/fonts/${hashed[f]}`);
const siteCss = renameFonts(css);
const siteHead = renameFonts(head)
  .replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n/, '')
  .replace(/<link rel="stylesheet" href="style\.css">/, `<style>\n${siteCss}</style>`);
const siteHtml = html
  .replace(head, siteHead)
  .replace(/<script type="module" src="app\.js"><\/script>/, `<script type="module">\n${script}</script>`);
write('dist/site/index.html', siteHtml);
// Piper TTS: its Web Worker and the self-hosted runtime (versioned paths).
mkdirSync(new URL('dist/site/src/', root), { recursive: true });
write('dist/site/src/tts-worker.js', read('src/tts-worker.js'));
cpSync(new URL('vendor/', root), new URL('dist/site/vendor/', root), { recursive: true });
write('dist/site/icon.svg', read('icon.svg'));

const inline = (tag, s) => [...s.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))]
  .map((m) => `'sha256-${sha(m[1], 'base64')}'`).join(' ');
const csp = [
  "default-src 'none'",
  // 'self' for the TTS worker and vendor scripts; wasm-unsafe-eval to compile WebAssembly.
  `script-src 'self' 'wasm-unsafe-eval' ${inline('script', siteHtml)}`,
  "worker-src 'self'",
  // The Piper voice model is downloaded from Hugging Face (redirects to *.hf.co).
  "connect-src 'self' https://huggingface.co https://*.hf.co",
  `style-src ${inline('style', siteHtml)}`,
  "font-src 'self'",
  "img-src 'self' data:",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');
write('dist/site/_headers', `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Resource-Policy: same-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/vendor/*
  Cache-Control: public, max-age=31536000, immutable
`);

// ---- Artifact body
const dataUri = (f) => `data:font/woff2;base64,${read(`fonts/${f}`, null).toString('base64')}`;
const artifactCss = css.replace(/url\(fonts\/([\w-]+\.woff2)\)/g, (_, f) => `url(${dataUri(f)})`);
const artifactHead = head
  .split('\n')
  .filter((l) => !/<meta charset|<meta name="viewport"|rel="preload"|rel="icon"|href="style\.css"/.test(l))
  .join('\n')
  .trim();
// The Artifact sandbox cannot load the Piper runtime: switch the voice off there.
const artifactScript = script.replace('const PIPER_ENABLED = true;', 'const PIPER_ENABLED = false;');
const artifact = `${artifactHead}\n<style>\n${artifactCss}</style>\n${body}\n<script type="module">\n${artifactScript}</script>\n`;
write('dist/artifact.html', artifact);

console.log(`dist/site/index.html ${siteHtml.length} bytes, ${fonts.length} fonts`);
console.log(`dist/artifact.html ${artifact.length} bytes`);
