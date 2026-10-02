import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation for favicon / tab logo
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
        }}
      >
        {/* Modern Vector Briefcase / Sparkle Brand Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4" />
          <path d="m4.93 4.93 2.83 2.83" />
          <path d="M2 12h4" />
          <path d="m4.93 19.07 2.83-2.83" />
          <path d="M12 18v4" />
          <path d="m19.07 19.07-2.83-2.83" />
          <path d="M18 12h4" />
          <path d="m19.07 4.93-2.83 2.83" />
          <circle cx="12" cy="12" r="3" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
