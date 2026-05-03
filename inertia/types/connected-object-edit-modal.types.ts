import type { ConnectedObject, TeamOption } from './connected-objects.types.ts'

export type ConnectedObjectEditableFields = Pick<ConnectedObject, 'name' | 'type' | 'status' | 'sector' | 'teamId'>

export type ConnectedObjectEditModalProps = {
  open: boolean
  device: ConnectedObject | null
  teams: TeamOption[]
  onClose: () => void
  onSave: (identifier: string, updates: ConnectedObjectEditableFields) => void
}
