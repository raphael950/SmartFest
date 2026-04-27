import ConnectedObject from '#models/connected_object'
import pointsService from '#services/points_service'
import type { HttpContext } from '@adonisjs/core/http'

const ALLOWED_STATUSES = new Set(['online', 'alert', 'maintenance', 'offline'])
const ALLOWED_TYPES = new Set(['CAM', 'LED'])
const ALLOWED_SECTORS = new Set(['S1', 'S2', 'S3'])

type SerializedConnectedDevice = {
  identifier: string
  name: string
  type: string
  sector: string
  status: ConnectedObject['status']
  firmware: string
  battery: number
  latencyMs: number
  signal: number
}

export default class ConnectedObjectsController {
  async index({ inertia, auth }: HttpContext) {
    if (auth.user) {
      await pointsService.awardObjectConsultation(auth.user)
    }

    const objects = await ConnectedObject.query().orderBy('id', 'desc')
    const devices: SerializedConnectedDevice[] = objects.map((device) => {
      const telemetry = this.buildTelemetry(device.identifier, device.status)

      return {
        identifier: device.identifier,
        name: device.name,
        type: device.type,
        sector: device.sector,
        status: device.status,
        firmware: device.firmware,
        battery: telemetry.battery,
        latencyMs: telemetry.latencyMs,
        signal: telemetry.signal,
      }
    })

    return inertia.render('objets', { devices })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = request.only(['name', 'type', 'sector', 'status'])
    const name = String(payload.name || '').trim()

    if (!name) {
      session.flash('error', 'Le nom de l\'objet est requis.')
      return response.redirect().back()
    }

    const type = this.sanitizeType(payload.type)
    const sector = this.sanitizeSector(payload.sector)
    const status = this.sanitizeStatus(payload.status)

    await ConnectedObject.create({
      identifier: await this.generateIdentifier(type),
      name,
      type,
      sector,
      status,
      firmware: this.generateFirmwareVersion(),
    })

    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const payload = request.only(['name', 'type', 'sector', 'status'])

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

    device.merge({
      name,
      type: this.sanitizeType(payload.type),
      sector: this.sanitizeSector(payload.sector),
      status: this.sanitizeStatus(payload.status),
    })

    await device.save()
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const device = await ConnectedObject.findBy('identifier', String(params.identifier || ''))
    if (!device) {
      session.flash('error', 'Objet introuvable.')
      return response.redirect().back()
    }

    await device.delete()
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
