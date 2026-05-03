import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'connected_objects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_deletion_requested').defaultTo(false)
      table
        .integer('requested_deletion_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['requested_deletion_by_user_id'])
      table.dropColumn('requested_deletion_by_user_id')
      table.dropColumn('is_deletion_requested')
    })
  }
}