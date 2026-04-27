import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('level', 32).notNullable().defaultTo('debutant')
    })

    this.defer(async (db) => {
      await db.from(this.tableName).where('points', '>=', 300).update({ level: 'expert' })
      await db
        .from(this.tableName)
        .where('points', '>=', 150)
        .andWhere('points', '<', 300)
        .update({ level: 'avance' })
      await db
        .from(this.tableName)
        .where('points', '>=', 50)
        .andWhere('points', '<', 150)
        .update({ level: 'intermediaire' })
      await db.from(this.tableName).where('points', '<', 50).update({ level: 'debutant' })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('level')
    })
  }
}
