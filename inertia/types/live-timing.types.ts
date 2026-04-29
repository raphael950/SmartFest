export type Driver = {
  id: number
  team: string
  pilote?: string
  position?: number
}

export type LiveTimingPageProps = {
  drivers: Driver[]
  circuitPath: string
}
