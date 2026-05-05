import User from '#models/user'

export const LOGIN_POINTS = 5
export const OBJECT_CONSULTATION_POINTS = 1
export const LIVE_TIMING_POINTS = 1

class PointsService {
  async award(user: User, amount: number) {
    if (!amount) {
      return
    }

    await User.query().where('id', user.id).increment('points', amount)
    user.points += amount
  }

  async awardLogin(user: User) {
    await this.award(user, LOGIN_POINTS)
  }

  async awardObjectConsultation(user: User) {
    await this.award(user, OBJECT_CONSULTATION_POINTS)
  }

  async awardLiveTimingConsultation(user: User) {
    await this.award(user, LIVE_TIMING_POINTS)
  }
}

export default new PointsService()
