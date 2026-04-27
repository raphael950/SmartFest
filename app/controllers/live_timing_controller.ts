import { HttpContext } from '@adonisjs/core/http'
import { parseGpx, gpxPointsToSvgPath } from '#services/gpx_parser'
import { fileURLToPath } from 'node:url'
import { access } from 'node:fs/promises'
import Team from '#models/team'

export default class LiveTimingController {
  async index({ inertia }: HttpContext) {
    const gpxPath = fileURLToPath(new URL('../../resources/circuits/circuit-du-mans.gpx', import.meta.url))

    // One entry per team: use the Team model and do not include any timing or session data
    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('id', 'asc')

    const drivers = teams.map((team, idx) => ({
      id: team.id,
      team: team.name,
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
        'M 100 150 Q 120 80 180 60 Q 280 40 320 100 Q 340 180 320 240 Q 280 280 180 260 Q 100 250 100 150'
    }

    return inertia.render('live-timing', {
      drivers,
      circuitPath,
    })
  }
}