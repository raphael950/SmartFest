import Flag from '#models/flag'
import type { HttpContext } from '@adonisjs/core/http'
import socketService, { type FlagColor } from '#services/socket_service'

const ALLOWED_COLORS: ReadonlySet<FlagColor> = new Set(['vert', 'jaune', 'rouge'])
const ALLOWED_SECTORS = new Set(['S1', 'S2', 'S3'])

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

    // Pour rouge : sector = 'tous' (cosmétique BDD uniquement)
    // Pour vert/jaune : valide le secteur
    let sector: string
    if (color === 'rouge') {
      sector = 'tous'
    } else {
      const rawSector = String(payload.sector ?? '').trim()
      sector = ALLOWED_SECTORS.has(rawSector) ? rawSector : 'S1'
    }

    // Persiste en BDD (historique)
    await Flag.create({ color, sector })

    // Met à jour l'état en mémoire et broadcast via WebSocket
    socketService.updateFlag(color, sector)

    return response.redirect().back()
  }

  private sanitize<T extends string>(value: unknown, allowed: ReadonlySet<T>, fallback: T): T {
    const normalized = String(typeof value === 'string' ? value : '').toLowerCase()
    if (allowed.has(normalized as T)) return normalized as T
    return fallback
  }
}