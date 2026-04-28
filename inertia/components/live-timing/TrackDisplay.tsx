import { useEffect, useRef, useState } from 'react'
import './TrackDisplay.css'

interface TrackDisplayProps {
  circuitPath: string
}

export default function TrackDisplay({ circuitPath }: TrackDisplayProps) {
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

  return (
    <div className="lt-glass lt-track-container lt-panel-section">
      <div className="lt-track-flag">Vert</div>
      <div className="lt-track-svg-wrapper">
        <svg className="lt-track-svg" preserveAspectRatio="xMidYMid meet" viewBox={viewBox}>
          {/* Secteur 1 */}
          <path
            d={circuitPath}
            fill="none"
            stroke="#ff0033df"
            strokeWidth="9"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={`${totalLength / 3} ${totalLength}`}
            strokeDashoffset={0}
          />

          {/* Secteur 2 */}
          <path
            d={circuitPath}
            fill="none"
            stroke="#ffd900da"
            strokeWidth="9"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={`${totalLength / 3} ${totalLength}`}
            strokeDashoffset={-totalLength / 3}
          />

          {/* Secteur 3 */}
          <path
            d={circuitPath}
            fill="none"
            stroke="#1500ffc1"
            strokeWidth="9"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={`${totalLength / 3} ${totalLength}`}
            strokeDashoffset={-(totalLength * 2) / 3}
          />

          <path
            ref={pathRef}
            d={circuitPath}
            fill="none"
            stroke="black"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
