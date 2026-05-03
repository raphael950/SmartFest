import type { ConnectedObjectEditableFields } from "./connected-object-edit-modal.types"
import type { TeamOption } from './connected-objects.types'

export type ConnectedObjectCreateModalProps = {
  open: boolean
  teams: TeamOption[]
  onClose: () => void
  onCreate: (values: ConnectedObjectEditableFields) => void
}
