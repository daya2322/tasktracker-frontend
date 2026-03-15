"use client";

export default function Loading({ isFullPage = true }: { isFullPage?: boolean }) {
  return (
    <>
      <style>{`
        @keyframes loading-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes loading-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.97); }
          50%       { opacity: 1;   transform: scale(1.03); }
        }
        @keyframes loading-fade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        .loading-spin-outer {
          animation: loading-spin 1.2s linear infinite;
        }
        .loading-spin-inner {
          animation: loading-spin 0.8s linear infinite reverse;
        }
        .loading-logo {
          animation: loading-pulse 2s ease-in-out infinite;
        }
        .loading-text {
          animation: loading-fade 0.5s ease both 0.2s;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          height: isFullPage ? "100vh" : "100%",
          minHeight: isFullPage ? "100vh" : 200,
          background: "#060c18",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute",
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Spinner + Logo stack */}
        <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>

          {/* Outer ring */}
          <svg
            className="loading-spin-outer"
            width={100} height={100}
            viewBox="0 0 100 100"
            style={{ position: "absolute", inset: 0 }}
          >
            <circle
              cx={50} cy={50} r={44}
              fill="none"
              stroke="rgba(20,184,166,0.15)"
              strokeWidth={3}
            />
            <circle
              cx={50} cy={50} r={44}
              fill="none"
              stroke="#14b8a6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="60 216"
              style={{ filter: "drop-shadow(0 0 6px rgba(20,184,166,0.8))" }}
            />
          </svg>

          {/* Inner ring */}
          <svg
            className="loading-spin-inner"
            width={72} height={72}
            viewBox="0 0 72 72"
            style={{ position: "absolute" }}
          >
            <circle
              cx={36} cy={36} r={30}
              fill="none"
              stroke="rgba(99,102,241,0.15)"
              strokeWidth={2}
            />
            <circle
              cx={36} cy={36} r={30}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="30 158"
              style={{ filter: "drop-shadow(0 0 4px rgba(99,102,241,0.7))" }}
            />
          </svg>

          {/* Logo inside spinner */}
          <div className="loading-logo" style={{ zIndex: 1 }}>
            <img
              src="/logoWhite2.jpg"
              alt="WorkSphere"
              style={{
                height: 35,
                width: "auto",
                borderRadius: 8,
                mixBlendMode: "lighten",
                filter: "drop-shadow(0 0 8px rgba(20,184,166,0.5))",
              }}
            />
          </div>
        </div>

        {/* Brand name + loading text */}
        {/* <div className="loading-text" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            fontSize: 18, fontWeight: 800,
            color: "#f1f5f9", letterSpacing: "-0.2px",
            fontFamily: "'Sora', 'Segoe UI', sans-serif",
          }}>
            WorkSphere
          </div>
          <div style={{
            fontSize: 12, color: "#14b8a6",
            fontWeight: 600, letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "'Sora', 'Segoe UI', sans-serif",
          }}>
            Loading…
          </div>
        </div> */}

      </div>
    </>
  );
}