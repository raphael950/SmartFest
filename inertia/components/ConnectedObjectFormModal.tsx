import { useEffect, useState } from 'react'
import type { DeviceStatus } from '../types/connected-objects.types.ts'
import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal'
import {
  CONNECTED_OBJECT_SECTOR_OPTIONS,
  CONNECTED_OBJECT_STATUS_OPTIONS,
  CONNECTED_OBJECT_TYPE_OPTIONS,
} from '@/lib/connected-object-options'
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

type ConnectedObjectFormModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description: string
  submitLabel: string
  initialValues: ConnectedObjectEditableFields
  onSubmit: (values: ConnectedObjectEditableFields) => void
  identifier?: string
  namePlaceholder?: string
  idPrefix: string
  normalizeAndValidateName?: boolean
}

const ConnectedObjectFormModal = ({
  open,
  onClose,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  identifier,
  namePlaceholder,
  idPrefix,
  normalizeAndValidateName = false,
}: ConnectedObjectFormModalProps) => {
  const [formState, setFormState] = useState<ConnectedObjectEditableFields>(initialValues)

  useEffect(() => {
    if (!open) {
      return
    }

    setFormState(initialValues)
  }, [open, initialValues])

  const handleSubmit = () => {
    if (!normalizeAndValidateName) {
      onSubmit(formState)
      return
    }

    const normalizedName = formState.name.trim()
    if (!normalizedName) {
      return
    }

    onSubmit({
      ...formState,
      name: normalizedName,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="iot-edit-modal">
        <DialogHeader className="iot-edit-modal__header">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="iot-edit-modal__form">
          {identifier ? (
            <div className="iot-edit-modal__row">
              <Label htmlFor={`${idPrefix}-id`}>Identifiant</Label>
              <Input
                id={`${idPrefix}-id`}
                className="iot-edit-modal__input focus-visible:ring-0 focus-visible:ring-offset-0"
                value={identifier}
                disabled
              />
            </div>
          ) : null}

          <div className="iot-edit-modal__row">
            <Label htmlFor={`${idPrefix}-name`}>Nom</Label>
            <Input
              id={`${idPrefix}-name`}
              className="iot-edit-modal__input focus-visible:ring-0 focus-visible:ring-offset-0"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={namePlaceholder}
            />
          </div>

          <div className="iot-edit-modal__grid">
            <div className="iot-edit-modal__row">
              <Label htmlFor={`${idPrefix}-type`}>Type</Label>
              <select
                id={`${idPrefix}-type`}
                className="iot-edit-modal__select"
                value={formState.type}
                onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
              >
                {CONNECTED_OBJECT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="iot-edit-modal__row">
              <Label htmlFor={`${idPrefix}-sector`}>Secteur</Label>
              <select
                id={`${idPrefix}-sector`}
                className="iot-edit-modal__select"
                value={formState.sector}
                onChange={(event) => setFormState((prev) => ({ ...prev, sector: event.target.value }))}
              >
                {CONNECTED_OBJECT_SECTOR_OPTIONS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="iot-edit-modal__row">
            <Label htmlFor={`${idPrefix}-status`}>Statut</Label>
            <select
              id={`${idPrefix}-status`}
              className="iot-edit-modal__select"
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as DeviceStatus }))}
            >
              {CONNECTED_OBJECT_STATUS_OPTIONS.map((status) => (
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
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConnectedObjectFormModal
