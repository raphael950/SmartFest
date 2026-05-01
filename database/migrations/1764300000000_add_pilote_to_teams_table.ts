import { BaseSchema } from '@adonisjs/lucid/schema'

const TEAM_PILOTES = [
  { team: 'Alpine Racing', pilote: 'M. Vaxiviere' },
  { team: 'Ferrari Corse', pilote: 'A. Pier Guidi' },
  { team: 'Porsche Team', pilote: 'K. Estre' },
  { team: 'Corvette Racing', pilote: 'T. Bamber' },
  { team: 'Hertz JOTA', pilote: 'N. Jani' },
] as const

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pilote').notNullable().defaultTo('')
    })

    this.defer(async (db) => {
      for (const entry of TEAM_PILOTES) {
        await db.from(this.tableName).where('name', entry.team).update({ pilote: entry.pilote })
      }
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pilote')
    })
  }
}
