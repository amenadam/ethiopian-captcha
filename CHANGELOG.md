# Changelog

## 2.0.0

**Breaking**
- `generateCaptcha` / `validateCaptcha` are now **async**.
- Fidel challenges no longer return the letters as text. They return `image` (an SVG data URI). The `captcha` array is gone.
- React: `EtCaptcha` takes a single `challenge` prop (the object from `generate`) and is a plain `.js` file (no JSX to transpile). `react` is an optional peer dependency. `ClickImage` is merged into `EtCaptcha`.
- Validation now allows exactly `maxAttempts` tries (v1 allowed one fewer). Results include a stable `code`.
- Node >= 18.

**New**
- `createCaptcha({ secret, store, ttl, maxAttempts, ... })` factory; default instance kept for the old function names.
- `geez-math` challenge: a small sum in Ge'ez numerals (፳፭ + ፲፪ =). Answer in Arabic digits or Ge'ez.
- Server-side distortion: glyphs baked to vector paths (rotated, skewed, warped, jittered) with noise curves, so the image has no text or repeatable path data. Build the glyphs with `npm run build:glyphs`.
- Pluggable store interface (Redis etc.); bounded, self-cleaning in-memory default.
- TypeScript types. Tests (`npm test`). LICENSE.

**Security fixes**
- Cryptographically random, unguessable captcha IDs (were `Date.now()` + `Math.random()`).
- Answers stored as HMAC-SHA256 with a secret and compared in constant time (was unsalted SHA-256).
- `click-image` was replayable after success and accepted any `includes()` match; now single-use with strict input checks.
- Attempt counter is race-safe; captchas are single-use; input length capped.
- Memory store was unbounded; now capped with TTL sweep.
