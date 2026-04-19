import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class RaceEvent extends BaseModel {
  static table = 'events'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare status: 'live' | 'upcoming'

  @column()
  declare accentColor: string

  @column()
  declare displayOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
