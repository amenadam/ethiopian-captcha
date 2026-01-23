import { useState } from "react";
import { DEBUGING_OPACITY } from "../constants/common";

export function ClickImage({
  captcha = {},
  captchaId,
  onVerify,
  onRefresh,
  loading = false,
}) {
  const [input, setInput] = useState(1000);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 6; // Relative to container
    const y = e.clientY - rect.top - 6;
    setIconPosition({ x, y });
  };

  const handleVerify = () => {
    onVerify({ captchaId, input });
    setIconPosition({ x: 0, y: 0 });
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        width: 260,
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          fontSize: 24,
          textAlign: "center",
          marginBottom: 12,
          userSelect: "none",
        }}
      >
        Click on <span style={{ fontWeight: "bold" }}>{captcha.captcha}</span>
      </div>

      <div
        style={{
          width: "15rem",
          position: "relative",
        }}
        onClick={handleClick}
      >
        <div
          style={{
            position: "absolute",
            background: "blue",
            border: "1px solid white",
            width: "15px",
            height: "15px",
            left: iconPosition.x,
            top: iconPosition.y,
            pointerEvents: "none",
            display: iconPosition.x == 0 || iconPosition.y == 0 ? "none" : "",
            borderRadius: "50%",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            opacity: DEBUGING_OPACITY,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            width: "100%",
            height: "100%",
            borderRadius: "0.5rem",
            margin: "0 auto",
          }}
        >
          <div
            onClick={() => setInput(0)}
            style={{
              background: `${input === 0 ? "#00000080" : ""}`,
              border: "1px solid #000",
            }}
          >
            0
          </div>
          <div
            onClick={() => setInput(1)}
            style={{
              background: `${input === 1 ? "#00000080" : ""}`,
              border: "1px solid #000",
            }}
          >
            1
          </div>
          <div
            onClick={() => setInput(2)}
            style={{ background: "", border: "1px solid #000" }}
          >
            2
          </div>
          <div
            onClick={() => setInput(3)}
            style={{ background: "", border: "1px solid #000" }}
          >
            3
          </div>
          <div
            onClick={() => setInput(4)}
            style={{ background: "", border: "1px solid #000" }}
          >
            4
          </div>
          <div
            onClick={() => setInput(5)}
            style={{ background: "", border: "1px solid #000" }}
          >
            5
          </div>
          <div
            onClick={() => setInput(6)}
            style={{ background: "", border: "1px solid #000" }}
          >
            6
          </div>
          <div
            onClick={() => setInput(7)}
            style={{ background: "", border: "1px solid #000" }}
          >
            7
          </div>
          <div
            onClick={() => setInput(8)}
            style={{ background: "", border: "1px solid #000" }}
          >
            8
          </div>
        </div>

        <img
          src={`${captcha.image}`}
          style={{ width: "100%", borderRadius: "0.5rem" }}
          alt="CAPTCHA"
        />
      </div>

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
