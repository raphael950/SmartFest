import User from '#models/user'
import ConnectedObject from '#models/connected_object'
import pointsService from '#services/points_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  public async index({ inertia, auth }: HttpContext) {
    if (auth.user) {
      await pointsService.awardObjectConsultation(auth.user)
    }

    const users = await User.query().orderBy('created_at', 'desc')

    const objects = await ConnectedObject.query()
      .where('is_deletion_requested', true)
      .preload('team', (query) => query.select(['id', 'name']))
      .preload('requestedDeletionByUser', (query) => query.select(['id', 'email', 'fullName', 'pseudo']))
      .orderBy('id', 'desc')

    const usersPayload = users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      pseudo: user.pseudo,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt.toISO() ?? user.createdAt.toJSDate().toISOString(),
    }))

    const devices = objects.map((device) => {
      return {
        id: device.id,
        identifier: device.identifier,
        name: device.name,
        type: device.type,
        sector: device.sector,
        status: device.status,
        firmware: device.firmware,
        battery: 0,
        latencyMs: 0,
        signal: 0,
        teamId: device.teamId,
        teamName: device.team?.name ?? null,
        isDeletionRequested: device.isDeletionRequested,
        requestedDeletionByUserName:
          device.isDeletionRequested && device.requestedDeletionByUser
            ? device.requestedDeletionByUser.fullName || device.requestedDeletionByUser.pseudo || device.requestedDeletionByUser.email
            : null,
      }
    })

    const stats = {
      total: objects.length,
      oldestRequest: objects.length > 0 ? objects[objects.length - 1].createdAt.toISO() : null,
    }

    return inertia.render('admin/index', { users: usersPayload, devices, stats })
  }
}
