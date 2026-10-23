import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transcribe } from '../src/transcriber.js';

const ipa = (text, opts) => transcribe(text, opts).text;

function table(name, cases, opts) {
  test(name, () => {
    for (const [input, expected] of cases) {
      assert.equal(ipa(input, opts), expected, `${input}`);
    }
  });
}

// Isolation forms from the phoneme and vowel tables of Coloma,
// "Argentine Spanish" (JIPA Illustrations of the IPA). Coloma writes
// stress as ' and [ɡ] as g; otherwise the forms are his.
table('Coloma consonant table', [
  ['pala', 'ˈpala'], ['bala', 'ˈbala'], ['pava', 'ˈpaβa'], ['mapa', 'ˈmapa'],
  ['fama', 'ˈfama'], ['tapa', 'ˈtapa'], ['dama', 'ˈdama'], ['nada', 'ˈnaða'],
  ['napa', 'ˈnapa'], ['manga', 'ˈmaŋɡa'], ['parra', 'ˈpara'], ['para', 'ˈpaɾa'],
  ['sala', 'ˈsala'], ['pasta', 'ˈpahta'], ['lata', 'ˈlata'], ['chapa', 'ˈtʃapa'],
  ['llama', 'ˈʃama'], ['ñata', 'ˈɲata'], ['cama', 'ˈkama'], ['garra', 'ˈɡara'],
  ['maga', 'ˈmaɣa'], ['jarra', 'ˈxara'],
]);

table('Coloma vowels, diphthongs and triphthongs', [
  ['aso', 'ˈaso'], ['eso', 'ˈeso'], ['hizo', 'ˈiso'], ['oso', 'ˈoso'], ['uso', 'ˈuso'],
  ['hielo', 'ˈjelo'], ['huevo', 'ˈweβo'], ['piano', 'ˈpjano'], ['quieto', 'ˈkjeto'],
  ['piojo', 'ˈpjoxo'], ['viuda', 'ˈbjuða'], ['cuatro', 'ˈkwatɾo'], ['cuero', 'ˈkweɾo'],
  ['fuimos', 'ˈfwimos'], ['cuota', 'ˈkwota'], ['baile', 'ˈbajle'], ['jaula', 'ˈxawla'],
  ['peine', 'ˈpejne'], ['neumático', 'newˈmatiko'], ['boina', 'ˈbojna'],
  ['estadounidense', 'ehtaðowniˈðense'], ['muy', 'ˈmuj'], ['hioides', 'ˈjojðes'],
  ['guau', 'ˈɡwaw'], ['buey', 'ˈbwej'],
]);

table('Coloma stress examples', [
  ['revolver', 'reβolˈβeɾ'], ['revólver', 'reˈβolβeɾ'], ['médico', 'ˈmeðiko'],
  ['medico', 'meˈðiko'], ['medicó', 'meðiˈko'], ['cantándomelo', 'kanˈtandomelo'],
  // Coloma: [inme'ðjata'mente], first stress perceived as secondary
  ['inmediatamente', 'inmeˌðjataˈmente'],
]);

table('Rioplatense palatals: sheísmo, hie- and loans', [
  ['lluvia', 'ˈʃuβja'], ['yuyo', 'ˈʃuʃo'], ['hierro', 'ˈjero'], ['yerro', 'ˈʃero'],
  ['haya', 'ˈaʃa'], ['shampoo', 'ʃamˈpu'], ['huraño', 'uˈɾaɲo'], ['uranio', 'uˈɾanjo'],
  ['extraño', 'eksˈtɾaɲo'], ['vida', 'ˈbiða'],
]);

table('Žeísmo option voices ll / y but not sh', [
  ['calle', 'ˈkaʒe'], ['yo', 'ˈʒo'], ['shampoo', 'ʃamˈpu'], ['show', 'ˈʃow'],
], { palatal: 'ʒ' });

table('Spelling rules', [
  ['ciudad', 'sjuˈðað'], ['zapato', 'saˈpato'], ['gente', 'ˈxente'], ['guerra', 'ˈɡera'],
  ['pingüino', 'piŋˈɡwino'], ['acción', 'akˈsjon'], ['taxi', 'ˈtaksi'], ['xilófono', 'siˈlofono'],
  ['México', 'ˈmexiko'], ['psicólogo', 'siˈkoloɣo'], ['honra', 'ˈonra'], ['alrededor', 'alreðeˈðoɾ'],
  ['subrayar', 'suβraˈʃaɾ'], ['atlántico', 'aˈtlantiko'], ['ahí', 'aˈi'], ['país', 'paˈis'],
  ['reír', 'reˈiɾ'], ['hoy', 'ˈoj'], ['estoy', 'ehˈtoj'], ['piscina', 'piˈsina'], ['kiwi', 'ˈkiwi'],
  ['rápidamente', 'ˌrapiðaˈmente'], ['lamente', 'laˈmente'], ['ancha', 'ˈaɲtʃa'], ['enfermo', 'eɱˈfeɾmo'],
]);

// Stretches of Coloma's semi-narrow transcription of "The North Wind and the Sun".
// Differences are only notational: we keep word boundaries and write
// resyllabification as ‿ instead of moving segments to the next word.
table('Coloma passage, connected speech', [
  ['El viento norte y el sol discutían sobre cuál de ellos era el más fuerte',
    'el ˈβjento ˈnoɾte j‿el ˈsol dihkuˈtian soβɾe ˈkwal de‿ˈeʃos‿ˈeɾa‿e̯l ˈmah ˈfweɾte'],
  ['cuando pasó un extraño viajero envuelto en una ancha capa',
    'kwando paˈso‿wn‿eksˈtɾaɲo βjaˈxeɾo̯‿emˈbwelto̯‿en‿ˈuna‿ˈaɲtʃa ˈkapa'],
  ['sopló con gran furia', 'soˈplo koŋ ˈɡɾaɱ ˈfuɾja'],
  ['más se agarraba', 'ˈma se̯‿aɣaˈraβa'],
  ['quien antes lograra obligar al viajero', 'kjen‿ˈanteh loˈɣɾaɾa‿o̯βliˈɣaɾ‿al βjaˈxeɾo'],
  ['brilló el sol con ardor', 'bɾiˈʃo̯‿el ˈsol kon‿aɾˈðoɾ'],
  ['el viajero se despojó de su capa', 'el βjaˈxeɾo se ðehpoˈxo ðe su ˈkapa'],
  ['la superioridad del sol', 'la supeɾjoɾiˈðað ðel ˈsol'],
]);

test('Coloma passage, broad transcription', () => {
  assert.equal(
    ipa('El viento norte y el sol discutían sobre cuál de ellos era el más fuerte', { mode: 'phonemic' }),
    'el ˈbiento ˈnoɾte i el ˈsol diskuˈtian sobɾe ˈkual de ˈeʃos ˈeɾa el ˈmas ˈfueɾte',
  );
});

table('/s/ before vowels, consonants, glides and pauses', [
  ['los otros', 'los‿ˈotɾos'], ['los perros', 'loh ˈperos'], ['los huevos', 'loh ˈweβos'],
  ['vamos.', 'ˈbamos.'], ['es así', 'ˈes‿aˈsi'],
]);

test('casual-speech options', () => {
  assert.equal(ipa('vamos.', { sPause: true }), 'ˈbamoh.');
  assert.equal(ipa('la verdad', { dFinal: true }), 'la βeɾˈða');
  assert.equal(ipa('la verdad es', { dFinal: true }), 'la βeɾˈðað‿ˈes');
  assert.equal(ipa('quiero comer', { rInfinitive: true }), 'ˈkjeɾo koˈme');
  assert.equal(ipa('el lugar', { rInfinitive: true }), 'el luˈɣaɾ');
  assert.equal(ipa('un año', { njMerger: true }), 'un‿ˈanjo');
});

test('display options', () => {
  assert.equal(ipa('estadounidense', { syllables: true }), 'eh.ta.ðow.niˈðen.se');
  assert.equal(ipa('los otros', { links: false }), 'los ˈotɾos');
  assert.equal(ipa('nada', { approximantDiacritic: true }), 'ˈnað̞a');
  assert.equal(ipa('baile', { fallingGlides: true }), 'ˈbai̯le');
  assert.equal(ipa('el sol', { monosyllableStress: false }), 'el sol');
  assert.equal(ipa('Hola, che. ¿Qué hacés?', { ipaPauses: true }), 'ˈola | ˈtʃe ‖ ˈke̯‿aˈses ‖');
});

test('numbers are spelled out', () => {
  assert.equal(ipa('tengo 2 perros'), 'ˈteŋɡo ˈðoh ˈperos');
  assert.equal(ipa('21'), 'bejnˈtjuno');
});

test('per-token rules are reported', () => {
  const r = transcribe('la calle está llena');
  const calle = r.tokens.find((t) => t.text === 'calle');
  assert.ok(calle.rules.includes('sheismo'));
  assert.ok(r.rules.s_aspiration >= 1);
});
