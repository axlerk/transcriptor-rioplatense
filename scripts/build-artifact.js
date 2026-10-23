#!/usr/bin/env node
// Bundle index.html, style.css and the JS modules into one self-contained
// page body for publishing as a claude.ai Artifact (the host adds the
// <!doctype>, <html>, <head> and <body> wrapper itself).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const html = read('index.html');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .split('\n')
  .filter((l) => !/<meta charset|<meta name="viewport"|href="style\.css"/.test(l))
  .join('\n')
  .trim();
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/<script type="module" src="app\.js"><\/script>\s*/, '')
  .trim();

// The modules share no top-level names, so they can be concatenated once
// their import lines and export keywords are removed.
const modules = ['src/rules.js', 'src/numbers.js', 'src/transcriber.js', 'app.js'];
const script = modules.map((p) => `// ${p}\n` + read(p)
  .replace(/^import .*;\n/gm, '')
  .replace(/^export (const|function|class) /gm, '$1 ')).join('\n');

mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
const scriptPath = new URL('../dist/bundle.mjs', import.meta.url);
writeFileSync(scriptPath, script);
execFileSync(process.execPath, ['--check', scriptPath.pathname]);

const out = `${head}\n<style>\n${read('style.css')}</style>\n${body}\n<script type="module">\n${script}</script>\n`;
const outPath = new URL('../dist/transcriptor-rioplatense.html', import.meta.url);
writeFileSync(outPath, out);
console.log(`${outPath.pathname} (${out.length} bytes)`);
