import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('description').notNullable().defaultTo('')
      table.string('category').notNullable().defaultTo('Hypercar')
      table.string('car_model').notNullable().defaultTo('')
      table.string('team_principal').notNullable().defaultTo('')
    })

    this.defer(async (db) => {
      await db
        .from(this.tableName)
        .where('name', 'Alpine Racing')
        .update({
          description:
            'Alpine Racing engage un programme endurance centre sur une approche precise des relais, une aero stable et une execution tres disciplinee en course longue.',
          category: 'Hypercar',
          car_model: 'Alpine A424',
          team_principal: 'Philippe Sinault',
        })

      await db
        .from(this.tableName)
        .where('name', 'Ferrari Corse')
        .update({
          description:
            'Ferrari Corse mise sur une forte traction en sortie de virage et une gestion agressive du rythme pour peser sur toute la duree des epreuves.',
          category: 'Hypercar',
          car_model: 'Ferrari 499P',
          team_principal: 'Antonello Coletta',
        })

      await db
        .from(this.tableName)
        .where('name', 'Porsche Team')
        .update({
          description:
            'Porsche Team s appuie sur une culture historique de l endurance avec une strategie rigoureuse, une fiabilite elevee et des arrêts au stand tres propres.',
          category: 'Hypercar',
          car_model: 'Porsche 963',
          team_principal: 'Thomas Laudenbach',
        })

      await db
        .from(this.tableName)
        .where('name', 'Toyota Gazoo')
        .update({
          description:
            'Toyota Gazoo Racing reste une reference de regularite avec une lecture fine des conditions de piste et une execution tres solide dans le trafic.',
          category: 'Hypercar',
          car_model: 'Toyota GR010 Hybrid',
          team_principal: 'Kamui Kobayashi',
        })

      await db
        .from(this.tableName)
        .where('name', 'Cadillac Hertz')
        .update({
          description:
            'Cadillac Hertz Team JOTA combine puissance moteur, agressivite visuelle et gros engagement dans les phases de relance pour gagner des positions rapidement.',
          category: 'Hypercar',
          car_model: 'Cadillac V-Series.R',
          team_principal: 'Sam Hignett',
        })

      await db
        .from(this.tableName)
        .where('name', 'Peugeot Sport')
        .update({
          description:
            'Peugeot Sport travaille un package endurance axe sur l innovation aero et une progression constante en rythme de course face au plateau Hypercar.',
          category: 'Hypercar',
          car_model: 'Peugeot 9X8',
          team_principal: 'Olivier Jansonnie',
        })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('description')
      table.dropColumn('category')
      table.dropColumn('car_model')
      table.dropColumn('team_principal')
    })
  }
}
