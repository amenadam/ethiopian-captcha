import { AMHARIC_LETTERS } from "../constants/amharicLetters.js";
import { hashAnswer } from "../utils/hash.js";
import { captchaConfig } from "../config/config.js";

const getRandomLetter = () => {
  return AMHARIC_LETTERS[Math.floor(Math.random() * AMHARIC_LETTERS.length)];
};

const getRandomLetters = (count = 4) => {
  let last = "";
  let randomLetters = [];
  for (let i = 0; i < count; i++) {
    let letter;
    do {
      letter = getRandomLetter();
    } while (letter === last);

    last = letter;
    randomLetters.push(letter);
  }

  return randomLetters;
};

const generatedCaptchas = new Map();

export const generateCaptcha = (
  type = captchaConfig.type,
  count = captchaConfig.count
) => {
  if (type !== "fidel") {
    return { success: false, message: "Unsupported captcha type" };
  }

  const captcha = getRandomLetters(count);
  const captchaId = `ETH-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

  generatedCaptchas.set(captchaId, {
    answerHash: hashAnswer(captcha.join("")),
    generatedAt: Date.now(),
    attempts: 0,
  });

  return {
    success: true,
    type,
    captchaId,
    captcha,
  };
};

const CAPTCHA_TTL = captchaConfig.ttl;
const MAX_ATTEMPTS = captchaConfig.attempts;
export const validateCaptcha = (captchaId, userInput) => {
  const captcha = generatedCaptchas.get(captchaId);

  if (!captcha) {
    return { success: false, message: "Invalid Captcha ID" };
  }

  if (Date.now() - captcha.generatedAt > CAPTCHA_TTL) {
    generatedCaptchas.delete(captchaId);
    return { success: false, message: "Captcha expired" };
  }

  captcha.attempts++;
  if (captcha.attempts > MAX_ATTEMPTS) {
    generatedCaptchas.delete(captchaId);
    return { success: false, message: "Too many attempts" };
  }

  const inputHash = hashAnswer(userInput.trim());
  if (inputHash === captcha.answerHash) {
    generatedCaptchas.delete(captchaId);
    return { success: true };
  }

  return { success: false, message: "Incorrect captcha" };
};
