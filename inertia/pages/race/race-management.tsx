import { router } from '@inertiajs/react'
import { Clock } from 'lucide-react'
import { useState } from 'react'
import type { InertiaProps } from '@/types'
import '@/css/pages/race/race-management.css'
import { Flag, FlagColor } from '@/types/flag.types.js'
import type { RaceState } from '@/types/race-state.types.js'

const SECTOR_OPTIONS = ['S1', 'S2', 'S3']

const COLOR_LABELS: Record<FlagColor, string> = {
  vert: 'Drapeau vert',
  jaune: 'Drapeau jaune',
  rouge: 'Drapeau rouge',
}

type RaceManagementPageProps = {
  flags: Flag[]
  raceState: RaceState
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatSector = (sector: string) => {
  if (sector === 'tous') return 'Tous'
  return `Secteur ${sector.replace('S', '')}`
}

const RaceManagementPage = ({ flags, raceState }: InertiaProps<RaceManagementPageProps>) => {
  const [sector, setSector] = useState('S1')
  const isRaceRunning = raceState.status === 'running'

  const handleSetFlag = (color: FlagColor) => {
    router.post('/course', {
      color,
      sector: color === 'rouge' ? 'tous' : sector,
    })
  }

  const handleStartRace = () => {
    router.post('/course/start')
  }

  const handleStopRace = () => {
    router.post('/course/stop')
  }

  return (
    <section className="race-management-page">
      <div className="race-management-content">
        {/* Left column: form + actions */}
        <div className="race-management-left">
          {/* Race control button - Checkered flag */}
          <div className="race-control">
            <button
              type="button"
              className={`race-control__btn ${isRaceRunning ? 'race-control__btn--stop' : 'race-control__btn--start'}`}
              onClick={isRaceRunning ? handleStopRace : handleStartRace}
              title={isRaceRunning ? 'Arrêter la course' : 'Démarrer la course'}
            >
              <span className="race-control__pattern"></span>
              <span className="race-control__text">
                {isRaceRunning ? 'ARRÊTER LA COURSE' : 'DÉMARRER LA COURSE'}
              </span>
            </button>
            <div className="race-control__status">
              <span className={`race-control__indicator ${isRaceRunning ? 'race-control__indicator--running' : 'race-control__indicator--stopped'}`}></span>
              <span className="race-control__label">
                {isRaceRunning ? 'Course en cours' : 'Course arrêtée'}
              </span>
            </div>
          </div>

          {/* Drapeau rouge (tous secteurs) */}
          <div className="race-actions">
            <button
              type="button"
              className="race-actions__btn race-actions__btn--rouge"
              onClick={() => handleSetFlag('rouge')}
              title="Le drapeau rouge s'applique automatiquement à tous les secteurs"
            >
              Drapeau Rouge (tous secteurs)
            </button>
          </div>

          {/* Secteur + drapeaux vert/jaune */}
          <div className="race-form">
            <div className="race-form__field">
              <label className="race-form__label" htmlFor="race-sector">
                Secteur
              </label>
              <select
                id="race-sector"
                className="race-form__select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{formatSector(s)}</option>
                ))}
              </select>
            </div>

            <div className="race-form__buttons">
              <button
                type="button"
                className="race-actions__btn race-actions__btn--vert"
                onClick={() => handleSetFlag('vert')}
              >
                Drapeau Vert
              </button>
              <button
                type="button"
                className="race-actions__btn race-actions__btn--jaune"
                onClick={() => handleSetFlag('jaune')}
              >
                Drapeau Jaune
              </button>
            </div>
          </div>
        </div>

        {/* Right column: history */}
        <div className="race-history">
          <h2 className="race-history__heading">Historique des drapeaux</h2>

          <div className="race-history__list">
            {flags.length === 0 ? (
              <p className="race-history__empty">Aucun drapeau enregistré.</p>
            ) : (
              flags.map((flag: Flag) => (
                <article key={flag.id} className="flag-card">
                  <div className="flag-card__header">
                    <div className="flag-card__time">
                      <Clock size={14} /> {formatTime(flag.createdAt)}
                    </div>
                    <span className={`flag-card__badge flag-card__badge--${flag.color}`}>
                      {COLOR_LABELS[flag.color as FlagColor] ?? flag.color}
                    </span>
                  </div>
                  <div className="flag-card__details">
                    <span>Secteur: <strong>{formatSector(flag.sector)}</strong></span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RaceManagementPage
