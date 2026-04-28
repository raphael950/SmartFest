import User from '#models/user'
import Team from '#models/team'
import type { HttpContext } from '@adonisjs/core/http'

export default class NetworkingController {
  async index({ inertia, auth }: HttpContext) {
    const currentUserId = auth.user?.id

    const users = await User.query()
      .whereNotNull('pseudo')
      .where('is_verified', true)
      .orderBy('created_at', 'desc')

    const followedTeamIds = [...new Set(users.map((user) => user.followedTeamId).filter((id) => id !== null))]
    const teams = followedTeamIds.length ? await Team.query().whereIn('id', followedTeamIds) : []
    const teamsById = new Map(teams.map((team) => [team.id, team.name]))

    const usersWithPseudo = users.filter((user): user is User & { pseudo: string } => user.pseudo !== null)

    return inertia.render('networking', {
      users: usersWithPseudo.map((user) => ({
        id: user.id,
        pseudo: user.pseudo,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarPath ? `/${user.avatarPath}` : null,
        followedTeam: user.followedTeamId ? (teamsById.get(user.followedTeamId) ?? null) : null,
        jobTitle: user.jobTitle,
        isCurrentUser: user.id === currentUserId,
      })),
    })
  }
}
