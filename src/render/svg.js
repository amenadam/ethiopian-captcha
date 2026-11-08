import { rand, pick } from "../utils/crypto.js";
import { GLYPHS } from "./glyphs.js";

const FONT = "'Noto Sans Ethiopic','Abyssinica SIL',Nyala,Kefa,Ebrima,sans-serif";
const INKS = ["#1b3a57", "#7a1f1f", "#14532d", "#4a2c6d", "#5b3a00", "#0f4c5c"];
const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const n1 = (v) => Math.round(v * 10) / 10;

// Math symbols are drawn here so no font is needed for them (1000-unit em, y down, baseline 0).
const R = (x1, y1, x2, y2) => `M${x1} ${y1}L${x2} ${y1}L${x2} ${y2}L${x1} ${y2}Z`;
const SYMBOLS = {
  "+": { w: 700, d: R(100, -375, 600, -285) + R(305, -580, 395, -80) },
  "−": { w: 700, d: R(100, -375, 600, -285) },
  "×": { w: 700, d: "M120 -490L170 -540L580 -170L530 -120ZM580 -490L530 -540L120 -170L170 -120Z" },
  "=": { w: 700, d: R(100, -440, 600, -360) + R(100, -300, 600, -220) },
};

const cache = new Map();
const parse = (key, d) => {
  if (!cache.has(key)) {
    const segs = [];
    const argc = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };
    for (const m of d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)) {
      const a = m[2].trim() ? m[2].trim().split(/[\s,]+/).map(Number) : [];
      if (a.length === argc[m[1]]) segs.push([m[1], a]);
    }
    cache.set(key, segs);
  }
  return cache.get(key);
};

const getGlyph = (c) => SYMBOLS[c] ?? GLYPHS?.glyphs?.[c];
export const hasOutlines = () => !!GLYPHS;

/**
 * Renders chars to an SVG data URI. With outlines, glyphs become vector paths
 * whose points are rotated, skewed, warped and jittered server-side, so the
 * markup contains no text and no repeatable path data.
 */
export function renderCaptchaImage(chars, { height = 90 } = {}) {
  const outline = chars.every((c) => c === " " || getGlyph(c));
  const widths = chars.map((c) => (c === " " ? 16 : 46));
  const pad = 20;
  const width = Math.round(pad * 2 + widths.reduce((a, b) => a + b, 0));
  const upm = GLYPHS?.upm ?? 1000;
  const A = rand(1.0, 1.7), lam = rand(16, 24), ph1 = rand(0, 6.28), ph2 = rand(0, 6.28);
  const glyphs = [];
  let x = pad;

  chars.forEach((c, i) => {
    const cx0 = x + widths[i] / 2 + rand(-3, 3);
    x += widths[i];
    if (c === " ") return;
    const size = rand(40, 50), ink = pick(INKS);
    const cy = height / 2 + size * 0.34 + rand(-7, 7);
    const rot = (rand(-18, 18) * Math.PI) / 180, skew = Math.tan((rand(-14, 14) * Math.PI) / 180);
    if (!outline) {
      glyphs.push(`<text transform="translate(${n1(cx0)} ${n1(cy)}) rotate(${n1((rot * 180) / Math.PI)})" text-anchor="middle" font-family="${FONT}" font-size="${n1(size)}" fill="${ink}">${esc(c)}</text>`);
      return;
    }
    const g = getGlyph(c), k = size / upm, cos = Math.cos(rot), sin = Math.sin(rot);
    const tp = (px, py) => {
      let gx = (px - g.w / 2) * k, gy = py * k;
      gx += skew * gy;
      let X = gx * cos - gy * sin + cx0, Y = gx * sin + gy * cos + cy;
      X += A * Math.sin(Y / lam + ph1) + rand(-0.3, 0.3);
      Y += A * Math.sin(X / lam + ph2) + rand(-0.3, 0.3);
      return `${n1(X)} ${n1(Y)}`;
    };
    const d = parse(c, g.d).map(([cmd, a]) => {
      const pts = [];
      for (let j = 0; j < a.length; j += 2) pts.push(tp(a[j], a[j + 1]));
      return cmd + pts.join(" ");
    }).join("");
    glyphs.push(`<path d="${d}" fill="${ink}"/>`);
  });

  const noise = [];
  for (let i = 0; i < 4; i++) {
    const y = () => n1(rand(8, height - 8));
    noise.push(`<path d="M-5 ${y()}C${n1(width * 0.3)} ${y()} ${n1(width * 0.6)} ${y()} ${width + 5} ${y()}" stroke="${pick(INKS)}" stroke-width="${n1(rand(1.2, 2.0))}" fill="none" opacity=".75"/>`);
  }
  for (let i = 0; i < 40; i++) {
    noise.push(`<circle cx="${n1(rand(0, width))}" cy="${n1(rand(0, height))}" r="${n1(rand(0.6, 1.8))}" fill="${pick(INKS)}" opacity=".5"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="hsl(${Math.round(rand(0, 360))},30%,94%)"/>${glyphs.join("")}${noise.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
