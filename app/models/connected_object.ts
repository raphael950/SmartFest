import { DateTime } from 'luxon'
import Team from '#models/team'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

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

  @column()
  declare teamId: number | null

  @column()
  declare isDeletionRequested: boolean

  @column()
  declare requestedDeletionByUserId: number | null

  @belongsTo(() => Team, { foreignKey: 'teamId' })
  declare team: BelongsTo<typeof Team>

  @belongsTo(() => User, { foreignKey: 'requestedDeletionByUserId' })
  declare requestedDeletionByUser: BelongsTo<typeof User>
}
