import { useState, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
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

export default function LiveTiming({ drivers: initialDrivers, circuitPath }: InertiaProps<LiveTimingPageProps>) {
  const [drivers] = useState(initialDrivers)
  const pathRef = useRef<SVGPathElement | null>(null)
  const circuitRef = useRef<HTMLDivElement | null>(null)

  return (
    <section className="live-timing-page">
      {/* Circuit view - Left column */}
      <div className="live-timing__circuit">
        <div className="circuit-header">
          <h1>Bugatti Circuit - Le Mans</h1>
          <p>Circuit automibile Le Mans Bugatti</p>
        </div>

        <div className="circuit-visual" ref={circuitRef}>
          <svg viewBox="0 0 400 300" className="circuit-svg">
            {/* Circuit path - simplified Bugatti Circuit shape */}
            <defs>
              <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
                d={circuitPath}
              fill="none"
              stroke="url(#circuit-gradient)"
              strokeWidth="8"
              className="circuit-path"
            />
            {/* Start/Finish line */}
            <line x1="95" y1="130" x2="105" y2="170" stroke="white" strokeWidth="3" strokeDasharray="5,5" />
            <text x="110" y="155" fontSize="12" fill="white" fontWeight="bold">
              S/F
            </text>

              {/* No live car animation for now (static circuit only) */}
          </svg>

          {/* Session info removed per request */}
        </div>
      </div>

      {/* Drivers table - Right column */}
      <div className="live-timing__table">
        <div className="drivers-table-header">
          <h2>Classement direct</h2>
        </div>

        {drivers.length === 0 ? (
          <div className="drivers-table-empty">
            <AlertCircle size={24} />
            <p>Aucune équipe</p>
          </div>
        ) : (
          <div className="drivers-table-container">
            <div className="drivers-table">
              <div className="drivers-table__header">
                <div className="col-pos">Pos</div>
                <div className="col-team">Équipe</div>
              </div>

              {drivers.map((driver) => (
                <div key={driver.id} className="drivers-table__row">
                  <div className="col-pos">
                    <span className="position-badge">{driver.position ?? '—'}</span>
                  </div>
                  <div className="col-team">
                    <span className="team-name">{driver.team}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
