import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "3Bfreeze — Freeze Your Credit at All Three Bureaus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #17153B 0%, #2E236C 50%, #433D8B 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Snowflake icon */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            marginBottom: 24,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C8ACD6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="20" y1="16" x2="4" y2="8" />
            <line x1="20" y1="8" x2="4" y2="16" />
            <line x1="4" y1="4" x2="8" y2="8" />
            <line x1="16" y1="16" x2="20" y2="20" />
            <line x1="4" y1="20" x2="8" y2="16" />
            <line x1="16" y1="8" x2="20" y2="4" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 16,
            letterSpacing: "-2px",
          }}
        >
          3Bfreeze
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#C8ACD6",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Freeze your credit at all three bureaus. Free by law.
        </div>

        {/* Bureau names */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>Equifax</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
          <span>TransUnion</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
          <span>Experian</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
