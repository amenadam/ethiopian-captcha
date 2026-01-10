import { useState } from "react";

export function EtCaptcha({
  captcha = [],
  captchaId,
  onVerify,
  onRefresh,
  loading = false,
}) {
  const [input, setInput] = useState("");

  const handleVerify = () => {
    if (!input.trim()) return;

    onVerify({
      captchaId,
      input: input.trim(),
    });
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        width: 260,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 24,
          letterSpacing: 8,
          textAlign: "center",
          marginBottom: 12,
          userSelect: "none",
        }}
      >
        {captcha.join(" ")}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type the letters"
        disabled={loading}
        style={{
          width: "100%",
          padding: 8,
          fontSize: 14,
          marginBottom: 10,
        }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleVerify} disabled={loading} style={{ flex: 1 }}>
          Verify
        </button>

        <button onClick={onRefresh} disabled={loading}>
          ↻
        </button>
      </div>
    </div>
  );
}
