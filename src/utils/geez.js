import { randomInt } from "node:crypto";
import { pick } from "./crypto.js";

/** 1..99 -> Ge'ez numerals (e.g. 25 -> ፳፭). */
export const toGeez = (n) => {
  const t = Math.floor(n / 10), o = n % 10;
  return (t ? String.fromCodePoint(0x1371 + t) : "") + (o ? String.fromCodePoint(0x1368 + o) : "");
};

/** Parses Arabic digits or Ge'ez numerals (up to 99). Returns NaN if invalid. */
export const parseNumber = (input) => {
  const s = String(input ?? "").normalize("NFKC").replace(/\s+/g, "");
  if (!s || s.length > 8) return NaN;
  if (/^\d+$/.test(s)) return Number(s);
  let total = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x1369 && c <= 0x1371) total += c - 0x1368;
    else if (c >= 0x1372 && c <= 0x137a) total += (c - 0x1371) * 10;
    else return NaN;
  }
  return total;
};

/** A small sum written in Ge'ez numerals; the answer is always 1..99. */
export const makeMathChallenge = () => {
  const op = pick(["+", "−", "×"]);
  let a, b, answer;
  if (op === "+") { a = randomInt(2, 50); b = randomInt(2, 50); answer = a + b; }
  else if (op === "−") { a = randomInt(10, 60); b = randomInt(2, a); answer = a - b; }
  else { a = randomInt(2, 10); b = randomInt(2, 10); answer = a * b; }
  return { tokens: [...toGeez(a), " ", op, " ", ...toGeez(b), " ", "="], answer };
};
