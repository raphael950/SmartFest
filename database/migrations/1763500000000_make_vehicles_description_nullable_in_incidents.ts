import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'incidents'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('vehicles').nullable().alter()
      table.text('description').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('vehicles').notNullable().alter()
      table.text('description').notNullable().alter()
    })
  }
}
