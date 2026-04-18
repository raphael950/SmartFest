import { useEffect, useState } from 'react'
import type { DeviceStatus } from '@/types/connected-objects'
import type {
  ConnectedObjectEditableFields,
  ConnectedObjectEditModalProps,
} from '@/types/connected-object-edit-modal'
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

const ConnectedObjectEditModal = ({ open, device, onClose, onSave }: ConnectedObjectEditModalProps) => {
  const [formState, setFormState] = useState<ConnectedObjectEditableFields>({
    name: '',
    type: 'CAM',
    status: 'online',
    sector: 'S1',
  })

  useEffect(() => {
    if (!device) {
      return
    }

    setFormState({
      name: device.name,
      type: device.type,
      status: device.status,
      sector: device.sector,
    })
  }, [device])

  const handleSubmit = () => {
    if (!device) {
      return
    }

    onSave(device.identifier, formState)
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="iot-edit-modal">
        <DialogHeader>
          <DialogTitle>Mettre a jour un objet</DialogTitle>
          <DialogDescription>
            Modification locale en memoire pour le prototype (non persistante tant que la DB n&apos;est pas branchee).
          </DialogDescription>
        </DialogHeader>

        {device && (
          <div className="iot-edit-modal__form">
            <div className="iot-edit-modal__row">
              <Label htmlFor="iot-edit-id">Identifiant</Label>
              <Input id="iot-edit-id" value={device.identifier} disabled />
            </div>

            <div className="iot-edit-modal__row">
              <Label htmlFor="iot-edit-name">Nom</Label>
              <Input
                id="iot-edit-name"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="iot-edit-modal__grid">
              <div className="iot-edit-modal__row">
                <Label htmlFor="iot-edit-type">Type</Label>
                <select
                  id="iot-edit-type"
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
                <Label htmlFor="iot-edit-sector">Secteur</Label>
                <select
                  id="iot-edit-sector"
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
              <Label htmlFor="iot-edit-status">Statut</Label>
              <select
                id="iot-edit-status"
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
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Mettre a jour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConnectedObjectEditModal
