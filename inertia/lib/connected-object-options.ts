import type { DeviceStatus } from '../types/connected-objects.types.ts'

export const CONNECTED_OBJECT_STATUS_OPTIONS: Array<{ value: DeviceStatus; label: string }> = [
  { value: 'online', label: 'EN LIGNE' },
  { value: 'alert', label: 'ALERTE' },
  { value: 'maintenance', label: 'MAINTENANCE' },
  { value: 'offline', label: 'HORS LIGNE' },
]

export const CONNECTED_OBJECT_TYPE_OPTIONS = ['CAM', 'LED']

export const CONNECTED_OBJECT_SECTOR_OPTIONS = ['S1', 'S2', 'S3']
