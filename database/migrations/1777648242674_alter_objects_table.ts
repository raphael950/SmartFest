import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'objects'

  async up() {
    this.schema.alterTable('connected_objects', (table) => {
      table.integer('team_owner').nullable() 
    })
  }

  async down() {
    this.schema.alterTable('connected_objects', (table) => {
      table.dropColumn('team_owner')
    })
  }
}