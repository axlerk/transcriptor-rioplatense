// Main-thread side of Piper text-to-speech with the Argentine voice "Daniela"
// (rhasspy/piper-voices es_AR-daniela-high). Synthesis runs in a Web Worker
// (src/tts-worker.js); the runtime is served from our origin under vendor/
// (scripts/fetch-vendor.mjs) and the 114 MB model comes from Hugging Face,
// pinned to a commit, hash-checked and kept in Cache Storage.

// False in the Artifact build, whose sandbox cannot load the runtime.
export const PIPER_ENABLED = true;
// Approximate first-use download, for the UI: model + phonemizer data + ONNX wasm.
export const PIPER_DOWNLOAD_MB = 145;
const PIPER_CACHE_NAME = 'piper-es_AR-daniela-high-5041a7a';
const PIPER_MODEL_URL = 'https://huggingface.co/rhasspy/piper-voices/resolve/5041a7a49ae5b3a0f30e6837769eb03fdbb231bd/es/es_AR/daniela/high/es_AR-daniela-high.onnx';

// True if the model is already downloaded, so choosing the voice is instant.
export async function piperIsCached() {
  try {
    const cache = await caches.open(PIPER_CACHE_NAME);
    return !!(await cache.match(PIPER_MODEL_URL));
  } catch {
    return false;
  }
}

// Sentence-sized chunks, so the first one can play while the next is synthesized.
export function piperChunks(text) {
  return text.split(/(?<=[.!?…;:])\s+|\n+/).map((s) => s.trim()).filter((s) => /\p{L}/u.test(s));
}

/**
 * Start the worker and load the voice. onProgress(fraction) reports the model
 * download. Resolves to { threads, synthesize(text, rate) → Promise<{ pcm, sampleRate }> }.
 * Multithreaded loading hung silently in one embedded browser (docs/audit.md, TTS),
 * so a load that does not finish in time is retried with a single thread.
 */
export async function createPiperVoice(onProgress) {
  try {
    return await piperStartWorker(4, onProgress, PIPER_LOAD_TIMEOUT_MS);
  } catch (e) {
    if (e.message !== 'timeout') throw e;
    return piperStartWorker(1, onProgress, 0);
  }
}

// Time allowed for initialisation once the model is downloaded.
const PIPER_LOAD_TIMEOUT_MS = 30000;

function piperStartWorker(maxThreads, onProgress, timeoutMs) {
  const worker = new Worker(new URL('src/tts-worker.js', document.baseURI));
  const pending = new Map();
  let nextId = 0;
  let timer = 0;
  return new Promise((resolve, reject) => {
    const fail = (error) => { clearTimeout(timer); worker.terminate(); reject(error); };
    const armTimer = () => {
      if (timeoutMs && !timer) timer = setTimeout(() => fail(new Error('timeout')), timeoutMs);
    };
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') {
        onProgress?.(data.fraction);
        if (data.fraction >= 1) armTimer();
      } else if (data.type === 'ready') {
        clearTimeout(timer);
        resolve({
          threads: data.threads,
          synthesize: (text, rate) => new Promise((res, rej) => {
            const id = nextId++;
            pending.set(id, { res, rej });
            worker.postMessage({ type: 'synth', id, text, rate });
          }),
        });
      } else if (data.type === 'audio') {
        pending.get(data.id)?.res({ pcm: data.pcm, sampleRate: data.sampleRate });
        pending.delete(data.id);
      } else if (data.type === 'error') {
        if (pending.has(data.id)) { pending.get(data.id).rej(new Error(data.message)); pending.delete(data.id); }
        else fail(new Error(data.message));
      }
    };
    worker.onerror = (e) => fail(new Error(e.message || 'The voice could not start.'));
    worker.postMessage({ type: 'load', vendorBase: new URL('vendor/', document.baseURI).href, maxThreads });
    // A cached model sends no progress: start the clock now.
    piperIsCached().then((cached) => { if (cached) armTimer(); });
  });
}
