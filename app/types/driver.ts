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
  sectors: Array<{ sector: number; time: string; delta: string; status: string }>
  // Position sur le circuit (0.0 → 1.0)
  trackProgression: number
  accentColor?: string
  shortName?: string
  speed?: number
  hasGps?: boolean
  gpsActive?: boolean
  gpsRevealPending?: boolean
}