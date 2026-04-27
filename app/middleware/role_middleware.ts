import { hasMinimumRole, type UserRole, USER_ROLE_LABELS } from '#models/user_role'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      minimumRole?: UserRole
    } = {}
  ) {
    const minimumRole = options.minimumRole ?? 'simple'
    const user = ctx.auth.user

    if (!user) {
      ctx.session.flash('error', 'Vous devez etre connecte pour acceder a cette page.')
      return ctx.response.redirect().toRoute('session.create')
    }

    if (!hasMinimumRole(user.role, minimumRole)) {
      const label = USER_ROLE_LABELS[minimumRole]
      ctx.session.flash('error', `Acces reserve aux utilisateurs ${label.toLowerCase()}s ou superieurs.`)
      return ctx.response.redirect().toRoute('home')
    }

    return next()
  }
}
