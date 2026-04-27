import { router } from '@inertiajs/react'
import { Clock } from 'lucide-react'
import { useState } from 'react'
import type { InertiaProps } from '@/types'
import type { Flag as FlagType, FlagColor } from '@/types/flags'
import '@/css/flags.css'

const SECTOR_OPTIONS = ['S1', 'S2', 'S3']

const COLOR_LABELS: Record<FlagColor, string> = {
  vert: 'Drapeau vert',
  jaune: 'Drapeau jaune',
  rouge: 'Drapeau rouge',
}

type FlagsPageProps = {
  flags: FlagType[]
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatSector = (sector: string) => {
  if (sector === 'tous') return 'Tous'
  return `Secteur ${sector.replace('S', '')}`
}

const FlagsPage = ({ flags }: InertiaProps<FlagsPageProps>) => {
  const [sector, setSector] = useState('S1')

  const handleSetFlag = (color: FlagColor) => {
    router.post('/drapeaux', {
      color,
      sector: color === 'rouge' ? 'tous' : sector,
    })
  }

  return (
    <section className="flags-page">
      <div className="flags-content">
        {/* Left column: form + actions */}
        <div className="flags-left">
          {/* Drapeau rouge (tous secteurs) */}
          <div className="flags-actions">
            <button
              type="button"
              className="flags-actions__btn flags-actions__btn--rouge"
              onClick={() => handleSetFlag('rouge')}
              title="Le drapeau rouge s'applique automatiquement à tous les secteurs"
            >
              Drapeau Rouge (tous secteurs)
            </button>
          </div>

          {/* Secteur + drapeaux vert/jaune */}
          <div className="flags-form">
            <div className="flags-form__field">
              <label className="flags-form__label" htmlFor="flag-sector">
                Secteur
              </label>
              <select
                id="flag-sector"
                className="flags-form__select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{formatSector(s)}</option>
                ))}
              </select>
            </div>

            <div className="flags-form__buttons">
              <button
                type="button"
                className="flags-actions__btn flags-actions__btn--vert"
                onClick={() => handleSetFlag('vert')}
              >
                Drapeau Vert
              </button>
              <button
                type="button"
                className="flags-actions__btn flags-actions__btn--jaune"
                onClick={() => handleSetFlag('jaune')}
              >
                Drapeau Jaune
              </button>
            </div>
          </div>
        </div>

        {/* Right column: history */}
        <div className="flags-history">
          <h2 className="flags-history__heading">Historique des drapeaux</h2>

          <div className="flags-history__list">
            {flags.length === 0 ? (
              <p className="flags-history__empty">Aucun drapeau enregistré.</p>
            ) : (
              flags.map((flag) => (
                <article key={flag.id} className="flag-card">
                  <div className="flag-card__header">
                    <div className="flag-card__time">
                      <Clock size={14} /> {formatTime(flag.createdAt)}
                    </div>
                    <span className={`flag-card__badge flag-card__badge--${flag.color}`}>
                      {COLOR_LABELS[flag.color] ?? flag.color}
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

export default FlagsPage
