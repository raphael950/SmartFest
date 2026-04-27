import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flags'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('incident_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('incident_id').unsigned().nullable().references('id').inTable('incidents').onDelete('SET NULL')
    })
  }
}
