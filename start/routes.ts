/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import ProfileController from '#controllers/profile_controller'
import { controllers } from '#generated/controllers'
import User from '#models/user'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')
router.get('/objets', [controllers.ConnectedObjects, 'index']).as('objets')
router.post('/objets', [controllers.ConnectedObjects, 'store']).as('objets.store')
router.put('/objets/:identifier', [controllers.ConnectedObjects, 'update']).as('objets.update')
router.delete('/objets/:identifier', [controllers.ConnectedObjects, 'destroy']).as('objets.destroy')
router
  .get('/profil/:pseudo', async ({ params, inertia }) => {
    const user = await User.query().where('pseudo', params.pseudo).firstOrFail()

    return inertia.render('profile/show', {
      profile: {
        id: user.id,
        fullName: user.fullName,
        pseudo: user.pseudo,
        avatarUrl: user.avatarPath ? `/${user.avatarPath}` : null,
        gender: user.gender,
        birthDate: user.birthDate ? user.birthDate.toISODate() : null,
        jobTitle: user.jobTitle,
        followedTeam: user.followedTeam,
      },
    })
  })
  .as('profile.show')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router
      .get('mon-profil', ({ auth, response }) => {
        if (auth.user?.pseudo) {
          return response.redirect().toRoute('profile.show', { pseudo: auth.user.pseudo })
        }

        return response.redirect().toRoute('profile.edit')
      })
      .as('profile.me')

    router.get('mon-profil/edition', [ProfileController, 'edit']).as('profile.edit')
    router.post('mon-profil/edition', [ProfileController, 'update']).as('profile.update')

    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
