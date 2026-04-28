import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('followed_team_id').unsigned().nullable().references('id').inTable('teams').onDelete('SET NULL')
      // NOTE: keep existing `followed_team` column for compatibility with other branches.
      // We'll remove it once all branches have migrated to `followed_team_id`.
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Reverse of up: only drop the added foreign key column.
      table.dropColumn('followed_team_id')
    })
  }
}
