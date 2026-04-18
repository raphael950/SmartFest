import User from '#models/user'
import { updateProfileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async edit({ auth, inertia }: HttpContext) {
    const user = auth.user!

    return inertia.render('profile/edit', {
      profile: {
        fullName: user.fullName,
        pseudo: user.pseudo,
        gender: user.gender,
        birthDate: user.birthDate ? user.birthDate.toISODate() : null,
        jobTitle: user.jobTitle,
        followedTeam: user.followedTeam,
      },
      hasPublicProfile: Boolean(user.pseudo),
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateProfileValidator)

    const pseudoConflict = await User.query()
      .where('pseudo', payload.pseudo)
      .whereNot('id', user.id)
      .first()

    if (pseudoConflict) {
      session.flash('error', 'Ce pseudo est deja pris. Choisis-en un autre.')
      return response.redirect().back()
    }

    user.merge(payload)
    await user.save()

    session.flash('success', 'Profil mis a jour avec succes.')
    return response.redirect().toRoute('profile.edit')
  }
}
