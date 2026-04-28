import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('followed_team_id').unsigned().nullable().references('id').inTable('teams').onDelete('SET NULL')
      table.dropColumn('followed_team')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('followed_team', 120).nullable()
      table.dropColumn('followed_team_id')
    })
  }
}
