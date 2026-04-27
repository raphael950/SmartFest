import Flag from '#models/flag'
import type { HttpContext } from '@adonisjs/core/http'

const ALLOWED_COLORS = new Set(['vert', 'jaune', 'rouge'])

export default class FlagsController {
  async index({ inertia }: HttpContext) {
    const flags = await Flag.query().orderBy('created_at', 'desc')

    return inertia.render('flags', {
      flags: flags.map((flag) => ({
        id: flag.id,
        color: flag.color,
        sector: flag.sector,
        createdAt: flag.createdAt.toISO() ?? '',
      })),
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = request.only(['color', 'sector'])

    const color = this.sanitize(payload.color, ALLOWED_COLORS, 'vert')

    // Rouge = toujours tous les secteurs. Vert/Jaune = un secteur spécifique obligatoire.
    let sector: string
    if (color === 'rouge') {
      sector = 'tous'
    } else {
      const rawSector = String(payload.sector ?? '').trim()
      sector = new Set(['S1', 'S2', 'S3']).has(rawSector) ? rawSector : 'S1'
    }

    await Flag.create({ color, sector })

    return response.redirect().back()
  }

  private sanitize(value: unknown, allowed: Set<string>, fallback: string) {
    const normalized = String(typeof value === 'string' ? value : '').toLowerCase()
    return allowed.has(normalized) ? normalized : fallback
  }
}
