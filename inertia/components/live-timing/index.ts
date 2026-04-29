// ─────────────────────────────────────────────
//  Live Timing — Shared Types
// ─────────────────────────────────────────────

export interface SectorTime {
  sector: number;
  time: string;
  delta?: string;
  status?: "fastest" | "personal-best" | "slow" | "normal";
}

export interface Driver {
  id: number;
  name: string;
  shortName: string;
  number: string;
  team: string;
  accentColor: string;
  carImage: string;
  position: number;
  lapsCompleted: number;
  gap: string;
  lastLap: string;
  sectors: SectorTime[];
}

export interface TrackConditionData {
  circuit: string;
  correction: string;
  trackQuality: string;
  airTemp: string;
  humidity: string;
}

export interface PositionMarker {
  id: number;
  x: number; // percentage along the path
  driver: string;
  color: string;
}
