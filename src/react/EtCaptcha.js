// No JSX on purpose: works in any bundler without transpiling node_modules.
import { createElement as h, useEffect, useState } from "react";

const L = {
  fidel: ["Type the letters you see", "ያዩትን ፊደላት ይጻፉ"],
  "geez-math": ["Solve the sum (Ge'ez numerals)", "ሒሳቡን ይፍቱ"],
  "click-image": ["Select", "ይምረጡ"],
  verify: ["Verify", "አረጋግጥ"],
  refresh: ["New captcha", "አድስ"],
};
const t = (k, lang) => (lang === "en" ? L[k][0] : lang === "am" ? L[k][1] : `${L[k][0]} / ${L[k][1]}`);

export function EtCaptcha({ challenge, onVerify, onRefresh, loading = false, lang = "both", style }) {
  const [input, setInput] = useState("");
  const id = challenge?.captchaId;
  useEffect(() => setInput(""), [id]);
  if (!challenge) return null;

  const click = challenge.type === "click-image";
  const ready = input !== "" && !loading;
  const submit = (e) => {
    e.preventDefault();
    if (ready) onVerify({ captchaId: id, input: click ? input : String(input).trim() });
  };

  const cells = click
    ? Array.from({ length: 9 }, (_, i) =>
        h("button", {
          key: i, type: "button", "aria-label": `Cell ${i + 1}`, "aria-pressed": input === i,
          onClick: () => setInput(i), disabled: loading,
          style: { background: input === i ? "rgba(0,80,200,.35)" : "transparent", border: "1px solid rgba(0,0,0,.15)", cursor: "pointer", padding: 0 },
        }))
    : null;

  return h("form", {
    onSubmit: submit,
    style: { border: "1px solid #ddd", borderRadius: 8, padding: 16, width: 280, fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 10, ...style },
  },
    h("div", { style: { fontSize: 14, textAlign: "center" } },
      t(challenge.type, lang), click ? h("b", null, ` ${challenge.question}`) : null),
    h("div", { style: { position: "relative", userSelect: "none" } },
      h("img", { src: challenge.image, alt: "Captcha", draggable: false, style: { width: "100%", display: "block", borderRadius: 6 } }),
      click ? h("div", { style: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "repeat(3,1fr)" } }, cells) : null),
    click ? null : h("input", {
      type: "text", value: input, disabled: loading, autoComplete: "off", autoCapitalize: "off", spellCheck: false,
      inputMode: challenge.type === "geez-math" ? "numeric" : "text", lang: challenge.type === "fidel" ? "am" : undefined,
      onChange: (e) => setInput(e.target.value), "aria-label": t(challenge.type, lang),
      style: { padding: 8, fontSize: 16 },
    }),
    h("div", { style: { display: "flex", gap: 8 } },
      h("button", { type: "submit", disabled: !ready, style: { flex: 1, padding: 8 } }, t("verify", lang)),
      h("button", { type: "button", onClick: onRefresh, disabled: loading, "aria-label": t("refresh", lang), title: t("refresh", lang), style: { padding: 8 } }, "↻")));
}
