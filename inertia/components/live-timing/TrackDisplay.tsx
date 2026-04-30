import { useEffect, useRef, useState } from 'react'
import type { Driver, FlagState } from '@/types/live-timing.types'
import './TrackDisplay.css'

interface TrackDisplayProps {
  circuitPath: string
  drivers: Driver[]
  flag: FlagState
}

const SECTOR_COLORS = ['#ff0033df', '#ffd900da', '#1500ffc1']


const FLAG_LABELS: Record<string, string> = {
  vert: 'Vert',
  jaune: 'Jaune',
  rouge: 'Rouge',
}

const FLAG_CSS_CLASSES: Record<string, string> = {
  vert: 'lt-track-flag lt-track-flag--vert',
  jaune: 'lt-track-flag lt-track-flag--jaune',
  rouge: 'lt-track-flag lt-track-flag--rouge',
}

export default function TrackDisplay({ circuitPath, drivers, flag }: TrackDisplayProps) {
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

  const getPointAt = (progression: number): DOMPoint | null => {
    if (!pathRef.current || totalLength === 0) return null
    const clamped = Math.max(0, Math.min(1, progression))
    return pathRef.current.getPointAtLength(totalLength * clamped)
  }

  const flagLabel =
  flag.color === 'jaune' && flag.sectors.length === 3
    ? 'FULL COURSE YELLOW'
    : flag.color === 'rouge' || flag.sectors.length === 0
      ? FLAG_LABELS[flag.color]
      : `${FLAG_LABELS[flag.color]} — ${flag.sectors.join(', ')}`
  return (
    <div className="lt-glass lt-track-container lt-panel-section">
      <div className={FLAG_CSS_CLASSES[flag.color] ?? 'lt-track-flag lt-track-flag--vert'}>
        {flagLabel}
      </div>

      <div className="lt-track-svg-wrapper">
        <svg className="lt-track-svg" preserveAspectRatio="xMidYMid meet" viewBox={viewBox}>

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

          <path
            ref={pathRef}
            d={circuitPath}
            fill="none"
            stroke="black"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {drivers.map((driver) => {
            const point = getPointAt(driver.trackProgression ?? 0)
            if (!point) return null
            return (
              <g key={driver.id}>
                <circle cx={point.x} cy={point.y} r={12} fill={driver.accentColor ?? '#888'} opacity={0.25} />
                <circle cx={point.x} cy={point.y} r={9} fill="white" />
                <circle cx={point.x} cy={point.y} r={7} fill={driver.accentColor ?? '#888'} />
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