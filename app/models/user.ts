import { UserSchema } from '#database/schema'
import type { UserLevel } from '#services/user_level_service'
import { hasMinimumRole, type UserRole } from '#models/user_role'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'

export default class User extends compose(UserSchema, withAuthFinder(() => hash.use())) {
  declare points: number
  declare level: UserLevel
  declare role: UserRole
  declare followedTeamId: number | null

  hasRole(required: UserRole) {
    return hasMinimumRole(this.role, required)
  }

  get initials() {
    const baseIdentity = this.fullName || this.pseudo || this.email
    const [first, last] = baseIdentity.split(' ')

    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }

    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
