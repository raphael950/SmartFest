import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal'

export type ConnectedObjectCreateModalProps = {
  open: boolean
  onClose: () => void
  onCreate: (values: ConnectedObjectEditableFields) => void
}
