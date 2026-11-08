export const captchaConfig = {
  type: "fidel", // "fidel" | "geez-math" | "click-image"
  count: 4, // letters in a fidel captcha
  ttl: 2 * 60 * 1000,
  maxAttempts: 3,
  maxEntries: 10000, // memory store cap (protects against flooding)
  imageBaseUrl: "https://ethiopian-captcha.vercel.app/", // click-image sprites
};
