import { HttpContext } from '@adonisjs/core/http'
import { parseGpx, gpxPointsToSvgPath } from '#services/gpx_parser'
import { fileURLToPath } from 'node:url'
import { access } from 'node:fs/promises'
import Team from '#models/team'
import pointsService from '#services/points_service'

// État en mémoire des progressions — persiste entre les requêtes
const driverProgressions = new Map<number, number>()

// Vitesse de progression simulée par team (aléatoire au démarrage)
const driverSpeeds = new Map<number, number>()

export default class LiveTimingController {
  async index({ inertia, auth }: HttpContext) {
    if (auth.user) {
      await pointsService.awardLiveTimingConsultation(auth.user)
    }

    const gpxPath = fileURLToPath(
      new URL('../../resources/circuits/circuit-du-mans.gpx', import.meta.url)
    )

    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('id', 'asc')

    const drivers = teams.map((team, idx) => ({
      id: team.id,
      team: team.name,
      pilote: team.pilote || undefined,
      carModel: team.carModel,
      accentColor: team.accentColor || '#888',
      position: idx + 1,
    }))

    let circuitPath = ''

    try {
      console.info(`[live-timing] loading GPX from ${gpxPath}`)
      await access(gpxPath)
      const gpxPoints = await parseGpx(gpxPath)
      if (gpxPoints.length === 0) {
        throw new Error(`No track points found in GPX file: ${gpxPath}`)
      }
      circuitPath = gpxPointsToSvgPath(gpxPoints)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[live-timing] GPX load failed for ${gpxPath}: ${message}`, error)
      circuitPath =
        'M 50 150 L 80 120 L 120 100 L 160 90 L 200 85 L 240 80 L 280 85 L 320 100 L 340 130 L 350 160 L 340 190 L 320 210 L 280 220 L 240 225 L 200 228 L 160 225 L 120 220 L 80 210 L 50 180 L 40 150 Z'
    }

    return inertia.render('live-timing/live-timing', {
      drivers,
      circuitPath,
    })
  }

  async apiIndex({ response }: HttpContext) {
    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('id', 'asc')

    const driversWithProgression = teams.map((team, idx) => {
      // Initialise la vitesse une seule fois par team (entre 0.003 et 0.007)
      if (!driverSpeeds.has(team.id)) {
        driverSpeeds.set(team.id, 0.003 + Math.random() * 0.004)
      }

      // Récupère la progression actuelle ou démarre à des positions décalées
      const currentProgression = driverProgressions.get(team.id) ?? idx * (1 / teams.length)

      // Avance la progression et boucle à 1.0
      const speed = driverSpeeds.get(team.id)!
      const nextProgression = (currentProgression + speed) % 1

      driverProgressions.set(team.id, nextProgression)

      // Calcule le tour complété
      const lapsCompleted = Math.floor(
        (driverProgressions.get(team.id)! + idx * (1 / teams.length)) / 1
      )

      return {
        id: team.id,
        team: team.name,
        pilote: team.pilote || undefined,
        position: idx + 1,
        carModel: team.carModel,
        lapsCompleted,
        gap: idx === 0 ? 'LEADER' : `+${(idx * 2.3 + Math.random() * 0.5).toFixed(3)}`,
        lastLap: '--:--.---',
        sectors: [
          { sector: 1, time: '--', delta: '--', status: 'normal' },
          { sector: 2, time: '--', delta: '--', status: 'normal' },
          { sector: 3, time: '--', delta: '--', status: 'normal' },
        ],
        trackProgression: nextProgression,
        accentColor: team.accentColor || '#888',
        shortName: team.pilote
          ? team.pilote
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 3)
              .toUpperCase()
          : '???',
      }
    })

    return response.json(driversWithProgression)
  }
}
