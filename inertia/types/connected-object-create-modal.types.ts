import type { ConnectedObjectEditableFields } from "./connected-object-edit-modal.types"

export type ConnectedObjectCreateModalProps = {
  open: boolean
  onClose: () => void
  onCreate: (values: ConnectedObjectEditableFields) => void
}
