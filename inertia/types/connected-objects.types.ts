export type DeviceStatus = 'online' | 'alert' | 'maintenance' | 'offline'

export type DeviceType = 'CAM' | 'LED' | 'GPS' | string

export type TeamOption = {
  id: number
  name: string
  isGpsOccupied?: boolean
}

export type PendingDeletionRequest = {
  id: number
  identifier: string
  name: string
  requestedBy: string
}

export type ConnectedObject = {
  id: number
  identifier: string
  name: string
  type: DeviceType
  sector: string
  status: DeviceStatus
  battery: number
  latencyMs: number
  signal: number
  firmware: string
  teamId: number | null
  teamName: string | null
  isDeletionRequested: boolean
  requestedDeletionByUserName: string | null
}

export type ObjetsPageProps = {
  devices: ConnectedObject[]
  teams: TeamOption[]
  pendingDeletionRequests: PendingDeletionRequest[]
}
