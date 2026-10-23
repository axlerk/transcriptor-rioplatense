#!/usr/bin/env node
// Build the Spanish review document for a specialist (docs/review/).
// Written in Spanish on purpose: its reader is a Spanish-speaking phonetician.
// Every IPA example below is computed by the engine at build time, so the
// document cannot drift from the code. Usage: node docs/review/build.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { transcribe } from '../../src/transcriber.js';

const here = new URL('./', import.meta.url);
const root = new URL('../../', import.meta.url);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ipa = (text, opts) => transcribe(text, opts).text;
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root.pathname }).toString().trim();
const fontUrl = (f) => new URL(`fonts/${f}`, root).href;

// ---------------------------------------------------------------- content

const DATE = '23 de octubre de 2026';

const EV = {
  v: ['verificado', 'ok'], s: ['secundario', 'warn'], i: ['inferido', 'risk'],
  n: ['notación', 'neutral'], o: ['abierto', 'risk'], x: ['superado', 'neutral'],
};

// [id, decisión, fuente, evidencia]
const DECISIONS = [
  ['Variedad y fonemas', [
    ['D1', 'Variedad por defecto: habla formal culta de Buenos Aires según C18; los rasgos coloquiales son opcionales', 'C18', 'v'],
    ['D2', 'Seseo: z, ce, ci → /s/; no hay /θ/', 'C18', 'v'],
    ['D3', 'Sin /ʎ/: ll e y ante vocal → un solo fonema /ʃ/', 'C18', 'v'],
    ['D4', 'Realización por defecto [ʃ]; [ʒ] como opción (hablantes mayores, Montevideo)', 'C18, MICH (resumen)', 'v'],
    ['D5', 'hi + vocal → [j], nunca [ʃ]: hierro y yerro se distinguen; hu + vocal → [w]', 'C18', 'v'],
    ['D6', 'La grafía sh → [ʃ] también en el modo [ʒ]', 'C18 (cita a Fontanella 1987)', 'v'],
    ['D7', '/x/ velar [x], nunca [h]', 'C18', 'v'],
    ['D8', '/r/ vibrante múltiple [r], sin asibilación (rasgo del norte)', 'C18', 'v'],
    ['D9', '/tʃ/ se mantiene [tʃ], nunca [ʃ]', 'C18', 'v'],
    ['D10', 'x → /ks/; x inicial → /s/; México, Texas, Oaxaca, Ximena → /x/', 'C18 (/ks/); resto, español general', 'v'],
    ['D11', 'ps- inicial → /s/ (psicólogo)', 'español general', 'i'],
  ]],
  ['/s/', [
    ['D12', '/s/ → [h] ante cualquier consonante, dentro de la palabra y entre palabras', 'C18; T78 (80 % interna, 69 % final ante C)', 'v'],
    ['D13', '/s/ ante vocal (también de la palabra siguiente) y ante pausa → [s]', 'C18; T78 (88 % y 78 %)', 'v'],
    ['D14', 'La /s/ de /ks/ se mantiene [s] (extraño [eksˈtɾaɲo])', 'C18', 'v'],
    ['D15', '/s/ + /s/ → una sola [s] (más soplaba)', 'C18', 'v'],
    ['D16', '/s/ ante deslizada inicial de palabra (los huevos) → [h]', '—', 'i'],
    ['D17', '/s/ en coda doble (abstracto, instante) recibe la misma regla de aspiración', '— (CC excluye estos grupos; SIL sugiere reducción a /s/)', 'o'],
    ['D18', 'No se modela la elisión de /s/ final ante consonante (20 % en T78)', 'T78', 'v'],
  ]],
  ['Otras consonantes', [
    ['D19', '/b d ɡ/ oclusivas tras pausa y tras nasal; /d/ también tras /l/; aproximantes en los demás contextos, también entre palabras', 'C18', 'v'],
    ['D20', 'Aproximantes escritas [β ð ɣ] (convención de C18); [β̞ ð̞ ɣ̞] como opción', 'C18', 'n'],
    ['D21', '/n/ → [m] ante /p b/, [ŋ] ante /k ɡ x/, [ɲ] ante /tʃ/', 'C18', 'v'],
    ['D22', '/n/ → [ɱ] ante /f/ (C18 escribe [m])', 'fonética general del español', 'i'],
    ['D23', '/n/ ante /m/ se mantiene [n] (inmediatamente)', 'C18', 'v'],
    ['D24', '/n/ ante /ʃ/ se mantiene [n] (con llave)', '—', 'i'],
  ]],
  ['Vocales y habla conectada', [
    ['D25', 'i/u átonas junto a vocal → [j w]; con dos vocales altas, núcleo la segunda (salvo y final); la tilde mantiene el hiato', 'C18; ortografía', 'v'],
    ['D26', 'Deslizadas [j w] a ambos lados del núcleo; [i̯ u̯] tras el núcleo como opción', 'C18', 'n'],
    ['D27', 'Sinalefa: la vocal menos sonora (i, u < e, o < a; empate: la primera) se vuelve no silábica, aun si es tónica', 'C18 (brilló el `βɾi·\'ʃo̯ el`)', 'v'],
    ['D28', 'Vocales idénticas entre palabras: se enlazan, no se reducen', '—', 'n'],
    ['D29', 'Una /i/ o /u/ tónica no se vuelve deslizada en sinalefa (la uva)', '—', 'i'],
    ['D30', 'La conjunción y ante vocal → [j], enlazada solo hacia adelante', 'C18 (`\'noɾ·te jel`)', 'v'],
    ['D31', 'Resilabeo y sinalefa se marcan con ‿ en lugar de mover segmentos, para conservar los límites de palabra', '—', 'n'],
    ['D32', '/ɲ/ se mantiene [ɲ] por defecto; la fusión con /nj/ es la opción D43', 'C18', 'v'],
  ]],
  ['Acento', [
    ['D33', 'Marca de acento antes de la sílaba, no antes de la vocal', 'práctica AFI; C18', 'n'],
    ['D34', 'Se marcan los monosílabos léxicos; las palabras funcionales átonas no', 'C18 (texto narrado)', 'v'],
    ['D35', 'Lista de palabras átonas más allá de las del texto de C18 (artículos, clíticos, preposiciones, conjunciones, relativos)', 'español general', 'i'],
    ['D36', 'un sin marca y una con marca, como en el texto de C18', 'C18', 'v'],
    ['D37', 'Una palabra aislada recibe acento de cita aunque sea funcional (para [ˈpaɾa])', 'C18 (tabla de palabras)', 'v'],
    ['D38', 'Adverbios en -mente: acento secundario en el adjetivo y primario en -men-', 'C18', 'v'],
    ['D39', 'No se modela el desplazamiento del acento a los enclíticos (decímelo → decimeló)', 'C18 (cita a Colantoni y Cuervo 2013)', 'v'],
  ]],
  ['Opciones coloquiales', [
    ['D40', 'Opción: /s/ ante pausa → [h]', 'WP (secundario)', 'x'],
    ['D41', 'Opción: elisión de /d/ final', 'español general', 'i'],
    ['D42', 'Opción: elisión de /ɾ/ final de infinitivo, con lista de excepciones no verbales en -ar/-er/-ir', 'WP; GRM17 (solo resumen)', 's'],
    ['D43', 'Opción: /ɲ/ → [nj] (hablantes jóvenes)', 'C18', 'v'],
    ['D44', 'D40 recalificada: debilitamiento ante pausa minoritario en hablantes cultos (22 %: [h] 11 %, elisión 11 %)', 'T78', 'v'],
    ['D45', 'Sin datos de /d/ final para Buenos Aires: DCG11 es de Caracas; L94 (secundario) dice que BA resiste la elisión de /d/ intervocálica', 'DCG11, L94', 'o'],
    ['D46', 'Gilbert y Rohena-Madrazo (2017) localizado pero no leído', 'GRM17', 'o'],
  ]],
  ['Fuera de alcance', [
    ['D47', 'No se representa la entonación (caída larga, interrogativas totales descendentes)', 'C18', 'v'],
    ['D48', 'No se aplican rasgos del norte y del oeste ([ʑ] para /r/, [ʎ], [ç], [ʝ])', 'C18', 'v'],
    ['D49', 'No se genera la [v] enfática para la grafía v', 'C18', 'v'],
  ]],
  ['Segunda revisión (tras la consulta de fuentes)', [
    ['D50', 'Tras des-, dis-, tras-, trans- ante h + vocal, s + h no es el dígrafo sh: la h es muda (antes deshielo salía [deˈʃjelo])', 'ortografía', 'i'],
    ['D51', 'En ese caso, ante hie-/hue- la /s/ queda en coda y se aspira (deshielo [dehˈjelo]); ante otra vocal se resilabea (deshacer)', '—', 'i'],
    ['D52', 'Préstamos: consonantes dobles y ck valen una consonante; -ng final → [n]; el acento se calcula sobre esa grafía (shopping [ˈʃopin])', '— (pronunciaciones recordadas)', 'i'],
    ['D53', 'Grafías adaptadas para préstamos frecuentes: jean(s), sándwich, jazz, hall, hobby, mail, email, freezer, jogging, marketing', '— (recordado)', 'i'],
    ['D54', 'La opción «/s/ ante pausa → [h]» se mantiene, rotulada como variante minoritaria con los datos de T78', 'T78', 'v'],
    ['D55', 'La opción de elisión de /d/ final se mantiene, rotulada como no verificada', 'DCG11, L94', 'o'],
    ['D56', 'Los casos inferidos de /s/ (D16, D17) tienen su propia tarjeta en la interfaz, marcada «inferred»', '—', 'n'],
    ['D57', 'En la línea de comandos, --casual activa las tres reglas coloquiales; ñ → nj es la opción aparte --nj (variante generacional, no de registro)', 'C18', 'n'],
  ]],
];

// Questions for the reviewer: [id, título, contexto, ejemplos, pregunta]
const QUESTIONS = [
  ['P1', '/s/ en coda doble', 'Aplicamos la aspiración de manera mecánica. Coloma y Colantoni excluyen estos grupos por infrecuentes; una fuente general sugiere reducción a /s/ en prefijos cultos.',
    ['abstracto', 'instante', 'obstáculo', 'perspectiva', 'construir'],
    '¿Cuáles son las realizaciones habituales en el habla culta porteña: [aβhˈtɾakto], [ahˈtɾakto], [asˈtɾakto]…? ¿Hay datos publicados?', ['D17']],
  ['P2', '/s/ ante deslizada inicial', 'Tratamos la deslizada de hie-/hue- como consonante: /s/ se aspira y no se enlaza.',
    ['los huevos', 'las hierbas', 'deshielo', 'deshuesar'],
    '¿Es habitual [loh ˈweβos] o predomina el resilabeo [lo ˈsweβos]? ¿Y [ɣw] en huevo ([ˈɣweβo])?', ['D16', 'D51']],
  ['P3', '/s/ ante /t/', 'T78 registra que ante /t/ se conserva la sibilante (o una mezcla [hs]) con más frecuencia que ante otras consonantes. Nosotros siempre escribimos [h].',
    ['pasta', 'este', 'gusto'],
    '¿Conviene una variante opcional con [s] ante /t/ para el registro formal?', ['D12']],
  ['P4', '/s/ ante pausa', 'Por defecto [s]. La opción coloquial da [h]. En T78 (1978, 24 hablantes cultos) el debilitamiento ante pausa es del 22 %, repartido entre [h] y elisión.',
    ['Vamos.', 'Son los chicos.'],
    '¿Siguen vigentes estas proporciones? ¿La variante debilitada más frecuente hoy es [h] o la elisión?', ['D13', 'D44'], { sPause: true }],
  ['P5', 'Elisión de /d/ final', 'Opción no verificada: no encontramos estudios de /d/ final en Buenos Aires.',
    ['verdad', 'usted', 'ciudad', 'Madrid'],
    '¿Qué tan frecuente es [beɾˈða] / [uhˈte] en el habla culta porteña? ¿Hay alguna fuente?', ['D41', 'D45'], { dFinal: true }],
  ['P6', 'Elisión de /ɾ/ en infinitivos', 'Opción basada en fuentes secundarias; GRM17 (sobre /ɾ/ en coda en Buenos Aires) no pudo consultarse.',
    ['quiero comer', 'vamos a hablar'],
    '¿La elisión se limita a infinitivos ante consonante o pausa? ¿Afecta también a sustantivos (mujer, lugar)?', ['D42', 'D46'], { rInfinitive: true }],
  ['P7', 'Nasal ante /ʃ/ y ante /f/', 'Ante ll/y mantenemos [n]; ante /f/ escribimos [ɱ], aunque C18 escribe [m].',
    ['con llave', 'un yuyo', 'enfermo', 'un fósforo'],
    '¿Hay asimilación palatal ante [ʃ]? ¿[ɱ] o [m] ante /f/?', ['D22', 'D24']],
  ['P8', 'Sinalefa', 'Regla de sonoridad (i, u < e, o < a), sin tener en cuenta el acento, salvo /i u/ tónicas, que no se vuelven deslizadas. Las vocales idénticas solo se enlazan.',
    ['era el más fuerte', 'la uva', 'de ellos', 'pasó un viajero'],
    '¿La regla describe bien el habla porteña? ¿Se fusionan las vocales idénticas ([de‿ˈeʃos] → [ˈdeʃos])?', ['D27', 'D28', 'D29']],
  ['P9', 'Acento de las palabras funcionales', 'Seguimos el texto de C18 (un átono, una tónico) y completamos la lista con criterios generales.',
    ['un amigo', 'una amiga', 'cuando llegues', 'para vos'],
    '¿Es correcta la lista de átonas? ¿un es átono en el habla porteña?', ['D34', 'D35', 'D36']],
  ['P10', 'Enclíticos', 'No modelamos el desplazamiento del acento que C18 describe como relativamente común.',
    ['decímelo', 'dámelo', 'contame'],
    '¿Conviene ofrecer decimeló como opción coloquial? ¿Con qué alcance?', ['D39']],
  ['P11', 'Préstamos del inglés', 'Pronunciaciones recordadas, no verificadas.',
    ['shopping', 'jean', 'sándwich', 'camping', 'marketing'],
    '¿Son las formas habituales en Buenos Aires? ¿Qué préstamos frecuentes faltan?', ['D52', 'D53']],
  ['P12', 'hie- inicial', 'Seguimos C18 (hierro [ˈjero]). Fuera de C18 no comprobamos si hielo puede pronunciarse con [ʃ]/[ʒ].',
    ['hielo', 'hierba', 'hierro', 'yerro'],
    '¿La distinción hierro/yerro es general entre hablantes jóvenes?', ['D5']],
  ['P13', 'Convenciones de notación', '[β ð ɣ] sin diacrítico, ‿ para resilabeo y sinalefa, [j w] a ambos lados del núcleo, ɡ tipográfica.',
    ['el viento y el sol', 'baile', 'nada'],
    '¿Son adecuadas para un público de estudiantes de ELE? ¿Preferiría otra convención?', ['D20', 'D26', 'D31']],
];

const SOURCES = [
  ['C18', 'Coloma, Germán (2018). «Argentine Spanish». <i>Journal of the International Phonetic Association</i>, Illustrations of the IPA. Copia del autor: ucema.edu.ar/u/gcoloma/ArgentineSpanish.pdf', 'Leído completo (copia del autor; año y páginas según la cita de Wikipedia, no verificados en la revista). Fuente principal; sus tablas y su transcripción del texto «El viento norte y el sol» son casos de prueba automáticos.'],
  ['T78', 'Terrell, Tracy D. (1978). «La aspiración y elisión de /s/ en el español porteño». <i>Anuario de Letras</i> 16, 41–66.', 'Leído completo.'],
  ['CC', 'Coloma, Germán y Laura Colantoni. «La aspiración de /s/ en el español rioplatense: tango vs. rock». Ponencia ALFAL.', 'Leído completo.'],
  ['DCG11', 'Díaz-Campos, Manuel y Michael Gradoville (2011). «An Analysis of Frequency as a Factor Contributing to the Diffusion of Variable Phenomena: Evidence from Spanish Data». <i>Selected Proceedings of the 13th Hispanic Linguistics Symposium</i>, 224–238.', 'Leídas las secciones de datos (los datos de /d/ son de Caracas).'],
  ['MICH', 'Michnowicz, Jim. «Sheísmo in Montevideo Spanish: Not (yet) identical to Buenos Aires». John Benjamins, IHLL 29, cap. 7.', 'Solo el resumen.'],
  ['GRM17', 'Gilbert y Marcos Rohena-Madrazo (2017). «Revising the canon: Social and stylistic variation of coda (-ɾ) in Buenos Aires Spanish». <i>Romance Languages and Linguistic Theory</i> 12, cap. 5.', 'No leído (acceso denegado); solo fragmentos del resumen.'],
  ['F73', 'Fontanella de Weinberg, Beatriz (1973). «Comportamiento ante -s de hablantes femeninos y masculinos del español bonaerense». <i>Romance Philology</i> 27, 50–58.', 'No leído; conocido por el resumen de T78.'],
  ['L94', 'Lipski, John (1994). <i>Latin American Spanish</i>, p. 190.', 'No leído; citado en una reseña secundaria.'],
  ['SIL', '«Reglas de silabación», elies.rediris.es/elies4/Fon2.htm.', 'Solo un fragmento de búsqueda.'],
  ['WP', 'Wikipedia, «Rioplatense Spanish», sección de fonología.', 'Fuente secundaria.'],
];

// ---------------------------------------------------------------- render

const chip = (k) => `<span class="ev ev-${EV[k][1]}">${EV[k][0]}</span>`;

const decisionsHtml = DECISIONS.map(([area, rows]) => `
  <h3>${esc(area)}</h3>
  <table class="dec">
    <thead><tr><th>N.º</th><th>Decisión</th><th>Fuente</th><th>Evidencia</th></tr></thead>
    <tbody>${rows.map(([id, d, s, e]) => `<tr><td class="id">${id}</td><td>${esc(d).replace(/`([^`]+)`/g, '<span class="ipa">$1</span>')}</td><td class="src">${esc(s).replace(/`([^`]+)`/g, '<span class="ipa">$1</span>')}</td><td>${chip(e)}</td></tr>`).join('')}</tbody>
  </table>`).join('');

const questionsHtml = QUESTIONS.map(([id, title, ctx, examples, q, refs, opt]) => `
  <section class="q">
    <h3><span class="id">${id}</span> ${esc(title)} <span class="refs">${refs.join(', ')}</span></h3>
    <p>${esc(ctx)}</p>
    <table class="ex">${opt ? '<thead><tr><th>Texto</th><th>Por defecto</th><th>Con la opción</th></tr></thead>' : ''}<tbody>${examples.map((e) => `<tr><td>${esc(e)}</td><td class="ipa">[${esc(ipa(e))}]</td>${opt ? `<td class="ipa">[${esc(ipa(e, opt))}]</td>` : ''}</tr>`).join('')}</tbody></table>
    <p class="ask"><b>Pregunta.</b> ${esc(q)}</p>
  </section>`).join('');

const colomaRows = [
  ['El viento norte y el sol discutían sobre cuál de ellos era el más fuerte', "el 'βjen·to 'noɾ·te jel 'sol dih·ku·'ti·an so·βɾe 'kwal 'de·ʃo 'se·ɾae̯ l 'mah 'fweɾ·te"],
  ['cuando pasó un extraño viajero envuelto en una ancha capa', "kwan·do pa·'sow neks·'tɾa·ɲo βja·'xe·ɾo̯ em 'bwel·to̯ e 'nu·na 'aɲ·tʃa 'ka·pa"],
  ['la superioridad del sol', "la su·pe·ɾjo·ɾi·'ða·ðel 'sol"],
].map(([t, c]) => `<tr><td>${esc(t)}</td><td class="ipa">${esc(c)}</td><td class="ipa">${esc(ipa(t))}</td></tr>`).join('');

const refSentence = 'Ciudad, calle, hielo, huevo, gente.';
const refRow = `<tr><td>${esc(refSentence)}</td><td class="ipa">θjuðˈad, kˈaʎe, jˈelo, wˈeβo, xˈɛnte.</td><td class="ipa">${esc(ipa(refSentence))}</td></tr>`;

const optRows = [
  ['Vamos con los chicos.', {}, 'por defecto'],
  ['Vamos con los chicos.', { sPause: true }, '/s/ ante pausa → [h]'],
  ['Usted tiene razón, la verdad.', { dFinal: true }, 'elisión de /d/ final'],
  ['Quiero comer.', { rInfinitive: true }, 'elisión de /ɾ/ en infinitivo'],
  ['La calle está llena.', { palatal: 'ʒ' }, 'žeísmo [ʒ]'],
  ['Mañana', { njMerger: true }, 'ñ → nj'],
  ['El viento norte', { mode: 'phonemic' }, 'transcripción fonológica'],
].map(([t, o, label]) => `<tr><td>${esc(label)}</td><td>${esc(t)}</td><td class="ipa">${o.mode === 'phonemic' ? '/' : '['}${esc(ipa(t, o))}${o.mode === 'phonemic' ? '/' : ']'}</td></tr>`).join('');

const sourcesHtml = SOURCES.map(([k, ref, read]) => `<tr><td class="id">${k}</td><td>${ref}</td><td class="src">${esc(read)}</td></tr>`).join('');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Transcriptor fonético rioplatense: documento para revisión</title>
<style>
@font-face { font-family: "Rio IPA Serif"; font-weight: 400; src: url(${fontUrl('rio-serif-400.woff2')}) format("woff2"); }
@font-face { font-family: "Rio IPA Serif"; font-weight: 400; font-style: italic; src: url(${fontUrl('rio-serif-400i.woff2')}) format("woff2"); }
@font-face { font-family: "Rio IPA Serif"; font-weight: 700; src: url(${fontUrl('rio-serif-700.woff2')}) format("woff2"); unicode-range: U+0020-017F, U+2010-2027; }
/* The bold serif subset has no IPA glyphs; headings borrow the regular ones for IPA ranges. */
@font-face { font-family: "Rio IPA Serif"; font-weight: 700; src: url(${fontUrl('rio-serif-400.woff2')}) format("woff2"); unicode-range: U+0250-02FF, U+0300-036F, U+03B2, U+203F, U+2190-2193; }
@font-face { font-family: "Rio UI Sans"; font-weight: 400; src: url(${fontUrl('rio-sans-400.woff2')}) format("woff2"); }
@font-face { font-family: "Rio UI Sans"; font-weight: 600; src: url(${fontUrl('rio-sans-600.woff2')}) format("woff2"); }
@page { size: A4; margin: 20mm 18mm 20mm 18mm;
  @bottom-center { content: counter(page) " / " counter(pages); font: 8.5pt "Rio UI Sans", sans-serif; color: #586874; } }
:root { --ink: #13212c; --muted: #586874; --line: #d2dbe2; --celeste: #2a6b96; --ok: #2d7a4c; --warn: #9a6200; --risk: #b0443a; }
* { box-sizing: border-box; }
body { margin: 0; color: var(--ink); font: 10.5pt/1.5 "Rio IPA Serif", serif; }
h1, h2, h3, th, .ev, .meta, .id, .refs { font-family: "Rio UI Sans", "Rio IPA Serif", sans-serif; }
h1 { font-size: 22pt; line-height: 1.15; margin: 0 0 4mm; }
h1 em { color: var(--celeste); font-family: "Rio IPA Serif", serif; }
h2 { font-size: 14pt; margin: 9mm 0 3mm; padding-bottom: 1.5mm; border-bottom: 1px solid var(--line); break-after: avoid; }
h3 { font-size: 11pt; margin: 5mm 0 2mm; break-after: avoid; }
p { margin: 0 0 2.5mm; }
.ipa { font-family: "Rio IPA Serif", serif; }
.meta { color: var(--muted); font-size: 9pt; margin-bottom: 8mm; }
.meta div { margin: 0.5mm 0; }
.lede { font-size: 11.5pt; }
table { width: 100%; border-collapse: collapse; margin: 1mm 0 3mm; font-size: 9.5pt; break-inside: auto; }
tr { break-inside: avoid; }
th { text-align: left; font-weight: 600; font-size: 8.5pt; color: var(--muted); border-bottom: 1px solid var(--line); padding: 1.5mm 2mm; }
td { vertical-align: top; padding: 1.4mm 2mm; border-bottom: 1px solid #edf1f4; }
td.id { font-family: "Rio UI Sans", sans-serif; font-weight: 600; white-space: nowrap; width: 11mm; }
td.src { color: var(--muted); width: 34%; }
table.dec td.src { width: 28%; }
td.ipa { font-size: 10.5pt; }
.ev { display: inline-block; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.04em; border: 1px solid currentColor; border-radius: 2px; padding: 0.3mm 1.2mm; white-space: nowrap; }
.ev-ok { color: var(--ok); } .ev-warn { color: var(--warn); } .ev-risk { color: var(--risk); } .ev-neutral { color: var(--muted); }
.q { break-inside: avoid; margin-bottom: 4mm; }
.q .id { color: var(--celeste); }
.q .refs { font-weight: 400; color: var(--muted); font-size: 8.5pt; margin-left: 2mm; }
.q table.ex td:first-child { width: 38%; }
.ask { background: #eef3f7; padding: 2mm 3mm; border-left: 2px solid var(--celeste); }
ul { margin: 0 0 3mm; padding-left: 5mm; }
li { margin: 0.8mm 0; }
.pagebreak { break-before: page; }
</style>
</head>
<body>
<h1>Transcriptor fonético <em>rioplatense</em></h1>
<div class="meta">
  <div>Documento para revisión especializada · ${DATE}</div>
  <div>Servicio: rioplatense.onegoodman.studio · Código: github.com/axlerk/transcriptor-rioplatense (versión ${commit})</div>
</div>

<p class="lede">El servicio convierte texto en español a transcripción fonética (AFI) según la pronunciación del Río de la Plata (Buenos Aires y Montevideo). Este documento describe cómo funciona, qué decisiones se tomaron y con qué fuentes, y qué puntos quedan abiertos. Le pedimos su opinión sobre esos puntos, en especial las preguntas P1–P13 de la sección 4.</p>

<h2>1. Qué hace el servicio</h2>
<ul>
  <li>Transcripción <b>fonética</b> [ ] por defecto, con alófonos, resilabeo y sinalefa; también <b>fonológica</b> / /.</li>
  <li>Variedad por defecto: habla formal culta de Buenos Aires, tal como la describe Coloma (2018). Los rasgos coloquiales se activan como opciones.</li>
  <li>Al pasar el cursor sobre una palabra se ven sus dos transcripciones y las reglas aplicadas. Cada regla indica su fuente y su nivel de evidencia: verificado en la fuente primaria, tomado de una fuente secundaria o inferido por nosotros.</li>
  <li>Síntesis de voz con las voces del dispositivo, con preferencia por es-AR y es-UY. La voz no forma parte de lo que se revisa: la referencia es la transcripción.</li>
  <li>Fuera de alcance: entonación y rasgos del norte y del oeste argentinos.</li>
</ul>

<h3>Proceso</h3>
<ul>
  <li><b>Grafema → fonema</b>: seseo, /ʃ/ para ll e y, hi + vocal → /i/, x → /ks/, préstamos con grafías adaptadas.</li>
  <li><b>Silabeo y acento</b>: diptongos y hiatos según la tilde; acento léxico por reglas ortográficas; palabras funcionales sin marca; doble acento en -mente.</li>
  <li><b>Alofonía en el grupo fónico</b> (entre pausas): aproximantes [β ð ɣ], asimilación nasal, aspiración de /s/ ante consonante, sinalefa y enlace marcados con ‿.</li>
</ul>

<h3>Opciones</h3>
<table><thead><tr><th>Opción</th><th>Texto</th><th>Resultado</th></tr></thead><tbody>${optRows}</tbody></table>

<h2>2. Validación</h2>
<p>Las tablas de palabras de Coloma (2018) y fragmentos de su transcripción semiestrecha de «El viento norte y el sol» son pruebas automáticas (18 pruebas, todas superadas en la versión ${commit}). Las diferencias que quedan son de notación: Coloma traslada los segmentos resilabeados a la palabra siguiente y separa sílabas con ·; nosotros mantenemos los límites de palabra y marcamos el enlace con ‿.</p>
<table><thead><tr><th>Texto</th><th>Coloma (2018), semiestrecha</th><th>Este servicio</th></tr></thead><tbody>${colomaRows}</tbody></table>
<p>Comparación con el transcriptor de referencia (unalengua.com, «Spanish», es-US, consultado el ${DATE}). Su salida para estas palabras se tomó de una frase de prueba más larga; muestra rasgos castellanos y marca el acento antes de la vocal:</p>
<table><thead><tr><th>Texto</th><th>Referencia</th><th>Este servicio</th></tr></thead><tbody>${refRow}</tbody></table>

<h2 class="pagebreak">3. Decisiones adoptadas</h2>
<p>Registro completo de decisiones (D1–D57). Los números coinciden con docs/decisions.md del repositorio. Niveles de evidencia: ${chip('v')} comprobado en la fuente primaria; ${chip('s')} tomado de un resumen de una fuente no leída; ${chip('i')} razonamiento propio o fonética general; ${chip('n')} decisión de presentación; ${chip('o')} pendiente; ${chip('x')} reemplazado por una decisión posterior.</p>
${decisionsHtml}

<h2 class="pagebreak">4. Puntos discutibles: preguntas para la revisión</h2>
<p>Cada pregunta indica las decisiones a las que se refiere. Los ejemplos son la salida actual del servicio.</p>
${questionsHtml}

<h2>5. Fuentes consultadas</h2>
<p>Para cada fuente se indica qué se leyó realmente.</p>
<table><thead><tr><th>Clave</th><th>Referencia</th><th>Lectura</th></tr></thead><tbody>${sourcesHtml}</tbody></table>
<p>También se buscaron, sin resultado, estudios sobre la /d/ final en Buenos Aires y sobre la /s/ en codas dobles en el español rioplatense (búsqueda del ${DATE}). Agradeceremos cualquier referencia.</p>

<h2>6. Cómo enviar comentarios</h2>
<p>Basta con citar el número de la pregunta (P1–P13) o de la decisión (D1–D57). El servicio puede probarse en rioplatense.onegoodman.studio con cualquier texto; el botón «North Wind and Sun» carga el texto completo de Coloma (2018).</p>
</body>
</html>
`;

const htmlPath = new URL('revision-especializada.html', here);
writeFileSync(htmlPath, html);
const pdfPath = new URL('transcriptor-rioplatense-revision.pdf', here);
execFileSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files',
  `--print-to-pdf=${pdfPath.pathname}`, htmlPath.href,
], { stdio: 'pipe' });
console.log(pdfPath.pathname, readFileSync(pdfPath).length, 'bytes');
