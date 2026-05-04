import { router } from '@inertiajs/react'
import { Clock, Flag as FlagIcon } from 'lucide-react'
import { useState } from 'react'
import type { InertiaProps } from '@/types'
import '@/css/pages/flags/flags.css'
import { Flag, FlagColor } from '@/types/flag.types.js'

const SECTOR_OPTIONS = ['S1', 'S2', 'S3']

const COLOR_LABELS: Record<FlagColor, string> = {
  vert: 'Drapeau vert',
  jaune: 'Drapeau jaune',
  rouge: 'Drapeau rouge',
}

const COLOR_INFO: Record<FlagColor, { label: string }> = {
  vert: { label: 'Drapeau Vert' },
  jaune: { label: 'Drapeau Jaune' },
  rouge: { label: 'Drapeau Rouge' },
}

type FlagsPageProps = {
  flags: Flag[]
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatSector = (sector: string) => {
  if (sector === 'tous') return 'Tous les secteurs'
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
      {/* Hero Header */}
      <header className="flags-hero">
        <div>
          <p className="flags-hero__eyebrow">Contrôle de piste</p>
          <h1 className="flags-hero__title">Drapeaux de course</h1>
          <p className="flags-hero__subtitle">
            Levez les drapeaux pour signaler l'état de la piste aux pilotes en temps réel.
          </p>
        </div>
      </header>

      <div className="flags-content">
        {/* Left column: form + actions */}
        <div className="flags-actions-panel">
          <div className="flags-section">
            <h2 className="flags-section__title">Secteur spécifique</h2>
            
            <div className="flags-form">
              <div className="flags-form__field">
                <label className="flags-form__label" htmlFor="flag-sector">
                  Sélectionner un secteur
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
                  className="flag-button flag-button--vert"
                  onClick={() => handleSetFlag('vert')}
                  title={`${COLOR_INFO.vert.label} - ${formatSector(sector)}`}
                >
                  <span className="flag-button__text">{COLOR_INFO.vert.label}</span>
                </button>
                <button
                  type="button"
                  className="flag-button flag-button--jaune"
                  onClick={() => handleSetFlag('jaune')}
                  title={`${COLOR_INFO.jaune.label} - ${formatSector(sector)}`}
                >
                  <span className="flag-button__text">{COLOR_INFO.jaune.label}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flags-section">
            <h2 className="flags-section__title">Tous les secteurs</h2>
            <button
              type="button"
              className="flag-button flag-button--rouge flag-button--full"
              onClick={() => handleSetFlag('rouge')}
              title="Le drapeau rouge s'applique automatiquement à tous les secteurs"
            >
              <span className="flag-button__text">{COLOR_INFO.rouge.label}</span>
            </button>
          </div>
        </div>
        {/* Right column: history */}
        <div className="flags-history-panel">
          <div className="flags-history-header">
            <h2 className="flags-history-header__title">
              <FlagIcon size={20} />
              Historique
            </h2>
            <span className="flags-history-header__count">{flags.length}</span>
          </div>

          <div className="flags-history__list">
            {flags.length === 0 ? (
              <div className="flags-history__empty">
                <p>Aucun drapeau enregistré</p>
              </div>
            ) : (
              flags.map((flag: Flag) => (
                <article key={flag.id} className={`flag-card flag-card--${flag.color}`}>
                  <div className="flag-card__indicator" aria-hidden="true" />
                  <div className="flag-card__content">
                    <div className="flag-card__header">
                      <div className="flag-card__badge">
                        <span>{COLOR_LABELS[flag.color as FlagColor] ?? flag.color}</span>
                      </div>
                      <time className="flag-card__time">
                        <Clock size={13} />
                        {formatTime(flag.createdAt)}
                      </time>
                    </div>
                    <div className="flag-card__meta">
                      <span className="flag-card__sector">{formatSector(flag.sector)}</span>
                    </div>
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
