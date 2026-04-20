import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Incident extends BaseModel {
  static readonly table = 'incidents'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: string

  @column()
  declare vehicles: string

  @column()
  declare severity: string

  @column()
  declare sector: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
