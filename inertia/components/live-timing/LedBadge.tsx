import type { LiveTimingLed } from '@/types/live-timing.types'

type LedBadgeProps = {
  led: LiveTimingLed
  scale: number
  x: number
  y: number
  onClick: () => void
  sectorFlagKind?: 'chequered' | 'rouge' | 'jaune' | 'vert'
}

const STATUS_CLASS: Record<LiveTimingLed['status'], string> = {
  online: 'online',
  alert: 'alert',
  maintenance: 'maintenance',
  offline: 'offline',
}

export default function LedBadge({ led, scale, x, y, onClick, sectorFlagKind }: LedBadgeProps) {
  const size = 10 / Math.sqrt(scale)
  const textSize = 8.5 / Math.sqrt(scale)

  return (
    <g
      className={`lt-led-badge lt-led-badge--${STATUS_CLASS[led.status]}`}
      transform={`translate(${x}, ${y})`}
      style={{ cursor: 'pointer' }}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <title>{led.name}</title>
      <rect
        className="lt-led-badge__glow"
        x={-size * 1.35}
        y={-size * 1.35}
        width={size * 2.7}
        height={size * 2.7}
        rx={size * 0.75}
        ry={size * 0.75}
      />
      <rect
        className={`lt-led-badge__tile ${sectorFlagKind ? `lt-led-badge__tile--${sectorFlagKind}` : ''}`}
        x={-size}
        y={-size}
        width={size * 2}
        height={size * 2}
        rx={size * 0.5}
        ry={size * 0.5}
      />
      <text
        className="lt-led-badge__label"
        x={0}
        y={size * 2.1}
        textAnchor="middle"
        fontSize={textSize}
        fontWeight={800}
      >
        LED
      </text>
    </g>
  )
}