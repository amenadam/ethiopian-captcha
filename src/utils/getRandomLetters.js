import { AMHARIC_LETTERS } from "../constants/amharicLetters.js";
import { randomInt } from "node:crypto";

const POOL = [...new Set(AMHARIC_LETTERS)];

/** Random fidel, never repeating a letter within one captcha. */
export const getRandomLetters = (count = 4) => {
  const pool = [...POOL];
  const n = Math.min(Math.max(1, count | 0), pool.length);
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool.splice(randomInt(0, pool.length), 1)[0]);
  return out;
};
