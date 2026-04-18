import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('age')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('age').unsigned().nullable()
    })
  }
}
