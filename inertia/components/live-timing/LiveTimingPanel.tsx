import TrackDisplay from "./TrackDisplay";
import TrackConditions from "./TrackConditions";
import Leaderboard from "./Leaderboard";
import "./live-timing.css";
import type { LiveTimingPageProps } from "~/types/live-timing.types";

interface LiveTimingPanelProps extends LiveTimingPageProps {}

export default function LiveTimingPanel({ drivers, circuitPath }: LiveTimingPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "20px 20px 20px 16px",
        height: "100%",
        minHeight: "100vh",
        background: "var(--lt-bg-base)",
        fontFamily: "var(--lt-font-display)",
        color: "var(--lt-white)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Page title ── */}
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--lt-font-display)",
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "var(--lt-white)",
            letterSpacing: "0.04em",
          }}
        >
          Bugatti Circuit — Le Mans
        </h1>
        <p
          style={{
            margin: "2px 0 0",
            fontFamily: "var(--lt-font-display)",
            fontSize: "0.78rem",
            color: "var(--lt-muted)",
            letterSpacing: "0.04em",
          }}
        >
          Circuit automobile Le Mans Bugatti
        </p>
      </div>

      {/* ── Upper zone: track + conditions side-by-side ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          gap: 16,
          minHeight: 260,
        }}
      >
        <TrackDisplay circuitPath={circuitPath} />
        <TrackConditions />
      </div>

      {/* ── Lower zone: leaderboard ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Leaderboard drivers={drivers} />
      </div>
    </div>
  );
}
