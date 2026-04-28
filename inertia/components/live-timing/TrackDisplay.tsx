import { useEffect, useRef } from "react";
import "../css/live-timing.css";

interface PositionMarker {
  id: number;
  x: number;
  y: number;
  driver: string;
  color: string;
}

interface TrackDisplayProps {
  circuitPath: string;
}

const POSITION_MARKERS: PositionMarker[] = [
  { id: 1, x: 52,  y: 38,  driver: "M. Vaxiviere", color: "#e8352a" },
  { id: 2, x: 78,  y: 28,  driver: "A. Pier Guidi", color: "#fbbf24" },
  { id: 3, x: 64,  y: 70,  driver: "K. Estre",      color: "#60a5fa" },
  { id: 4, x: 22,  y: 58,  driver: "T. Bamber",     color: "#34d399" },
  { id: 5, x: 38,  y: 22,  driver: "N. Jani",       color: "#a78bfa" },
];



export default function TrackDisplay({ circuitPath }: TrackDisplayProps) {
  const glowRef = useRef(null);

  // Subtle ambient pulse on the glow
  useEffect(() => {
    let raf: number;
    let t = 0;
    const animate = () => {
      t += 0.018;
      if (glowRef.current) {
        const opacity = 0.28 + Math.sin(t) * 0.07;
        (glowRef.current as HTMLDivElement).style.opacity = String(opacity);
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="lt-glass"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "16px",
        height: "100%",
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* ── Ambient radial glow behind circuit ── */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 55% at 52% 50%, rgba(232,53,42,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          transition: "opacity 0.1s",
        }}
      />

      {/* ── Header row ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Mini sector times */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            minWidth: 170,
          }}
        >
          <span
            style={{
              fontFamily: "var(--lt-font-display)",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--lt-muted)",
              marginBottom: 2,
            }}
          >
            Mini Sector Times
          </span>
          {[
            { s: "Sector 1", t: "0:00.33" },
            { s: "Sector 2", t: "0:05.34" },
            { s: "Sector 3", t: "0:37.25" },
            { s: "Sector 4", t: "0:15.57" },
          ].map((row) => (
            <div key={row.s} className="lt-mini-sector">
              <span
                style={{
                  fontFamily: "var(--lt-font-display)",
                  fontSize: "0.78rem",
                  color: "var(--lt-muted)",
                  fontWeight: 500,
                  minWidth: 64,
                }}
              >
                {row.s}
              </span>
              <span
                style={{
                  fontFamily: "var(--lt-font-mono)",
                  fontSize: "0.78rem",
                  color: "var(--lt-white)",
                  fontWeight: 600,
                }}
              >
                {row.t}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SVG Circuit ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 520 200"
          className="lt-track-svg"
          style={{ width: "100%", maxWidth: 520, height: "auto" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D-depth gradient for the track stroke */}
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#ff4433" />
              <stop offset="40%"  stopColor="#e8352a" />
              <stop offset="80%"  stopColor="#c0281f" />
              <stop offset="100%" stopColor="#ff4433" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="6"   result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Shadow beneath track (3D floor effect) */}
            <filter id="trackShadow">
              <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* ── Shadow layer (depth illusion) ── */}
          <path
            d={circuitPath}
            fill="rgba(0,0,0,0.35)"
            transform="translate(3,5)"
          />

          {/* ── Main track path ── */}
          <path
            id="circuit"
            d={circuitPath}
            fill="none"
            stroke="url(#trackGrad)"
            strokeWidth="8"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* ── Inner border line (3D kerb effect) ── */}
          <path
            d={circuitPath}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeDasharray="4,8"
          />

          {/* ── Start/Finish line ── */}
          <line
            x1="120" y1="155"
            x2="140" y2="165"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <text x="128" y="148" fill="#9ca3af" fontSize="8" fontFamily="var(--lt-font-mono)" textAnchor="middle">S/F</text>

          {/* ── Speed trap markers ── */}
          {[
            { label: "36",  x: 76,  y: 74  },
            { label: "50",  x: 240, y: 22  },
            { label: "50",  x: 470, y: 90  },
            { label: "92",  x: 268, y: 176 },
            { label: "-36", x: 38,  y: 118 },
          ].map((m) => (
            <g key={`${m.label}-${m.x}`}>
              <rect
                x={m.x - 12} y={m.y - 8}
                width={26} height={14}
                rx={3}
                fill="rgba(0,0,0,0.55)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.7}
              />
              <text
                x={m.x + 1} y={m.y + 2}
                fill="#9ca3af"
                fontSize={7}
                fontFamily="var(--lt-font-mono)"
                textAnchor="middle"
              >
                {m.label}
              </text>
            </g>
          ))}

          {/* ── Animated position markers ── */}
          {POSITION_MARKERS.map((m, i) => (
            <g key={m.id}>
              {/* Outer glow ring */}
              <circle
                cx={m.x * 5.2}
                cy={m.y * 2}
                r={7}
                fill="none"
                stroke={m.color}
                strokeWidth={1.2}
                opacity={0.4}
              >
                <animate
                  attributeName="r"
                  values="6;10;6"
                  dur={`${2.2 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0;0.4"
                  dur={`${2.2 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Core dot */}
              <circle
                cx={m.x * 5.2}
                cy={m.y * 2}
                r={4}
                fill={m.color}
                filter="url(#neonGlow)"
              />
              {/* Driver label */}
              <text
                x={m.x * 5.2 + 7}
                y={m.y * 2 + 3}
                fill={m.color}
                fontSize={5.5}
                fontFamily="var(--lt-font-mono)"
                fontWeight="700"
              >
                {m.driver.split(" ")[1] || m.driver}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
