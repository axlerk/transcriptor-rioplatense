# Transcriptor fonético rioplatense

Live: <https://rioplatense.onegoodman.studio>

Spanish text to IPA as spoken in the Río de la Plata region (Buenos Aires,
Montevideo). It works like the unalengua.com *transcriptor fonético* but
models Rioplatense instead of a generic Spanish:

- `ll` / `y` → [ʃ] (sheísmo) or [ʒ] (žeísmo), while `hi`+vowel stays [j]:
  *hierro* [ˈjero] ≠ *yerro* [ˈʃero]
- /s/ → [h] before consonants, also across words: *más fuerte* [ˈmah ˈfweɾte]
- seseo, velar [x] (never [h]), trilled [r] without assibilation
- spirantization, nasal assimilation, synalepha and linking in connected
  speech: *de ellos era el* [de‿ˈeʃos‿ˈeɾa‿e̯l]
- optional casual-speech rules, each marked with how well it is attested

Every rule, its source and its evidence level are in
[docs/phonology.md](docs/phonology.md). The main source is Coloma's
*Argentine Spanish* Illustration of the IPA. Its word tables and its narrow
transcription of "The North Wind and the Sun" are the test fixtures.

## Use

No dependencies; needs Node 20+ for the tests and CLI.

```bash
npm start            # serves the web page on http://127.0.0.1:8765
npm test             # node --test
npm run build        # dist/site (production) and dist/artifact.html
npm run deploy       # tests, build, wrangler deploy
```

The CLI reads text from its arguments or from stdin:

```bash
node bin/transcribe.js "Che, ¿vos sabés dónde queda la calle Florida?"
# ˈtʃe, ¿ˈbo saˈβeh ˈðonde ˈkeða la ˈkaʃe floˈɾiða?
```

Flags: `--phonemic`, `--zh` (žeísmo), `--syllables`, `--casual` (all casual-speech rules), `--nj` (ñ → nj).

As a library:

```js
import { transcribe } from './src/transcriber.js';
transcribe('la calle', { palatal: 'ʒ' }).text; // 'la ˈkaʒe'
```

## Deployment

A Cloudflare Worker with static assets only (`wrangler.toml`), served on
`rioplatense.onegoodman.studio`. A push to `main` deploys: Cloudflare
Workers Builds runs `npm run build:ci` (tests, then build) and
`npx wrangler deploy`. A failing test stops the build, and production keeps
the previous version. `npm run deploy` does the same by hand.

The trigger (branch `main` only, so no preview builds; build cache off)
was created on 2026-10-23 through the Workers Builds API with the token in
the Keychain item `cloudflare-workers-ci`. A manual build that day cloned
the repo, passed 15/15 tests, built and deployed (version `49e89b3e`).

Security headers (hash-based CSP, HSTS and others) are generated into
`dist/site/_headers`. Why vanilla JS, and what the audit measured:
[docs/audit.md](docs/audit.md).

## Limits

- Stress comes from spelling rules. Loanwords spelled without Spanish
  accents (*shampoo*, *México*) need an entry in `RESPELL`.
- The Argentine stress shift onto enclitics (*decímelo* → *decimeló*) is
  not modelled.
- Intonation is not represented.
- The audio uses the device's speech voices. Few devices ship an Argentine
  voice, so the page says which accent you are hearing.
