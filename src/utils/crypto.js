import { randomBytes, randomInt, createHmac, timingSafeEqual } from "node:crypto";

export const newId = (type) => `ETH-${type}-${randomBytes(18).toString("base64url")}`;
export const rand = (min, max) => min + (randomInt(0, 1_000_000) / 1_000_000) * (max - min);
export const pick = (arr) => arr[randomInt(0, arr.length)];
export const sign = (secret, id, answer) =>
  createHmac("sha256", secret).update(`${id}\n${answer}`).digest();
export const safeEqual = (a, b) => a.length === b.length && timingSafeEqual(a, b);
