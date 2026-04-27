import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('color').notNullable()
      table.string('sector').notNullable()
      table.integer('incident_id').unsigned().nullable().references('id').inTable('incidents').onDelete('SET NULL')
      table.boolean('retracted').defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
