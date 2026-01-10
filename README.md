# EthiopianCaptcha 🇪🇹

A lightweight, secure, and extensible CAPTCHA library designed for Ethiopian languages (starting with Amharic Fidel).

EthiopianCaptcha provides:

- Server-side CAPTCHA generation & validation
- Secure hashed answers (no plaintext storage)
- TTL & attempt limiting
- Optional React UI component
- Zero external dependencies

---

## Features

- 🇪🇹 Amharic (Fidel) CAPTCHA support
- Hashed answers (security-first)
- Configurable expiration (TTL)
- Attempt limiting
- Optional React component

---

## Installation

```bash
npm install ethiopian-captcha
```

---

## Server-side Usage (Node.js)

```js
import { generateCaptcha, validateCaptcha } from "ethiopian-captcha";

// Generate captcha
const captchaData = generateCaptcha();

console.log(captchaData);
/*
{
  success: true,
  type: "fidel",
  captchaId: "ETH-...",
  captcha: ["ኩ", "ቴ", "ኃ", "ሀ"]
}
*/

// Validate captcha
const result = validateCaptcha(captchaData.captchaId, "ኩቴኃሀ");

if (result.success) {
  console.log("Captcha verified");
} else {
  console.log(result.message);
}
```

---

## React Component (Optional)

```jsx
import { EtCaptcha } from "ethiopian-captcha/react";

<EtCaptcha
  captcha={captcha}
  captchaId={captchaId}
  loading={loading}
  onRefresh={fetchNewCaptcha}
  onVerify={({ captchaId, input }) => {
    validateCaptcha({ captchaId, input });
  }}
/>;
```

The React component:

- Does NOT handle validation logic
- Does NOT make HTTP requests
- Is fully controlled by props

---

## Configuration

```js
export const captchaConfig = {
  type: "fidel",
  count: 4,
  ttl: 2 * 60 * 1000,
  attempts: 3,
};
```

---

## Security Notes

- Answers are stored as hashes
- Captchas auto-expire
- Entries are removed after success or failure
- In-memory storage (stateless & fast)

⚠️ For distributed systems, use Redis or a shared store.

---

## Roadmap

- Numeric CAPTCHA
- Mixed-type CAPTCHA
- Redis adapter
- TypeScript support
- Canvas-based CAPTCHA rendering

---

## License

MIT © EthiopianCaptcha
