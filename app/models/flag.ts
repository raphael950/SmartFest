import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Flag extends BaseModel {
  static readonly table = 'flags'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare color: string

  @column()
  declare sector: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
