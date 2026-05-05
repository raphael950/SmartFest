import { router } from '@inertiajs/react'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { InertiaProps } from '@/types'
import type { Incident, IncidentSector, IncidentSeverity, IncidentType } from '@/types/incidents.types'
import '@/css/pages/incidents/incidents.css'

const INCIDENT_TYPE_OPTIONS: { value: IncidentType; label: string }[] = [
  { value: 'contact', label: 'Contact' },
  { value: 'sortie_piste', label: 'Sortie de piste' },
  { value: 'panne_mecanique', label: 'Panne mécanique' },
  { value: 'incendie', label: 'Incendie' },
  { value: 'debris', label: 'Débris' },
  { value: 'autre', label: 'Autre' },
]

const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string }[] = [
  { value: 'leger', label: 'Léger' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'grave', label: 'Grave' },
  { value: 'critique', label: 'Critique' },
]

const SECTOR_OPTIONS: IncidentSector[] = ['S1', 'S2', 'S3']

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  leger: 'Léger',
  moyen: 'Moyen',
  grave: 'Grave',
  critique: 'Critique',
}

const TYPE_LABELS: Record<IncidentType, string> = {
  contact: 'Contact',
  sortie_piste: 'Sortie de piste',
  panne_mecanique: 'Panne mécanique',
  incendie: 'Incendie',
  debris: 'Débris',
  autre: 'Autre',
}

const isIncidentType = (value: string): value is IncidentType => {
  return INCIDENT_TYPE_OPTIONS.some((option) => option.value === value)
}

const isIncidentSeverity = (value: string): value is IncidentSeverity => {
  return SEVERITY_OPTIONS.some((option) => option.value === value)
}

const isIncidentSector = (value: string): value is IncidentSector => {
  return SECTOR_OPTIONS.includes(value as IncidentSector)
}

type IncidentsPageProps = {
  incidents: Incident[]
  teams: Array<{
    id: number
    name: string
    carModel: string
  }>
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatSector = (sector: string) => {
  return `Secteur ${sector.replace('S', '')}`
}

const IncidentsPage = ({ incidents, teams }: InertiaProps<IncidentsPageProps>) => {
  const [type, setType] = useState<IncidentType | ''>('')
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([])
  const [severity, setSeverity] = useState<IncidentSeverity>('leger')
  const [sector, setSector] = useState<IncidentSector | ''>('')
  const [description, setDescription] = useState('')
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false)
  const vehicleMenuRef = useRef<HTMLDivElement>(null)

  const selectedVehiclesLabel = useMemo(() => {
    if (selectedTeamIds.length === 0) {
      return 'Sélectionner les voitures impliquées'
    }

    const selectedModels = teams
      .filter((team) => selectedTeamIds.includes(team.id))
      .map((team) => team.carModel)

    return selectedModels.join(', ')
  }, [selectedTeamIds, teams])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!vehicleMenuRef.current?.contains(event.target as Node)) {
        setVehicleMenuOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setVehicleMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const toggleVehicle = (teamId: number) => {
    setSelectedTeamIds((current) =>
      current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId]
    )
  }

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const vehicles = teams
      .filter((team) => selectedTeamIds.includes(team.id))
      .map((team) => team.carModel)
      .join(', ')
    if (!type || !vehicles.trim() || !sector || !description.trim()) {
      return
    }

    router.post('/incidents', {
      type,
      vehicles: vehicles.trim(),
      severity,
      sector,
      description: description.trim(),
    }, {
      onSuccess: () => {
        setType('')
        setSeverity('leger')
        setSector('')
        setDescription('')
        setSelectedTeamIds([])
        setVehicleMenuOpen(false)
      },
    })
  }

  return (
    <section className="incidents-page">
      <div className="incidents-create">
        <h2 className="incidents-create__title">
          <span className="incidents-create__title-icon">+</span>{' '}
          Créer un incident
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="incidents-create__grid">
            <div className="incidents-create__field">
              <label className="incidents-create__label incidents-create__label--required" htmlFor="incident-type">
                Type d'incident
              </label>
              <select
                id="incident-type"
                className="incidents-create__select"
                value={type}
                onChange={(e) => {
                  const value = e.target.value
                  setType(isIncidentType(value) ? value : '')
                }}
              >
                <option value="" disabled>Sélectionner...</option>
                {INCIDENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="incidents-create__field">
              <label className="incidents-create__label incidents-create__label--required" htmlFor="incident-vehicles">
                Véhicules impliqués
              </label>
              <div className="incidents-vehicle-picker" ref={vehicleMenuRef}>
                <button
                  id="incident-vehicles"
                  type="button"
                  className="incidents-vehicle-picker__trigger"
                  onClick={() => setVehicleMenuOpen((current) => !current)}
                  aria-haspopup="menu"
                  aria-expanded={vehicleMenuOpen}
                >
                  <span className="incidents-vehicle-picker__trigger-label">{selectedVehiclesLabel}</span>
                  <ChevronDown size={16} className={`incidents-vehicle-picker__chevron${vehicleMenuOpen ? ' is-open' : ''}`} />
                </button>

                {vehicleMenuOpen && (
                  <div className="incidents-vehicle-picker__menu" role="menu" aria-label="Sélection des voitures impliquées">
                    {teams.length === 0 ? (
                      <p className="incidents-vehicle-picker__empty">Aucune voiture disponible.</p>
                    ) : (
                      teams.map((team) => {
                        const isSelected = selectedTeamIds.includes(team.id)

                        return (
                          <label key={team.id} className={`incidents-vehicle-picker__option${isSelected ? ' is-selected' : ''}`}>
                            <input
                              type="checkbox"
                              className="incidents-vehicle-picker__checkbox"
                              checked={isSelected}
                              onChange={() => toggleVehicle(team.id)}
                            />
                            <span className="incidents-vehicle-picker__check" aria-hidden="true" />
                            <span className="incidents-vehicle-picker__text">
                              <strong>{team.carModel}</strong>
                              <span>{team.name}</span>
                            </span>
                          </label>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="incidents-create__field">
              <label className="incidents-create__label incidents-create__label--required" htmlFor="incident-severity">
                Sévérité
              </label>
              <select
                id="incident-severity"
                className="incidents-create__select"
                value={severity}
                onChange={(e) => {
                  const value = e.target.value
                  if (isIncidentSeverity(value)) {
                    setSeverity(value)
                  }
                }}
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="incidents-create__field">
              <label className="incidents-create__label incidents-create__label--required" htmlFor="incident-sector">
                Secteur
              </label>
              <select
                id="incident-sector"
                className="incidents-create__select"
                value={sector}
                onChange={(e) => {
                  const value = e.target.value
                  setSector(isIncidentSector(value) ? value : '')
                }}
              >
                <option value="" disabled>Sélectionner...</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{formatSector(s)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="incidents-create__field">
            <label className="incidents-create__label incidents-create__label--required" htmlFor="incident-description">
              Description
            </label>
            <textarea
              id="incident-description"
              className="incidents-create__textarea"
              placeholder="Détails de l'incident..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="incidents-create__submit">
            Créer l'incident
          </button>
        </form>
      </div>

      <div className="incidents-timeline">
        <h2 className="incidents-timeline__title">
          <AlertTriangle size={20} className="incidents-timeline__title-icon" />
          Timeline des incidents
        </h2>

        <div className="incidents-timeline__list">
          {incidents.length === 0 ? (
            <p className="incidents-timeline__empty">Aucun incident enregistré.</p>
          ) : (
            incidents.map((incident: Incident) => (
              <article key={incident.id} className={`incident-card incident-card--${incident.severity}`}>
                <div className="incident-card__header">
                  <div className="incident-card__meta">
                    <span className="incident-card__time">{formatTime(incident.createdAt)}</span>
                    <span className={`incident-card__badge incident-card__badge--${incident.severity}`}>
                      {SEVERITY_LABELS[incident.severity as IncidentSeverity]}
                    </span>
                  </div>
                  <span className="incident-card__sector">{formatSector(incident.sector)}</span>
                </div>

                <p className="incident-card__type">{TYPE_LABELS[incident.type as IncidentType]}</p>
                <p className="incident-card__vehicles">Véhicules: {incident.vehicles}</p>

                <div className="incident-card__description">{incident.description}</div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default IncidentsPage
