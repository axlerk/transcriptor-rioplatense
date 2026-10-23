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

# Design review (2026-10-23, second iteration)

Checked on the local build at desktop width (light) and 375 px (dark), and
on production before the fix.

| Finding | Severity | Fix |
|---|---|---|
| The word tooltip never hid: `.tip { display: grid }` overrode the browser's `[hidden] { display: none }`, so `tip.hidden = true` had no effect. Reproduced on production (hidden = true, computed display = grid). The speech bar had the same latent bug for devices with no Spanish voice. It went unnoticed in the Artifact preview, whose wrapper adds its own `[hidden]` rule | critical | Global `[hidden] { display: none !important }`. The tooltip also hides when the pointer leaves the output, on Escape, on a tap outside a word, and on every re-render. Verified: computed display none after moving away |
| Output footer: "Copy IPA" wrapped alone onto a second line on desktop; on a phone the speech controls took four rows | moderate | Copy moved to the output header next to the mode switch (it acts on the output); the speech bar is one row whose voice picker shrinks with an ellipsis |
| The "/s/ before a pause" option showed a "minority" pill in the colour of "secondary", mixing frequency with evidence | moderate | The pill shows the evidence level (verified, Terrell 1978); "minority variant" moved into the label |
| `--warn` on the page background was 4.49:1, under AA's 4.5:1 for small text | moderate | `#9a6200` → `#8a5800`: 5.32:1 on `--bg`, 5.88:1 on `--panel` |
| Buttons were 28–31 px tall: above WCAG 2.5.8's 24 px, small for fingers | minor | 40 px minimum under `pointer: coarse` |
| The no-voice note was two lines on most devices | minor | Shortened |
| Output words are not keyboard-focusable | known | Unchanged: the rule cards carry the same information |

Contrast after the change (WCAG relative luminance): body text 14.4–16.0:1;
muted text 5.1–5.6:1; pills 4.6–5.9:1 in light, 6.2–8.4:1 in dark. The tie
‿ (3.1:1 light) is a non-text graphic, where 3:1 applies.
