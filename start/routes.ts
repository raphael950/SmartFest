/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import HomeController from '#controllers/home_controller'
import IncidentsController from '#controllers/incidents_controller'
import ProfileController from '#controllers/profile_controller'
import AdminUsersController from '#controllers/admin_users_controller'
import NetworkingController from '#controllers/networking_controller'
import LiveTimingController from '#controllers/live_timing_controller'
import { controllers } from '#generated/controllers'
import User from '#models/user'
import userLevelService from '#services/user_level_service'
import router from '@adonisjs/core/services/router'

router.get('/', [HomeController, 'index']).as('home')
router
  .get('/profil/:pseudo', async ({ params, inertia, auth }) => {
    const user = await User.query().where('pseudo', params.pseudo).firstOrFail()
    const levelProgress = userLevelService.getProgress(user.points)

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
        points: user.points,
        level: levelProgress.level,
        levelLabel: levelProgress.levelLabel,
        levelProgress,
      },
      canEdit: auth.user?.id === user.id,
    })
  })
  .as('profile.show')
  .use(middleware.role({ minimumRole: 'simple' }))

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create']).as('new_account.create')
    router.post('signup', [controllers.NewAccount, 'store']).as('new_account.store')

    router.get('login', [controllers.Session, 'create']).as('session.create')
    router.post('login', [controllers.Session, 'store']).as('session.store')
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
    router.get('networking', [NetworkingController, 'index']).as('networking.index')
    router.get('live-timing', [LiveTimingController, 'index']).as('live-timing')
    router.get('api/live-timing', [LiveTimingController, 'apiIndex']).as('api.live-timing')
    router.post('logout', [controllers.Session, 'destroy']).as('session.destroy')
  })
  .use(middleware.role({ minimumRole: 'simple' }))

router
  .group(() => {
    router.get('admin/users', [AdminUsersController, 'index']).as('admin.users.index')
    router.put('admin/users/:id/password', [AdminUsersController, 'updatePassword']).as('admin.users.password')
    router.post('admin/users/:id/verify', [AdminUsersController, 'verify']).as('admin.users.verify')
    router.post('admin/users/:id/role', [AdminUsersController, 'updateRole']).as('admin.users.role')
    router.delete('admin/users/:id', [AdminUsersController, 'destroy']).as('admin.users.destroy')
    router.get('admin/objets', [controllers.ConnectedObjects, 'indexAdmin']).as('admin.objets.index')
    router.post('admin/objets/:id/approve-destroy', [controllers.ConnectedObjects, 'approveDestroy']).as('admin.objets.approve_destroy')
    router.post('admin/objets/:id/reject-destroy', [controllers.ConnectedObjects, 'rejectDestroy']).as('admin.objets.reject_destroy')
  })
  .use(middleware.role({ minimumRole: 'admin' }))

router
  .group(() => {
    router.get('/incidents', [IncidentsController, 'index']).as('incidents')
    router.post('/incidents', [IncidentsController, 'store']).as('incidents.store')
    router.get('/drapeaux', [controllers.Flags, 'index']).as('flags')
    router.post('/drapeaux', [controllers.Flags, 'store']).as('flags.store')
    router.get('/objets', [controllers.ConnectedObjects, 'index']).as('objets')
    router.post('/objets', [controllers.ConnectedObjects, 'store']).as('objets.store')
    router.put('/objets/:identifier', [controllers.ConnectedObjects, 'update']).as('objets.update')
    router.post('/objets/:identifier/request-delete', [controllers.ConnectedObjects, 'requestDestroy']).as('objets.request_destroy')
  })
  .use(middleware.role({ minimumRole: 'complexe' }))
