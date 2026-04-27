import User from '#models/user'
import userLevelService from '#services/user_level_service'

export const LOGIN_POINTS = 5
export const OBJECT_CONSULTATION_POINTS = 1

class PointsService {
  async award(user: User, amount: number) {
    if (!amount) {
      return
    }

    await User.query().where('id', user.id).increment('points', amount)
    user.points += amount

    const nextLevel = userLevelService.getLevelFromPoints(user.points)
    if (user.level !== nextLevel) {
      await User.query().where('id', user.id).update({ level: nextLevel })
      user.level = nextLevel
    }
  }

  async awardLogin(user: User) {
    await this.award(user, LOGIN_POINTS)
  }

  async awardObjectConsultation(user: User) {
    await this.award(user, OBJECT_CONSULTATION_POINTS)
  }
}

export default new PointsService()
