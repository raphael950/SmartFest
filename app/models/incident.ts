import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { IncidentSector, IncidentSeverity, IncidentType } from '#models/incident.types'

export default class Incident extends BaseModel {
  static readonly table = 'incidents'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: IncidentType

  @column()
  declare vehicles: string

  @column()
  declare severity: IncidentSeverity

  @column()
  declare sector: IncidentSector

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
