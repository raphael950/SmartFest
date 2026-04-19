import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Team extends BaseModel {
  static table = 'teams'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare country: string

  @column()
  declare accentColor: string

  @column()
  declare description: string

  @column()
  declare category: string

  @column()
  declare carModel: string

  @column()
  declare teamPrincipal: string

  @column()
  declare displayOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
