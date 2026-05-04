import { useEffect, useRef, useState, useCallback } from 'react'
import type { Driver, FlagState } from '@/types/live-timing.types'
import CarFocusBadge from './CarFocusBadge'
import './TrackDisplay.css'

interface TrackDisplayProps {
  circuitPath: string
  drivers: Driver[]
  flag: FlagState
  selectedDriverIds: number[]
  onDriverClick: (id: number) => void
}

interface ViewTransform {
  x: number
  y: number
  scale: number
}

const SECTOR_COLORS = ['#ff0033df', '#ffd900da', '#1500ffc1']
const MIN_SCALE = 1
const MAX_SCALE = 8
const ZOOM_SENSITIVITY = 0.005

export default function TrackDisplay({ circuitPath, drivers, flag, selectedDriverIds, onDriverClick }: TrackDisplayProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [totalLength, setTotalLength] = useState(0)
  const [baseViewBox, setBaseViewBox] = useState({ x: 0, y: 0, w: 500, h: 300 })
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 })

  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  // Initialisation et calcul du ViewBox auto-centré
  useEffect(() => {
    if (!pathRef.current) return
    const path = pathRef.current
    const { x, y, width, height } = path.getBBox()
    const padding = 30
    setTotalLength(path.getTotalLength())
    const newBase = {
      x: x - padding,
      y: y - padding,
      w: width + padding * 2,
      h: height + padding * 2
    }
    setBaseViewBox(newBase)
    setTransform({ x: newBase.x, y: newBase.y, scale: 1 })
  }, [circuitPath])

  // Logique de Zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()

    setTransform((prev) => {
      const delta = -e.deltaY * ZOOM_SENSITIVITY
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * (1 + delta)))

      if (newScale === prev.scale) return prev

      const mouseX = ((e.clientX - rect.left) / rect.width) * (baseViewBox.w / prev.scale) + prev.x
      const mouseY = ((e.clientY - rect.top) / rect.height) * (baseViewBox.h / prev.scale) + prev.y

      const newX = mouseX - ((e.clientX - rect.left) / rect.width) * (baseViewBox.w / newScale)
      const newY = mouseY - ((e.clientY - rect.top) / rect.height) * (baseViewBox.h / newScale)

      return { scale: newScale, x: newX, y: newY }
    })
  }, [baseViewBox])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Logique de Pan (Déplacement)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (transform.scale <= 1) return // Optionnel : désactive le pan si pas de zoom
    isDragging.current = true
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !svgRef.current) return

    const dx = e.clientX - lastMousePos.current.x
    const dy = e.clientY - lastMousePos.current.y
    lastMousePos.current = { x: e.clientX, y: e.clientY }

    const rect = svgRef.current.getBoundingClientRect()
    const moveX = (dx / rect.width) * (baseViewBox.w / transform.scale)
    const moveY = (dy / rect.height) * (baseViewBox.h / transform.scale)

    setTransform((prev) => ({
      ...prev,
      x: prev.x - moveX,
      y: prev.y - moveY
    }))
  }

  const handleMouseUp = () => { isDragging.current = false }
  const handleDoubleClick = () => { setTransform({ x: baseViewBox.x, y: baseViewBox.y, scale: 1 }) }

  const getPointAt = (progression: number): DOMPoint | null => {
    if (!pathRef.current || totalLength === 0) return null
    return pathRef.current.getPointAtLength(totalLength * (progression ?? 0))
  }

  const viewBoxStr = `${transform.x} ${transform.y} ${baseViewBox.w / transform.scale} ${baseViewBox.h / transform.scale}`
  const labelScale = Math.sqrt(transform.scale)
  const trackDrivers = drivers.filter((driver) => {
    if (driver.gpsActive === true) return true
    if (driver.hasGps === true && driver.gpsRevealPending === false) return true
    return false
  })
  const pitDrivers = drivers.filter((driver) => driver.gpsRevealPending === true)
  const pitAnchor = getPointAt(0.985)

  return (
    <div className="lt-glass lt-track-container lt-panel-section">
      <div className={`lt-track-flag lt-track-flag--${flag.color}`}>
        {flag.color.toUpperCase()}
      </div>

      {transform.scale > 1.05 && (
        <button className="lt-track-zoom-reset" onClick={handleDoubleClick}>
          Réinitialiser la vue
        </button>
      )}

      <div className="lt-track-svg-wrapper">
        <svg
          ref={svgRef}
          className={`lt-track-svg ${transform.scale > 1 ? 'is-panning' : ''}`}
          viewBox={viewBoxStr}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{ cursor: isDragging.current ? 'grabbing' : transform.scale > 1 ? 'grab' : 'default' }}
        >
          {/* 1. Contour des secteurs (Couleurs) */}
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

          {/* 2. Piste principale (Noir, par-dessus les secteurs pour créer l'effet de bordure) */}
          <path
            ref={pathRef}
            d={circuitPath}
            fill="none"
            stroke="black"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 3. Pilotes */}
          {trackDrivers.map((driver) => {
            const point = getPointAt(driver.trackProgression ?? 0)
            if (!point) return null

            const dotSize = 7 / Math.sqrt(transform.scale)
            const isSelected = selectedDriverIds.includes(driver.id)
            const labelWidth = 126 / labelScale
            const labelHeight = 78 / labelScale
            const labelX = point.x - labelWidth / 2
            const labelY = point.y - dotSize * 5.8 - labelHeight

            return (
              <g
                key={driver.id}
                style={{ cursor: 'pointer', transition: 'all 0.1s linear' }}
                onClick={() => onDriverClick(driver.id)}
              >
                {isSelected && (
                  <CarFocusBadge
                    anchorX={point.x}
                    anchorY={point.y}
                    badgeX={labelX}
                    badgeY={labelY}
                    badgeWidth={labelWidth}
                    badgeHeight={labelHeight}
                    scale={transform.scale}
                    team={driver.team}
                    carModel={driver.carModel}
                    accentColor={driver.accentColor}
                  />
                )}
                <circle cx={point.x} cy={point.y} r={dotSize * 1.6} fill={driver.accentColor} opacity={0.3} />
                <circle cx={point.x} cy={point.y} r={dotSize * 1.2} fill="white" />
                <circle cx={point.x} cy={point.y} r={dotSize} fill={driver.accentColor} />
                <text
                  x={point.x}
                  y={point.y - dotSize * 2}
                  textAnchor="middle"
                  fontSize={9 / Math.sqrt(transform.scale)}
                  fontWeight="600"
                  fill="white"
                  stroke="black"
                  strokeWidth={2 / transform.scale}
                  paintOrder="stroke"
                >
                  {driver.shortName ?? driver.id}
                </text>
              </g>
            )
          })}

          {/* 4. Stand / pit lane */}
          {pitAnchor && pitDrivers.length > 0 && (
            <g opacity={0.72}>
              <text
                x={pitAnchor.x + 18}
                y={pitAnchor.y - 24}
                textAnchor="start"
                fontSize={10 / Math.sqrt(transform.scale)}
                fontWeight="700"
                fill="#c7c7c7"
                stroke="black"
                strokeWidth={1.6 / transform.scale}
                paintOrder="stroke"
              >
                PIT
              </text>

              {pitDrivers.map((driver, index) => {
                const dotSize = 5.5 / Math.sqrt(transform.scale)
                const isSelected = selectedDriverIds.includes(driver.id)
                const x = pitAnchor.x + 18
                const y = pitAnchor.y - 8 + index * (dotSize * 3.1)
                const labelWidth = 126 / labelScale
                const labelHeight = 78 / labelScale
                const labelX = x + 18
                const labelY = y - dotSize * 4.8 - labelHeight

                return (
                  <g
                    key={`pit-${driver.id}`}
                    style={{ cursor: 'pointer', transition: 'all 0.1s linear' }}
                    onClick={() => onDriverClick(driver.id)}
                  >
                    {isSelected && (
                      <CarFocusBadge
                        anchorX={x}
                        anchorY={y}
                        badgeX={labelX}
                        badgeY={labelY}
                        badgeWidth={labelWidth}
                        badgeHeight={labelHeight}
                        scale={transform.scale}
                        team={driver.team}
                        carModel={driver.carModel}
                        accentColor={driver.accentColor}
                      />
                    )}
                    <circle cx={x} cy={y} r={dotSize * 1.45} fill={driver.accentColor} opacity={0.24} />
                    <circle cx={x} cy={y} r={dotSize} fill="#202124" opacity={0.92} />
                    <circle cx={x} cy={y} r={dotSize * 0.7} fill={driver.accentColor} opacity={0.9} />
                    <text
                      x={x + dotSize * 1.8}
                      y={y + dotSize * 0.35}
                      textAnchor="start"
                      fontSize={8 / Math.sqrt(transform.scale)}
                      fontWeight="700"
                      fill="#d8d8d8"
                      stroke="black"
                      strokeWidth={1.6 / transform.scale}
                      paintOrder="stroke"
                    >
                      {driver.shortName ?? driver.id}
                    </text>
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}