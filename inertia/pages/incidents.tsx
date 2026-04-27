import { router } from '@inertiajs/react'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { InertiaProps } from '@/types'
import type { Incident, IncidentSeverity, IncidentType, Team } from '@/types/incidents'
import '@/css/incidents.css'

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

const SECTOR_OPTIONS = ['S1', 'S2', 'S3']

const SEVERITY_LABELS: Record<string, string> = {
  leger: 'Léger',
  moyen: 'Moyen',
  grave: 'Grave',
  critique: 'Critique',
}

const TYPE_LABELS: Record<string, string> = {
  contact: 'Contact',
  sortie_piste: 'Sortie de piste',
  panne_mecanique: 'Panne mécanique',
  incendie: 'Incendie',
  debris: 'Débris',
  autre: 'Autre',
}

type IncidentsPageProps = {
  incidents: Incident[]
  teams: Team[]
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
  const [vehicles, setVehicles] = useState('')
  const [severity, setSeverity] = useState<IncidentSeverity>('leger')
  const [sector, setSector] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!type || !sector) {
      return
    }

    router.post('/incidents', {
      type,
      vehicles: vehicles || '',
      severity,
      sector,
      description: description.trim(),
    }, {
      onSuccess: () => {
        setType('')
        setVehicles('')
        setSeverity('leger')
        setSector('')
        setDescription('')
      },
    })
  }

  return (
    <section className="incidents-page">
      {/* Create form */}
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
                onChange={(e) => setType(e.target.value as IncidentType)}
              >
                <option value="" disabled>Sélectionner...</option>
                {INCIDENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="incidents-create__field">
              <label className="incidents-create__label" htmlFor="incident-vehicles">
                Véhicule impliqué
              </label>
              <select
                id="incident-vehicles"
                className="incidents-create__select"
                value={vehicles}
                onChange={(e) => setVehicles(e.target.value)}
              >
                <option value="">Aucun</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.carModel}>
                    {team.name} — {team.carModel}
                  </option>
                ))}
              </select>
            </div>

            <div className="incidents-create__field">
              <label className="incidents-create__label incidents-create__label--required" htmlFor="incident-severity">
                Sévérité
              </label>
              <select
                id="incident-severity"
                className="incidents-create__select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
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
                onChange={(e) => setSector(e.target.value)}
              >
                <option value="" disabled>Sélectionner...</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{formatSector(s)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="incidents-create__field">
            <label className="incidents-create__label" htmlFor="incident-description">
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

      {/* Timeline */}
      <div className="incidents-timeline">
        <h2 className="incidents-timeline__title">
          <AlertTriangle size={20} className="incidents-timeline__title-icon" />
          Timeline des incidents
        </h2>

        <div className="incidents-timeline__list">
          {incidents.length === 0 ? (
            <p className="incidents-timeline__empty">Aucun incident enregistré.</p>
          ) : (
            incidents.map((incident) => (
              <article key={incident.id} className={`incident-card incident-card--${incident.severity}`}>
                <div className="incident-card__header">
                  <div className="incident-card__meta">
                    <span className="incident-card__time">{formatTime(incident.createdAt)}</span>
                    <span className={`incident-card__badge incident-card__badge--${incident.severity}`}>
                      {SEVERITY_LABELS[incident.severity] || incident.severity}
                    </span>
                  </div>
                  <span className="incident-card__sector">{formatSector(incident.sector)}</span>
                </div>

                <p className="incident-card__type">{TYPE_LABELS[incident.type] || incident.type}</p>
                {incident.vehicles && <p className="incident-card__vehicles">Véhicule: {incident.vehicles}</p>}

                {incident.description && <div className="incident-card__description">{incident.description}</div>}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default IncidentsPage
