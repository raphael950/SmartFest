import { useEffect, useRef, useState } from 'react'
import type { Driver } from '@/types/live-timing.types'
import { SECTOR_THRESHOLDS } from '@/hooks/use-race-simulation'
import './TrackDisplay.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrackDisplayProps {
  circuitPath: string
  drivers: Driver[]
}

// ─── Marqueurs de seuil (S1, S2, ligne d'arrivée) ────────────────────────────

const SECTOR_MARKERS = [
  { progression: SECTOR_THRESHOLDS.s1,     label: 'S2', color: '#ffd900' },
  { progression: SECTOR_THRESHOLDS.s2,     label: 'S3', color: '#1500ff' },
  { progression: SECTOR_THRESHOLDS.finish, label: 'FL', color: '#ffffff' },
] as const

// ─── Couleurs des arcs de secteur ─────────────────────────────────────────────

const SECTOR_COLORS = ['#ff0033df', '#ffd900da', '#1500ffc1'] as const

// ─── Composant ────────────────────────────────────────────────────────────────

export default function TrackDisplay({ circuitPath, drivers }: TrackDisplayProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const [totalLength, setTotalLength] = useState(0)
  const [viewBox, setViewBox] = useState('0 0 500 300')

  useEffect(() => {
    if (!pathRef.current) return
    const path = pathRef.current
    const { x, y, width, height } = path.getBBox()
    const padding = 24
    setTotalLength(path.getTotalLength())
    if (width > 0 && height > 0) {
      setViewBox(`${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`)
    }
  }, [circuitPath])

  /**
   * Retourne le point SVG correspondant à une progression (0.0→1.0) sur le chemin.
   */
  const getPointAt = (progression: number): DOMPoint | null => {
    if (!pathRef.current || totalLength === 0) return null
    const clamped = Math.max(0, Math.min(1, progression))
    return pathRef.current.getPointAtLength(totalLength * clamped)
  }

  return (
    <div className="lt-glass lt-track-container lt-panel-section">
      <div className="lt-track-flag">Vert</div>

      <div className="lt-track-svg-wrapper">
        <svg className="lt-track-svg" preserveAspectRatio="xMidYMid meet" viewBox={viewBox}>

          {/* ── Arcs de secteur (S1, S2, S3) ── */}
          {SECTOR_COLORS.map((color, i) => (
            <path
              key={i}
              d={circuitPath}
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={`${totalLength / 3} ${totalLength}`}
              strokeDashoffset={-(totalLength / 3) * i}
            />
          ))}

          {/* ── Tracé principal (par-dessus les arcs) ── */}
          <path
            ref={pathRef}
            d={circuitPath}
            fill="none"
            stroke="black"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* ── Marqueurs S2 / S3 / Finish Line ── */}
          {SECTOR_MARKERS.map(({ progression, label, color }) => {
            const point = getPointAt(progression)
            if (!point) return null
            return (
              <g key={label}>
                {/* Croix de marqueur */}
                <line
                  x1={point.x - 6} y1={point.y - 6}
                  x2={point.x + 6} y2={point.y + 6}
                  stroke={color} strokeWidth="2.5" strokeLinecap="round"
                />
                <line
                  x1={point.x + 6} y1={point.y - 6}
                  x2={point.x - 6} y2={point.y + 6}
                  stroke={color} strokeWidth="2.5" strokeLinecap="round"
                />
                {/* Halo blanc pour la lisibilité */}
                <circle cx={point.x} cy={point.y} r={8} fill="none" stroke="black" strokeWidth="3" opacity="0.4" />
                {/* Label */}
                <text
                  x={point.x}
                  y={point.y - 12}
                  textAnchor="middle"
                  fontSize="6"
                  fontWeight="700"
                  fill={color}
                  stroke="black"
                  strokeWidth="2"
                  paintOrder="stroke"
                >
                  {label}
                </text>
              </g>
            )
          })}

          {/* ── Voitures ── */}
          {drivers.map((driver) => {
            const point = getPointAt(driver.trackProgression ?? 0)
            if (!point) return null
            return (
              <g key={driver.id}>
                {/* Halo d'équipe (légère aura colorée) */}
                <circle cx={point.x} cy={point.y} r={12} fill={driver.accentColor ?? '#888'} opacity={0.25} />
                {/* Corps */}
                <circle cx={point.x} cy={point.y} r={9} fill="white" />
                <circle cx={point.x} cy={point.y} r={7} fill={driver.accentColor ?? '#888'} />
                {/* Nom court */}
                <text
                  x={point.x}
                  y={point.y - 14}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="600"
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                  paintOrder="stroke"
                >
                  {driver.shortName ?? driver.pilote}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}