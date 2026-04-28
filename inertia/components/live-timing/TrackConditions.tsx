import "../css/live-timing.css";

interface TrackConditionData {
  circuit: string;
  correction: string;
  trackQuality: string;
  airTemp: string;
  humidity: string;
}

const CONDITIONS: TrackConditionData = {
  circuit:      "23° Mmh",
  correction:   "-50 °C",
  trackQuality: "22 %",
  airTemp:      "18 °C",
  humidity:     "64 %",
};

const rows = [
  { label: "Circuit",       value: CONDITIONS.circuit },
  { label: "Correction",    value: CONDITIONS.correction },
  { label: "Track quality", value: CONDITIONS.trackQuality },
  { label: "Air temp.",     value: CONDITIONS.airTemp },
  { label: "Humidity",      value: CONDITIONS.humidity },
];

export default function TrackConditions() {
  return (
    <div
      className="lt-glass lt-glass--bright"
      style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        {/* Pulsing live indicator */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--lt-red)",
            boxShadow: "0 0 6px var(--lt-red-glow)",
            display: "inline-block",
            animation: "lt-pulse 1.6s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--lt-font-display)",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--lt-white)",
          }}
        >
          Track Conditions
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--lt-border)", marginBottom: 4 }} />

      {/* Condition rows */}
      {rows.map((row) => (
        <div key={row.label} className="lt-cond-row">
          <span className="lt-cond-label">{row.label}</span>
          <span className="lt-cond-value">{row.value}</span>
        </div>
      ))}

      {/* Inline keyframe via style tag */}
      <style>{`
        @keyframes lt-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--lt-red-glow); }
          50%       { opacity: 0.4; box-shadow: 0 0 2px var(--lt-red-glow); }
        }
      `}</style>
    </div>
  );
}
