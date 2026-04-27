import { useState } from 'react'
import { Clock, Gauge, Trophy, AlertCircle } from 'lucide-react'
import type { InertiaProps } from '~/types'
import '@/css/pages/live-timing.css'
import { LiveTimingPageProps } from '@/types/live-timing.types'

const STATUS_LABELS: Record<string, string> = {
  waiting: 'En attente',
  live: 'Session active',
  yellow: 'Drapeau jaune',
  red: 'Arrêt session',
  finished: 'Terminé',
}

const STATUS_COLORS: Record<string, string> = {
  waiting: 'status-waiting',
  live: 'status-live',
  yellow: 'status-yellow',
  red: 'status-red',
  finished: 'status-finished',
}

const DRIVER_STATUS_LABELS: Record<string, string> = {
  live: 'En piste',
  pit: 'Au stand',
  retired: 'Abandon',
}

const DRIVER_STATUS_COLORS: Record<string, string> = {
  live: 'driver-live',
  pit: 'driver-pit',
  retired: 'driver-retired',
}

export default function LiveTiming({ drivers, sessionStatus, elapsedTime, currentLap, totalLaps }: InertiaProps<LiveTimingPageProps>) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <section className="live-timing-page">
      {/* Circuit view */}
      <div className="live-timing__circuit">
        <div className="circuit-card">
          <div className="circuit-header">
            <h1>Bugatti Circuit - Le Mans</h1>
            <p>Circuit automibile Le Mans Bugatti</p>
          </div>

          <div className="circuit-visual">
            <svg viewBox="0 0 400 300" className="circuit-svg">
              {/* Circuit path - simplified Bugatti Circuit shape */}
              <path
                d="M 100 150 Q 120 80 180 60 Q 280 40 320 100 Q 340 180 320 240 Q 280 280 180 260 Q 100 250 100 150"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="circuit-path"
              />
              {/* Start/Finish line */}
              <line x1="95" y1="130" x2="105" y2="170" stroke="white" strokeWidth="3" strokeDasharray="5,5" />
              <text x="110" y="155" fontSize="12" fill="white" fontWeight="bold">
                S/F
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Session info */}
      <div className="live-timing__panel">
        <div className="session-info">
          <div className={`session-status ${STATUS_COLORS[sessionStatus]}`}>
            <div className="status-indicator" />
            <span>{STATUS_LABELS[sessionStatus]}</span>
          </div>

          <div className="session-stats">
            <div className="stat-item">
              <Clock size={16} />
              <div>
                <p className="stat-label">Temps écoulé</p>
                <p className="stat-value">{elapsedTime}</p>
              </div>
            </div>

            <div className="stat-item">
              <Gauge size={16} />
              <div>
                <p className="stat-label">Tour</p>
                <p className="stat-value">
                  {currentLap}/{totalLaps}
                </p>
              </div>
            </div>

            <div className="stat-item">
              <Trophy size={16} />
              <div>
                <p className="stat-label">Température piste</p>
                <p className="stat-value">42°C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers list */}
        <div className="drivers-list">
          <button
            type="button"
            className="drivers-list__header"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2>Classement direct</h2>
            <span className={`expand-icon ${isExpanded ? 'is-expanded' : ''}`}>▼</span>
          </button>

          {isExpanded && (
            <div className="drivers-list__content">
              {drivers.length === 0 ? (
                <div className="drivers-list__empty">
                  <AlertCircle size={24} />
                  <p>Aucun pilote en session</p>
                </div>
              ) : (
                <div className="drivers-table">
                  <div className="drivers-table__header">
                    <div className="col-pos">Pos</div>
                    <div className="col-number">#</div>
                    <div className="col-name">Pilote</div>
                    <div className="col-team">Équipe</div>
                    <div className="col-best">Meilleur tour</div>
                    <div className="col-last">Dernier tour</div>
                    <div className="col-gap">Écart</div>
                    <div className="col-status">Statut</div>
                  </div>

                  {drivers.map((driver) => (
                    <div key={driver.id} className="drivers-table__row">
                      <div className="col-pos">
                        <span className="position-badge">{driver.position}</span>
                      </div>
                      <div className="col-number">{driver.number}</div>
                      <div className="col-name">
                        <span className="driver-name">{driver.name}</span>
                      </div>
                      <div className="col-team">
                        <span className="team-name">{driver.team}</span>
                      </div>
                      <div className="col-best">
                        <span className="lap-time">{driver.bestLap}</span>
                      </div>
                      <div className="col-last">
                        <span className="lap-time">{driver.lastLap}</span>
                      </div>
                      <div className="col-gap">
                        <span className={driver.gap ? 'gap-time' : 'gap-leader'}>
                          {driver.gap || 'Leader'}
                        </span>
                      </div>
                      <div className="col-status">
                        <span className={`driver-status ${DRIVER_STATUS_COLORS[driver.status]}`}>
                          {DRIVER_STATUS_LABELS[driver.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
