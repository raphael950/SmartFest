import { useId, type CSSProperties } from 'react'
import { resolveImageSrc } from '@/lib/home_team_media'
import './CarFocusBadge.css'

interface CarFocusBadgeProps {
    anchorX: number
    anchorY: number
    badgeX: number
    badgeY: number
    badgeWidth: number
    badgeHeight: number
    scale: number
    team: string
    carModel?: string
    accentColor?: string
}

export default function CarFocusBadge({
    anchorX,
    anchorY,
    badgeX,
    badgeY,
    badgeWidth,
    badgeHeight,
    scale,
    team,
    carModel,
    accentColor,
}: CarFocusBadgeProps) {
    const labelScale = Math.sqrt(scale)
    const uid = useId()
    const bgGradientId = `${uid}-bg`
    const accentGradientId = `${uid}-accent`
    const shadowId = `${uid}-shadow`
    const carName = carModel ?? team
    const carImageSrc = resolveImageSrc(team, 'car')
    const titleX = badgeX + badgeWidth / 2
    const resolvedAccent = accentColor ?? '#ffffff'
    // Zones verticales claires dans le badge
    const padding = 8 / labelScale
    const topBarHeight = 4 / labelScale
    const chipSize = 4 / labelScale

    // Titre : après la topbar + chip, aligné verticalement au chip
    const titleY = badgeY + topBarHeight + padding + (chipSize * 2) // centré sur la ligne du chip

    // Image : centrée horizontalement, en dessous du titre
    const imageSize = 100 / labelScale
    const imageX = badgeX + (badgeWidth - imageSize) / 2
    const imageY = titleY - 20 / labelScale  // juste sous le titre

    // Chip : aligné verticalement avec le titre
    const chipCX = badgeX + 10 / labelScale
    const chipCY = titleY - 2 / labelScale  // légèrement au-dessus du baseline du texte
    const style = {
        '--lt-car-focus-accent': resolvedAccent,
    } as CSSProperties

    return (
        <g className="lt-car-focus-badge" style={style} pointerEvents="none">
            <defs>
                <linearGradient id={bgGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(24, 30, 41, 0.98)" />
                    <stop offset="100%" stopColor="rgba(9, 12, 18, 0.96)" />
                </linearGradient>
                <linearGradient id={accentGradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)" />
                    <stop offset="50%" stopColor={resolvedAccent} />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
                </linearGradient>
                <filter id={shadowId} x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0, 0, 0, 0.5)" />
                </filter>
            </defs>
            <rect
                className="lt-car-focus-badge__panel"
                x={badgeX}
                y={badgeY}
                width={badgeWidth}
                height={badgeHeight}
                rx={10 / labelScale}
                fill={`url(#${bgGradientId})`}
                stroke={`url(#${accentGradientId})`}
                strokeWidth={1.4 / scale}
                filter={`url(#${shadowId})`}
            />
            <rect
                className="lt-car-focus-badge__topbar"
                x={badgeX + 2 / labelScale}
                y={badgeY + 2 / labelScale}
                width={badgeWidth - 4 / labelScale}
                height={4 / labelScale}
                rx={2 / labelScale}
                fill={`url(#${accentGradientId})`}
                opacity={0.9}
            />
            <circle
                className="lt-car-focus-badge__chip"
                cx={chipCX}
                cy={chipCY}
                r={4 / labelScale}
                fill={resolvedAccent}
                opacity={0.95}
            />
            <text
                className="lt-car-focus-badge__title"
                x={titleX}
                y={titleY}
                textAnchor="middle"
                fontSize={10 / labelScale}
                strokeWidth={1.2 / scale}
            >
                {carName}
            </text>
            {carImageSrc ? (
                <image
                    className="lt-car-focus-badge__image"
                    href={carImageSrc}
                    x={imageX}
                    y={imageY}
                    width={imageSize}
                    height={imageSize}
                    preserveAspectRatio="xMidYMid meet"
                />
            ) : null}
            <title>{carName}</title>
            <desc>
                Focus badge anchored at {anchorX},{anchorY}
            </desc>
        </g>
    )
}