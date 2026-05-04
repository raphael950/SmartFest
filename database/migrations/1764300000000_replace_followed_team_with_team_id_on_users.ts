import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    if (!(await this.db.schema.hasColumn(this.tableName, 'followed_team_id'))) {
      this.schema.alterTable(this.tableName, (table) => {
        table.integer('followed_team_id').unsigned().nullable().references('id').inTable('teams').onDelete('SET NULL')
      })
    }

    if (await this.db.schema.hasColumn(this.tableName, 'followed_team')) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('followed_team')
      })
    }
  }

  async down() {
    if (!(await this.db.schema.hasColumn(this.tableName, 'followed_team'))) {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('followed_team', 120).nullable()
      })
    }

    if (await this.db.schema.hasColumn(this.tableName, 'followed_team_id')) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('followed_team_id')
      })
    }
  }
}
