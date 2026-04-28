import User from '#models/user'
import Team from '#models/team'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('name', 'asc')

    return inertia.render('auth/signup', {
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
      })),
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)
    const hasExistingUser = Boolean(await User.query().select('id').first())
    const role = hasExistingUser ? 'simple' : 'admin'

    const user = await User.create({
      ...payload,
      role,
      isVerified: !hasExistingUser,
    })

    if (!hasExistingUser) {
      await auth.use('web').login(user)
      session.flash('success', 'Premier compte cree en mode administrateur.')
      return response.redirect().toRoute('profile.show', { pseudo: user.pseudo! })
    }

    session.flash('success', 'Compte cree. Un administrateur doit valider votre compte avant connexion.')
    return response.redirect().toRoute('session.create')
  }
}
