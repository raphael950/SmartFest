import type { ConnectedObject } from './connected-objects.types.ts'

export type ConnectedObjectEditableFields = Pick<ConnectedObject, 'name' | 'type' | 'status' | 'sector'>

export type ConnectedObjectEditModalProps = {
  open: boolean
  device: ConnectedObject | null
  onClose: () => void
  onSave: (identifier: string, updates: ConnectedObjectEditableFields) => void
}
