import socketService, { FlagState } from '#services/socket_service'
import Team from '#models/team'
import { Driver } from '../types/driver.js'
import ConnectedObject from '../models/connected_object.js'

// ─── Constantes ───────────────────────────────────────────────────────────────

const SECTOR_THRESHOLDS = {
  s1: 1 / 3,
  s2: 2 / 3,
  finish: 1.0,
} as const

const YELLOW_SPEED = 0.0003
const randomSpeed = () => 0.00065 + Math.random() * 0.0007

// ─── Utilitaires ──────────────────────────────────────────────────────────────

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

function progressionInSector(prog: number, sector: string): boolean {
  switch (sector) {
    case 'S1': return prog >= 0 && prog < SECTOR_THRESHOLDS.s1
    case 'S2': return prog >= SECTOR_THRESHOLDS.s1 && prog < SECTOR_THRESHOLDS.s2
    case 'S3': return prog >= SECTOR_THRESHOLDS.s2 && prog < SECTOR_THRESHOLDS.finish
    default: return false
  }
}

// ─── Types internes ───────────────────────────────────────────────────────────

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
  _redFlagJoinPriority: number
  _gpsRevealPending: boolean
  /** Vrai si la vitesse de reprise a déjà été tirée pendant la neutralisation */
  _speedRerolledForRestart: boolean
}

type GpsState = {
  hasGps: boolean
  gpsActive: boolean
}

const TRACKABLE_GPS_STATUSES = new Set(['online', 'alert'])

function makeEmptyLapData() {
  return {
    lapsCompleted: 0,
    gap: '---',
    lastLap: '---',
    bestLap: '---',
    sectors: makeEmptySectors(),
  }
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

function makeEmptySectors() {
  return [
    { sector: 1, time: '--', delta: '--', status: 'normal' },
    { sector: 2, time: '--', delta: '--', status: 'normal' },
    { sector: 3, time: '--', delta: '--', status: 'normal' },
  ]
}

// ─── Service ──────────────────────────────────────────────────────────────────

export default class RaceEngineService {
  private static drivers: DriverState[] = []
  private static flagState: FlagState = { color: 'vert', sectors: [] }
  private static raceRunning: boolean = false
  private static bestOverallSector1Ms: number | null = null
  private static bestOverallSector2Ms: number | null = null
  private static bestOverallSector3Ms: number | null = null

  // ── API publique ────────────────────────────────────────────────────────────

  public static async start() {
    await this.initializeDrivers()
    setInterval(() => {
      this.updatePhysics()
      this.broadcast()
    }, 100)
  }

  public static async setFlag(flag: FlagState) {
    // Transition vers le rouge → repositionnement immédiat dans l'ordre du classement
    const previousColor = this.flagState.color
    this.flagState = flag

    if (flag.color === 'rouge' && previousColor !== 'rouge') {
      await this.refreshGpsAssignments()
      this.repositionForRedFlag()
    }
  }

  /**
   * Envoie toutes les voitures aux stands (arrêt de la course)
   */
  public static async sendAllCarsToStandby(): Promise<void> {
    this.raceRunning = false
    const total = this.drivers.length
    const now = performance.now()

    this.drivers.forEach((driver, idx) => {
      // Repositionne toutes les voitures à la ligne d'arrêt (progression 0.95-0.99)
      const newProgression = 0.95 + ((total - 1 - idx) / Math.max(total - 1, 1)) * 0.04

      driver.trackProgression = newProgression
      driver._prevProgression = newProgression
      driver.speed = randomSpeed()
      driver._speedRerolledForRestart = false
      driver._lapStartedAt = now
      driver._s1EnteredAt = null
      driver._s2EnteredAt = null
      driver._s1Crossed = false
      driver._s2Crossed = false
      driver._isFirstLap = true
      driver._sectorDisplays = [makeSectorDisplay(), makeSectorDisplay(), makeSectorDisplay()]
      driver.sectors = makeEmptySectors()

      // Réinitialise les données de tour
      driver.lapsCompleted = 0
      driver.gap = '---'
      driver.lastLap = '---'
      driver.bestLap = '---'
    })

    this.rebuildLeaderboard()
  }

  /**
   * Démarre la course
   */
  public static async startRace(): Promise<void> {
    this.raceRunning = true
  }

  /**
   * Arrête la course
   */
  public static async stopRace(): Promise<void> {
    this.raceRunning = false
  }

  public static getCurrentState(): Driver[] {
    return this.drivers.map(this.toPublicDriver)
  }

  public static async refreshFromConnectedObjects() {
    await this.refreshGpsAssignments()
    this.rebuildLeaderboard()
  }

  // ── Initialisation ──────────────────────────────────────────────────────────

  private static async initializeDrivers() {
    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('id', 'asc')
    const gpsStateByTeamId = await this.getGpsStateByTeamId()
    const now = performance.now()

    this.drivers = teams.map((team, idx) => {
      const startProgression = 0.95 + (idx / Math.max(teams.length, 1)) * 0.04
      const gpsState = gpsStateByTeamId.get(team.id) ?? { hasGps: false, gpsActive: false }

      return {
        id: team.id,
        team: team.name,
        pilote: team.pilote || undefined,
        carModel: team.carModel,
        accentColor: team.accentColor || '#888',
        shortName: team.pilote
          ? team.pilote.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()
          : '???',
        speed: randomSpeed(),
        trackProgression: startProgression,
        position: idx + 1,
        hasGps: gpsState.hasGps,
        gpsActive: gpsState.gpsActive,
        ...makeEmptyLapData(),
        _prevProgression: startProgression,
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
        _redFlagJoinPriority: 0,
        _gpsRevealPending: false,
        _speedRerolledForRestart: false,
      }
    })
  }

  private static async refreshGpsAssignments() {
    const gpsStateByTeamId = await this.getGpsStateByTeamId()

    this.drivers.forEach((driver) => {
      const previousActive = driver.gpsActive === true
      const previousHasGps = driver.hasGps === true
      const nextGpsState = gpsStateByTeamId.get(driver.id) ?? { hasGps: false, gpsActive: false }

      if (this.flagState.color !== 'rouge' && !previousHasGps && nextGpsState.hasGps) {
        driver._gpsRevealPending = true
      }

      if (this.flagState.color === 'rouge') {
        driver._gpsRevealPending = false
      }

      driver._redFlagJoinPriority = !previousActive && nextGpsState.gpsActive ? 1 : 0
      driver.hasGps = nextGpsState.hasGps
      driver.gpsActive = nextGpsState.gpsActive
    })
  }

  private static async getGpsStateByTeamId() {
    const devices = await ConnectedObject.query().where('type', 'GPS').whereNotNull('teamId')
    const stateByTeamId = new Map<number, GpsState>()

    devices.forEach((device) => {
      const current = stateByTeamId.get(device.teamId!) ?? { hasGps: false, gpsActive: false }
      stateByTeamId.set(device.teamId!, {
        hasGps: true,
        gpsActive: current.gpsActive || TRACKABLE_GPS_STATUSES.has(String(device.status)),
      })
    })

    return stateByTeamId
  }

  // ── Red flag : repositionnement dans l'ordre du classement ─────────────────
  private static repositionForRedFlag() {
    // Tri explicite sur le classement courant — ne pas faire confiance
    // à l'ordre de this.drivers qui peut être en cours de mise à jour
    const sorted = [...this.drivers].sort((a, b) => {
      const aBucket = a.gpsActive ? 0 : a.hasGps ? 1 : 2
      const bBucket = b.gpsActive ? 0 : b.hasGps ? 1 : 2
      if (aBucket !== bBucket) return aBucket - bBucket
      if ((a._redFlagJoinPriority ?? 0) !== (b._redFlagJoinPriority ?? 0))
        return (a._redFlagJoinPriority ?? 0) - (b._redFlagJoinPriority ?? 0)
      // 1. Tours complétés desc
      if ((b.lapsCompleted ?? 0) !== (a.lapsCompleted ?? 0))
        return (b.lapsCompleted ?? 0) - (a.lapsCompleted ?? 0)
      // 2. Progression desc
      if (b.trackProgression !== a.trackProgression)
        return b.trackProgression - a.trackProgression
      // 3. Position déjà calculée comme tie-breaker
      return (a.position ?? 0) - (b.position ?? 0)
    })

    const total = sorted.length
    const now = performance.now()

    sorted.forEach((driver, idx) => {
      const d = this.drivers.find((x) => x.id === driver.id)!
      // idx 0 = leader → progression la plus haute (0.99), dernier → 0.95
      const newProgression = 0.95 + ((total - 1 - idx) / Math.max(total - 1, 1)) * 0.04

      d.trackProgression = newProgression
      d._prevProgression = newProgression
      d.speed = randomSpeed()
      d._speedRerolledForRestart = true
      d._lapStartedAt = now
      d._s1EnteredAt = null
      d._s2EnteredAt = null
      d._s1Crossed = false
      d._s2Crossed = false
      d._isFirstLap = true
      d._sectorDisplays = [makeSectorDisplay(), makeSectorDisplay(), makeSectorDisplay()]
      d.sectors = makeEmptySectors()
    })
  }

  private static rebuildLeaderboard() {
    this.drivers.sort((a, b) => {
      const aBucket = a.gpsActive ? 0 : a.hasGps ? 1 : 2
      const bBucket = b.gpsActive ? 0 : b.hasGps ? 1 : 2
      if (aBucket !== bBucket) return aBucket - bBucket
      if ((a._redFlagJoinPriority ?? 0) !== (b._redFlagJoinPriority ?? 0))
        return (a._redFlagJoinPriority ?? 0) - (b._redFlagJoinPriority ?? 0)
      if ((b.lapsCompleted ?? 0) !== (a.lapsCompleted ?? 0))
        return (b.lapsCompleted ?? 0) - (a.lapsCompleted ?? 0)
      return b.trackProgression - a.trackProgression
    })

    const leader = this.drivers.find((driver) => driver.gpsActive) ?? this.drivers.find((driver) => driver.hasGps) ?? this.drivers[0]
    const leaderLapMs = leader?._lastLapMs ?? leader?._bestLapMs ?? 90_000

    this.drivers.forEach((d, idx) => {
      d.position = idx + 1
      if (!d.gpsActive) {
        d.gap = '---'
        d.lastLap = '---'
        d.bestLap = '---'
        d.sectors = makeEmptySectors()
        return
      }

      if (idx === 0) {
        d.gap = 'LEADER'
      } else {
        const lapDiff = (leader?.lapsCompleted ?? 0) - (d.lapsCompleted ?? 0)
        if (lapDiff > 0) {
          d.gap = `+${lapDiff} tour${lapDiff > 1 ? 's' : ''}`
        } else {
          const progDiff = (leader?.trackProgression ?? 0) - d.trackProgression
          d.gap = `+${formatLapTime(Math.abs(progDiff) * leaderLapMs)}`
        }
      }
    })
  }

  // ── Physique ────────────────────────────────────────────────────────────────

  private static updatePhysics() {
    const flag = this.flagState
    const now = performance.now()

    this.drivers.forEach((d) => {
      if (!d.gpsActive) {
        d._prevProgression = d.trackProgression
        d.gap = '---'
        d.lastLap = '---'
        d.bestLap = '---'
        d.sectors = makeEmptySectors()
        return
      }

      const prev = d._prevProgression

      // ── Course arrêtée : gel total (comme le drapeau rouge) ──────────
      if (!this.raceRunning) {
        d.trackProgression = prev
        d._prevProgression = prev
        return
      }

      // ── Drapeau rouge : gel total ────────────────────────────────────
      if (flag.color === 'rouge') {
        // La vitesse de reprise est déjà tirée dans repositionForRedFlag,
        // rien d'autre à faire ici — on gèle et on sort.
        d.trackProgression = prev
        d._prevProgression = prev
        return
      }

      // ── Réarmement du flag de reroll (on n'est plus sous neutralisation) ──
      // Sera remis à true si on entre dans un secteur jaune ci-dessous.
      let speedRerolledThisFrame = false

      // ── Calcul de la vitesse effective ───────────────────────────────
      let effectiveSpeed = d.speed ?? 0.0001

      if (flag.color === 'jaune') {
        const inYellowSector = flag.sectors.some((s) => progressionInSector(prev, s))

        if (inYellowSector) {
          effectiveSpeed = YELLOW_SPEED

          // Tire la vitesse de reprise une seule fois pendant le passage jaune
          if (!d._speedRerolledForRestart) {
            d.speed = randomSpeed()
            d._speedRerolledForRestart = true
          }
          speedRerolledThisFrame = true
        }
      }

      // Réarme si on n'est plus dans un secteur neutralisé
      if (!speedRerolledThisFrame) {
        d._speedRerolledForRestart = false
      }

      let next = prev + effectiveSpeed

      // ── Mise à jour des phases d'affichage secteur ───────────────────
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

      // ── Chronos en cours (défilent) ──────────────────────────────────
      if (!d._s1Crossed && d._sectorDisplays[0].phase === 'idle' && !d._isFirstLap) {
        const t = now - d._lapStartedAt
        d._sectorDisplays[0].time = formatLapTime(t)
        d._sectorDisplays[0].status = 'in_progress'
        if (d.sectors) d.sectors[0] = { sector: 1, time: formatLapTime(t), delta: '--', status: 'in_progress' }
      }

      if (d._s1Crossed && !d._s2Crossed && d._s1EnteredAt !== null && d._sectorDisplays[1].phase === 'idle') {
        const t = now - d._s1EnteredAt
        d._sectorDisplays[1].time = formatLapTime(t)
        d._sectorDisplays[1].status = 'in_progress'
        if (d.sectors) d.sectors[1] = { sector: 2, time: formatLapTime(t), delta: '--', status: 'in_progress' }
      }

      if (d._s2Crossed && d._s2EnteredAt !== null && d._sectorDisplays[2].phase === 'idle') {
        const t = now - d._s2EnteredAt
        d._sectorDisplays[2].time = formatLapTime(t)
        d._sectorDisplays[2].status = 'in_progress'
        if (d.sectors) d.sectors[2] = { sector: 3, time: formatLapTime(t), delta: '--', status: 'in_progress' }
      }

      // ── Détection franchissement S1 ──────────────────────────────────
      if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.s1) && !d._s1Crossed) {
        d._s1EnteredAt = now
        d._s1Crossed = true

        if (!d._isFirstLap) {
          const sector1Ms = now - d._lapStartedAt
          const isBestOverall = this.bestOverallSector1Ms === null || sector1Ms < this.bestOverallSector1Ms
          const isPersonalBest = d._bestSector1Ms === null || sector1Ms < d._bestSector1Ms
          const status = isBestOverall ? 'best-overall' : isPersonalBest ? 'personal-best' : 'slow'
          const delta = d._bestSector1Ms !== null ? formatDelta(sector1Ms, d._bestSector1Ms) : '--'

          if (isPersonalBest) d._bestSector1Ms = sector1Ms
          if (isBestOverall) this.bestOverallSector1Ms = sector1Ms

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

      // ── Détection franchissement S2 ──────────────────────────────────
      if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.s2) && !d._s2Crossed && d._s1EnteredAt !== null) {
        d._s2EnteredAt = now
        d._s2Crossed = true

        if (!d._isFirstLap) {
          const sector2Ms = now - d._s1EnteredAt
          const isBestOverall = this.bestOverallSector2Ms === null || sector2Ms < this.bestOverallSector2Ms
          const isPersonalBest = d._bestSector2Ms === null || sector2Ms < d._bestSector2Ms
          const status = isBestOverall ? 'best-overall' : isPersonalBest ? 'personal-best' : 'slow'
          const delta = d._bestSector2Ms !== null ? formatDelta(sector2Ms, d._bestSector2Ms) : '--'

          if (isPersonalBest) d._bestSector2Ms = sector2Ms
          if (isBestOverall) this.bestOverallSector2Ms = sector2Ms

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

      // ── Détection finish line ────────────────────────────────────────
      if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.finish) && prev > 0.5) {
        const lapMs = now - d._lapStartedAt

        if (!d._isFirstLap && d._s2EnteredAt !== null) {
          const sector3Ms = now - d._s2EnteredAt
          const isBestOverall = this.bestOverallSector3Ms === null || sector3Ms < this.bestOverallSector3Ms
          const isPersonalBest = d._bestSector3Ms === null || sector3Ms < d._bestSector3Ms
          const status = isBestOverall ? 'best-overall' : isPersonalBest ? 'personal-best' : 'slow'
          const delta = d._bestSector3Ms !== null ? formatDelta(sector3Ms, d._bestSector3Ms) : '--'

          if (isPersonalBest) d._bestSector3Ms = sector3Ms
          if (isBestOverall) this.bestOverallSector3Ms = sector3Ms

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
        d._sectorDisplays[1] = makeSectorDisplay()
        d._sectorDisplays[2] = makeSectorDisplay()

        next = next % 1
      }

      d.trackProgression = next
      d._prevProgression = next
    })

    this.rebuildLeaderboard()
  }

  // ── Broadcast ───────────────────────────────────────────────────────────────

  private static broadcast() {
    socketService.io?.emit('race_update', {
      timestamp: Date.now(),
      drivers: this.drivers.map(this.toPublicDriver),
    })
  }

  // ── Projection publique (retire les champs internes _xxx) ────────────────────

  private static toPublicDriver(d: DriverState): Driver {
    return {
      id: d.id,
      team: d.team,
      pilote: d.pilote,
      carModel: d.carModel,
      accentColor: d.accentColor,
      shortName: d.shortName,
      position: d.position,
      hasGps: d.hasGps,
      gpsActive: d.gpsActive,
      gpsRevealPending: d._gpsRevealPending,
      lapsCompleted: d.lapsCompleted,
      gap: d.gap,
      lastLap: d.lastLap,
      bestLap: d.bestLap,
      sectors: d.sectors,
      trackProgression: d.trackProgression,
    }
  }
}