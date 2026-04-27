import User from '#models/user'
import userLevelService from '#services/user_level_service'
import { updateProfileValidator } from '#validators/user'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { mkdir, unlink } from 'node:fs/promises'

export default class ProfileController {
  private avatarUrl(avatarPath: string | null) {
    return avatarPath ? `/${avatarPath}` : null
  }

  async edit({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const levelProgress = userLevelService.getProgress(user.points)

    return inertia.render('profile/edit', {
      profile: {
        fullName: user.fullName,
        pseudo: user.pseudo,
        gender: user.gender,
        birthDate: user.birthDate ? user.birthDate.toISODate() : null,
        jobTitle: user.jobTitle,
        followedTeam: user.followedTeam,
        points: user.points,
        level: levelProgress.level,
        levelLabel: levelProgress.levelLabel,
        levelProgress,
        avatarUrl: this.avatarUrl(user.avatarPath),
      },
      hasPublicProfile: Boolean(user.pseudo),
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateProfileValidator)
    const profilePhoto = request.file('profilePhoto', {
      size: '4mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    })

    if (profilePhoto && !profilePhoto.isValid) {
      session.flash('error', 'La photo doit etre une image valide (jpg, png, webp, avif) de 4MB max.')
      return response.redirect().back()
    }

    const pseudoConflict = await User.query()
      .where('pseudo', payload.pseudo)
      .whereNot('id', user.id)
      .first()

    if (pseudoConflict) {
      session.flash('error', 'Ce pseudo est deja pris. Choisis-en un autre.')
      return response.redirect().back()
    }

    if (profilePhoto) {
      const avatarsDir = app.makePath('public/uploads/avatars')
      await mkdir(avatarsDir, { recursive: true })

      const extension = profilePhoto.extname || 'jpg'
      const fileName = `avatar-${user.id}-${randomUUID()}.${extension}`

      await profilePhoto.move(avatarsDir, {
        name: fileName,
        overwrite: true,
      })

      if (user.avatarPath) {
        const oldAvatarFullPath = app.makePath('public', user.avatarPath)
        await unlink(oldAvatarFullPath).catch(() => {})
      }

      user.avatarPath = `uploads/avatars/${fileName}`
    }

    user.merge(payload)
    await user.save()

    session.flash('success', 'Profil mis a jour avec succes.')
    return response.redirect().toRoute('profile.me')
  }
}
