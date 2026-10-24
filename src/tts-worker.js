// Web Worker that runs Piper (Daniela, es_AR) off the main thread, so synthesis
// never freezes the page. Messages in:  { type: 'load', vendorBase, maxThreads? }
//                                       { type: 'synth', id, text, rate }
// Messages out: { type: 'progress', fraction } | { type: 'ready', threads }
//               { type: 'audio', id, pcm, sampleRate } | { type: 'error', id?, message }
// The phonemizer is espeak-ng "es-419", the one the voice was trained with.
/* global ort, createPiperPhonemize */

const MODEL = {
  url: 'https://huggingface.co/rhasspy/piper-voices/resolve/5041a7a49ae5b3a0f30e6837769eb03fdbb231bd/es/es_AR/daniela/high/es_AR-daniela-high.onnx',
  sha256: '7ceb1fc0dab349418c5b54a639ae9ee595212d7c9ea422220d8419163d5cc985',
  bytes: 114199011,
};
const CACHE = 'piper-es_AR-daniela-high-5041a7a';
const ORT_DIR = 'onnxruntime-web-1.20.1/';
const PHONEMIZE_DIR = 'piper-wasm-1.0.0/';
const CONFIG = 'piper-voices-5041a7a/es_AR-daniela-high.onnx.json';

let voice = null;

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.arrayBuffer();
}

async function fetchModel() {
  let cache = null;
  try {
    cache = await caches.open(CACHE);
    const hit = await cache.match(MODEL.url);
    if (hit) return hit.arrayBuffer();
  } catch { /* no Cache Storage: download every time */ }
  const res = await fetch(MODEL.url);
  if (!res.ok || !res.body) throw new Error(`Voice model: HTTP ${res.status}`);
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    postMessage({ type: 'progress', fraction: Math.min(1, loaded / MODEL.bytes) });
  }
  const buf = await new Blob(chunks).arrayBuffer();
  if (hex(await crypto.subtle.digest('SHA-256', buf)) !== MODEL.sha256) {
    throw new Error('The voice model failed its integrity check.');
  }
  try { await cache?.put(MODEL.url, new Response(new Blob([buf]))); } catch { /* quota */ }
  return buf;
}

async function load(vendorBase, maxThreads = 4) {
  const url = (path) => new URL(path, vendorBase).href;
  importScripts(url(ORT_DIR + 'ort.wasm.min.js'), url(PHONEMIZE_DIR + 'piper_phonemize.js'));
  // Threads need SharedArrayBuffer, available only when the page is cross-origin isolated.
  const threads = self.crossOriginIsolated ? Math.min(maxThreads, navigator.hardwareConcurrency || 1) : 1;
  ort.env.wasm.wasmPaths = url(ORT_DIR);
  ort.env.wasm.numThreads = threads;
  const [config, wasmBinary, dataPackage, model] = await Promise.all([
    fetch(url(CONFIG)).then((r) => r.json()),
    fetchBuffer(url(PHONEMIZE_DIR + 'piper_phonemize.wasm')),
    fetchBuffer(url(PHONEMIZE_DIR + 'piper_phonemize.data')),
    fetchModel(),
  ]);
  const session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'] });

  const phonemize = (text) => new Promise((resolve, reject) => {
    createPiperPhonemize({
      wasmBinary,
      getPreloadedPackage: () => dataPackage,
      locateFile: (file) => url(PHONEMIZE_DIR + file),
      print: (line) => {
        try { resolve(JSON.parse(line).phoneme_ids); } catch (e) { reject(e); }
      },
      printErr: () => { /* espeak-ng warnings */ },
    }).then((mod) => mod.callMain([
      '-l', config.espeak.voice,
      '--input', JSON.stringify([{ text }]),
      '--espeak_data', '/espeak-ng-data',
    ])).catch(reject);
  });

  const { noise_scale: noise, length_scale: length, noise_w: noiseW } = config.inference;
  voice = {
    sampleRate: config.audio.sample_rate,
    async synthesize(text, rate) {
      const ids = await phonemize(text);
      const { output } = await session.run({
        input: new ort.Tensor('int64', BigInt64Array.from(ids, BigInt), [1, ids.length]),
        input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)])),
        scales: new ort.Tensor('float32', Float32Array.from([noise, length / rate, noiseW])),
      });
      return Float32Array.from(output.data);
    },
  };
  return threads;
}

onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      const threads = await load(data.vendorBase, data.maxThreads);
      postMessage({ type: 'ready', threads });
    } else if (data.type === 'synth') {
      const pcm = await voice.synthesize(data.text, data.rate || 1);
      postMessage({ type: 'audio', id: data.id, pcm, sampleRate: voice.sampleRate }, [pcm.buffer]);
    }
  } catch (e) {
    postMessage({ type: 'error', id: data.id, message: e.message || String(e) });
  }
};
