import socketService from '#services/socket_service'
import Team from '#models/team'
import { Driver } from '../types/driver.js'

const SECTOR_THRESHOLDS = {
  s1: 1 / 3,
  s2: 2 / 3,
  finish: 1.0,
}

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1_000)
  const millis = Math.floor(ms % 1_000)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

function crossedThreshold(prev: number, next: number, threshold: number): boolean {
  if (prev <= next) return prev < threshold && next >= threshold
  return prev < threshold || next >= threshold
}

function formatDelta(sectorMs: number, bestSectorMs: number): string {
  const deltaMs = sectorMs - bestSectorMs
  const sign = deltaMs > 0 ? '+' : '-'
  return `${sign}${formatLapTime(Math.abs(deltaMs))}`
}

// Phase d'affichage du secteur après franchissement
type SectorPhase = 'idle' | 'showing_delta' | 'showing_time'

interface SectorDisplay {
  phase: SectorPhase
  time: string
  delta: string
  status: string
  phaseStartedAt: number | null
  finalTime: string
  finalDelta: string
  finalStatus: string
}

interface DriverState extends Driver {
  _prevProgression: number
  _lapStartedAt: number
  _s1EnteredAt: number | null
  _s2EnteredAt: number | null
  _s1Crossed: boolean
  _s2Crossed: boolean
  _lastLapMs: number | null
  _bestLapMs: number | null
  _bestSector1Ms: number | null
  _bestSector2Ms: number | null
  _bestSector3Ms: number | null
  _sectorDisplays: [SectorDisplay, SectorDisplay, SectorDisplay]
  _isFirstLap: boolean
}

function makeSectorDisplay(): SectorDisplay {
  return {
    phase: 'idle',
    time: '--',
    delta: '--',
    status: 'normal',
    phaseStartedAt: null,
    finalTime: '--',
    finalDelta: '--',
    finalStatus: 'normal',
  }
}

export default class RaceEngineService {
  private static drivers: DriverState[] = []
  private static bestOverallSector1Ms: number | null = null
  private static bestOverallSector2Ms: number | null = null
  private static bestOverallSector3Ms: number | null = null

  public static async start() {
    await this.initializeDrivers()
    setInterval(() => {
      this.updatePhysics()
      this.broadcast()
    }, 100)
  }

  private static async initializeDrivers() {
    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('id', 'asc')
    const now = performance.now()

    this.drivers = teams.map((team, idx) => ({
      id: team.id,
      team: team.name,
      pilote: team.pilote || undefined,
      carModel: team.carModel,
      accentColor: team.accentColor || '#888',
      shortName: team.pilote
        ? team.pilote.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()
        : '???',
      speed: 0.0006 + Math.random() * 0.0007,
      trackProgression: idx * (1 / Math.max(teams.length, 1)),
      position: idx + 1,
      lapsCompleted: 0,
      gap: idx === 0 ? 'LEADER' : '--',
      lastLap: '--:--.---',
      bestLap: '--:--.---',
      sectors: [
        { sector: 1, time: '--', delta: '--', status: 'normal' },
        { sector: 2, time: '--', delta: '--', status: 'normal' },
        { sector: 3, time: '--', delta: '--', status: 'normal' },
      ],
      _prevProgression: idx * (1 / Math.max(teams.length, 1)),
      _lapStartedAt: now,
      _s1EnteredAt: null,
      _s2EnteredAt: null,
      _s1Crossed: false,
      _s2Crossed: false,
      _lastLapMs: null,
      _bestLapMs: null,
      _bestSector1Ms: null,
      _bestSector2Ms: null,
      _bestSector3Ms: null,
      _sectorDisplays: [makeSectorDisplay(), makeSectorDisplay(), makeSectorDisplay()],
      _isFirstLap: true,
    }))
  }

 private static updatePhysics() {
  const now = performance.now()

  this.drivers.forEach((d) => {
    const prev = d._prevProgression
    const speed = d.speed ?? 0.0001
    let next = prev + speed

    // ── Mise à jour des phases d'affichage secteur ──────────────────
    d._sectorDisplays.forEach((sd, i) => {
      if (sd.phase === 'showing_delta' && sd.phaseStartedAt !== null) {
        if (now - sd.phaseStartedAt >= 1000) {
          sd.phase = 'showing_time'
          sd.time = sd.finalTime
          sd.delta = sd.finalDelta
          sd.status = sd.finalStatus
          sd.phaseStartedAt = null
        }
      }

      if (d.sectors) {
        d.sectors[i] = {
          sector: i + 1,
          time: sd.time,
          delta: sd.delta,
          status: sd.status,
        }
      }
    })

    // ── Chronos en cours (défilent) ─────────────────────────────────
    if (!d._s1Crossed && d._sectorDisplays[0].phase === 'idle' && !d._isFirstLap) {
      const s1InProgress = now - d._lapStartedAt
      d._sectorDisplays[0].time = formatLapTime(s1InProgress)
      d._sectorDisplays[0].status = 'in_progress'
      if (d.sectors) {
        d.sectors[0] = { sector: 1, time: formatLapTime(s1InProgress), delta: '--', status: 'in_progress' }
      }
    }

    if (d._s1Crossed && !d._s2Crossed && d._s1EnteredAt !== null && d._sectorDisplays[1].phase === 'idle') {
      const s2InProgress = now - d._s1EnteredAt
      d._sectorDisplays[1].time = formatLapTime(s2InProgress)
      d._sectorDisplays[1].status = 'in_progress'
      if (d.sectors) {
        d.sectors[1] = { sector: 2, time: formatLapTime(s2InProgress), delta: '--', status: 'in_progress' }
      }
    }

    if (d._s2Crossed && d._s2EnteredAt !== null && d._sectorDisplays[2].phase === 'idle') {
      const s3InProgress = now - d._s2EnteredAt
      d._sectorDisplays[2].time = formatLapTime(s3InProgress)
      d._sectorDisplays[2].status = 'in_progress'
      if (d.sectors) {
        d.sectors[2] = { sector: 3, time: formatLapTime(s3InProgress), delta: '--', status: 'in_progress' }
      }
    }

    // ── Détection franchissement S1 ─────────────────────────────────
    if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.s1) && !d._s1Crossed) {
      d._s1EnteredAt = now
      d._s1Crossed = true

      if (!d._isFirstLap) {
        const sector1Ms = now - d._lapStartedAt

        const isBestOverall =
          RaceEngineService.bestOverallSector1Ms === null ||
          sector1Ms < RaceEngineService.bestOverallSector1Ms
        const isPersonalBest = d._bestSector1Ms === null || sector1Ms < d._bestSector1Ms

        const status = isBestOverall
          ? 'best-overall'
          : isPersonalBest
            ? 'personal-best'
            : 'slow'

        const delta = d._bestSector1Ms !== null ? formatDelta(sector1Ms, d._bestSector1Ms) : '--'

        if (isPersonalBest) d._bestSector1Ms = sector1Ms
        if (isBestOverall) RaceEngineService.bestOverallSector1Ms = sector1Ms

        const sd = d._sectorDisplays[0]
        sd.phase = 'showing_delta'
        sd.phaseStartedAt = now
        sd.time = delta
        sd.delta = delta
        sd.status = status
        sd.finalTime = formatLapTime(sector1Ms)
        sd.finalDelta = delta
        sd.finalStatus = status
      }

      d._sectorDisplays[1] = makeSectorDisplay()
    }

    // ── Détection franchissement S2 ─────────────────────────────────
    if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.s2) && !d._s2Crossed && d._s1EnteredAt !== null) {
      d._s2EnteredAt = now
      d._s2Crossed = true

      if (!d._isFirstLap) {
        const sector2Ms = now - d._s1EnteredAt

        const isBestOverall =
          RaceEngineService.bestOverallSector2Ms === null ||
          sector2Ms < RaceEngineService.bestOverallSector2Ms
        const isPersonalBest = d._bestSector2Ms === null || sector2Ms < d._bestSector2Ms

        const status = isBestOverall
          ? 'best-overall'
          : isPersonalBest
            ? 'personal-best'
            : 'slow'

        const delta = d._bestSector2Ms !== null ? formatDelta(sector2Ms, d._bestSector2Ms) : '--'

        if (isPersonalBest) d._bestSector2Ms = sector2Ms
        if (isBestOverall) RaceEngineService.bestOverallSector2Ms = sector2Ms

        const sd = d._sectorDisplays[1]
        sd.phase = 'showing_delta'
        sd.phaseStartedAt = now
        sd.time = delta
        sd.delta = delta
        sd.status = status
        sd.finalTime = formatLapTime(sector2Ms)
        sd.finalDelta = delta
        sd.finalStatus = status
      }

      d._sectorDisplays[2] = makeSectorDisplay()
    }

    // ── Détection finish line ───────────────────────────────────────
    if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.finish) && prev > 0.5) {
      const lapMs = now - d._lapStartedAt

      if (!d._isFirstLap && d._s2EnteredAt !== null) {
        const sector3Ms = now - d._s2EnteredAt

        const isBestOverall =
          RaceEngineService.bestOverallSector3Ms === null ||
          sector3Ms < RaceEngineService.bestOverallSector3Ms
        const isPersonalBest = d._bestSector3Ms === null || sector3Ms < d._bestSector3Ms

        const status = isBestOverall
          ? 'best-overall'
          : isPersonalBest
            ? 'personal-best'
            : 'slow'

        const delta = d._bestSector3Ms !== null ? formatDelta(sector3Ms, d._bestSector3Ms) : '--'

        if (isPersonalBest) d._bestSector3Ms = sector3Ms
        if (isBestOverall) RaceEngineService.bestOverallSector3Ms = sector3Ms

        const sd = d._sectorDisplays[2]
        sd.phase = 'showing_delta'
        sd.phaseStartedAt = now
        sd.time = delta
        sd.delta = delta
        sd.status = status
        sd.finalTime = formatLapTime(sector3Ms)
        sd.finalDelta = delta
        sd.finalStatus = status

        d._lastLapMs = lapMs
        const isBestLap = d._bestLapMs === null || lapMs < d._bestLapMs
        if (isBestLap) d._bestLapMs = lapMs
        d.lapsCompleted = (d.lapsCompleted ?? 0) + 1
        d.lastLap = formatLapTime(lapMs)
        d.bestLap = formatLapTime(d._bestLapMs!)
      }

      d._isFirstLap = false
      d._lapStartedAt = now
      d._s1EnteredAt = null
      d._s2EnteredAt = null
      d._s1Crossed = false
      d._s2Crossed = false
      d._sectorDisplays[0] = makeSectorDisplay()

      next = next % 1
    }

    d.trackProgression = next
    d._prevProgression = next
  })

  // ── Classement ──────────────────────────────────────────────────
  this.drivers.sort((a, b) => {
    if ((b.lapsCompleted ?? 0) !== (a.lapsCompleted ?? 0)) {
      return (b.lapsCompleted ?? 0) - (a.lapsCompleted ?? 0)
    }
    return b.trackProgression - a.trackProgression
  })

  const leader = this.drivers[0]
  const leaderLapMs = leader._lastLapMs ?? leader._bestLapMs ?? 90_000

  this.drivers.forEach((d, idx) => {
    d.position = idx + 1
    if (idx === 0) {
      d.gap = 'LEADER'
    } else {
      const lapDiff = (leader.lapsCompleted ?? 0) - (d.lapsCompleted ?? 0)
      if (lapDiff > 0) {
        d.gap = `+${lapDiff} tour${lapDiff > 1 ? 's' : ''}`
      } else {
        const progDiff = leader.trackProgression - d.trackProgression
        const gapMs = Math.abs(progDiff) * leaderLapMs
        d.gap = `+${formatLapTime(gapMs)}`
      }
    }
  })
}

  private static broadcast() {
    const publicDrivers: Driver[] = this.drivers.map((d) => ({
      id: d.id,
      team: d.team,
      pilote: d.pilote,
      carModel: d.carModel,
      accentColor: d.accentColor,
      shortName: d.shortName,
      position: d.position,
      lapsCompleted: d.lapsCompleted,
      gap: d.gap,
      lastLap: d.lastLap,
      bestLap: d.bestLap,
      sectors: d.sectors,
      trackProgression: d.trackProgression,
    }))

    socketService.io?.emit('race_update', {
      timestamp: Date.now(),
      drivers: publicDrivers,
    })
  }

  public static getCurrentState(): Driver[] {
    return this.drivers.map((d) => ({
      id: d.id,
      team: d.team,
      pilote: d.pilote,
      carModel: d.carModel,
      accentColor: d.accentColor,
      shortName: d.shortName,
      position: d.position,
      lapsCompleted: d.lapsCompleted,
      gap: d.gap,
      lastLap: d.lastLap,
      bestLap: d.bestLap,
      sectors: d.sectors,
      trackProgression: d.trackProgression,
    }))
  }
}