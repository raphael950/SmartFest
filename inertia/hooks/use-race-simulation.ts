import { useEffect, useRef, useState, useCallback } from 'react'
import type { Driver } from '@/types/live-timing.types'

// ─── Configuration ────────────────────────────────────────────────────────────

export const SECTOR_THRESHOLDS = {
  s1: 1 / 3,
  s2: 2 / 3,
  finish: 1.0,
} as const

// Vitesse par défaut si non fournie (tours/frame à 60fps)
const DEFAULT_SPEED = 0.0002

// ─── Types internes ───────────────────────────────────────────────────────────

export interface DriverSeed {
  id: number
  team: string
  pilote?: string
  shortName?: string
  accentColor?: string
  carModel?: string
  /** Vitesse de progression (0.003–0.007 recommandé), fournie par le back */
  speed?: number
  /** Position initiale sur le circuit (0.0→1.0), fournie par le back */
  startProgression?: number
}

interface LapState {
  lapCount: number
  lapStartedAt: number   // timestamp performance.now()
  s1EnteredAt: number | null
  s2EnteredAt: number | null
  s1SectorMs: number | null
  s2SectorMs: number | null
  lastLapMs: number | null
  bestLapMs: number | null
  prevProgression: number
  // flags pour éviter les double-détections dans un même frame
  s1Crossed: boolean
  s2Crossed: boolean
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1_000)
  const millis = Math.floor(ms % 1_000)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

function formatSectorTime(ms: number | null): string {
  if (ms === null) return '--'
  const seconds = Math.floor(ms / 1_000)
  const millis = Math.floor(ms % 1_000)
  return `${seconds}.${String(millis).padStart(3, '0')}`
}

function getSectorStatus(currentMs: number | null): string {
  if (currentMs === null) return 'normal'
  return 'normal'
}

/**
 * Détecte si le seuil `threshold` a été franchi entre `prev` et `next`,
 * en tenant compte du wrap autour de 1.0 (fin de tour → début de tour).
 */
function crossedThreshold(prev: number, next: number, threshold: number): boolean {
  if (prev <= next) {
    return prev < threshold && next >= threshold
  }
  // wrap : prev était proche de 1.0, next est proche de 0.0
  return prev < threshold || next >= threshold
}

function buildDriverFromState(seed: DriverSeed, prog: number, lap: LapState, position: number, gap: string): Driver {
  const now = performance.now()

  const s1Ms = lap.s1SectorMs
  const s2Ms = lap.s2SectorMs

  // S3 = temps depuis S2 jusqu'à maintenant (en cours) ou jusqu'à la fin du dernier tour
  const s3InProgress =
    lap.s2EnteredAt !== null ? now - lap.s2EnteredAt : null

  return {
    id: seed.id,
    team: seed.team,
    pilote: seed.pilote,
    shortName: seed.shortName,
    accentColor: seed.accentColor ?? '#888',
    carModel: seed.carModel,
    position,
    trackProgression: prog,

    lapsCompleted: lap.lapCount,
    gap,
    lastLap: lap.lastLapMs !== null ? formatLapTime(lap.lastLapMs) : '--:--.---',
  sectors: [
      {
        sector: 1,
        time: formatSectorTime(s1Ms),
        delta: '',
        status: getSectorStatus(s1Ms),
      },
      {
        sector: 2,
        time: formatSectorTime(s2Ms),
        delta: '',
        status: getSectorStatus(s2Ms),
      },
      {
        sector: 3,
        time: formatSectorTime(s3InProgress),
        delta: '',
        status: s3InProgress !== null ? 'in_progress' : 'normal',
      },
    ],
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * Simule la position et le timing de chaque pilote côté front uniquement.
 *
 * Le back (Adonis/Inertia) n'est appelé qu'une seule fois au chargement
 * pour fournir les `DriverSeed[]`. Ensuite tout est géré localement via
 * requestAnimationFrame — aucun polling, aucune requête réseau.
 *
 * @example
 * const drivers = useRaceSimulation(driverSeeds)
 */
export function useRaceSimulation(seeds: DriverSeed[]): Driver[] {
  const [drivers, setDrivers] = useState<Driver[]>(() =>
    seeds.map((s, i) => ({
      id: s.id,
      team: s.team,
      pilote: s.pilote,
      shortName: s.shortName,
      accentColor: s.accentColor ?? '#888',
      carModel: s.carModel,
      position: i + 1,

      trackProgression: s.startProgression ?? i * (1 / Math.max(seeds.length, 1)),
      lapsCompleted: 0,
      gap: i === 0 ? 'LEADER' : '--',
      lastLap: '--:--.---',
      sectors: [
        { sector: 1, time: '--', delta: '--', status: 'normal' },
        { sector: 2, time: '--', delta: '--', status: 'normal' },
        { sector: 3, time: '--', delta: '--', status: 'normal' },
      ],
    }))
  )

  // Progressions brutes en ref (pas de setState à chaque frame)
  const progressionsRef = useRef<Map<number, number>>(
    new Map(
      seeds.map((s, i) => [
        s.id,
        s.startProgression ?? i * (1 / Math.max(seeds.length, 1)),
      ])
    )
  )

  // État de lap/secteur en ref
  const lapStatesRef = useRef<Map<number, LapState>>(
    new Map(
      seeds.map((s, i) => [
        s.id,
        {
          lapCount: 0,
          lapStartedAt: performance.now(),
          s1EnteredAt: null,
          s2EnteredAt: null,
          s1SectorMs: null,
          s2SectorMs: null,
          lastLapMs: null,
          bestLapMs: null,
          prevProgression: s.startProgression ?? i * (1 / Math.max(seeds.length, 1)),
          s1Crossed: false,
          s2Crossed: false,
        },
      ])
    )
  )

  const lastFrameRef = useRef<number>(performance.now())
  const rafRef = useRef<number>(0)

  const tick = useCallback(
    (timestamp: number) => {
      const delta = Math.min(timestamp - lastFrameRef.current, 100) // cap à 100ms (onglet en arrière-plan)
      lastFrameRef.current = timestamp
      const now = performance.now()

      const rawDrivers: Array<{ seed: DriverSeed; prog: number; lap: LapState }> = []

      for (const seed of seeds) {
        const speed = seed.speed ?? DEFAULT_SPEED
        const prev = progressionsRef.current.get(seed.id)!
        const lap = lapStatesRef.current.get(seed.id)!

        // Avance proportionnelle au delta réel (normalisé pour 60fps = 16.67ms)
        const step = speed * (delta / 16.67)
        const next = (prev + step) % 1.0

        progressionsRef.current.set(seed.id, next)

        // ── Détection S1 ──────────────────────────────────────────────────
        if (!lap.s1Crossed && crossedThreshold(prev, next, SECTOR_THRESHOLDS.s1)) {
          lap.s1EnteredAt = now
          lap.s1SectorMs = now - lap.lapStartedAt
          lap.s1Crossed = true
          lap.s2Crossed = false
        }

        // ── Détection S2 ──────────────────────────────────────────────────
        if (lap.s1Crossed && !lap.s2Crossed && crossedThreshold(prev, next, SECTOR_THRESHOLDS.s2)) {
          lap.s2EnteredAt = now
          lap.s2SectorMs = lap.s1EnteredAt !== null ? now - lap.s1EnteredAt : null
          lap.s2Crossed = true
        }

        // ── Détection finish line (prog wrap autour de 1.0 → 0.0) ────────
        if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.finish) && prev > 0.5) {
          const lapMs = now - lap.lapStartedAt
          const s3Ms = lap.s2EnteredAt !== null ? now - lap.s2EnteredAt : 0
          
          // No previous sector storage needed
          
          lap.lastLapMs = lapMs
          lap.bestLapMs = lap.bestLapMs === null ? lapMs : Math.min(lap.bestLapMs, lapMs)
          lap.lapCount += 1

          // Reset pour le nouveau tour
          lap.lapStartedAt = now
          lap.s1EnteredAt = null
          lap.s2EnteredAt = null
          lap.s1SectorMs = null
          lap.s2SectorMs = null
          lap.s1Crossed = false
          lap.s2Crossed = false
        }

        lap.prevProgression = next
        rawDrivers.push({ seed, prog: next, lap })
      }

      // ── Classement : tours desc, puis progression desc ────────────────
      rawDrivers.sort((a, b) => {
        if (b.lap.lapCount !== a.lap.lapCount) return b.lap.lapCount - a.lap.lapCount
        return b.prog - a.prog
      })

      // ── Calcul des écarts ─────────────────────────────────────────────
      const leader = rawDrivers[0]
      const leaderLapMs = leader.lap.lastLapMs ?? leader.lap.bestLapMs ?? 90_000

      const finalDrivers: Driver[] = rawDrivers.map(({ seed, prog, lap }, idx) => {
        let gap: string

        if (idx === 0) {
          gap = 'LEADER'
        } else {
          const lapDiff = leader.lap.lapCount - lap.lapCount
          if (lapDiff > 0) {
            gap = `+${lapDiff} tour${lapDiff > 1 ? 's' : ''}`
          } else {
            const progDiff = leader.prog - prog
            // On estime l'écart en secondes via le dernier tour du leader
            const gapMs = Math.abs(progDiff) * leaderLapMs
            gap = `+${formatLapTime(gapMs)}`
          }
        }

        return buildDriverFromState(seed, prog, lap, idx + 1, gap)
      })

      setDrivers(finalDrivers)
      rafRef.current = requestAnimationFrame(tick)
    },
    // seeds est stable (référence Inertia, ne change pas en cours de session)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seeds]
  )

  useEffect(() => {
    lastFrameRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  return drivers
}
