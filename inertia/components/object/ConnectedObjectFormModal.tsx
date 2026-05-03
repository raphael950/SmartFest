import { useEffect, useState } from 'react'
import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal.types'
import type { DeviceStatus, TeamOption } from '@/types/connected-objects.types'
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
import '@/css/components/objets/ConnectedObjectEditModal.css'

type ConnectedObjectFormModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description: string
  submitLabel: string
  initialValues: ConnectedObjectEditableFields
  teams: TeamOption[]
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
  teams,
  onSubmit,
  identifier,
  namePlaceholder,
  idPrefix,
  normalizeAndValidateName = false,
}: ConnectedObjectFormModalProps) => {
  const [formState, setFormState] = useState<ConnectedObjectEditableFields>(initialValues)

  // Vérification si l'objet est un GPS
  // Note : Adapte "GPS" selon la valeur exacte dans tes CONNECTED_OBJECT_TYPE_OPTIONS
  const isGps = formState.type.toUpperCase() === 'GPS'

  useEffect(() => {
    if (!open) return
    setFormState(initialValues)
  }, [open, initialValues])

  const handleSubmit = () => {
    let finalValues = { ...formState }

    // 1. Normalisation du nom si nécessaire
    if (normalizeAndValidateName) {
      const normalizedName = finalValues.name.trim()
      if (!normalizedName) return
      finalValues.name = normalizedName
    }

    // 2. Logique métier GPS : On vide le secteur
    if (isGps) {
      finalValues.sector = ""
      if (!finalValues.teamId) {
        return
      }
    } else {
      finalValues.teamId = null
    }

    onSubmit(finalValues)
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="iot-edit-modal">
        <DialogHeader className="iot-edit-modal__header">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="iot-edit-modal__form">
          {/* ... Identifiant et Nom (inchangés) ... */}
          {identifier ? (
            <div className="iot-edit-modal__row">
              <Label htmlFor={`${idPrefix}-id`}>Identifiant</Label>
              <Input
                id={`${idPrefix}-id`}
                className="iot-edit-modal__input"
                value={identifier}
                disabled
              />
            </div>
          ) : null}

          <div className="iot-edit-modal__row">
            <Label htmlFor={`${idPrefix}-name`}>Nom</Label>
            <Input
              id={`${idPrefix}-name`}
              className="iot-edit-modal__input"
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

            <div className={`iot-edit-modal__row ${isGps ? 'opacity-50' : ''}`}>
              <Label htmlFor={`${idPrefix}-sector`}>Secteur</Label>
              <select
                id={`${idPrefix}-sector`}
                className="iot-edit-modal__select"
                // Si c'est un GPS, on affiche vide et on désactive
                value={isGps ? "" : formState.sector}
                disabled={isGps}
                onChange={(event) => setFormState((prev) => ({ ...prev, sector: event.target.value }))}
              >
                {/* On ajoute une option vide pour le visuel quand c'est désactivé */}
                {isGps && <option value="">Aucun (GPS)</option>}
                {CONNECTED_OBJECT_SECTOR_OPTIONS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ... Statut (inchangé) ... */}
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

          <div className={`iot-edit-modal__row ${!isGps ? 'opacity-50' : ''}`}>
            <Label htmlFor={`${idPrefix}-team`}>Equipe Proprietaire</Label>
            <select
              id={`${idPrefix}-team`}
              className="iot-edit-modal__select"
              value={isGps && formState.teamId ? String(formState.teamId) : ''}
              required={isGps}
              disabled={!isGps}
              onChange={(event) => {
                const nextValue = event.target.value
                setFormState((prev) => ({
                  ...prev,
                  teamId: nextValue ? Number.parseInt(nextValue, 10) : null,
                }))
              }}
            >
              <option value="">{isGps ? 'Selectionner une equipe' : 'FIA / Direction de course'}</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
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