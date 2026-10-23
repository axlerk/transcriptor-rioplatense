# Audit: security, speed, rendering (2026-10-23)

Measured on an Apple Silicon Mac, Node 25.8.1, Chromium-based browser pane.

## Technology choice

Vanilla JS (ES modules), no framework, no runtime or build dependencies.

- The engine is a pure function (`transcribe(text, options)`) shared by the
  page, the CLI and the tests. Nothing in it needs a framework.
- The UI is one form and one output region. Rebuilding the output from
  scratch on each change takes ~10 ms at the 5000-character limit, so a
  virtual DOM or reactive library would add bytes without saving time.
- No dependencies means no supply chain to audit and no lockfile to update.
  The build (`scripts/build.js`) is ~100 lines of Node built-ins.
- Hosting is a Cloudflare Worker with static assets only (no Worker code),
  so there is no server-side attack surface.

## Security

| Check | Result |
|---|---|
| User text reaches the DOM only through `textContent` / text nodes | Yes; no `innerHTML` anywhere |
| Stored state (`localStorage`) treated as untrusted | **Fixed.** `Object.assign(state.opts, saved.opts)` copied any key, including `__proto__`, and an invalid `mode` crashed `syncControls`. Now only known keys with valid values are copied |
| `?text=` length | **Fixed.** Capped at 5000 like the textarea |
| Third-party requests | **Fixed.** Fonts came from Google Fonts (IP address of every visitor sent to Google). Now self-hosted; the page makes no third-party requests |
| CSP | `default-src 'none'`; script and style allowed only by sha256 hash; `font-src 'self'`; `frame-ancestors 'none'`. `test/build.test.js` checks the hashes match the built page |
| Other headers | HSTS, `nosniff`, `Referrer-Policy: no-referrer`, COOP, CORP, Permissions-Policy denying camera, microphone, geolocation, payment, USB |
| Verified | Headers checked with `curl -I` against `wrangler dev`; page loaded under the CSP with no console violations and all 6 fonts loaded |

## Speed

| Metric | Before | After |
|---|---|---|
| Engine, 5000 chars, per keystroke (Node) | 4.7 ms for two transcriptions | one transcription; the second (for the tooltip) is computed only on hover |
| Full render in browser, 5000 chars (921 words), median / max | 16.0 / 31.0 ms | 10.6 / 21.4 ms |
| Renders for 5 keystrokes in one frame | 5 | 1 (requestAnimationFrame) |
| `localStorage` writes | every keystroke | 400 ms after typing stops |
| Requests on first load | HTML, CSS, 4 JS modules (a module waterfall), Google CSS + font files | HTML (CSS and JS inlined; 55 KB, 18 KB gzip) + 2 preloaded fonts, 4 more fonts as needed |
| Fonts | Google subsets (no combining marks, so a 2.5 KB extra face was embedded) | own subsets, 152 KB total for 6 faces, critical two 69 KB; hashed names cached for a year |

## Rendering

- The output is built in a `DocumentFragment` and swapped in once.
- `ˈ` (U+02C8) has line-break class BB, so the browser could break a word
  before its stress mark; word spans are `white-space: nowrap`.
- **Fixed:** the output had `aria-live="polite"`, so a screen reader would
  re-read the whole transcription on every keystroke. Now a labelled region.
- Checked at 375 px in dark mode: no horizontal scroll.

## Not done

- Words in the output are not keyboard-focusable, so the tooltip is
  mouse-only. The same information is in the rule cards.
- JS is not minified; gzip/brotli from Cloudflare makes the gain small.
