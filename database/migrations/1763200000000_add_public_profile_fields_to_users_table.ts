import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pseudo', 30).nullable().unique()
      table.integer('age').unsigned().nullable()
      table.string('gender', 50).nullable()
      table.date('birth_date').nullable()
      table.string('job_title', 120).nullable()
      table.string('followed_team', 120).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('followed_team')
      table.dropColumn('job_title')
      table.dropColumn('birth_date')
      table.dropColumn('gender')
      table.dropColumn('age')
      table.dropColumn('pseudo')
    })
  }
}
