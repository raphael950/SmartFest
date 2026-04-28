import DriverRow from "./DriverRow";
import "../css/live-timing.css";
import type { Driver } from "~/types/live-timing.types";

interface LeaderboardProps {
  drivers: Driver[];
}

/** Mock enriched driver data for UI display */
interface EnrichedDriver extends Driver {
  name: string;
  shortName: string;
  number: string;
  teamColor: string;
  lapsCompleted: number;
  gap: string;
  lastLap: string;
  sectors: Array<{ sector: number; time: string; delta: string; status: string }>;
}

const MOCK_DRIVERS_DATA: EnrichedDriver[] = [
  {
    id: 1,
    name: "M. Vaxiviere",
    shortName: "VAX",
    number: "A424",
    team: "Alpine Racing",
    teamColor: "#e8352a",
    position: 1,
    lapsCompleted: 11,
    gap: "+0.059",
    lastLap: "1:53.298",
    sectors: [
      { sector: 1, time: "0:28.12", delta: "-0.04", status: "personal-best" },
      { sector: 2, time: "0:42.77", delta: "+0.11", status: "normal" },
      { sector: 3, time: "0:42.41", delta: "-0.09", status: "personal-best" },
    ],
  },
  {
    id: 2,
    name: "A. Pier Guidi",
    shortName: "PGU",
    number: "499P",
    team: "Ferrari Corse",
    teamColor: "#fbbf24",
    position: 2,
    lapsCompleted: 12,
    gap: "+2.994",
    lastLap: "1:33.552",
    sectors: [
      { sector: 1, time: "0:27.88", delta: "-0.28", status: "fastest" },
      { sector: 2, time: "0:43.10", delta: "+0.44", status: "slow" },
      { sector: 3, time: "0:42.56", delta: "+0.06", status: "normal" },
    ],
  },
  {
    id: 3,
    name: "K. Estre",
    shortName: "EST",
    number: "963",
    team: "Porsche Team",
    teamColor: "#60a5fa",
    position: 3,
    lapsCompleted: 13,
    gap: "+2.350",
    lastLap: "1:32.000",
    sectors: [
      { sector: 1, time: "0:28.44", delta: "+0.32", status: "slow" },
      { sector: 2, time: "0:41.98", delta: "-0.68", status: "fastest" },
      { sector: 3, time: "0:41.58", delta: "-0.92", status: "fastest" },
    ],
  },
  {
    id: 4,
    name: "T. Bamber",
    shortName: "BAM",
    number: "75",
    team: "Corvette Racing",
    teamColor: "#34d399",
    position: 4,
    lapsCompleted: 10,
    gap: "+5.112",
    lastLap: "1:34.881",
    sectors: [
      { sector: 1, time: "0:29.01", delta: "+0.89", status: "slow" },
      { sector: 2, time: "0:43.55", delta: "+0.89", status: "slow" },
      { sector: 3, time: "0:42.33", delta: "-0.17", status: "personal-best" },
    ],
  },
  {
    id: 5,
    name: "N. Jani",
    shortName: "JAN",
    number: "38",
    team: "Hertz JOTA",
    teamColor: "#a78bfa",
    position: 5,
    lapsCompleted: 9,
    gap: "+8.490",
    lastLap: "1:35.442",
    sectors: [
      { sector: 1, time: "0:29.22", delta: "+1.10", status: "normal" },
      { sector: 2, time: "0:43.81", delta: "+1.15", status: "slow" },
      { sector: 3, time: "0:42.41", delta: "-0.09", status: "personal-best" },
    ],
  },
];

const COLUMNS = [
  { label: "POS",           style: { width: 44, textAlign: "center" as const } },
  { label: "ÉQUIPE / PILOTE", style: { flex: 1 } },
  { label: "TOUR ACCO.",    style: { width: 80, textAlign: "center" as const } },
  { label: "ÉCART",         style: { width: 80, textAlign: "center" as const } },
  { label: "DERNIER TOUR",  style: { width: 90, textAlign: "center" as const } },
  { label: "PILOTE ACTUEL", style: { width: 110 } },
  { label: "",              style: { width: 28 } },
];

export default function Leaderboard({ drivers }: LeaderboardProps) {
  // Enrich backend drivers with mock data for display
  const enrichedDrivers = drivers.map((d, idx) => ({
    ...d,
    ...MOCK_DRIVERS_DATA[idx % MOCK_DRIVERS_DATA.length],
  }));

  return (
    <div
      className="lt-glass"
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* ── Title bar ── */}
      <div
        style={{
          padding: "14px 14px 0 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 4,
            height: 18,
            background: "var(--lt-red)",
            borderRadius: 2,
            boxShadow: "0 0 8px var(--lt-red-glow)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--lt-font-display)",
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--lt-white)",
            letterSpacing: "0.04em",
          }}
        >
          Classement direct
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--lt-font-mono)",
            fontSize: "0.65rem",
            color: "var(--lt-red)",
            padding: "2px 8px",
            border: "1px solid var(--lt-red-border)",
            borderRadius: 4,
            background: "var(--lt-red-dim)",
          }}
        >
          LIVE
        </span>
      </div>

      {/* ── Column headers ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 80px 80px 90px 110px 28px",
          padding: "10px 14px 6px 0",
          gap: 8,
          borderBottom: "1px solid var(--lt-border-bright)",
        }}
      >
        {COLUMNS.map((col, i) => (
          <div key={i} className="lt-th" style={col.style}>
            {col.label}
          </div>
        ))}
      </div>

      {/* ── Rows ── */}
      <div
        className="lt-scroll"
        style={{ overflowY: "auto", flex: 1 }}
      >
        {enrichedDrivers.map((driver, i) => (
          <DriverRow key={driver.id} driver={driver} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
