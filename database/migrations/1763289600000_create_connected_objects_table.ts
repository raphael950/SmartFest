import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'connected_objects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('identifier').notNullable().unique()
      table.string('name').notNullable()
      table.string('type').notNullable()
      table.string('sector').notNullable()
      table.string('status').notNullable().defaultTo('online')

      table.string('firmware').notNullable().defaultTo('v1.0.0')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
