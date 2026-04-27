import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flags'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('retracted')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('retracted').defaultTo(false)
    })
  }
}
