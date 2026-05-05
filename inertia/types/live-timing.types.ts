export type Driver = {
  id: number
  team: string
  pilote?: string
  position?: number
  carModel?: string
  // Champs timing
  lapsCompleted?: number
  gap?: string
  lastLap?: string
  bestLap?: string
  sectors?: { sector: number; time: string; delta: string; status: string }[]
  // Position sur le circuit (0.0 → 1.0)
  trackProgression?: number
  accentColor?: string
  shortName?: string
  hasGps?: boolean
  gpsActive?: boolean
  gpsRevealPending?: boolean
}

export type LiveTimingCamera = {
  id: number
  identifier: string
  name: string
  type: 'CAM' | string
  sector: 'S1' | 'S2' | 'S3' | string
  status: 'online' | 'alert' | 'maintenance' | 'offline'
}

export type LiveTimingPageProps = {
  drivers: Driver[]
  circuitPath: string
  cameras: LiveTimingCamera[]
}

// types/live-timing.types.ts — ajouter ces types

export type FlagColor = 'vert' | 'jaune' | 'rouge'

export interface FlagState {
  color: FlagColor
  /** Secteurs concernés — uniquement pertinent pour 'jaune', vide sinon */
  sectors: string[]
}
