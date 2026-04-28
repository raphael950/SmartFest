import { useState } from "react";
import "../css/live-timing.css";
import type { Driver } from "~/types/live-timing.types";

interface DriverRowProps {
  driver: Driver & { name: string; number: string; teamColor: string; lapsCompleted: number; gap: string; lastLap: string; shortName: string; sectors: Array<{ sector: number; time: string; delta: string; status: string }> };
  rank: number;
}

export default function DriverRow({ driver, rank }: DriverRowProps) {
  const [expanded, setExpanded] = useState(false);

  const posBadgeClass =
    rank === 1 ? "lt-pos-badge lt-pos-badge--1"
    : rank === 2 ? "lt-pos-badge lt-pos-badge--2"
    : rank === 3 ? "lt-pos-badge lt-pos-badge--3"
    : "lt-pos-badge lt-pos-badge--n";

  return (
    <div
      className={`lt-driver-row${expanded ? " lt-driver-row--active" : ""}`}
      style={{
        borderBottom: "1px solid var(--lt-border)",
        background: expanded ? "var(--lt-bg-row-active)" : "var(--lt-bg-row)",
      }}
      onClick={() => setExpanded((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
      aria-expanded={expanded}
    >
      {/* ── Main row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 80px 80px 90px 110px 28px",
          alignItems: "center",
          padding: "10px 14px 10px 0",
          gap: 8,
        }}
      >
        {/* Position */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className={posBadgeClass}>{rank}</div>
        </div>

        {/* Team + car image + car number */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          {/* Team color bar */}
          <div
            style={{
              width: 3,
              height: 32,
              borderRadius: 2,
              background: driver.teamColor,
              flexShrink: 0,
              boxShadow: `0 0 6px ${driver.teamColor}66`,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span
              style={{
                fontFamily: "var(--lt-font-display)",
                fontSize: "0.72rem",
                color: "var(--lt-muted)",
                lineHeight: 1,
              }}
            >
              {driver.team}
            </span>
            <span
              style={{
                fontFamily: "var(--lt-font-display)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--lt-white)",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {driver.name}
            </span>
          </div>
          {/* Car image placeholder */}
          <div
            style={{
              width: 58,
              height: 28,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${driver.teamColor}22, ${driver.teamColor}44)`,
              border: `1px solid ${driver.teamColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--lt-font-display)",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: driver.teamColor,
              }}
            >
              {driver.number}
            </span>
          </div>
        </div>

        {/* Laps */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "var(--lt-font-mono)", fontSize: "0.8rem", color: "var(--lt-white)" }}>
            {driver.lapsCompleted}
          </span>
        </div>

        {/* Gap */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontFamily: "var(--lt-font-mono)",
              fontSize: "0.8rem",
              color: rank === 1 ? "var(--lt-red)" : "var(--lt-white)",
            }}
          >
            {driver.gap}
          </span>
        </div>

        {/* Last lap */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "var(--lt-font-mono)", fontSize: "0.8rem", color: "var(--lt-white)" }}>
            {driver.lastLap}
          </span>
        </div>

        {/* Current driver (repeated for "PILOTE ACTUEL" column) */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${driver.teamColor}55, ${driver.teamColor}22)`,
              border: `1px solid ${driver.teamColor}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "0.6rem", color: driver.teamColor, fontWeight: 700 }}>
              {driver.shortName}
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--lt-font-display)",
              fontSize: "0.78rem",
              color: "var(--lt-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {driver.name.split(" ")[0][0]}. {driver.name.split(" ").slice(1).join(" ")}
          </span>
        </div>

        {/* Expand chevron */}
        <div
          style={{
            textAlign: "center",
            transition: "transform 0.22s ease",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            color: "var(--lt-muted)",
            fontSize: "0.75rem",
          }}
        >
          ▶
        </div>
      </div>

      {/* ── Sector drawer ── */}
      <div className={`lt-sector-drawer${expanded ? " lt-sector-drawer--open" : ""}`}>
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "0 14px 12px 44px",
          }}
        >
          {driver.sectors.map((s: { sector: number; time: string; delta: string; status: string }) => {
            const pillClass =
              s.status === "fastest"
                ? "lt-sector-pill lt-sector-pill--fast"
                : s.status === "personal-best"
                ? "lt-sector-pill lt-sector-pill--pb"
                : s.status === "slow"
                ? "lt-sector-pill lt-sector-pill--slow"
                : "lt-sector-pill lt-sector-pill--normal";

            return (
              <div
                key={s.sector}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 72,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--lt-font-display)",
                    fontSize: "0.65rem",
                    color: "var(--lt-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Sector {s.sector}
                </span>
                <span className={pillClass}>{s.time}</span>
                {s.delta && (
                  <span
                    style={{
                      fontFamily: "var(--lt-font-mono)",
                      fontSize: "0.62rem",
                      color:
                        s.delta.startsWith("-")
                          ? "#4ade80"
                          : "#f87171",
                    }}
                  >
                    {s.delta}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
