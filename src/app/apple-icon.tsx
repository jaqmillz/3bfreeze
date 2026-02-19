import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1e3a5f",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
        }}
      >
        {/* Snowflake */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
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
    ),
    { ...size }
  );
}
