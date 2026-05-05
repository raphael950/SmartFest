export type RaceStatus = 'stopped' | 'running'

export interface RaceState {
  status: RaceStatus
  startedAt: number | null
}

export type RaceEvent = {
  id: number
  status: RaceStatus
  startedAt: string | null
  stoppedAt: string | null
  createdAt: string
}
