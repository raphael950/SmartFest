// app/services/race_engine_service.ts
import socketService from '#services/socket_service'
import Team from '#models/team'
import { Driver } from '../types/driver.js'

// ─── Configuration ────────────────────────────────────────────────────────────

const SECTOR_THRESHOLDS = {
  s1: 1 / 3,
  s2: 2 / 3,
  finish: 1.0,
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1_000)
  const millis = Math.floor(ms % 1_000)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

function crossedThreshold(prev: number, next: number, threshold: number): boolean {
  if (prev <= next) {
    return prev < threshold && next >= threshold
  }
  // wrap : prev était proche de 1.0, next est proche de 0.0
  return prev < threshold || next >= threshold
}

// ─── Types internes ───────────────────────────────────────────────────────────

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
  _sector1UpdatedAt: number | null
  _sector2UpdatedAt: number | null
  _sector3UpdatedAt: number | null
}

// ─── Service ──────────────────────────────────────────────────────────────────

export default class RaceEngineService {
  private static drivers: DriverState[] = []

  public static async start() {
    await this.initializeDrivers()

    setInterval(() => {
      this.updatePhysics()
      this.broadcast()
    }, 100)
  }

  /**
   * Charge les équipes depuis la BDD et initialise l'état de course.
   */
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
        ? team.pilote
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 3)
            .toUpperCase()
        : '???',
      speed: 0.0006 + Math.random() * 0.0007,
      trackProgression: idx * (1 / Math.max(teams.length, 1)),
      position: idx + 1,
      lapsCompleted: 0,
      gap: idx === 0 ? 'LEADER' : '--',
      lastLap: '--:--.---',
      sectors: [
        { sector: 1, time: '--', delta: '--', status: 'normal' },
        { sector: 2, time: '--', delta: '--', status: 'normal' },
        { sector: 3, time: '--', delta: '--', status: 'normal' },
      ],
      // État interne (non exposé aux clients)
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
      _sector1UpdatedAt: null,
      _sector2UpdatedAt: null,
      _sector3UpdatedAt: null,
    }))
  }

  /**
   * Met à jour la physique de chaque pilote (progression, secteurs, tours).
   */
  private static updatePhysics() {
    const now = performance.now()

    this.drivers.forEach((d) => {
      const prev = d._prevProgression
      const speed = d.speed ?? 0.0001
      let next = prev + speed

      // Vérifier si 1 seconde est écoulée depuis la mise à jour de chaque secteur
      const nowTime = performance.now()
      if (d.sectors) {
        if (d._sector1UpdatedAt !== null && nowTime - d._sector1UpdatedAt >= 1000) {
          d.sectors[0].status = 'normal'
          d._sector1UpdatedAt = null
        }
        if (d._sector2UpdatedAt !== null && nowTime - d._sector2UpdatedAt >= 1000) {
          d.sectors[1].status = 'normal'
          d._sector2UpdatedAt = null
        }
        if (d._sector3UpdatedAt !== null && nowTime - d._sector3UpdatedAt >= 1000) {
          d.sectors[2].status = 'normal'
          d._sector3UpdatedAt = null
        }
      }

      // ── Détection secteur 1 ─────────────────────────────────────────
      if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.s1) && !d._s1Crossed) {
        d._s1EnteredAt = now
        d._s1Crossed = true

        // Mettre à jour le temps du secteur 1 immédiatement
        if (d.sectors) {
          const sector1Ms = now - d._lapStartedAt

          // Déterminer le statut basé sur la comparaison avec le meilleur temps (AVANT mise à jour)
          let status: 'normal' | 'fast' | 'slow' = 'normal'
          if (d._bestSector1Ms !== null) {
            if (sector1Ms < d._bestSector1Ms) {
              status = 'fast' // vert
            } else if (sector1Ms > d._bestSector1Ms) {
              status = 'slow' // rouge
            } else {
              status = 'normal' // blanc
            }
          }

          // Mettre à jour le meilleur temps du secteur 1 (APRES détermination du statut)
          if (d._bestSector1Ms === null || sector1Ms < d._bestSector1Ms) {
            d._bestSector1Ms = sector1Ms
          }

          d.sectors[0] = {
            sector: 1,
            time: formatLapTime(sector1Ms),
            delta: '--',
            status: status,
          }

          // Enregistrer le moment de la mise à jour pour le reset après 1 seconde
          d._sector1UpdatedAt = nowTime
        }
      }

      // ── Détection secteur 2 ─────────────────────────────────────────
      if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.s2) && !d._s2Crossed) {
        d._s2EnteredAt = now
        d._s2Crossed = true

        // Mettre à jour le temps du secteur 2 immédiatement
        if (d.sectors && d._s1EnteredAt !== null) {
          const sector2Ms = now - d._s1EnteredAt

          // Déterminer le statut basé sur la comparaison avec le meilleur temps (AVANT mise à jour)
          let status: 'normal' | 'fast' | 'slow' = 'normal'
          if (d._bestSector2Ms !== null) {
            if (sector2Ms < d._bestSector2Ms) {
              status = 'fast' // vert
            } else if (sector2Ms > d._bestSector2Ms) {
              status = 'slow' // rouge
            } else {
              status = 'normal' // blanc
            }
          }

          // Mettre à jour le meilleur temps du secteur 2 (APRES détermination du statut)
          if (d._bestSector2Ms === null || sector2Ms < d._bestSector2Ms) {
            d._bestSector2Ms = sector2Ms
          }

          d.sectors[1] = {
            sector: 2,
            time: formatLapTime(sector2Ms),
            delta: '--',
            status: status,
          }

          // Enregistrer le moment de la mise à jour pour le reset après 1 seconde
          d._sector2UpdatedAt = nowTime
        }
      }

      // ── Détection finish line (wrap autour de 1.0) ──────────────────
      if (crossedThreshold(prev, next, SECTOR_THRESHOLDS.finish) && prev > 0.5) {
        const lapMs = now - d._lapStartedAt
        const s3Ms = d._s2EnteredAt !== null ? now - d._s2EnteredAt : 0

        d._lastLapMs = lapMs
        d._bestLapMs = d._bestLapMs === null ? lapMs : Math.min(d._bestLapMs, lapMs)
        d.lapsCompleted = (d.lapsCompleted ?? 0) + 1
        d.lastLap = formatLapTime(lapMs)

        // Mise à jour du secteur 3 uniquement
        if (d.sectors) {
          const sector3Ms = d._s2EnteredAt !== null ? now - d._s2EnteredAt : 0

          // Déterminer le statut basé sur la comparaison avec le meilleur temps (AVANT mise à jour)
          let status: 'normal' | 'fast' | 'slow' = 'normal'
          if (d._bestSector3Ms !== null) {
            if (sector3Ms < d._bestSector3Ms) {
              status = 'fast' // vert
            } else if (sector3Ms > d._bestSector3Ms) {
              status = 'slow' // rouge
            } else {
              status = 'normal' // blanc
            }
          }

          // Mettre à jour le meilleur temps du secteur 3 (APRES détermination du statut)
          if (d._bestSector3Ms === null || sector3Ms < d._bestSector3Ms) {
            d._bestSector3Ms = sector3Ms
          }

          d.sectors[2] = {
            sector: 3,
            time: formatLapTime(sector3Ms),
            delta: '--',
            status: status,
          }

          // Enregistrer le moment de la mise à jour pour le reset après 1 seconde
          d._sector3UpdatedAt = nowTime
        }

        // Reset pour le nouveau tour
        d._lapStartedAt = now
        d._s1EnteredAt = null
        d._s2EnteredAt = null
        d._s1Crossed = false
        d._s2Crossed = false

        // Wrap la progression
        next = next % 1
      }

      d.trackProgression = next
      d._prevProgression = next
    })

    // ── Classement : tours desc, puis progression desc ──────────────
    this.drivers.sort((a, b) => {
      if ((b.lapsCompleted ?? 0) !== (a.lapsCompleted ?? 0)) {
        return (b.lapsCompleted ?? 0) - (a.lapsCompleted ?? 0)
      }
      return b.trackProgression - a.trackProgression
    })

    // ── Calcul des écarts ───────────────────────────────────────────
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

  /**
   * Diffuse l'état actuel à tous les clients connectés.
   */
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
      sectors: d.sectors,
      trackProgression: d.trackProgression,
    }))

    socketService.io?.emit('race_update', {
      timestamp: Date.now(),
      drivers: publicDrivers,
    })
  }

  /**
   * Retourne l'état public actuel (pour les nouveaux connections via initial_state).
   */
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
      sectors: d.sectors,
      trackProgression: d.trackProgression,
    }))
  }
}
