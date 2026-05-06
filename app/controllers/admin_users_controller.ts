import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { USER_ROLE_LABELS, hasMinimumRole, parseUserRole } from '#models/user_role'
import userLevelService from '#services/user_level_service'
import mail from '@adonisjs/mail/services/main'
import AccountApprovedMailer from '#mailers/account_approved_mailer'

export default class AdminUsersController {
  async index({ inertia }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'desc')

    return inertia.render('admin/users', {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        pseudo: user.pseudo,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt.toISO() ?? user.createdAt.toJSDate().toISOString(),
      })),
    })
  }

  async updatePassword({ request, response, session, params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const password = String(request.input('password', '')).trim()

    if (password.length < 8) {
      session.flash('error', 'Le mot de passe doit contenir au moins 8 caracteres.')
      return response.redirect().back()
    }

    user.password = password
    await user.save()

    session.flash('success', `Mot de passe mis a jour pour ${user.email}.`)
    return response.redirect().back()
  }

  async verify({ response, session, params }: HttpContext) {
    const user = await User.findOrFail(params.id)

    if (!user.isVerified) {
      user.isVerified = true
      await user.save()

      // Send account approval email
      await mail.send(new AccountApprovedMailer(user))
    }

    session.flash('success', `Compte valide pour ${user.email}.`)
    return response.redirect().back()
  }

  async updateRole({ auth, request, response, session, params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const role = parseUserRole(request.input('role'))

    if (!role) {
      session.flash('error', 'Role invalide.')
      return response.redirect().back()
    }

    if (auth.user && auth.user.id === user.id && role !== 'admin') {
      session.flash('error', 'Vous ne pouvez pas retirer votre propre role administrateur.')
      return response.redirect().back()
    }

    user.role = role

    const { level, minPoints } = userLevelService.getLevelAndPointsForRole(role)
    user.level = level
    user.points = minPoints

    if (hasMinimumRole(role, 'complexe')) {
      user.isVerified = true
    }

    await user.save()

    session.flash('success', `Role ${USER_ROLE_LABELS[role]} mis a jour pour ${user.email}.`)
    return response.redirect().back()
  }

  async destroy({ response, session, params, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)

    if (auth.user && auth.user.id === user.id) {
      session.flash('error', 'Vous ne pouvez pas supprimer votre propre compte admin.')
      return response.redirect().back()
    }

    await user.delete()
    session.flash('success', `Compte supprime: ${user.email}.`)
    return response.redirect().back()
  }
}
