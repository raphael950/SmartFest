type Driver = {
  id: number
  number: number
  name: string
  team: string
  position: number
  bestLap: string
  lastLap: string
  gap: string | null
  status: 'live' | 'pit' | 'retired'
}
