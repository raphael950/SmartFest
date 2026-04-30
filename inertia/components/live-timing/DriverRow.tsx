import { ChevronRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import './live-timing.base.css'
import './DriverRow.css'
import type { Driver } from '@/types/live-timing.types'

export type LeaderboardDriver = Driver & {
  name: string
  shortName: string
  number: string
  carModel?: string
  lapsCompleted: number
  gap: string
  lastLap: string
  bestLap?: string
  sectors: Array<{ sector: number; time: string; delta: string; status: string }>
}

interface DriverRowProps {
  driver: LeaderboardDriver
  rank: number
  columnCount: number
}

export default function DriverRow({ driver, rank, columnCount }: DriverRowProps) {
  const [expanded, setExpanded] = useState(false)

  const posBadgeClass =
    rank === 1
      ? 'lt-pos-badge lt-pos-badge--1'
      : rank === 2
        ? 'lt-pos-badge lt-pos-badge--2'
        : rank === 3
          ? 'lt-pos-badge lt-pos-badge--3'
          : 'lt-pos-badge lt-pos-badge--n'

  const teamStyle = { '--team-color': driver.accentColor } as CSSProperties

  return (
    <>
      <tr
        className={`lt-driver-row${expanded ? ' lt-driver-row--active' : ''}`}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
      >
        <td className="lt-driver-cell lt-driver-cell--pos">
          <div className={posBadgeClass}>{rank}</div>
        </td>

        <td className="lt-driver-cell">
          <div className="lt-driver-team" style={teamStyle}>
            <div className="lt-driver-team-bar" aria-hidden="true" />
            <div className="lt-driver-team-meta">
              <span className="lt-driver-team-name">{driver.team}</span>
              <span className="lt-driver-team-code">{driver.carModel}</span>
            </div>
            <ChevronRight className={`lt-driver-chevron${expanded ? ' is-open' : ''}`} />
          </div>
        </td>

        <td className="lt-driver-cell lt-driver-cell--center">
          <span className="lt-driver-mono">{driver.lapsCompleted}</span>
        </td>

        <td className="lt-driver-cell lt-driver-cell--center">
          <span className={`lt-driver-mono${rank === 1 ? ' is-leader' : ''}`}>{driver.gap}</span>
        </td>
      </tr>

      <tr className={`lt-driver-detail-row${expanded ? ' is-open' : ''}`} aria-hidden={!expanded}>
        <td className="lt-driver-detail-cell" colSpan={columnCount}>
          <div className={`lt-sector-drawer${expanded ? ' lt-sector-drawer--open' : ''}`}>
            <div className="lt-driver-detail-summary">
              <div className="lt-driver-detail-card">
                <span className="lt-driver-detail-label">Pilote actuel</span>
                <span className="lt-driver-detail-value">{driver.name}</span>
              </div>
              <div className="lt-driver-detail-card">
                <span className="lt-driver-detail-label">Dernier tour</span>
                <span className="lt-driver-detail-value lt-driver-detail-value--mono">
                  {driver.lastLap}
                </span>
              </div>
              <div className="lt-driver-detail-card">
                <span className="lt-driver-detail-label">Meilleur tour</span>
                <span className="lt-driver-detail-value lt-driver-detail-value--mono">
                  {driver.bestLap ?? '--:--.---'}
                </span>
              </div>
            </div>

            <div className="lt-driver-sector-list">
              {driver.sectors.map((sector) => {
                const pillClass =
                  sector.status === 'best-overall'
                    ? 'lt-sector-pill lt-sector-pill--best-overall'
                    : sector.status === 'personal-best'
                      ? 'lt-sector-pill lt-sector-pill--pb'
                      : sector.status === 'slow'
                        ? 'lt-sector-pill lt-sector-pill--slow'
                        : sector.status === 'showing_delta'
                          ? 'lt-sector-pill lt-sector-pill--delta'
                          : sector.status === 'in_progress'
                            ? 'lt-sector-pill lt-sector-pill--in-progress'
                            : 'lt-sector-pill lt-sector-pill--normal'

                return (
                  <div key={sector.sector} className="lt-driver-sector-item">
                    <span className="lt-driver-sector-label">S{sector.sector}</span>
                    <span className={pillClass}>{sector.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </td>
      </tr>
    </>
  )
}