// Rioplatense (Buenos Aires / Montevideo) Spanish text → IPA.
// The rules and their sources are specified in docs/phonology.md.

import { numberToWords } from './numbers.js';

export const DEFAULT_OPTIONS = {
  mode: 'phonetic', // 'phonetic' [..] or 'phonemic' /../
  palatal: 'ʃ', // realization of ll / y: 'ʃ' (sheísmo) or 'ʒ' (žeísmo)
  syllables: false, // separate syllables with '.'
  links: true, // mark synalepha and linking with '‿'
  monosyllableStress: true, // mark stress on stressed one-syllable words
  approximantDiacritic: false, // write [β̞ ð̞ ɣ̞] instead of [β ð ɣ]
  fallingGlides: false, // write [i̯ u̯] after the nucleus instead of [j w]
  ipaPauses: false, // replace punctuation with | and ‖
  // Casual-speech options
  sPause: false, // /s/ → [h] before a pause
  dFinal: false, // drop word-final /d/
  rInfinitive: false, // drop infinitive-final /ɾ/
  njMerger: false, // /ɲ/ → [nj]
};

const ACCENTED = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };
const VOWEL_LETTERS = new Set('aeiouáéíóúü');
const FRONT_LETTERS = new Set('eiéí');
const STRONG = new Set(['a', 'e', 'o']);
const ONSET_FIRST = new Set(['p', 'b', 'f', 'k', 'g', 't', 'd']);
const NASALS = new Set(['m', 'n', 'ŋ', 'ɲ', 'ɱ']);
const SONORITY = { a: 3, e: 2, o: 2, i: 1, u: 1 };
const PAUSE_CHARS = new Set(',.;:!?¡¿…()[]{}"«»“”—–/');
const MAJOR_PAUSE = new Set('.!?…');

// Words whose spelling does not follow the regular rules, respelled so that
// the regular rules give the right result.
const RESPELL = {
  méxico: 'méjico', mexicano: 'mejicano', mexicana: 'mejicana',
  mexicanos: 'mejicanos', mexicanas: 'mejicanas', texas: 'tejas',
  oaxaca: 'oajaca', ximena: 'jimena', shampoo: 'shampú',
};

// Unstressed function words: no stress mark (docs/phonology.md, Stress).
const FUNCTION_WORDS = new Set([
  'el', 'la', 'lo', 'los', 'las', 'un', 'del', 'al',
  'me', 'te', 'se', 'nos', 'os', 'le', 'les',
  'mi', 'mis', 'tu', 'tus', 'su', 'sus',
  'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'en', 'entre', 'hacia',
  'hasta', 'para', 'por', 'sin', 'so', 'sobre', 'tras',
  'y', 'e', 'ni', 'o', 'u', 'que', 'pero', 'mas', 'sino', 'aunque', 'porque',
  'pues', 'si', 'conque',
  'como', 'cuando', 'donde', 'cual', 'cuales', 'quien', 'quienes',
  'cuyo', 'cuya', 'cuyos', 'cuyas',
]);

// Words in -mente that are not adverbs (mostly subjunctive verb forms).
const NOT_MENTE_ADVERBS = new Set([
  'mente', 'demente', 'clemente', 'inclemente', 'vehemente', 'lamente', 'comente',
  'aumente', 'fomente', 'alimente', 'atormente', 'implemente', 'complemente',
  'suplemente', 'experimente', 'cimente', 'sedimente', 'documente', 'argumente',
  'incremente', 'fermente', 'cumplimente', 'reglamente', 'parlamente',
]);

// Nouns and adjectives in -ar/-er/-ir that are not infinitives.
const NOT_INFINITIVES = new Set([
  'lugar', 'hogar', 'mujer', 'ayer', 'taller', 'collar', 'altar', 'militar',
  'popular', 'familiar', 'particular', 'regular', 'similar', 'singular',
  'solar', 'polar', 'celular', 'titular', 'nivel', 'alfiler', 'malestar',
  'bienestar', 'quehacer', 'menester', 'escolar', 'mujer', 'muladar',
]);

// ---------------------------------------------------------------------------
// Grapheme → phoneme

function g2p(word) {
  const w = RESPELL[word] ?? word;
  const out = [];
  const add = (p, props = {}) => out.push({ p, ...props });
  const n = w.length;
  for (let i = 0; i < n; i++) {
    const c = w[i], prev = w[i - 1] ?? '', nx = w[i + 1] ?? '', nx2 = w[i + 2] ?? '';
    if (VOWEL_LETTERS.has(c)) {
      const props = { v: true, acc: c in ACCENTED };
      // hi + vowel: a glide [j] that never becomes [ʃ]
      if (c === 'i' && prev === 'h' && VOWEL_LETTERS.has(nx) && !'cs'.includes(w[i - 2] || '_')) {
        props.hie = true;
      }
      add(ACCENTED[c] ?? (c === 'ü' ? 'u' : c), props);
      continue;
    }
    switch (c) {
      case 'b': case 'v': add('b'); break;
      case 'c':
        if (nx === 'h') { add('tʃ'); i++; }
        else if (FRONT_LETTERS.has(nx)) add('s', { rule: 'seseo' });
        else add('k');
        break;
      case 'd': add('d'); break;
      case 'f': add('f'); break;
      case 'g':
        if (FRONT_LETTERS.has(nx)) add('x', { rule: 'velar_x' });
        else if (nx === 'u' && FRONT_LETTERS.has(nx2)) { add('g'); i++; }
        else add('g');
        break;
      case 'h': break; // silent; ch and sh are handled at c and s
      case 'j': add('x', { rule: 'velar_x' }); break;
      case 'k': add('k'); break;
      case 'l':
        if (nx === 'l') { add('ʃ', { pal: true }); i++; } else add('l');
        break;
      case 'm': add('m'); break;
      case 'n': add('n'); break;
      case 'ñ': add('ɲ'); break;
      case 'p': if (!(i === 0 && nx === 's')) add('p'); break;
      case 'q': add('k'); if (nx === 'u') i++; break;
      case 'r':
        if (nx === 'r') { add('r', { rule: 'trill' }); i++; }
        else if (i === 0 || 'nls'.includes(prev) || (i === 3 && w.startsWith('sub'))) add('r', { rule: 'trill' });
        else add('ɾ');
        break;
      case 's':
        if (nx === 'h') { add('ʃ', { rule: 'sh' }); i++; } else add('s');
        break;
      case 't': add('t'); break;
      case 'w': add('w', { rule: 'glide' }); break;
      case 'x':
        if (i === 0) add('s', { rule: 'x_ks' });
        else { add('k', { rule: 'x_ks' }); add('s', { rule: 'x_ks', ks: true }); }
        break;
      case 'y':
        if (n === 1) add('i', { v: true, rule: 'y_vowel' });
        else if (VOWEL_LETTERS.has(nx)) add('ʃ', { pal: true });
        else add('i', { v: true, forceGlide: i === n - 1, rule: 'y_vowel' });
        break;
      case 'z': add('s', { rule: 'seseo' }); break;
      case 'ç': add('s'); break;
      default: {
        // Foreign letters with diacritics (à, ê, ö…): drop the diacritic.
        const base = c.normalize('NFD').replace(/\p{M}/gu, '');
        if (base && base !== c) out.push(...g2p(base));
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Syllabification and stress

const isStrong = (s) => STRONG.has(s.p) || s.acc;

// Decide which vowels are syllable nuclei (N) and which are glides (G).
function assignVowelRoles(segs) {
  for (let i = 0; i < segs.length;) {
    if (!segs[i].v) { i++; continue; }
    let j = i;
    while (j < segs.length && segs[j].v) j++;
    const run = segs.slice(i, j);
    run.forEach((s, k) => {
      const prev = run[k - 1], next = run[k + 1];
      if (isStrong(s)) s.role = 'N';
      else if (s.forceGlide && run.length > 1) s.role = 'G';
      else if ((prev && isStrong(prev)) || (next && isStrong(next))) s.role = 'G';
      else if (next && !next.forceGlide) s.role = 'G'; // two high vowels: the first glides
      else s.role = 'N';
    });
    i = j;
  }
}

function validOnset(a, b) {
  return ONSET_FIRST.has(a.p) && (b.p === 'ɾ' || b.p === 'l') && !(a.p === 'd' && b.p === 'l');
}

function syllabify(segs) {
  assignVowelRoles(segs);
  // Group each nucleus with its glides; consonants stay single items.
  const items = [];
  for (let i = 0; i < segs.length;) {
    if (!segs[i].v) { items.push({ c: segs[i] }); i++; continue; }
    let j = i;
    while (j < segs.length && segs[j].v) j++;
    const run = segs.slice(i, j);
    let cur = null, pending = [];
    run.forEach((s, k) => {
      if (s.role === 'N') {
        cur = { nucleus: [...pending, s] };
        pending = [];
        items.push(cur);
      } else if (run[k + 1]?.role === 'N' || !cur) {
        pending.push(s);
      } else {
        s.falling = true;
        cur.nucleus.push(s);
      }
    });
    if (pending.length) cur.nucleus.push(...pending.map((s) => Object.assign(s, { falling: true })));
    i = j;
  }

  const vowelItems = items.filter((it) => it.nucleus);
  if (!vowelItems.length) return [{ segs: items.map((it) => it.c) }];

  const syls = vowelItems.map((it) => ({ onset: [], nucleus: it.nucleus, coda: [] }));
  let v = -1, cluster = [];
  const flush = () => {
    if (v < 0) { syls[0].onset = cluster; return; }
    const L = cluster.length;
    if (v === syls.length - 1) { syls[v].coda = cluster; return; }
    let split = L - 1; // index where the next onset starts
    if (L >= 2 && validOnset(cluster[L - 2], cluster[L - 1])) split = L - 2;
    if (L === 0) split = 0;
    syls[v].coda = cluster.slice(0, split);
    syls[v + 1].onset = cluster.slice(split);
  };
  for (const it of items) {
    if (it.nucleus) { flush(); cluster = []; v++; } else cluster.push(it.c);
  }
  flush();
  return syls.map((s) => {
    s.coda.forEach((c) => { c.coda = true; });
    return { segs: [...s.onset, ...s.nucleus, ...s.coda] };
  });
}

function stressIndex(syls, word) {
  const acc = syls.findIndex((s) => s.segs.some((x) => x.acc));
  if (acc >= 0) return acc;
  if (syls.length === 1) return 0;
  return /[aeiouns]$/.test(word) ? syls.length - 2 : syls.length - 1;
}

function analyzeWord(word, opts) {
  const segs = g2p(word);
  const syls = syllabify(segs);
  const spelled = RESPELL[word] ?? word;
  const rules = new Set();
  syls.forEach((s) => { s.stress = 0; });

  // A word on its own is said in citation form, stressed even if it is a function word.
  const isFunction = FUNCTION_WORDS.has(word) && !opts.citation;
  const marked = !isFunction && (syls.length > 1 || opts.monosyllableStress);
  const menteStem = word.length > 7 && word.endsWith('mente') && !NOT_MENTE_ADVERBS.has(word)
    ? word.slice(0, -5) : null;
  if (marked && menteStem && syls.length >= 3) {
    syls[syls.length - 2].stress = 1;
    const stemSyls = syllabify(g2p(menteStem));
    syls[stressIndex(stemSyls, menteStem)].stress = 2;
    rules.add('mente');
  } else if (marked && syls.some((s) => s.segs.some((x) => x.v))) {
    syls[stressIndex(syls, spelled)].stress = 1;
  }

  for (const s of segs) {
    if (s.rule) rules.add(s.rule);
    if (s.role === 'G') rules.add(s.hie ? 'hie' : 'glide');
    if (s.pal) rules.add(opts.palatal === 'ʒ' ? 'zheismo' : 'sheismo');
  }
  return {
    word, segs, syls, rules,
    isY: word === 'y',
    stressedFinal: syls.length > 1 && stressIndex(syls, spelled) === syls.length - 1,
  };
}

// ---------------------------------------------------------------------------
// Phonetic realization over a phrase (a stretch of words between pauses)

const live = (s) => !s.deleted;
const firstSeg = (w) => w.segs.find(live);
const lastSeg = (w) => w.segs.findLast(live);
// A word "starts with a vowel" for linking only if it starts with a nucleus;
// a word-initial glide (huevo, hielo) behaves like a consonant.
const startsWithNucleus = (w) => firstSeg(w)?.role === 'N';

function realizePhrase(words, opts) {
  // Casual deletions first: they change the neighbours of other segments.
  words.forEach((w, k) => {
    const next = words[k + 1];
    const beforeConsonantOrPause = !next || !startsWithNucleus(next);
    const last = lastSeg(w);
    if (!last) return;
    if (opts.dFinal && last.p === 'd' && w.segs.length > 1 && beforeConsonantOrPause) {
      last.deleted = true; w.rules.add('d_final');
    }
    if (opts.rInfinitive && last.p === 'ɾ' && /[aei]r$/.test(w.word) && w.syls.length > 1 &&
        w.stressedFinal && !NOT_INFINITIVES.has(w.word) && beforeConsonantOrPause) {
      last.deleted = true; w.rules.add('r_infinitive');
    }
  });

  const flat = [];
  words.forEach((w, k) => w.segs.forEach((s) => { s.wi = k; flat.push(s); }));
  const seq = () => flat.filter(live);

  // /s/ + /s/ → [s]
  let segs = seq();
  segs.forEach((s, i) => {
    if (s.p === 's' && segs[i + 1]?.p === 's') { s.deleted = true; words[s.wi].rules.add('s_merge'); }
  });

  segs = seq();
  segs.forEach((s, i) => {
    const prev = segs[i - 1], next = segs[i + 1];
    const w = words[s.wi];
    let ph = s.p;
    if (s.pal) {
      ph = opts.palatal;
    } else if (s.p === 'b' || s.p === 'd' || s.p === 'g') {
      const stop = !prev || NASALS.has(prev.ph) || (s.p === 'd' && prev.p === 'l');
      if (!stop) {
        ph = { b: 'β', d: 'ð', g: 'ɣ' }[s.p] + (opts.approximantDiacritic ? '̞' : '');
        w.rules.add('spirantization');
      } else if (s.p === 'g') {
        ph = 'ɡ';
      }
    } else if (s.p === 'n' && next) {
      const np = next.p;
      const assim = { p: 'm', b: 'm', f: 'ɱ', k: 'ŋ', g: 'ŋ', x: 'ŋ', 'tʃ': 'ɲ' }[np];
      if (assim) { ph = assim; w.rules.add('nasal'); }
    } else if (s.p === 's' && s.coda && !s.ks) {
      const wordFinal = s === lastSeg(w);
      let aspirate;
      if (!wordFinal) aspirate = true;
      else if (!next) aspirate = opts.sPause;
      else aspirate = !startsWithNucleus(words[next.wi]);
      if (aspirate) {
        ph = 'h';
        w.rules.add(!next ? 's_pause' : 's_aspiration');
      }
    } else if (s.p === 'ɲ' && opts.njMerger) {
      ph = 'nj'; w.rules.add('nj_merger');
    } else if (s.role === 'G' || s.p === 'w') {
      const high = s.p === 'u' || s.p === 'w' ? 'w' : 'j';
      ph = s.falling && opts.fallingGlides ? (high === 'w' ? 'u̯' : 'i̯') : high;
    }
    s.ph = ph;
  });

  // Synalepha and linking across word boundaries.
  words.forEach((w, k) => {
    const next = words[k + 1];
    if (!next) return;
    const a = lastSeg(w), b = firstSeg(next);
    // The conjunction y only links forward (norte y el → [ˈnoɾte jel]).
    if (!a || !b || b.role !== 'N' || next.isY) return;
    if (w.isY) {
      a.ph = 'j';
      w.linkNext = true;
      return;
    }
    if (a.role === 'N') {
      w.linkNext = true;
      w.rules.add('synalepha');
      if (a.p === b.p) return;
      const target = SONORITY[a.p] <= SONORITY[b.p] ? a : b;
      const targetStressed = target === b ? next.syls[0].stress : w.syls.at(-1).stress;
      if ((target.p === 'i' || target.p === 'u') && targetStressed) return;
      target.ph = { i: 'j', u: 'w', e: 'e̯', o: 'o̯' }[target.p] ?? target.ph;
    } else {
      w.linkNext = true;
      w.rules.add('linking');
    }
  });
}

// ---------------------------------------------------------------------------
// Rendering

function renderWord(w, opts, phonetic) {
  const parts = [];
  for (const syl of w.syls) {
    const body = syl.segs.filter(live).map((s) => {
      if (phonetic) return s.ph;
      if (s.pal) return opts.palatal;
      if (s.p === 'w') return 'u';
      return s.p === 'g' ? 'ɡ' : s.p;
    }).join('');
    if (!body) continue;
    const mark = syl.stress === 1 ? 'ˈ' : syl.stress === 2 ? 'ˌ' : '';
    parts.push({ mark, body });
  }
  return parts.map((p, i) => {
    const sep = i > 0 && opts.syllables && !p.mark ? '.' : '';
    return sep + p.mark + p.body;
  }).join('');
}

const PHONEMIC_ONLY_RULES = new Set([
  'sheismo', 'zheismo', 'sh', 'hie', 'seseo', 'trill', 'velar_x', 'x_ks', 'glide', 'y_vowel', 'mente',
]);

const TOKEN_RE = /(\p{L}+(?:['’]\p{L}+)*)|(\d+(?:[.,]\d+)*)|(\s+)|([^\s\p{L}\d])/gu;

/**
 * Transcribe Spanish text as spoken in the Río de la Plata region.
 * Returns the rendered string plus per-token details for the UI.
 */
export function transcribe(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const phonetic = opts.mode === 'phonetic';
  const tokens = [];
  const phrases = [[]];
  const breakPhrase = () => { if (phrases.at(-1).length) phrases.push([]); };

  const matches = [...text.matchAll(TOKEN_RE)];
  const wordOpts = { ...opts, citation: matches.filter((m) => m[1]).length === 1 && !matches.some((m) => m[2]) };
  for (const m of matches) {
    const [raw, letters, digits, space, punct] = m;
    if (letters || digits) {
      const spelled = digits ? numberToWords(digits) : letters;
      if (!spelled) { tokens.push({ kind: 'punct', text: raw }); breakPhrase(); continue; }
      const words = spelled.toLocaleLowerCase('es').replace(/['’]/g, '').split(' ')
        .map((x) => analyzeWord(x, wordOpts));
      words.forEach((w) => phrases.at(-1).push(w));
      tokens.push({ kind: 'word', text: raw, words });
    } else if (space) {
      tokens.push({ kind: 'space', text: raw });
      if (raw.includes('\n')) breakPhrase();
    } else {
      tokens.push({ kind: 'punct', text: punct });
      if (PAUSE_CHARS.has(punct)) breakPhrase();
    }
  }

  if (phonetic) phrases.forEach((p) => p.length && realizePhrase(p, opts));

  const ruleCounts = {};
  let out = '';
  tokens.forEach((t, i) => {
    if (t.kind === 'word') {
      const linked = phonetic && opts.links;
      t.out = t.words.map((w, k) => renderWord(w, opts, phonetic) +
        (k < t.words.length - 1 ? (linked && w.linkNext ? '‿' : ' ') : '')).join('');
      const rules = new Set();
      t.words.forEach((w) => w.rules.forEach((r) => {
        if (phonetic || PHONEMIC_ONLY_RULES.has(r)) rules.add(r);
      }));
      if (!(phonetic && opts.links)) { rules.delete('synalepha'); rules.delete('linking'); }
      t.rules = [...rules];
      t.rules.forEach((r) => { ruleCounts[r] = (ruleCounts[r] ?? 0) + 1; });
      t.linkNext = t.words.at(-1).linkNext;
      out += t.out;
    } else if (t.kind === 'space') {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      const tie = phonetic && opts.links && prev?.kind === 'word' && prev.linkNext &&
        next?.kind === 'word' && !t.text.includes('\n');
      t.out = tie ? '‿' : t.text;
      out += t.out;
    } else {
      t.out = t.text;
      if (opts.ipaPauses && PAUSE_CHARS.has(t.text)) {
        t.out = MAJOR_PAUSE.has(t.text) ? ' ‖' : '¿¡"«»“”'.includes(t.text) ? '' : ' |';
      }
      out += t.out;
    }
  });
  if (opts.ipaPauses) out = out.replace(/ ([|‖])( [|‖])+/g, ' $1').replace(/ {2,}/g, ' ').trim();

  return {
    text: out,
    tokens: tokens.map(({ kind, text: tx, out: o, rules }) => ({ kind, text: tx, out: o, rules })),
    rules: ruleCounts,
  };
}
