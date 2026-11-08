import { randomBytes } from "node:crypto";
import { captchaConfig } from "../config/config.js";
import { MemoryStore } from "./memoryStore.js";
import { newId, sign, safeEqual } from "../utils/crypto.js";
import { getRandomLetters } from "../utils/getRandomLetters.js";
import { makeMathChallenge, parseNumber } from "../utils/geez.js";
import { renderCaptchaImage, hasOutlines } from "../render/svg.js";
import { IMAGE_CAPTCHA_METADATA } from "../assets/metadatas/metaData.js";
import { pick } from "../utils/crypto.js";

const TYPES = ["fidel", "geez-math", "click-image"];
const normText = (s) => String(s).normalize("NFC").replace(/\s+/g, "");
let warned = false;

export function createCaptcha(options = {}) {
  const defined = Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined));
  const cfg = { ...captchaConfig, ...defined };
  if (options.store && !options.secret) {
    throw new Error("ethiopian-captcha: `secret` is required when using a custom store.");
  }
  if (!warned && process.env.NODE_ENV === "production") {
    warned = true;
    if (!options.secret && !options.store) {
      console.warn("[ethiopian-captcha] In-memory store: single process only. Pass `store` + `secret` for multiple instances.");
    }
    if (!hasOutlines()) {
      console.warn("[ethiopian-captcha] Vector glyphs not built; images contain readable text. Run `npm run build:glyphs`.");
    }
  }
  const secret = options.secret ?? randomBytes(32);
  const store = options.store ?? new MemoryStore({ maxEntries: cfg.maxEntries });
  const fail = (code, message, extra) => ({ success: false, code, message, ...extra });

  async function generate(type = cfg.type, count = cfg.count) {
    if (!TYPES.includes(type)) return fail("UNSUPPORTED_TYPE", "Unsupported captcha type");
    const captchaId = newId(type);
    const expiresAt = Date.now() + cfg.ttl;
    const base = { type, attempts: 0, expiresAt };
    let record, out;

    if (type === "fidel") {
      const letters = getRandomLetters(count);
      record = { ...base, mac: sign(secret, captchaId, letters.join("")).toString("hex") };
      out = { image: renderCaptchaImage(letters), _answer: letters.join("") };
    } else if (type === "geez-math") {
      const { tokens, answer } = makeMathChallenge();
      record = { ...base, mac: sign(secret, captchaId, String(answer)).toString("hex") };
      out = { image: renderCaptchaImage(tokens), _answer: String(answer) };
    } else {
      const meta = pick(IMAGE_CAPTCHA_METADATA);
      record = { ...base, answer: [...meta.answer] };
      out = { image: new URL(meta.image, cfg.imageBaseUrl).href, question: meta.question, grid: 3, _answer: [...meta.answer] };
    }

    await store.set(captchaId, record, cfg.ttl);
    const res = { success: true, type, captchaId, expiresAt, ...out };
    if (process.env.NODE_ENV !== "test") delete res._answer; // test-only hook
    return res;
  }

  async function validate(captchaId, userInput) {
    if (typeof captchaId !== "string" || captchaId.length > 128) {
      return fail("INVALID_ID", "Invalid Captcha ID");
    }
    const rec = await store.get(captchaId);
    if (!rec || rec.used) return fail("INVALID_ID", "Invalid Captcha ID");
    if (Date.now() > rec.expiresAt) {
      await store.delete(captchaId);
      return fail("EXPIRED", "Captcha expired");
    }

    rec.attempts += 1; // synchronous with the read: parallel guesses can't dodge the counter
    let ok = false;
    if (rec.type === "click-image") {
      const isIdx = typeof userInput === "number" || (typeof userInput === "string" && /^\d$/.test(userInput));
      ok = isIdx && rec.answer.includes(Number(userInput));
    } else if (typeof userInput === "string" && userInput.length <= 64) {
      const given = rec.type === "geez-math" ? String(parseNumber(userInput)) : normText(userInput);
      ok = safeEqual(sign(secret, captchaId, given), Buffer.from(rec.mac, "hex"));
    }

    if (ok) {
      rec.used = true;
      await store.delete(captchaId);
      return { success: true, code: "OK", message: "Captcha correctly matched" };
    }
    if (rec.attempts >= cfg.maxAttempts) {
      rec.used = true;
      await store.delete(captchaId);
      return fail("TOO_MANY_ATTEMPTS", "Too many attempts");
    }
    await store.set(captchaId, rec, Math.max(1, rec.expiresAt - Date.now()));
    return fail("INCORRECT", "Incorrect captcha", { attemptsLeft: cfg.maxAttempts - rec.attempts });
  }

  return { generate, validate, close: () => store.close?.() };
}

let shared;
const getShared = () => (shared ??= createCaptcha());
export const generateCaptcha = (...args) => getShared().generate(...args);
export const validateCaptcha = (...args) => getShared().validate(...args);
