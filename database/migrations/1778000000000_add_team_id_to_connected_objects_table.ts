import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'connected_objects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('team_id').unsigned().nullable().references('id').inTable('teams').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['team_id'])
      table.dropColumn('team_id')
    })
  }
}