import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ConnectedObject extends BaseModel {
  static table = 'connected_objects'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare identifier: string

  @column()
  declare name: string

  @column()
  declare type: string

  @column()
  declare sector: string

  @column()
  declare status: 'online' | 'alert' | 'maintenance' | 'offline'

  @column()
  declare firmware: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
