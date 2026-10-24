# Third-party notices

## Fonts (fonts/)

Subsets of Charis SIL and IBM Plex built by `scripts/subset-fonts.py` from
the google/fonts repository. The SIL Open Font License does not allow a
modified font (a subset counts as one) to keep a Reserved Font Name, so
the subsets are renamed:

| File | Source | Family name here |
|---|---|---|
| `rio-serif-400.woff2`, `rio-serif-400i.woff2`, `rio-serif-700.woff2` | Charis SIL Regular, Italic, Bold. Copyright (c) 1997-2022 SIL International, Reserved Font Names "Charis" and "SIL" | Rio IPA Serif |
| `rio-sans-400.woff2`, `rio-sans-600.woff2` | IBM Plex Sans (variable, instanced at wght 400 and 600). Copyright © 2017 IBM Corp., Reserved Font Name "Plex" | Rio UI Sans |
| `rio-mono-500.woff2` | IBM Plex Mono Medium. Copyright © 2017 IBM Corp., Reserved Font Name "Plex" | Rio UI Mono |

Both are licensed under the SIL Open Font License 1.1; the full texts are
`fonts/OFL-CharisSIL.txt` and `fonts/OFL-IBMPlex.txt`.

## Piper text-to-speech (vendor/, downloaded at build time)

Fetched by `scripts/fetch-vendor.mjs` with pinned sha256 hashes and served
from this site; not stored in git.

| Component | Version | Licence | Source |
|---|---|---|---|
| ONNX Runtime Web (`ort.wasm.min.js`, `ort-wasm-simd-threaded.*`) | 1.20.1 | MIT | <https://github.com/microsoft/onnxruntime> |
| piper-wasm (`piper_phonemize.js`, `.wasm`, `.data`) | 1.0.0 | MIT (package) | <https://www.npmjs.com/package/@diffusionstudio/piper-wasm> |
| — contains piper-phonemize | — | MIT | <https://github.com/rhasspy/piper-phonemize> |
| — contains eSpeak NG and its language data | — | **GPL-3.0-or-later** | <https://github.com/espeak-ng/espeak-ng> |

The eSpeak NG part is distributed here unmodified, as a separate program the
page talks to; its source code is available at the eSpeak NG repository above.

## Piper voice "Daniela" (es_AR, high)

The model is not redistributed: the browser downloads it from Hugging Face
(`rhasspy/piper-voices`, commit `5041a7a`), and its sha256 is checked.

- Model card: trained on OpenSLR 61, "Crowdsourced high-quality Argentinian
  Spanish speech data set" (Google), licensed **CC BY-SA 4.0**; trained by
  larcanio, fine-tuned from the U.S. English "lessac" voice. The licence of
  the lessac base model was not checked.
