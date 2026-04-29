import Flag from '#models/flag'
import type { HttpContext } from '@adonisjs/core/http'

type FlagColor = 'vert' | 'jaune' | 'rouge'
const ALLOWED_COLORS: ReadonlySet<FlagColor> = new Set(['vert', 'jaune', 'rouge'])

export default class FlagsController {
  async index({ inertia }: HttpContext) {
    const flags = await Flag.query().orderBy('created_at', 'desc')

    return inertia.render('flags/flags', {
      flags: flags.map((flag) => ({
        id: flag.id,
        color: this.sanitize(flag.color, ALLOWED_COLORS, 'vert'),
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

  private sanitize<T extends string>(value: unknown, allowed: ReadonlySet<T>, fallback: T): T {
    const normalized = String(typeof value === 'string' ? value : '').toLowerCase()
    if (allowed.has(normalized as T)) {
      return normalized as T
    }

    return fallback
  }
}
