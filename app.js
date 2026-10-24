import { transcribe, DEFAULT_OPTIONS } from './src/transcriber.js';
import { RULES } from './src/rules.js';
import { PIPER_ENABLED, PIPER_DOWNLOAD_MB, piperIsCached, piperChunks, createPiperVoice } from './src/tts-piper.js';

const $ = (id) => document.getElementById(id);

const SAMPLES = {
  porteno: 'Che, ¿vos sabés dónde queda la calle Florida? Mañana me voy a la playa con los chicos del barrio, si no llueve. Ayer comimos unas empanadas buenísimas.',
  coloma: 'El viento norte y el sol discutían sobre cuál de ellos era el más fuerte, cuando pasó un extraño viajero envuelto en una ancha capa. El viento y el sol convinieron en que quien antes lograra obligar al viajero a quitarse la capa sería considerado más poderoso. El viento norte sopló con gran furia, pero cuanto más soplaba, más se agarraba el viajero de su capa. Por fin el viento norte abandonó la empresa. Entonces brilló el sol con ardor, e inmediatamente el viajero se despojó de su capa, por lo que el viento norte tuvo que reconocer la superioridad del sol.',
};

const OPTION_KEYS = [
  'links', 'syllables', 'monosyllableStress', 'approximantDiacritic', 'fallingGlides',
  'ipaPauses', 'sPause', 'dFinal', 'rInfinitive', 'njMerger',
];
const STORE_KEY = 'transcriptor-rioplatense/v1';
const MAX_CHARS = 5000;

const state = { text: SAMPLES.porteno, opts: { ...DEFAULT_OPTIONS }, voice: '' };

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (typeof saved?.text === 'string') state.text = saved.text.slice(0, MAX_CHARS);
    // Copy only known options with valid values: stored data is untrusted.
    const o = saved?.opts ?? {};
    OPTION_KEYS.forEach((k) => { if (typeof o[k] === 'boolean') state.opts[k] = o[k]; });
    if (o.mode === 'phonetic' || o.mode === 'phonemic') state.opts.mode = o.mode;
    if (o.palatal === 'ʃ' || o.palatal === 'ʒ') state.opts.palatal = o.palatal;
    if (typeof saved?.voice === 'string' && saved.voice.length < 300) state.voice = saved.voice;
  } catch { /* storage unavailable: keep defaults */ }
  try {
    const fromUrl = new URLSearchParams(location.search).get('text');
    if (fromUrl) state.text = fromUrl.slice(0, MAX_CHARS);
  } catch { /* no usable URL */ }
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Rendering

// The shown transcription, plus the other mode computed only when the tooltip needs it.
let current = null; // { text, opts, shown, starts, phonetic?, phonemic? }

function forms() {
  const { text, opts } = current;
  current.phonetic ??= opts.mode === 'phonetic' ? current.shown : transcribe(text, { ...opts, mode: 'phonetic' });
  current.phonemic ??= opts.mode === 'phonemic' ? current.shown : transcribe(text, { ...opts, mode: 'phonemic' });
  return current;
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function render() {
  const { text, opts } = state;
  const shown = transcribe(text, opts);
  let pos = 0;
  const starts = shown.tokens.map((t) => { const s = pos; pos += t.text.length; return s; });
  current = { text, opts: { ...opts }, shown, starts };

  $('count').textContent = `${text.length} / ${MAX_CHARS}`;
  $('out-label').textContent = opts.mode === 'phonemic' ? 'IPA · phonemic' : 'IPA · phonetic';

  const out = document.createDocumentFragment();
  if (!text.trim()) {
    out.append(el('span', 'empty', 'The transcription appears here as you type.'));
  } else {
    const [open, close] = opts.mode === 'phonemic' ? ['/', '/'] : ['[', ']'];
    out.append(el('span', 'delim', open));
    shown.tokens.forEach((t, i) => {
      if (t.kind === 'word') {
        const span = el('span', 'w');
        appendWithTies(span, t.out);
        span.dataset.i = i;
        span.dataset.rules = t.rules.join(' ');
        out.append(span);
      } else if (t.out === '‿') {
        out.append(el('span', 'tie', '‿'));
      } else {
        out.append(document.createTextNode(t.out));
      }
    });
    out.append(el('span', 'delim', close));
  }
  $('output').replaceChildren(out);
  tip.hidden = true; // its word may no longer exist
  renderRules(shown.rules);
}

// Ties inside multi-word tokens (spelled-out numbers) get the tie colour too.
function appendWithTies(parent, text) {
  text.split(/(‿)/).forEach((part) => {
    if (!part) return;
    parent.append(part === '‿' ? el('span', 'tie', '‿') : document.createTextNode(part));
  });
}

const EVIDENCE_LABEL = { verified: 'verified', secondary: 'secondary', recalled: 'unverified', inferred: 'inferred' };

function renderRules(counts) {
  const grid = $('rules');
  grid.replaceChildren();
  const order = Object.keys(RULES);
  const ids = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || order.indexOf(a) - order.indexOf(b));
  if (!ids.length) {
    grid.append(el('p', 'rules-empty', 'No rules applied yet. Type some Spanish above.'));
    return;
  }
  for (const id of ids) {
    const rule = RULES[id];
    const card = el('article', 'rule');
    card.dataset.rule = id;
    const head = el('div', 'rule-head');
    head.append(el('h3', null, rule.title), el('span', 'n', `${counts[id]} ${counts[id] === 1 ? 'word' : 'words'}`));
    const foot = el('div', 'rule-foot');
    foot.append(el('span', 'src', rule.source), el('i', `ev ev-${rule.evidence}`, EVIDENCE_LABEL[rule.evidence]));
    card.append(head, el('p', null, rule.text), el('p', 'ex', rule.example), foot);
    grid.append(card);
  }
}

// ---------------------------------------------------------------------------
// Word tooltip and rule highlighting

const tip = $('tip');

function showTip(span) {
  const i = Number(span.dataset.i);
  const { phonetic, phonemic } = forms();
  const word = phonetic.tokens[i];
  const broad = phonemic.tokens[i];
  tip.replaceChildren();
  tip.append(el('div', 'tw', word.text));
  const line = (label, value) => {
    const row = el('div', 'tf');
    row.append(el('small', null, label), document.createTextNode(value));
    return row;
  };
  tip.append(line('phonemic', `/${broad.out}/`), line('phonetic', `[${word.out}]`));
  if (word.rules.length) {
    const rules = el('div', 'tr');
    word.rules.forEach((r) => rules.append(el('span', null, RULES[r].title)));
    tip.append(rules);
  }
  tip.hidden = false;
  const r = span.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const left = Math.min(Math.max(8, r.left), window.innerWidth - t.width - 8);
  const top = r.bottom + 8 + t.height < window.innerHeight ? r.bottom + 8 : r.top - t.height - 8;
  tip.style.left = `${left}px`;
  tip.style.top = `${Math.max(8, top)}px`;
}

const output = $('output');
output.addEventListener('mouseover', (e) => {
  const span = e.target.closest('.w');
  if (span) showTip(span);
});
const hideTip = () => { tip.hidden = true; };
output.addEventListener('mouseout', (e) => {
  if (e.target.closest('.w') && !e.relatedTarget?.closest?.('.w')) hideTip();
});
output.addEventListener('mouseleave', hideTip);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
// On touch screens a tap shows the tooltip; a tap anywhere else closes it.
document.addEventListener('pointerdown', (e) => { if (!e.target.closest?.('#output .w')) hideTip(); });
output.addEventListener('click', (e) => {
  const span = e.target.closest('.w');
  if (span) speakWord(current.shown.tokens[Number(span.dataset.i)].text);
});

window.addEventListener('scroll', hideTip, { passive: true });

function highlightRule(id) {
  output.querySelectorAll('.w').forEach((w) => {
    w.classList.toggle('hl', !!id && w.dataset.rules.split(' ').includes(id));
  });
}
$('rules').addEventListener('mouseover', (e) => highlightRule(e.target.closest('.rule')?.dataset.rule));
$('rules').addEventListener('mouseleave', () => highlightRule(null));

// ---------------------------------------------------------------------------
// Speech. Two engines: Piper's Argentine voice "Daniela", generated on the
// device (src/tts-piper.js), and the device's own voices (Web Speech API).

const PIPER = 'piper';
const piperSupported = PIPER_ENABLED && typeof Worker === 'function' && typeof WebAssembly === 'object';
const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
let voices = [];
let piperCached = false;
let piper = null; // Promise of the loaded voice, once loading has started
let piperStatus = ''; // progress or error text while loading
let audioCtx = null;
let speaking = null; // the current Piper playback: { stopped, source }

function voiceRank(v) {
  const lang = v.lang.replace('_', '-').toLowerCase();
  if (lang === 'es-ar') return 0;
  if (lang === 'es-uy') return 1;
  if (lang === 'es-es') return 3;
  return 2;
}

const isPiper = () => $('voice').value === PIPER;

function loadVoices() {
  voices = (synth?.getVoices() ?? [])
    .filter((v) => v.lang.toLowerCase().startsWith('es'))
    .sort((a, b) => voiceRank(a) - voiceRank(b) || a.name.localeCompare(b.name));
  const select = $('voice');
  const previous = select.value || state.voice;
  const options = voices.map((v) => {
    const o = el('option', null, `${v.name} (${v.lang})`);
    o.value = v.voiceURI;
    return o;
  });
  if (piperSupported) {
    const o = el('option', null, 'Daniela, Argentina (Piper)');
    o.value = PIPER;
    options.unshift(o);
  }
  select.replaceChildren(...options);
  const values = options.map((o) => o.value);
  if (values.includes(previous)) select.value = previous;
  // Daniela by default only when it costs no surprise download.
  else if (piperSupported && (piperCached || !voices.length)) select.value = PIPER;
  else if (voices.length) select.value = voices[0].voiceURI;
  $('speech').hidden = !options.length;
  updateVoiceNote();
}

function updateVoiceNote() {
  const note = $('voice-note');
  let text = '';
  if (!$('voice').options.length) {
    text = 'This browser has no Spanish voice, so audio is off. The transcription works without it.';
  } else if (isPiper()) {
    if (piperStatus) text = piperStatus;
    else if (!piperCached) text = `Argentine voice generated on your device. The first use downloads about ${PIPER_DOWNLOAD_MB} MB, the model from Hugging Face; after that it works offline.`;
  } else if (voices.length && voiceRank(voices.find((v) => v.voiceURI === $('voice').value) ?? voices[0]) > 1) {
    text = piperSupported
      ? 'This voice has another accent. For an Argentine voice, choose “Daniela, Argentina (Piper)”.'
      : 'No Argentine or Uruguayan voice on this device: the audio has another accent.';
  }
  note.textContent = text;
  note.hidden = !text;
}

function loadPiper() {
  if (!piper) {
    piperStatus = 'Starting the Argentine voice…';
    updateVoiceNote();
    piper = createPiperVoice((f) => {
      piperStatus = `Downloading the Argentine voice… ${Math.round(f * 100)}%`;
      updateVoiceNote();
    }).then((voice) => {
      piperCached = true;
      piperStatus = '';
      updateVoiceNote();
      return voice;
    }, (e) => {
      piper = null;
      piperStatus = `The Argentine voice could not load (${e.message}). Try again, or choose another voice.`;
      updateVoiceNote();
      throw e;
    });
  }
  return piper;
}

function setSpeaking(on) { $('speak').setAttribute('aria-pressed', String(on)); }

// Highlight the words whose text lies in [start, end) of the input.
function markRange(start, end) {
  output.querySelectorAll('.w').forEach((span) => {
    const s = current.starts[Number(span.dataset.i)];
    span.classList.toggle('speaking', s >= start && s < end);
  });
}

function stopSpeaking() {
  if (speaking) { speaking.stopped = true; speaking.source?.stop(); speaking = null; }
  synth?.cancel();
  setSpeaking(false);
  markRange(-1, -1);
}

function playPcm(session, pcm, sampleRate) {
  return new Promise((resolve) => {
    const buffer = audioCtx.createBuffer(1, pcm.length, sampleRate);
    buffer.copyToChannel(pcm, 0);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.onended = resolve;
    session.source = source;
    source.start();
  });
}

// Sentences with their offsets in the text, for highlighting.
function chunksWithOffsets(text) {
  let pos = 0;
  return piperChunks(text).map((chunk) => {
    const start = text.indexOf(chunk, pos);
    pos = start + chunk.length;
    return { text: chunk, start, end: pos };
  });
}

async function speakPiper(text, highlight) {
  // The AudioContext must start inside the click, before the first await.
  audioCtx ??= new AudioContext();
  audioCtx.resume();
  const session = { stopped: false, source: null };
  speaking = session;
  setSpeaking(true);
  try {
    const voice = await loadPiper();
    const rate = Number($('rate').value);
    const chunks = highlight ? chunksWithOffsets(text) : [{ text, start: -1, end: -1 }];
    let next = chunks.length ? voice.synthesize(chunks[0].text, rate) : null;
    for (let i = 0; i < chunks.length && !session.stopped; i++) {
      const { pcm, sampleRate } = await next;
      // Synthesize the next sentence while this one plays.
      if (i + 1 < chunks.length) next = voice.synthesize(chunks[i + 1].text, rate);
      if (session.stopped) break;
      markRange(chunks[i].start, chunks[i].end);
      await playPcm(session, pcm, sampleRate);
    }
  } catch { /* loadPiper reports load errors in the note */ }
  if (speaking === session) { speaking = null; setSpeaking(false); markRange(-1, -1); }
}

function utterance(text) {
  if (!synth || !voices.length || !text.trim()) return null;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = voices.find((v) => v.voiceURI === $('voice').value) ?? voices[0];
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = Number($('rate').value);
  return u;
}

function speakWord(text) {
  stopSpeaking();
  if (isPiper()) { speakPiper(text, false); return; }
  const u = utterance(text);
  if (u) synth.speak(u);
}

function speakAll() {
  if (speaking || synth?.speaking) { stopSpeaking(); return; }
  if (!state.text.trim()) return;
  if (isPiper()) { speakPiper(state.text, true); return; }
  const u = utterance(state.text);
  if (!u) return;
  u.onboundary = (e) => {
    if (e.name && e.name !== 'word') return;
    markRange(e.charIndex, e.charIndex + (e.charLength || 1));
  };
  u.onstart = () => setSpeaking(true);
  u.onend = u.onerror = () => { setSpeaking(false); markRange(-1, -1); };
  synth.speak(u);
}

// ---------------------------------------------------------------------------
// Wiring

function syncControls() {
  $('input').value = state.text;
  $(`mode-${state.opts.mode}`).checked = true;
  $(state.opts.palatal === 'ʒ' ? 'palatal-zh' : 'palatal-sh').checked = true;
  OPTION_KEYS.forEach((k) => { $(`opt-${k}`).checked = !!state.opts[k]; });
}

// Several keystrokes within one frame cost one render; saving waits for a pause.
let frame = 0, saveTimer = 0;
function update() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(render);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 400);
}

$('input').addEventListener('input', (e) => { state.text = e.target.value; update(); });
document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener('change', () => {
  state.opts.mode = r.value; update();
}));
document.querySelectorAll('input[name="palatal"]').forEach((r) => r.addEventListener('change', () => {
  state.opts.palatal = r.value; update();
}));
OPTION_KEYS.forEach((k) => $(`opt-${k}`).addEventListener('change', (e) => {
  state.opts[k] = e.target.checked; update();
}));
$('sample-porteno').addEventListener('click', () => { state.text = SAMPLES.porteno; syncControls(); update(); });
$('sample-coloma').addEventListener('click', () => { state.text = SAMPLES.coloma; syncControls(); update(); });
$('clear').addEventListener('click', () => { state.text = ''; syncControls(); update(); $('input').focus(); });
$('copy').addEventListener('click', async () => {
  const btn = $('copy');
  try {
    await navigator.clipboard.writeText(current.shown.text);
    btn.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(output);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    btn.textContent = 'Selected, press Ctrl+C';
  }
  setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
});
$('speak').addEventListener('click', speakAll);
$('voice').addEventListener('change', () => {
  stopSpeaking();
  state.voice = $('voice').value;
  saveState();
  updateVoiceNote();
});

synth?.addEventListener?.('voiceschanged', loadVoices);
if (piperSupported) piperIsCached().then((cached) => { piperCached = cached; loadVoices(); });

$('title-ipa').textContent = `[${transcribe('Transcriptor fonético rioplatense').text}]`;

loadState();
syncControls();
render();
loadVoices();
