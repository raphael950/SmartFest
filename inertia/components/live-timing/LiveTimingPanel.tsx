import TrackDisplay from "./TrackDisplay";
import TrackConditions from "./TrackConditions";
import Leaderboard from "./Leaderboard";
import "./live-timing.base.css";
import "./LiveTimingPanel.css";
import type { LiveTimingPageProps } from "~/types/live-timing.types";

interface LiveTimingPanelProps extends LiveTimingPageProps {}

export default function LiveTimingPanel({ drivers, circuitPath }: LiveTimingPanelProps) {
  return (
    <div className="lt-panel-root">
      {/* ── Page title ── */}
      <div>
        <h1 className="lt-panel-title">
          Bugatti Circuit — Le Mans
        </h1>
        <p className="lt-panel-subtitle">
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
