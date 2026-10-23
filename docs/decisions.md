# Decision log

Every academic decision behind the transcriber: what was decided, on what
source, how solid that source is, and when. Source keys ([C18], [T78] …)
point to the bibliography in [phonology.md](phonology.md#sources).

Evidence levels follow phonology.md:
- **verified**: checked in the primary source itself;
- **secondary**: taken from a summary of a source we have not read;
- **inferred**: our own reasoning or general Spanish phonetics from memory;
- **notation**: a presentation choice, not a claim about speech.

When a decision changes, add a new row that supersedes the old one (say
which) instead of editing the old row, so the history stays readable.

## Target variety and inventory

| # | Date | Decision | Source | Evidence |
|---|---|---|---|---|
| D1 | 2026-10-23 | Default target: formal, educated Buenos Aires speech as described in C18; casual features are opt-in | C18 | verified |
| D2 | 2026-10-23 | No /θ/ (seseo): z, ce, ci → /s/ | C18 | verified |
| D3 | 2026-10-23 | No /ʎ/: ll and y (before a vowel) → one phoneme /ʃ/ | C18 | verified |
| D4 | 2026-10-23 | Default realization of /ʃ/ is [ʃ]; [ʒ] is an option for older speakers and Montevideo | C18, MICH (abstract) | verified |
| D5 | 2026-10-23 | hi + vowel → glide [j], never [ʃ] (*hierro* [ˈjero] ≠ *yerro* [ˈʃero]); hu + vowel → [w] | C18 | verified |
| D6 | 2026-10-23 | Spelling sh → [ʃ] in both [ʃ] and [ʒ] modes | C18 citing Fontanella 1987 | verified |
| D7 | 2026-10-23 | /x/ is velar [x], never [h] | C18 | verified |
| D8 | 2026-10-23 | /r/ is a trill [r], not assibilated (assibilation is northern Argentine) | C18 | verified |
| D9 | 2026-10-23 | /tʃ/ stays [tʃ], never [ʃ] | C18 | verified |
| D10 | 2026-10-23 | x → /ks/; word-initial x → /s/; *México, Texas, Oaxaca, Ximena* → /x/ | C18 for /ks/; rest general Spanish | verified / inferred |
| D11 | 2026-10-23 | Word-initial ps → /s/ (*psicólogo*) | general Spanish | inferred |

## /s/

| # | Date | Decision | Source | Evidence |
|---|---|---|---|---|
| D12 | 2026-10-23 | /s/ → [h] before any consonant, word-internally and across words | C18; confirmed by T78 (80% internal, 69% final before C; Terrell's conclusion: [h] is the norm before a consonant) | verified |
| D13 | 2026-10-23 | /s/ before a vowel (also across words) and before a pause → [s] | C18; T78 ([s] 88% before V, 78% before pause) | verified |
| D14 | 2026-10-23 | The /s/ of /ks/ stays [s] (*extraño* [eksˈtɾaɲo]) | C18 `neks·'tɾa·ɲo` | verified |
| D15 | 2026-10-23 | /s/ + /s/ → one [s] (*más soplaba*) | C18 `'ma·so 'pla·βa` | verified |
| D16 | 2026-10-23 | /s/ before a word-initial glide (*los huevos*) → [h] | none | inferred |
| D17 | 2026-10-23 | /s/ in a two-consonant coda (*abstracto, instante, perspectiva*) gets the same [h] rule mechanically | none found; SIL (snippet) suggests reduction to /s/ instead; CC excluded these clusters | inferred, **open** |
| D18 | 2026-10-23 | Not modelled: deletion of word-final /s/ before a consonant (20% in T78) | T78 | verified, not implemented |

## Other consonants

| # | Date | Decision | Source | Evidence |
|---|---|---|---|---|
| D19 | 2026-10-23 | /b d ɡ/ are stops after a pause and after a nasal, /d/ also after /l/; approximants elsewhere, across word boundaries too | C18 | verified |
| D20 | 2026-10-23 | Approximants written [β ð ɣ] (C18's convention); [β̞ ð̞ ɣ̞] as an option | C18 | notation |
| D21 | 2026-10-23 | /n/ → [m] before /p b/, [ŋ] before /k ɡ x/, [ɲ] before /tʃ/ | C18 | verified |
| D22 | 2026-10-23 | /n/ → [ɱ] before /f/ (C18 writes [m]) | general Spanish phonetics | inferred |
| D23 | 2026-10-23 | /n/ before /m/ stays [n] (*inmediatamente*) | C18 `ejn·me` | verified |
| D24 | 2026-10-23 | /n/ before /ʃ/ stays [n] (*con llave*) | none | inferred |

## Vowels, glides, connected speech

| # | Date | Decision | Source | Evidence |
|---|---|---|---|---|
| D25 | 2026-10-23 | Unstressed i/u next to a vowel → [j w]; with two high vowels the second is the nucleus, except word-final y; a written accent keeps the hiatus | C18 examples; general Spanish orthography | verified |
| D26 | 2026-10-23 | Glides written [j w] on both sides of the nucleus; [i̯ u̯] after it as an option | C18 | notation |
| D27 | 2026-10-23 | Synalepha: the less sonorous vowel (i, u < e, o < a; first on a tie) becomes nonsyllabic, regardless of stress | C18 examples (*brilló el* `βɾi·'ʃo̯ el` has a stressed vowel made nonsyllabic) | verified |
| D28 | 2026-10-23 | Identical vowels across words are linked, not reduced | none | notation / inferred |
| D29 | 2026-10-23 | A stressed /i/ or /u/ is not made a glide in synalepha (*la uva* [la‿ˈuβa]) | none | inferred |
| D30 | 2026-10-23 | The conjunction *y* before a vowel → [j] and links only forward | C18 `'noɾ·te jel` | verified |
| D31 | 2026-10-23 | Resyllabification and synalepha are shown with the tie ‿ instead of moving segments between words, so words stay clickable | — | notation |
| D32 | 2026-10-23 | /ɲ/ stays [ɲ] by default; the merger with /nj/ of younger speakers is the option D43 | C18 | verified |

## Stress

| # | Date | Decision | Source | Evidence |
|---|---|---|---|---|
| D33 | 2026-10-23 | Stress mark before the syllable, not before the vowel | IPA practice; C18 | notation |
| D34 | 2026-10-23 | Content monosyllables are marked; unstressed function words are not | C18 passage | verified |
| D35 | 2026-10-23 | The function-word list beyond the words in C18's passage (articles, clitics, prepositions, conjunctions, relatives) | general Spanish (atonic word classes) | inferred |
| D36 | 2026-10-23 | *un* unmarked, *una* marked, as in C18's passage | C18 | verified |
| D37 | 2026-10-23 | A single word on its own gets citation stress even if it is a function word | C18 word table (*para* [ˈpaɾa]) | verified |
| D38 | 2026-10-23 | -mente adverbs: secondary stress on the adjective, primary on -men- | C18 (*inmediatamente*, first stress "perceived as secondary") | verified |
| D39 | 2026-10-23 | Not modelled: stress shift onto enclitics (*decímelo* → *decimeló*) | C18 citing Colantoni & Cuervo 2013 | verified, not implemented |

## Casual-speech options

| # | Date | Decision | Source | Evidence |
|---|---|---|---|---|
| D40 | 2026-10-23 | Option: /s/ before a pause → [h] | WP (secondary) | superseded by D44 |
| D41 | 2026-10-23 | Option: drop word-final /d/ | general Latin American Spanish | inferred; no Rioplatense source found (D45) |
| D42 | 2026-10-23 | Option: drop infinitive-final /ɾ/, with a list of non-verbs in -ar/-er/-ir | WP citing Baistrocchi 2020 and Gilbert & Rohena-Madrazo | secondary |
| D43 | 2026-10-23 | Option: /ɲ/ → [nj] | C18 | verified |
| D44 | 2026-10-23 | Re-graded D40: pre-pausal weakening is a minority variant among educated porteños (22%, split [h] 11% / deletion 11%) | T78 | verified; behaviour not yet changed |
| D45 | 2026-10-23 | Searched for Buenos Aires final /d/ data: none found. DCG11 is Caracas data; L94 (secondary) says BA resists intervocalic /d/ elision | DCG11, L94 | open |
| D46 | 2026-10-23 | Gilbert & Rohena-Madrazo located (2017, RLLT 12) but not read | GRM17 | open |

## Out of scope

| # | Date | Decision | Source | Evidence |
|---|---|---|---|---|
| D47 | 2026-10-23 | Intonation (long fall, falling yes/no questions) not represented | C18 | verified, out of scope |
| D48 | 2026-10-23 | Northern and western Argentine features ([ʑ] for /r/, [ʎ], [ç], [ʝ]) not applied | C18 | verified |
| D49 | 2026-10-23 | Emphatic [v] for spelling v not generated | C18 (optional, speaker-dependent) | verified |
