# EthiopianCaptcha 🇪🇹 v2

A CAPTCHA built for Ethiopian users: **Amharic fidel** and **Ge'ez-numeral math**, rendered server-side as distorted vector images. Zero runtime dependencies. Node >= 18.

| type | what the user does |
|---|---|
| `fidel` | types the Amharic letters shown (default) |
| `geez-math` | solves a small sum written in Ge'ez numerals, e.g. ፳፭ + ፲፪ = (answers in `37` or `፴፯`) |
| `click-image` | clicks the grid cell showing an Ethiopian item (lightweight, see notes) |

## Install

```bash
npm install ethiopian-captcha
```

## Server (Express example)

```js
import express from "express";
import { createCaptcha } from "ethiopian-captcha";

const captcha = createCaptcha({ secret: process.env.CAPTCHA_SECRET });
const app = express();
app.use(express.json());

app.get("/captcha", async (req, res) => {
  res.json(await captcha.generate(req.query.type)); // { captchaId, image, type, expiresAt }
});

app.post("/signup", async (req, res) => {
  const r = await captcha.validate(req.body.captchaId, req.body.captchaInput);
  if (!r.success) return res.status(400).json(r); // { code, message, attemptsLeft? }
  // ...continue
});
```

Result codes: `OK`, `INVALID_ID`, `EXPIRED`, `INCORRECT`, `TOO_MANY_ATTEMPTS`, `UNSUPPORTED_TYPE`.
A captcha is single-use: success, expiry, or the last failed attempt all consume it.

## React

```jsx
import { EtCaptcha } from "ethiopian-captcha/react";

<EtCaptcha
  challenge={challenge}            // response of /captcha
  loading={loading}
  onRefresh={fetchChallenge}
  onVerify={({ captchaId, input }) => submit(captchaId, input)}
  lang="both"                      // "both" | "en" | "am"
/>
```

The component makes no network calls. Strings are English + Amharic; have a native speaker review the Amharic labels before launch.

## Production setup (read this)

1. **Build the vector glyphs** (one time, needs `pip install fonttools`):
   ```bash
   npm run build:glyphs -- /path/to/NotoSansEthiopic-Bold.ttf
   ```
   Use an OFL font (Noto Sans Ethiopic, Abyssinica SIL) and commit the generated `src/render/glyphs.js`. Without it the library falls back to SVG `<text>`, which works but is readable by a script without any OCR (a warning is logged when `NODE_ENV=production`).
2. **Set a `secret`** (32+ random bytes) in env.
3. **Multiple servers / serverless:** pass a shared `store` (anything with `get/set/delete`, e.g. Redis with TTL) and the same `secret` on every instance. The default store is in-process only. With a networked store, make attempt counting atomic if you can.
4. **Serve the image via `<img>`**, never inline the SVG in the DOM.
5. **Rate-limit `/captcha` and the validate route** by IP; that is outside this library.

## Options

```js
createCaptcha({
  type: "fidel", count: 4, ttl: 120000, maxAttempts: 3,
  maxEntries: 10000, imageBaseUrl: "https://ethiopian-captcha.vercel.app/",
  secret, store,
});
```

## Honest limits

- No CAPTCHA stops a determined attacker with a trained model or a solving service; this raises the cost and blocks casual bots. Pair with rate limiting.
- `click-image` uses one public sprite sheet whose answers ship in the npm package, so it is a lightweight challenge only. Prefer `fidel` or `geez-math` for anything sensitive.
- Typing fidel needs an Amharic keyboard. For mobile/Latin-keyboard users, `geez-math` (digits accepted) is the friendlier option.

## Upgrading from 1.x

See [CHANGELOG.md](CHANGELOG.md): functions are async, fidel returns `image` instead of letters, React prop is now `challenge`.

MIT
