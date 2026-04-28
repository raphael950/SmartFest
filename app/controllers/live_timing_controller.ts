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
      // Mock realistic Le Mans Bugatti circuit path with proper proportions for 500x300 viewBox
      circuitPath =
        'M 50 150 L 80 120 L 120 100 L 160 90 L 200 85 L 240 80 L 280 85 L 320 100 L 340 130 L 350 160 L 340 190 L 320 210 L 280 220 L 240 225 L 200 228 L 160 225 L 120 220 L 80 210 L 50 180 L 40 150 Z'
    }

    return inertia.render('live-timing', {
      drivers,
      circuitPath,
    })
  }
}