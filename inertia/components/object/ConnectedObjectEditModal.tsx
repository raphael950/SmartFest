import type {
  ConnectedObjectEditableFields,
  ConnectedObjectEditModalProps,
} from '@/types/connected-object-edit-modal.types'
import ConnectedObjectFormModal from '@/components/object/ConnectedObjectFormModal'

const emptyFormState: ConnectedObjectEditableFields = {
  name: '',
  type: 'CAM',
  status: 'online',
  sector: 'S1',
  teamId: null,
}

const ConnectedObjectEditModal = ({ open, device, teams, onClose, onSave }: ConnectedObjectEditModalProps) => {
  const handleSubmit = (values: ConnectedObjectEditableFields) => {
    if (!device) {
      return
    }

    onSave(device.identifier, values)
  }

  return (
    <ConnectedObjectFormModal
      open={open}
      onClose={onClose}
      title="Mettre a jour un objet"
      description="Modification persistante en base de donnees pour l&apos;objet selectionne."
      submitLabel="Mettre a jour"
      initialValues={
        device
          ? {
              name: device.name,
              type: device.type,
              status: device.status,
              sector: device.sector,
              teamId: device.teamId,
            }
          : emptyFormState
      }
      teams={teams}
      identifier={device?.identifier}
      idPrefix="iot-edit"
      onSubmit={handleSubmit}
    />
  )
}

export default ConnectedObjectEditModal
