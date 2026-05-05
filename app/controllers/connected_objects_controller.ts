import ConnectedObject from '#models/connected_object'
import Team from '#models/team'
import pointsService from '#services/points_service'
import socketService from '#services/socket_service'
import type { HttpContext } from '@adonisjs/core/http'

const ALLOWED_STATUSES = new Set(['online', 'alert', 'maintenance', 'offline'])
const ALLOWED_TYPES = new Set(['CAM', 'LED', 'GPS'])
const ALLOWED_SECTORS = new Set(['S1', 'S2', 'S3'])

type SerializedConnectedDevice = {
  id: number
  identifier: string
  name: string
  type: string
  sector: string
  status: ConnectedObject['status']
  firmware: string
  battery: number
  latencyMs: number
  signal: number
  teamId: number | null
  teamName: string | null
  isDeletionRequested: boolean
  requestedDeletionByUserName: string | null
}

type TeamOption = {
  id: number
  name: string
  isGpsOccupied: boolean
}

export default class ConnectedObjectsController {
  async index({ inertia, auth }: HttpContext) {
    if (auth.user) {
      await pointsService.awardObjectConsultation(auth.user)
    }

    const objects = await ConnectedObject.query()
      .preload('team', (query) => query.select(['id', 'name']))
      .preload('requestedDeletionByUser', (query) => query.select(['id', 'email', 'fullName', 'pseudo']))
      .orderBy('id', 'desc')

    const teams: TeamOption[] = (await Team.query().select(['id', 'name']).orderBy('name', 'asc')).map((team) => ({
      id: team.id,
      name: team.name,
      isGpsOccupied: objects.some((device) => device.type === 'GPS' && device.teamId === team.id),
    }))

    const devices: SerializedConnectedDevice[] = objects.map((device) => {
      const telemetry = this.buildTelemetry(device.identifier, device.status)

      return {
        id: device.id,
        identifier: device.identifier,
        name: device.name,
        type: device.type,
        sector: device.sector,
        status: device.status,
        firmware: device.firmware,
        battery: telemetry.battery,
        latencyMs: telemetry.latencyMs,
        signal: telemetry.signal,
        teamId: device.teamId,
        teamName: device.team?.name ?? null,
        isDeletionRequested: device.isDeletionRequested,
        requestedDeletionByUserName:
          device.isDeletionRequested && device.requestedDeletionByUser
            ? device.requestedDeletionByUser.fullName || device.requestedDeletionByUser.pseudo || device.requestedDeletionByUser.email
            : null,
      }
    })

    const pendingDeletionRequests = objects
      .filter((obj) => obj.isDeletionRequested)
      .map((obj) => ({
        id: obj.id,
        identifier: obj.identifier,
        name: obj.name,
        requestedBy: obj.requestedDeletionByUser?.fullName || obj.requestedDeletionByUser?.pseudo || obj.requestedDeletionByUser?.email || 'Utilisateur inconnu',
      }))

    return inertia.render('objets/objets', { devices, teams, pendingDeletionRequests })
  }

  async indexAdmin({ inertia }: HttpContext) {
    const objects = await ConnectedObject.query()
      .where('is_deletion_requested', true)
      .preload('team', (query) => query.select(['id', 'name']))
      .preload('requestedDeletionByUser', (query) => query.select(['id', 'email', 'fullName', 'pseudo']))
      .orderBy('id', 'desc')

    const devices: SerializedConnectedDevice[] = objects.map((device) => {
      const telemetry = this.buildTelemetry(device.identifier, device.status)

      return {
        id: device.id,
        identifier: device.identifier,
        name: device.name,
        type: device.type,
        sector: device.sector,
        status: device.status,
        firmware: device.firmware,
        battery: telemetry.battery,
        latencyMs: telemetry.latencyMs,
        signal: telemetry.signal,
        teamId: device.teamId,
        teamName: device.team?.name ?? null,
        isDeletionRequested: device.isDeletionRequested,
        requestedDeletionByUserName:
          device.isDeletionRequested && device.requestedDeletionByUser
            ? device.requestedDeletionByUser.fullName || device.requestedDeletionByUser.pseudo || device.requestedDeletionByUser.email
            : null,
      }
    })

    const stats = {
      total: objects.length,
      oldestRequest: objects.length > 0 ? objects[objects.length - 1].createdAt.toISO() : null,
    }

    return inertia.render('admin/objets', { devices, stats })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = request.only(['name', 'type', 'sector', 'status', 'teamId'])
    const name = String(payload.name || '').trim()

    if (!name) {
      session.flash('error', 'Le nom de l\'objet est requis.')
      return response.redirect().back()
    }

    const type = this.sanitizeType(payload.type)
    const sector = this.sanitizeSector(payload.sector)
    const status = this.sanitizeStatus(payload.status)
    const teamId = await this.sanitizeTeamId(payload.teamId, type)

    if (type === 'GPS' && !teamId) {
      session.flash('error', 'Une equipe proprietaire est requise pour un objet GPS.')
      return response.redirect().back()
    }

    await ConnectedObject.create({
      identifier: await this.generateIdentifier(type),
      name,
      type,
      sector,
      status,
      firmware: this.generateFirmwareVersion(),
      teamId,
    })

    await socketService.refreshLiveTiming()

    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const payload = request.only(['name', 'type', 'sector', 'status', 'teamId'])

    const device = await ConnectedObject.findBy('identifier', String(params.identifier || ''))
    if (!device) {
      session.flash('error', 'Objet introuvable.')
      return response.redirect().back()
    }

    const name = String(payload.name || '').trim()
    if (!name) {
      session.flash('error', 'Le nom de l\'objet est requis.')
      return response.redirect().back()
    }

    const type = this.sanitizeType(payload.type)
    const nextStatus = this.sanitizeStatus(payload.status)
    const teamId = await this.sanitizeTeamId(payload.teamId, type, device.identifier)

    if (type === 'GPS' && !teamId) {
      session.flash('error', 'Une equipe proprietaire est requise pour un objet GPS.')
      return response.redirect().back()
    }

    device.merge({
      name,
      type,
      sector: this.sanitizeSector(payload.sector),
      status: nextStatus,
      teamId,
    })

    await device.save()
    if (device.type === 'CAM') {
      socketService.updateCamera(device.id, device.status, device.sector)
    } else if (device.type === 'LED') {
      socketService.updateLed(device.id, device.status, device.sector)
    }
    await socketService.refreshLiveTiming()
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const device = await ConnectedObject.findBy('identifier', String(params.identifier || ''))
    if (!device) {
      session.flash('error', 'Objet introuvable.')
      return response.redirect().back()
    }

    await device.delete()
    await socketService.refreshLiveTiming()
    return response.redirect().back()
  }

  async requestDestroy({ params, auth, response, session }: HttpContext) {
    const device = await ConnectedObject.findBy('identifier', String(params.identifier || ''))
    if (!device) {
      session.flash('error', 'Objet introuvable.')
      return response.redirect().back()
    }

    const user = auth.user
    if (!user) {
      session.flash('error', 'Vous devez etre connecte pour demander une suppression.')
      return response.redirect().back()
    }

    if (device.isDeletionRequested) {
      session.flash('error', 'Une demande de suppression est deja en attente pour cet objet.')
      return response.redirect().back()
    }

    device.isDeletionRequested = true
    device.requestedDeletionByUserId = user.id
    await device.save()

    session.flash('success', 'Demande de suppression envoyee. En attente de validation administrateur.')
    return response.redirect().back()
  }

  async approveDestroy({ params, response, session }: HttpContext) {
    const device = await ConnectedObject.find(params.id)
    if (!device) {
      session.flash('error', 'Objet introuvable.')
      return response.redirect().back()
    }

    await device.delete()
    await socketService.refreshLiveTiming()
    session.flash('success', 'Suppression validee par administrateur.')
    return response.redirect().back()
  }

  async rejectDestroy({ params, response, session }: HttpContext) {
    const device = await ConnectedObject.find(params.id)
    if (!device) {
      session.flash('error', 'Objet introuvable.')
      return response.redirect().back()
    }

    device.isDeletionRequested = false
    device.requestedDeletionByUserId = null
    await device.save()

    session.flash('success', 'Demande de suppression rejetee.')
    return response.redirect().back()
  }

  private sanitizeStatus(status: unknown) {
    const normalized = String(status || '').toLowerCase()
    return ALLOWED_STATUSES.has(normalized) ? (normalized as ConnectedObject['status']) : 'online'
  }

  private sanitizeType(type: unknown) {
    const normalized = String(type || '').toUpperCase()
    return ALLOWED_TYPES.has(normalized) ? normalized : 'CAM'
  }

  private sanitizeSector(sector: unknown) {
    const normalized = String(sector || '').toUpperCase()
    return ALLOWED_SECTORS.has(normalized) ? normalized : 'S1'
  }

  private async sanitizeTeamId(teamId: unknown, type: string, currentIdentifier?: string) {
    if (type !== 'GPS') {
      return null
    }

    const parsed = Number.parseInt(String(teamId ?? ''), 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null
    }

    const team = await Team.find(parsed)
    if (!team) {
      return null
    }

    const occupiedByGpsQuery = ConnectedObject.query().where('type', 'GPS').where('team_id', team.id)
    if (currentIdentifier) {
      occupiedByGpsQuery.whereNot('identifier', currentIdentifier)
    }

    const occupiedByGps = await occupiedByGpsQuery.first()

    return occupiedByGps ? null : team.id
  }

  private async generateIdentifier(type: string) {
    const prefix = type.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'DEV'

    let identifier = `${prefix}-${this.getRandomInt(100, 999)}`
    while (await ConnectedObject.findBy('identifier', identifier)) {
      identifier = `${prefix}-${this.getRandomInt(100, 999)}`
    }

    return identifier
  }

  private generateFirmwareVersion() {
    return `v${this.getRandomInt(1, 5)}.${this.getRandomInt(0, 9)}.${this.getRandomInt(0, 9)}`
  }

  private buildTelemetry(identifier: string, status: ConnectedObject['status']) {
    const seed = identifier
      .split('')
      .reduce((accumulator, character, index) => accumulator + character.charCodeAt(0) * (index + 1), status.length * 97)

    const battery = this.clamp(18 + (seed % 83), 0, 100)
    const latencyMs = 5 + ((seed >> 2) % 220)
    const signal = this.clamp(42 + ((seed >> 4) % 59), 0, 100)

    return { battery, latencyMs, signal }
  }

  private clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max))
  }

  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
