export type DeviceStatus = 'online' | 'alert' | 'maintenance' | 'offline'

export type ConnectedObjectAdmin = {
  id: number
  identifier: string
  name: string
  type: string
  sector: string
  status: DeviceStatus
  firmware: string
  battery: number
  latencyMs: number
  signal: number
  teamId: number | null
  teamName: string | null
  isDeletionRequested: boolean
  requestedDeletionByUserName: string | null
}

export type AdminObjetsPageProps = {
  devices: ConnectedObjectAdmin[]
  stats: {
    total: number
    oldestRequest: string | null
  }
}
