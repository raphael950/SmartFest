import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'isVerified',
      'role',
      'fullName',
      'pseudo',
      'email',
      'avatarPath',
      'gender',
      'birthDate',
      'jobTitle',
      'followedTeam',
      'points',
      'level',
      'createdAt',
      'updatedAt',
      'initials',
    ])
  }
}
