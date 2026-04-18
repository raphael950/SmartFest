import { useEffect, useState } from 'react'
import type { DeviceStatus } from '@/types/connected-objects'
import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal'
import type { ConnectedObjectCreateModalProps } from '@/types/connected-object-create-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import '@/css/components/ConnectedObjectEditModal.css'

const statusOptions: Array<{ value: DeviceStatus; label: string }> = [
  { value: 'online', label: 'EN LIGNE' },
  { value: 'alert', label: 'ALERTE' },
  { value: 'maintenance', label: 'MAINTENANCE' },
  { value: 'offline', label: 'HORS LIGNE' },
]

const typeOptions = ['CAM', 'LED']
const sectorOptions = ['S1', 'S2', 'S3']

const emptyFormState: ConnectedObjectEditableFields = {
  name: '',
  type: 'CAM',
  status: 'online',
  sector: 'S1',
}

const ConnectedObjectCreateModal = ({ open, onClose, onCreate }: ConnectedObjectCreateModalProps) => {
  const [formState, setFormState] = useState<ConnectedObjectEditableFields>(emptyFormState)

  useEffect(() => {
    if (open) {
      setFormState(emptyFormState)
    }
  }, [open])

  const handleSubmit = () => {
    const normalizedName = formState.name.trim()
    if (!normalizedName) {
      return
    }

    onCreate({
      ...formState,
      name: normalizedName,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="iot-edit-modal">
        <DialogHeader className="iot-edit-modal__header">
          <DialogTitle>Ajouter un objet</DialogTitle>
          <DialogDescription>
            Creation locale en memoire: l&apos;ID et les donnees techniques sont generees automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="iot-edit-modal__form">
          <div className="iot-edit-modal__row">
            <Label htmlFor="iot-create-name">Nom</Label>
            <Input
              id="iot-create-name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ex: Camera Virage S2"
            />
          </div>

          <div className="iot-edit-modal__grid">
            <div className="iot-edit-modal__row">
              <Label htmlFor="iot-create-type">Type</Label>
              <select
                id="iot-create-type"
                className="iot-edit-modal__select"
                value={formState.type}
                onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="iot-edit-modal__row">
              <Label htmlFor="iot-create-sector">Secteur</Label>
              <select
                id="iot-create-sector"
                className="iot-edit-modal__select"
                value={formState.sector}
                onChange={(event) => setFormState((prev) => ({ ...prev, sector: event.target.value }))}
              >
                {sectorOptions.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="iot-edit-modal__row">
            <Label htmlFor="iot-create-status">Statut</Label>
            <select
              id="iot-create-status"
              className="iot-edit-modal__select"
              value={formState.status}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, status: event.target.value as DeviceStatus }))
              }
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="iot-edit-modal__footer">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConnectedObjectCreateModal
