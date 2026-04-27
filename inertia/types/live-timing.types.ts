export type LiveTimingPageProps = {
  drivers: Driver[]
  sessionStatus: 'waiting' | 'live' | 'yellow' | 'red' | 'finished'
  elapsedTime: string
  currentLap: number
  totalLaps: number
}