import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'isAdmin',
      'isVerified',
      'fullName',
      'pseudo',
      'email',
      'avatarPath',
      'gender',
      'birthDate',
      'jobTitle',
      'followedTeam',
      'createdAt',
      'updatedAt',
      'initials',
    ])
  }
}
