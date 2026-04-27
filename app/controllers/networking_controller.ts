import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NetworkingController {
  async index({ inertia, auth }: HttpContext) {
    const currentUserId = auth.user?.id

    const users = await User.query()
      .whereNotNull('pseudo')
      .where('is_verified', true)
      .orderBy('created_at', 'desc')

    return inertia.render('networking', {
      users: users.map((user) => ({
        id: user.id,
        pseudo: user.pseudo,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarPath ? `/${user.avatarPath}` : null,
        followedTeam: user.followedTeam,
        jobTitle: user.jobTitle,
        isCurrentUser: user.id === currentUserId,
      })),
    })
  }
}
