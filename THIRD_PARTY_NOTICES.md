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
