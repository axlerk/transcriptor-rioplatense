#!/usr/bin/env node
// Download the Piper TTS runtime into vendor/ (git-ignored) and check every
// file against a pinned sha256. The build copies vendor/ into dist/site/vendor/,
// so the browser loads the runtime from our own origin. The voice model itself
// (114 MB, over the 25 MiB static-asset limit) is fetched by the browser from
// Hugging Face; its hash is pinned in src/tts-piper.js.
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

const ORT = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist';
const PIPER = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build';
const VOICE = 'https://huggingface.co/rhasspy/piper-voices/resolve/5041a7a49ae5b3a0f30e6837769eb03fdbb231bd/es/es_AR/daniela/high';

export const FILES = [
  // [path under vendor/, source URL, sha256]
  ['onnxruntime-web@1.20.1/ort.wasm.min.js', `${ORT}/ort.wasm.min.js`, 'e66568724f8848e57cc2a56e4bea3a5b86ce3ff81b2da11eac8ed7ab02b27bd4'],
  ['onnxruntime-web@1.20.1/ort-wasm-simd-threaded.mjs', `${ORT}/ort-wasm-simd-threaded.mjs`, '745eb7c0ce6f18a6aa521971b2877babc7ffb27eecb58ab3bc6e5ef4692672e8'],
  ['onnxruntime-web@1.20.1/ort-wasm-simd-threaded.wasm', `${ORT}/ort-wasm-simd-threaded.wasm`, '207d02be4591c156b0a98f024f3d58005b5b04c92274d759fb390338c63559ea'],
  ['piper-wasm@1.0.0/piper_phonemize.js', `${PIPER}/piper_phonemize.js`, 'fef0c2fc442d24fdef5c7c7cc37d5da2314407640fe11ab1bfe347c723dff19b'],
  ['piper-wasm@1.0.0/piper_phonemize.wasm', `${PIPER}/piper_phonemize.wasm`, 'b777cd107a91d2bcc6a1ea46f2c26a662a7407394fe84589198aeaa83dd7a9d6'],
  ['piper-wasm@1.0.0/piper_phonemize.data', `${PIPER}/piper_phonemize.data`, '29f1025eb23a5b5c192cd14a6efbce4509402ff265405072ee6f7d1a09b78f8c'],
  ['piper-voices@5041a7a/es_AR-daniela-high.onnx.json', `${VOICE}/es_AR-daniela-high.onnx.json`, 'aedbf69647e1d754c62ecf8e0366ca5f16af3e768e3c6b5329af6eb6bde3852b'],
];

const root = new URL('../vendor/', import.meta.url);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

for (const [path, url, hash] of FILES) {
  const target = new URL(path, root);
  if (existsSync(target) && sha(readFileSync(target)) === hash) continue;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (sha(buf) !== hash) throw new Error(`${path}: sha256 mismatch (got ${sha(buf)})`);
  mkdirSync(dirname(target.pathname), { recursive: true });
  writeFileSync(target, buf);
  console.log(`vendor/${path} ${buf.length} bytes`);
}
