import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Driver, FlagState, LiveTimingCamera, LiveTimingLed } from '@/types/live-timing.types'
import type { RaceState } from '@/types/race-state.types'
import CameraPlayer from './CameraPlayer'
import CarFocusBadge from './CarFocusBadge'
import LedBadge from './LedBadge'
import TrackObjectModal from './TrackObjectModal'
import '@/css/components/live-timing/TrackDisplay.css'
import '@/css/components/live-timing/TrackCamera.css'

const VIDEO_URLS = {
  S1: '/videos/sector1.mp4',
  S2: '/videos/sector2.mp4',
  S3: '/videos/sector3.mp4',
}

interface TrackDisplayProps {
  circuitPath: string
  drivers: Driver[]
  cameras: LiveTimingCamera[]
  leds: LiveTimingLed[]
  flag: FlagState
  raceState?: RaceState
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
const CAMERA_SECTOR_BASE: Record<string, number> = {
  S1: 0.12,
  S2: 0.46,
  S3: 0.79,
}
const CAMERA_SECTOR_OFFSET: Record<string, number> = {
  S1: 42,
  S2: 38,
  S3: 44,
}

const LED_SECTOR_BASE: Record<string, number> = {
  S1: 0.08,
  S2: 0.41,
  S3: 0.74,
}

const LED_SECTOR_OFFSET : Record<string, number> = {
  S1: 30,
  S2: 28,
  S3: 32,
}

export default function TrackDisplay({ circuitPath, drivers, cameras, leds, flag, raceState, selectedDriverIds, onDriverClick }: TrackDisplayProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [totalLength, setTotalLength] = useState(0)
  const [baseViewBox, setBaseViewBox] = useState({ x: 0, y: 0, w: 500, h: 300 })
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 })
  const [activeCameraId, setActiveCameraId] = useState<number | null>(null)
  const [activeLedId, setActiveLedId] = useState<number | null>(null)
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!pathRef.current) return
    const path = pathRef.current
    const { x, y, width, height } = path.getBBox()
    const padding = 30
    setTotalLength(path.getTotalLength())
    const newBase = { x: x - padding, y: y - padding, w: width + padding * 2, h: height + padding * 2 }
    setBaseViewBox(newBase)
    setTransform({ x: newBase.x, y: newBase.y, scale: 1 })
  }, [circuitPath])

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (transform.scale <= 1) return
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
    setTransform((prev) => ({ ...prev, x: prev.x - moveX, y: prev.y - moveY }))
  }

  const handleMouseUp = () => { isDragging.current = false }
  const handleDoubleClick = () => { setTransform({ x: baseViewBox.x, y: baseViewBox.y, scale: 1 }) }

  const getPointAt = (progression: number): DOMPoint | null => {
    if (!pathRef.current || totalLength === 0) return null
    return pathRef.current.getPointAtLength(totalLength * (progression ?? 0))
  }

  const getTrackFrame = (progression: number) => {
    if (!pathRef.current || totalLength === 0) return null
    const normalized = ((progression % 1) + 1) % 1
    const delta = 0.003
    const previous = pathRef.current.getPointAtLength(totalLength * (((normalized - delta) % 1) + 1) % 1)
    const next = pathRef.current.getPointAtLength(totalLength * (((normalized + delta) % 1) + 1) % 1)
    const point = pathRef.current.getPointAtLength(totalLength * normalized)
    const dx = next.x - previous.x
    const dy = next.y - previous.y
    const length = Math.sqrt(dx * dx + dy * dy) || 1
    return {
      point,
      normalX: -dy / length,
      normalY: dx / length,
    }
  }

  const getPitLaneAnchor = () => {
    if (!pathRef.current || totalLength === 0) return null
    const finishProg = 0.985
    const epsilon = 0.005
    const p1 = pathRef.current.getPointAtLength(totalLength * (finishProg - epsilon))
    const p2 = pathRef.current.getPointAtLength(totalLength * (finishProg + epsilon))
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const tx = dx / len
    const ty = dy / len
    const perpX = ty
    const perpY = -tx
    const finishPoint = pathRef.current.getPointAtLength(totalLength * finishProg)
    const offset = -50
    const angleRad = (-13 * Math.PI) / 180
    return {
      baseX: finishPoint.x + perpX * offset - 115,
      baseY: finishPoint.y + perpY * offset,
      alongX: Math.cos(angleRad),
      alongY: Math.sin(angleRad),
    }
  }

  const viewBoxStr = `${transform.x} ${transform.y} ${baseViewBox.w / transform.scale} ${baseViewBox.h / transform.scale}`
  const labelScale = Math.sqrt(transform.scale)

  const pitDrivers = drivers.filter((driver) => driver.gpsRevealPending === true)
  const pitDriverIds = new Set(pitDrivers.map((d) => d.id))
  const trackDrivers = drivers.filter((driver) => {
    if (pitDriverIds.has(driver.id)) return false
    if (driver.gpsActive === true) return true
    if (driver.hasGps === true && driver.gpsRevealPending === false) return true
    return false
  })
  const pitAnchor = getPitLaneAnchor()

  const isRaceStopped = raceState?.status === 'stopped'
  const activeCamera = cameras.find((camera) => camera.id === activeCameraId) ?? null
  const activeLed = leds.find((led) => led.id === activeLedId) ?? null

  const getSectorFlagState = (sector: string) => {
    if (isRaceStopped) {
      return {
        kind: 'chequered' as const,
        label: 'Course arrêtée',
      }
    }

    if (flag.color === 'rouge') {
      return {
        kind: 'rouge' as const,
        label: 'Drapeau rouge',
      }
    }

    if (flag.color === 'jaune' && flag.sectors.includes(sector)) {
      return {
        kind: 'jaune' as const,
        label: `Drapeau jaune secteur ${sector.replace('S', '')}`,
      }
    }

    return {
      kind: 'vert' as const,
      label: 'Drapeau vert',
    }
  }

  // ── Modal drag ──────────────────────────────────────────────────────────────
  const modalDragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 })
  const [modalDragging, setModalDragging] = useState(false)

  useEffect(() => {
    if (!activeCamera) return
    const width = Math.min(420, window.innerWidth - 28)
    const height = 352
    setModalPos({
      x: Math.max(16, window.innerWidth - width - 16),
      y: Math.max(16, window.innerHeight - height - 16),
    })
  }, [activeCamera?.id])

  useEffect(() => {
    if (!activeLed) return
    const width = Math.min(320, window.innerWidth - 28)
    const height = 180
    setModalPos({
      x: Math.max(16, window.innerWidth - width - 16),
      y: Math.max(16, window.innerHeight - height - 16),
    })
  }, [activeLed?.id])

  useEffect(() => {
    if (!modalDragging) return
    const handlePointerMove = (event: PointerEvent) => {
      const drag = modalDragRef.current
      if (!drag) return
      setModalPos({
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      })
    }
    const handlePointerUp = () => {
      setModalDragging(false)
      modalDragRef.current = null
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [modalDragging])

  const startModalDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    modalDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: modalPos.x,
      originY: modalPos.y,
    }
    setModalDragging(true)
  }

  // ── Camera markers ──────────────────────────────────────────────────────────
  const CAMERA_VIDEO_BY_SECTOR: Record<string, string> = VIDEO_URLS as Record<string, string>

  const cameraMarkers = cameras
    .filter((camera) => camera.type === 'CAM')
    .reduce<Record<string, LiveTimingCamera[]>>((accumulator, camera) => {
      if (!accumulator[camera.sector]) accumulator[camera.sector] = []
      accumulator[camera.sector].push(camera)
      return accumulator
    }, {})

  const cameraElements = Object.entries(cameraMarkers).flatMap(([sector, sectorCameras]) =>
    sectorCameras.map((camera, index) => {
      const sectorBase = CAMERA_SECTOR_BASE[sector] ?? 0.12
      const sectorOffset = CAMERA_SECTOR_OFFSET[sector] ?? 40
      const progression = sectorBase + (index - (Math.max(sectorCameras.length, 1) - 1) / 2) * 0.02
      const frame = getTrackFrame(progression)
      if (!frame) return []
      const position = {
        x: frame.point.x + frame.normalX * (sectorOffset / Math.sqrt(transform.scale)),
        y: frame.point.y + frame.normalY * (sectorOffset / Math.sqrt(transform.scale)),
      }
      const size = 4 / Math.sqrt(transform.scale)
      return (
        <g
          key={camera.identifier}
          transform={`translate(${position.x}, ${position.y})`}
          style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation()
            setActiveLedId(null)
            setActiveCameraId(camera.id)
          }}
        >
          <circle cx={0} cy={0} r={size} fill="rgba(34,197,94,0.9)" stroke="#051122" strokeWidth={1 / transform.scale} />
          <text x={size * 1.8} y={size * 0.8} fontSize={9 / Math.sqrt(transform.scale)} fontWeight={700} fill="#fff" stroke="#000" strokeWidth={1 / transform.scale} paintOrder="stroke">CAM</text>
        </g>
      )
    }),
  )

  const ledMarkers = leds
    .filter((led) => led.type === 'LED')
    .reduce<Record<string, LiveTimingLed[]>>((accumulator, led) => {
      if (!accumulator[led.sector]) accumulator[led.sector] = []
      accumulator[led.sector].push(led)
      return accumulator
    }, {})

  const ledElements = Object.entries(ledMarkers).flatMap(([sector, sectorLeds]) =>
    sectorLeds.map((led, index) => {
      const sectorBase = LED_SECTOR_BASE[sector] ?? 0.08
      const sectorOffset = LED_SECTOR_OFFSET[sector] ?? 30
      const progression = sectorBase + (index - (Math.max(sectorLeds.length, 1) - 1) / 2) * 0.015
      const frame = getTrackFrame(progression)
      if (!frame) return []
      const position = {
        x: frame.point.x + frame.normalX * (sectorOffset / Math.sqrt(transform.scale)),
        y: frame.point.y + frame.normalY * (sectorOffset / Math.sqrt(transform.scale)),
      }
      const sectorFlag = getSectorFlagState(led.sector)
      return (
        <LedBadge
          key={led.identifier}
          led={led}
          scale={transform.scale}
          x={position.x}
          y={position.y}
          sectorFlagKind={sectorFlag.kind}
          onClick={() => {
            setActiveCameraId(null)
            setActiveLedId(led.id)
          }}
        />
      )
    }),
  )

  // ── Modal via portal (rendu dans document.body, hors de toute hiérarchie CSS) ──
  const cameraModal = activeCamera
    ? createPortal(
        <div
          className="lt-camera-modal"
          style={{ left: `${modalPos.x}px`, top: `${modalPos.y}px` }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="lt-camera-modal__header" onPointerDown={startModalDrag}>
            <div className="lt-camera-modal__title-wrap">
              <span className="lt-camera-modal__badge">LIVE</span>
              <div>
                <p className="lt-camera-modal__title">{activeCamera.name}</p>
                <p className="lt-camera-modal__subtitle">
                  Secteur {activeCamera.sector.replace('S', '')} · {activeCamera.status.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="lt-camera-modal__close"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setActiveCameraId(null)
              }}
              aria-label="Fermer la vidéo"
            >
              ✕
            </button>
          </div>
          <div className="lt-camera-modal__body">
            <CameraPlayer
              camera={activeCamera}
              sourceUrl={CAMERA_VIDEO_BY_SECTOR[activeCamera.sector] ?? VIDEO_URLS.S1}
              raceState={raceState}
            />
            <div className="lt-camera-modal__footer">
              <span className="lt-camera-modal__meta lt-camera-modal__meta--muted">Glisser l'en-tête pour déplacer</span>
            </div>
          </div>
        </div>,
        document.body
      )
    : null

  const ledModal = activeLed
    ? (() => {
        const sectorFlag = getSectorFlagState(activeLed.sector)
        return (
          <TrackObjectModal
            variant="led"
            badge="LED"
            title={activeLed.name}
            subtitle={`Secteur ${activeLed.sector.replace('S', '')} · ${activeLed.status.toUpperCase()}`}
            position={modalPos}
            onClose={() => setActiveLedId(null)}
            onHeaderPointerDown={startModalDrag}
            footer={<span className="lt-track-modal__meta lt-track-modal__meta--muted">Glisser l'en-tête pour déplacer</span>}
          >
            <div className="lt-led-modal">
              <div className="lt-led-modal__state">
                <div className={`lt-led-modal__tile lt-led-modal__tile--${sectorFlag.kind} ${sectorFlag.kind === 'jaune' || sectorFlag.kind === 'rouge' ? 'lt-led-modal__tile--blink' : ''}`} aria-hidden="true" />
                <div>
                  <p className="lt-led-modal__state-title">{sectorFlag.label}</p>
                  <p className="lt-led-modal__state-text">
                    {activeLed.status === 'offline'
                      ? 'La LED est hors-ligne : informations désactivées.'
                      : isRaceStopped
                        ? 'La LED est en mode arrêt de course.'
                        : 'La LED suit le drapeau du secteur en temps réel.'}
                  </p>
                </div>
              </div>
            </div>
          </TrackObjectModal>
        )
      })()
    : null

  return (
    <div className="lt-glass lt-track-container lt-panel-section">
      <div className={isRaceStopped ? 'lt-track-flag lt-track-flag--chequered' : `lt-track-flag lt-track-flag--${flag.color}`}>
        {isRaceStopped ? 'Course arrêtée' : flag.color.toUpperCase()}
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
          {/* 1. Secteurs */}
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

          {/* 2. Piste principale */}
          <path
            ref={pathRef}
            d={circuitPath}
            fill="none"
            stroke="black"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 3. Pilotes sur la piste */}
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
              <g key={driver.id} style={{ cursor: 'pointer', transition: 'all 0.1s linear' }} onClick={() => onDriverClick(driver.id)}>
                {isSelected && (
                  <CarFocusBadge
                    anchorX={point.x} anchorY={point.y}
                    badgeX={labelX} badgeY={labelY}
                    badgeWidth={labelWidth} badgeHeight={labelHeight}
                    scale={transform.scale}
                    team={driver.team} carModel={driver.carModel} accentColor={driver.accentColor}
                  />
                )}
                <circle cx={point.x} cy={point.y} r={dotSize * 1.6} fill={driver.accentColor} opacity={0.3} />
                <circle cx={point.x} cy={point.y} r={dotSize * 1.2} fill="white" />
                <circle cx={point.x} cy={point.y} r={dotSize} fill={driver.accentColor} />
                <text
                  x={point.x} y={point.y - dotSize * 2}
                  textAnchor="middle"
                  fontSize={9 / Math.sqrt(transform.scale)}
                  fontWeight="600" fill="white" stroke="black"
                  strokeWidth={2 / transform.scale} paintOrder="stroke"
                >
                  {driver.shortName ?? driver.id}
                </text>
              </g>
            )
          })}

          {cameraElements}
          {ledElements}

          {/* 4. Pit lane */}
          {pitAnchor && pitDrivers.length > 0 && (
            <g opacity={0.85}>
              <text
                x={pitAnchor.baseX - pitAnchor.alongX * 6}
                y={pitAnchor.baseY - pitAnchor.alongY * 6 - 8 / Math.sqrt(transform.scale)}
                textAnchor="middle"
                fontSize={8 / Math.sqrt(transform.scale)}
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
                const spacing = dotSize * 2.5
                const x = pitAnchor.baseX + pitAnchor.alongX * index * spacing
                const y = pitAnchor.baseY + pitAnchor.alongY * index * spacing
                const isSelected = selectedDriverIds.includes(driver.id)
                const labelWidth = 126 / labelScale
                const labelHeight = 78 / labelScale
                return (
                  <g
                    key={`pit-${driver.id}`}
                    style={{ cursor: 'pointer', transition: 'all 0.1s linear' }}
                    onClick={() => onDriverClick(driver.id)}
                  >
                    {isSelected && (
                      <CarFocusBadge
                        anchorX={x} anchorY={y}
                        badgeX={x - labelWidth / 2}
                        badgeY={y - dotSize * 4.8 - labelHeight}
                        badgeWidth={labelWidth} badgeHeight={labelHeight}
                        scale={transform.scale}
                        team={driver.team} carModel={driver.carModel} accentColor={driver.accentColor}
                      />
                    )}
                    <circle cx={x} cy={y} r={dotSize * 1.45} fill={driver.accentColor} opacity={0.24} />
                    <circle cx={x} cy={y} r={dotSize} fill="#202124" opacity={0.92} />
                    <circle cx={x} cy={y} r={dotSize * 0.7} fill={driver.accentColor} opacity={0.9} />
                    <text
                      x={x} y={y + dotSize * 2.2}
                      textAnchor="middle"
                      fontSize={7 / Math.sqrt(transform.scale)}
                      fontWeight="700" fill="#d8d8d8" stroke="black"
                      strokeWidth={1.6 / transform.scale} paintOrder="stroke"
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

      {/* Portal — rendu dans document.body, échappe à overflow:hidden et backdrop-filter */}
      {cameraModal}
      {ledModal}
    </div>
  )
}