import ConnectedObjectFormModal from '@/components/ConnectedObjectFormModal'
import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal.types'
import type { ConnectedObjectCreateModalProps } from '@/types/connected-object-create-modal.types'

const emptyFormState: ConnectedObjectEditableFields = {
  name: '',
  type: 'CAM',
  status: 'online',
  sector: 'S1',
}

const ConnectedObjectCreateModal = ({ open, onClose, onCreate }: ConnectedObjectCreateModalProps) => {
  return (
    <ConnectedObjectFormModal
      open={open}
      onClose={onClose}
      title="Ajouter un objet"
      description="Creation persistante en base: l&apos;ID et les donnees techniques sont generees automatiquement."
      submitLabel="Ajouter"
      initialValues={emptyFormState}
      onSubmit={onCreate}
      idPrefix="iot-create"
      namePlaceholder="Ex: Camera Virage S2"
      normalizeAndValidateName
    />
  )
}

export default ConnectedObjectCreateModal
