import { hashAnswer } from "../utils/hash.js";
import { captchaConfig } from "../config/config.js";
import { getRandomLetters } from "../utils/getRandomLetters.js";
import { IMAGE_CAPTCHA_METADATA } from "../assets/metadatas/metaData.js";
import { IMAGES_API } from "../constants/imageAPI.js";

let imageAPI = IMAGES_API;

const generatedCaptchas = new Map();

const getRandomImageClickCaptcha = () => {
  let randomCaptcha =
    IMAGE_CAPTCHA_METADATA[
      Math.floor(Math.random() * IMAGE_CAPTCHA_METADATA.length)
    ];
  return randomCaptcha;
};

export const generateCaptcha = (
  type = captchaConfig.type,
  count = captchaConfig.count,
) => {
  if (type === "fidel") {
    const captcha = getRandomLetters(count);
    const captchaId = `ETH-fidel-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    generatedCaptchas.set(captchaId, {
      answerHash: hashAnswer(captcha.join("")),
      generatedAt: Date.now(),
      attempts: 0,
      type: "fidel",
    });

    return {
      success: true,
      type,
      captchaId,
      captcha,
    };
  }

  if (type === "click-image") {
    let captcha = getRandomImageClickCaptcha();
    const captchaId = `ETH-click-image-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    let image = imageAPI + captcha.image;
    generatedCaptchas.set(captchaId, {
      captcha,
      image,

      generatedAt: Date.now(),
      attempts: 0,
      type: "click-image",
    });
    return { success: true, type, captchaId, captcha: captcha.question, image };
  }

  return { success: false, message: "Unsupported captcha type" };
};

const CAPTCHA_TTL = captchaConfig.ttl;
const MAX_ATTEMPTS = captchaConfig.maxAttempts;
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
  if (captcha.attempts >= MAX_ATTEMPTS) {
    generatedCaptchas.delete(captchaId);
    return { success: false, message: "Too many attempts" };
  }

  if (captcha.type === "fidel") {
    const inputHash = hashAnswer(userInput.trim());
    if (inputHash === captcha.answerHash) {
      generatedCaptchas.delete(captchaId);
      return { success: true, message: "captcha correctly matched" };
    }

    return { success: false, message: "Incorrect captcha" };
  }

  if (captcha.type === "click-image") {
    if (captcha.captcha.answer.includes(userInput)) {
      return { success: true, message: "Correct Choice" };
    }

    return { success: false, message: "incorrect choice" };
  }

  return { success: false, message: "Incorrect captcha" };
};
