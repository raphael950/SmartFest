import Incident from '#models/incident'
import Team from '#models/team'
import {
  INCIDENT_SECTORS,
  INCIDENT_SEVERITIES,
  INCIDENT_TYPES,
  type IncidentSector,
  type IncidentSeverity,
  type IncidentType,
} from '#models/incident.types'

const ALLOWED_TYPES: ReadonlySet<IncidentType> = new Set(INCIDENT_TYPES)
const ALLOWED_SEVERITIES: ReadonlySet<IncidentSeverity> = new Set(INCIDENT_SEVERITIES)
const ALLOWED_SECTORS: ReadonlySet<IncidentSector> = new Set(INCIDENT_SECTORS)
import type { HttpContext } from '@adonisjs/core/http'

export default class IncidentsController {
  async index({ inertia }: HttpContext) {
    const [incidents, teams] = await Promise.all([
      Incident.query().orderBy('created_at', 'desc'),
      Team.query().select('id', 'name', 'carModel').orderBy('display_order', 'asc').orderBy('id', 'asc'),
    ])

    return inertia.render('incidents/incidents', {
      incidents: incidents.map((incident) => ({
        id: incident.id,
        type: incident.type,
        vehicles: incident.vehicles,
        severity: incident.severity,
        sector: incident.sector,
        description: incident.description,
        createdAt: incident.createdAt.toISO() ?? '',
        updatedAt: incident.updatedAt?.toISO() ?? null,
      })),
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        carModel: team.carModel,
      })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = request.only(['type', 'vehicles', 'severity', 'sector', 'description']) as Partial<
      Record<'type' | 'vehicles' | 'severity' | 'sector' | 'description', unknown>
    >

    const type = this.sanitize(payload.type, ALLOWED_TYPES, 'autre')
    const vehicles = String(payload.vehicles || '').trim()
    const severity = this.sanitize(payload.severity, ALLOWED_SEVERITIES, 'leger')
    const sector = this.sanitize(payload.sector, ALLOWED_SECTORS, 'S1')
    const description = String(payload.description || '').trim()

    if (!vehicles) {
      session.flash('error', 'Les véhicules impliqués sont requis.')
      return response.redirect().back()
    }

    if (!description) {
      session.flash('error', 'La description est requise.')
      return response.redirect().back()
    }

    await Incident.create({ type, vehicles, severity, sector, description })

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
