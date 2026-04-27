export type DeviceStatus = 'online' | 'alert' | 'maintenance' | 'offline'

export type DeviceType = 'CAM' | 'LED' | string

export type ConnectedObject = {
  identifier: string
  name: string
  type: DeviceType
  sector: string
  status: DeviceStatus
  battery: number
  latencyMs: number
  signal: number
  firmware: string
}

export type ObjetsPageProps = {
  devices: ConnectedObject[]
}
