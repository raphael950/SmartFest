import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable().unique()
      table.string('country').notNullable()
      table.string('accent_color').notNullable().defaultTo('#e84c3d')
      table.integer('display_order').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        { name: 'Alpine Racing', country: 'France', accent_color: '#0055ff', display_order: 1 },
        { name: 'Ferrari Corse', country: 'Italie', accent_color: '#dc0000', display_order: 2 },
        { name: 'Porsche Team', country: 'Allemagne', accent_color: '#e5e7eb', display_order: 3 },
        { name: 'Toyota Gazoo', country: 'Japon', accent_color: '#eb0a1e', display_order: 4 },
        { name: 'Cadillac Hertz', country: 'Etats-Unis', accent_color: '#f59e0b', display_order: 5 },
        { name: 'Peugeot Sport', country: 'France', accent_color: '#22c55e', display_order: 6 },
        { name: 'BMW M Team', country: 'Allemagne', accent_color: '#2563eb', display_order: 7 },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
