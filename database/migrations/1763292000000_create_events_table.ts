import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title').notNullable()
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.string('status').notNullable().defaultTo('upcoming')
      table.string('accent_color').notNullable().defaultTo('#ff5a4a')
      table.integer('display_order').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          title: 'Qualification 24H Le Mans',
          start_date: '2026-04-15',
          end_date: null,
          status: 'upcoming',
          accent_color: '#ff5a4a',
          display_order: 1,
        },
        {
          title: '24 Heures du Mans',
          start_date: '2026-04-18',
          end_date: '2026-04-19',
          status: 'live',
          accent_color: '#ff5a4a',
          display_order: 2,
        },
        {
          title: 'Course Endurance',
          start_date: '2026-04-25',
          end_date: null,
          status: 'upcoming',
          accent_color: '#ff5a4a',
          display_order: 3,
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
