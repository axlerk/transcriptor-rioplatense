# Rioplatense phonology: the rules the transcriber implements

This file is the specification for `src/transcriber.js`. Every rule names its
source and how solid that source is, so a later reader can tell a measured
fact from a remembered one.

## Evidence levels

- **Verified (primary)**: read in this project's research session
  (2026-10-23) in the primary source itself.
- **Secondary**: read only in a secondary summary (Wikipedia and similar)
  that cites a primary source we have not read.
- **Recalled / inferred**: general Spanish phonetics from memory, or a
  decision made by reasoning. Treat with skepticism; these are the first
  candidates for correction.

## Sources

- **[C18]** Germán Coloma, "Argentine Spanish", *Illustrations of the IPA*,
  Journal of the International Phonetic Association. Read in full from the
  author's copy: <https://ucema.edu.ar/u/gcoloma/ArgentineSpanish.pdf>.
  Wikipedia cites it as Coloma (2018), pp. 244–246. It describes formal Buenos
  Aires Spanish of a 49-year-old educated male speaker and contains a broad
  and a semi-narrow transcription of "The North Wind and the Sun", which the
  test suite uses as a fixture.
- **[MICH]** Jim Michnowicz, "Sheísmo in Montevideo Spanish" (Benjamins,
  IHLL 29, ch. 7). Abstract only: the change to [ʃ] is complete for young
  Buenos Aires speakers; Montevideo is about a generation behind.
- **[MR23]** Marchini & Ramsammy, ICPhS 2023, word-final /s/ lenition in
  Buenos Aires and Southern Chilean Spanish. Abstract only.
- **[WP]** Wikipedia, "Rioplatense Spanish", Phonology section (secondary).
  Cites Coloma 2018, Lipski 1988, Fontanella de Weinberg 1974, Baistrocchi
  2020, Gilbert & Rohena-Madrazo 2021.
- **[MACK]** Ian Mackenzie, "Rioplatense Spanish",
  <https://www.staff.ncl.ac.uk/i.e.mackenzie/rioplat.htm> (secondary).

## How the reference tool differs

unalengua.com's "Transcriptor fonético" (Spanish, es-US) was checked on
2026-10-23 with a test sentence. Its output is eSpeak-NG style: the stress
mark goes before the vowel rather than before the syllable, and every
monosyllable is stressed (`mˈe`, `lˈa`). It also mixes in Castilian traits:
`Ciudad` came out as `θjuðˈad` and `ll` as `ʎ` (`ʎˈamo`). None of that is
Rioplatense.

## Phoneme inventory [C18, verified]

Consonants: /p b t d k ɡ tʃ m n ɲ ɾ r f s ʃ x l/. Allophones: [β ð ɣ ŋ h].
No /θ/ (seseo), no /ʎ/ (merged into /ʃ/). Vowels: /a e i o u/, with the
glides [j w] as allophones of /i u/. In synalepha, /e o/ also have the
nonsyllabic allophones [e̯ o̯].

## Grapheme → phoneme

| Spelling | Phoneme | Notes | Evidence |
|---|---|---|---|
| `ll`, `y` before a vowel | /ʃ/ | *llama* [ˈʃama], *yuyo* [ˈʃuʃo] | C18 verified |
| `hi` + vowel | /i/ → [j] | *hielo* [ˈjelo]; contrasts with `y`: *hierro* [ˈjero] vs *yerro* [ˈʃero] | C18 verified |
| `hu` + vowel | /u/ → [w] | *huevo* [ˈweβo] | C18 verified |
| `y` as a word, word-final or before a consonant | /i/ | *muy* [muj], *y el* [jel] | C18 verified |
| `sh` | /ʃ/ | loans: *shampoo* [ʃamˈpu]; stays [ʃ] even for [ʒ] speakers (Fontanella 1987 via C18) | C18 verified |
| `c` before e/i, `z`, `s` | /s/ | seseo | C18 verified |
| `j`, `g` before e/i | /x/ | never [h] in Buenos Aires | C18 verified |
| `x` | /ks/ | *extraño* [eksˈtɾaɲo]; word-initially /s/; *México, Texas, Oaxaca* /x/ | ks: C18; rest recalled |
| `r` word-initially, after n/l/s, `rr` | /r/ trill | *parra* [ˈpara] vs *para* [ˈpaɾa]; no assibilation (that is northern) | C18 verified |
| `h` | silent | except in `ch`, `sh` | general |
| `qu`, `gu` + e/i | /k/, /ɡ/ | `gü` = /ɡw/ | general |
| `ps-` word-initially | /s/ | *psicólogo* | recalled |

## Allophonic rules (phonetic mode)

1. **Spirantization** [C18 verified]. /b d ɡ/ are stops after a pause and
   after a nasal; /d/ is also a stop after /l/. Everywhere else, including
   across word boundaries, they are approximants, written [β ð ɣ] as in C18
   (*el viento* [el ˈβjento], *se despojó* [se ðehpoˈxo], *ardor*
   [aɾˈðoɾ]). An option adds the approximant diacritic: [β̞ ð̞ ɣ̞].
2. **/s/ aspiration** [C18 verified]. Before any consonant, word-internally
   and across words, /s/ → [h]: *pasta* [ˈpahta], *discutían* [dihkuˈtian],
   *más fuerte* [ˈmah ˈfweɾte]. Before a vowel, including the next word's,
   it stays [s] and resyllabifies (*ellos era* → C18 `'de·ʃo 'se·ɾa`).
   Before a pause it stays [s] in formal speech.
   - The /s/ in /ks/ is left as [s]: C18 writes *un extraño* `neks·'tɾa·ɲo`.
   - /s/ + /s/ → a single [s]: *más soplaba* → C18 `'ma·so 'pla·βa`.
   - Before a word-initial glide (*los huevos*) /s/ is treated as
     preconsonantal → [h]. **Inferred**, not checked.
3. **Nasal place assimilation**. /n/ → [m] before /p b/ (C18:
   *envuelto* `em 'bwel·to`, *convinieron* `kom·bi`), [ŋ] before
   /k ɡ x/ (C18: *manga* [ˈmaŋɡa], *con gran* `koŋ 'ɡran`), [ɲ] before /tʃ/
   (C18: *ancha* `'aɲ·tʃa`), [ɱ] before /f/ (C18 writes `m`; [ɱ] is the
   standard IPA value, recalled from general Spanish phonetics). /n/ before
   /m/ is left as [n], as C18 writes *inmediatamente* `ejn·me`.
4. **Palatal /ʃ/** [C18, MICH verified]. Default [ʃ], the norm for young
   Buenos Aires speakers. Option [ʒ]: traditional, older speakers, and more of
   Montevideo [MICH].
5. **Glides** [C18 verified]. Unstressed /i u/ next to another vowel become
   [j w]: *piano* [ˈpjano], *baile* [ˈbajle], *ciudad* [sjuˈðað],
   *fuimos* [ˈfwimos]. With two high vowels, the second is the nucleus,
   except that word-final `y` is always a glide (*muy* [muj]). A written
   accent keeps the hiatus (*día*, *país*, *discutían*). C18 writes [j w] on
   both sides of the nucleus; an option writes falling glides as [i̯ u̯].
6. **Synalepha** [C18 verified for the examples]. Across a word boundary
   with no pause, two vowels share a syllable. The less sonorous one
   (i, u < e, o < a; on a tie, the first) becomes nonsyllabic, regardless of
   stress. C18: *era el* `'se·ɾae̯ l`, *lograra obligar* `'ɣɾa·ɾao̯  βli`,
   *pasó un* `pa·'sow`, *brilló el* `βɾi·'ʃo̯ el`, *e inmediatamente*
   `ejn·me`. Identical vowels are only linked, not reduced. The conjunction
   *y* before a vowel becomes [j] and attaches to the next word (*y el*
   [jel]).
7. **Linking** [C18 verified]. A word-final consonant before a vowel-initial
   word resyllabifies (C18: *por fin el* `'fi·nel`). Rendered with the tie
   `‿` so word boundaries stay visible and clickable.

## Stress

- Written accent wins; otherwise words ending in a vowel, `n` or `s` are
  stressed on the penult, and everything else (including `-y`: *estoy*) on
  the last syllable. General Spanish orthography rules.
- The stress mark goes **before the syllable**, as in IPA and C18, not
  before the vowel as in eSpeak.
- Unstressed function words (articles, clitic pronouns, most prepositions
  and conjunctions, relative *que/quien/cual/cuando/donde/como*) get no
  mark. This follows C18's passage, which leaves *el, de, la, en, que, quien,
  se, su, con, por, lo, pero, sobre, cuando, un* unmarked. Content
  monosyllables are marked (C18: `'sol`, `'mas`, `'kwal`).
- `-mente` adverbs carry two stresses. C18 writes *inmediatamente*
  [inme'ðjata'mente] and says the first is perceived as secondary, so we
  write it as [ˌ].
- Not implemented: the stress shift onto enclitics (*decímelo* →
  *decimeló*), which C18 reports as "relatively common" in Argentina
  (Colantoni & Cuervo 2013).

## Casual-speech options (off by default)

| Option | Effect | Evidence |
|---|---|---|
| /s/ before a pause → [h] | *vamos.* [ˈbamoh] | Secondary: WP citing C18 and Lipski 1988 ("popular speech … before a consonant or pause") |
| Drop word-final /d/ | *verdad* [beɾˈða] | **Recalled**, general Latin American Spanish. Not verified for Buenos Aires. The search found -d- deletion data only for Spain and Caracas |
| Drop infinitive-final /ɾ/ | *comer* [koˈme] | Secondary: WP citing Baistrocchi 2020, Gilbert & Rohena-Madrazo 2021 |
| /ɲ/ → [nj] | *huraño* = *uranio* | C18 verified ("many young Argentinians") |

## Deliberately out of scope

- Intonation (the "long fall" and the falling yes/no questions of C18) has
  no segmental representation here.
- Northern and western Argentine features ([ʑ] for /r/, [ʎ], [ç], [ʝ]) do
  not apply to Río de la Plata.
- The emphatic [v] for `v` (C18) is not generated, since it is optional
  and speaker-dependent.
