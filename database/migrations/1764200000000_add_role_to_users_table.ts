import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role', 16).notNullable().defaultTo('simple')
    })

    this.defer(async (db) => {
      await db.from(this.tableName).where('is_admin', true).update({ role: 'admin' })
      await db.from(this.tableName).where('is_admin', false).update({ role: 'simple' })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }
}
