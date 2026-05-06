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
import AdminController from '#controllers/admin_controller'
import NetworkingController from '#controllers/networking_controller'
import LiveTimingController from '#controllers/live_timing_controller'
import NewAccountController from '#controllers/new_account_controller'
import SessionController from '#controllers/session_controller'
import PasswordController from '#controllers/password_controller'
import RaceController from '#controllers/race_controller'
import ConnectedObjectsController from '#controllers/connected_objects_controller'
import User from '#models/user'
import Team from '#models/team'
import userLevelService from '#services/user_level_service'
import router from '@adonisjs/core/services/router'

router.get('/', [HomeController, 'index']).as('home')
router
  .get('/profil/:pseudo', async ({ params, inertia, auth }) => {
    const user = await User.query().where('pseudo', params.pseudo).firstOrFail()
    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('name', 'asc')
    const levelProgress = userLevelService.getProgress(user.points, user.level)

    return inertia.render('profile/show', {
      profile: {
        id: user.id,
        fullName: user.fullName,
        pseudo: user.pseudo,
        avatarUrl: user.avatarPath ? `/${user.avatarPath}` : null,
        gender: user.gender,
        birthDate: user.birthDate ? user.birthDate.toISODate() : null,
        jobTitle: user.jobTitle,
        followedTeamId: user.followedTeamId,
        points: user.points,
        level: user.level,
        levelLabel: levelProgress.levelLabel,
        levelProgress,
      },
      teams: teams.map((team) => ({ id: team.id, name: team.name })),
      canEdit: auth.user?.id === user.id,
    })
  })
  .as('profile.show')
  .use(middleware.role({ minimumRole: 'simple' }))

router
  .group(() => {
    // Registration flow (4 steps)
    router.get('signup', [NewAccountController, 'create']).as('new_account.create')
    router.post('signup/identity', [NewAccountController, 'storeIdentity']).as('new_account.store_identity')
    router.get('signup/email', [NewAccountController, 'emailStep']).as('new_account.email_step')
    router.post('signup/send-verification', [NewAccountController, 'sendVerificationEmail']).as('new_account.send_verification')
    router.get('signup/waiting', [NewAccountController, 'waitingStep']).as('new_account.waiting_step')
    router.get('signup/finalization', [NewAccountController, 'finalizationStep']).as('new_account.finalization_step')
    router.post('signup', [NewAccountController, 'store']).as('new_account.store')
    router.get('verify-email', [NewAccountController, 'confirmEmail']).as('verify.email')

    router.get('login', [SessionController, 'create']).as('session.create')
    router.post('login', [SessionController, 'store']).as('session.store')
    router.post('forgot-password', [PasswordController, 'sendResetLink']).as('password.send_reset')
    router.get('reset-password', [PasswordController, 'showResetForm']).as('password.reset')
    router.post('reset-password', [PasswordController, 'resetPassword']).as('password.update')
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
    router.post('mon-profil/niveau', [ProfileController, 'upgradeLevel']).as('profile.level.upgrade')
    router.get('networking', [NetworkingController, 'index']).as('networking.index')
    router.get('live-timing', [LiveTimingController, 'index']).as('live-timing')
    router.get('api/live-timing', [LiveTimingController, 'apiIndex']).as('api.live-timing')
    router.post('logout', [SessionController, 'destroy']).as('session.destroy')
  })
  .use(middleware.role({ minimumRole: 'simple' }))

router
  .group(() => {
    router.get('admin/users', [AdminUsersController, 'index']).as('admin.users.index')
    router.get('admin', [AdminController, 'index']).as('admin.index')
    router.put('admin/users/:id/password', [AdminUsersController, 'updatePassword']).as('admin.users.password')
    router.post('admin/users/:id/verify', [AdminUsersController, 'verify']).as('admin.users.verify')
    router.post('admin/users/:id/role', [AdminUsersController, 'updateRole']).as('admin.users.role')
    router.delete('admin/users/:id', [AdminUsersController, 'destroy']).as('admin.users.destroy')
    router.get('admin/objets', [ConnectedObjectsController, 'indexAdmin']).as('admin.objets.index')
    router.post('admin/objets/:id/approve-destroy', [ConnectedObjectsController, 'approveDestroy']).as('admin.objets.approve_destroy')
    router.post('admin/objets/:id/reject-destroy', [ConnectedObjectsController, 'rejectDestroy']).as('admin.objets.reject_destroy')
  })
  .use(middleware.role({ minimumRole: 'admin' }))

router
  .group(() => {
    router.get('/incidents', [IncidentsController, 'index']).as('incidents')
    router.post('/incidents', [IncidentsController, 'store']).as('incidents.store')
    router.get('/course', [RaceController, 'index']).as('race')
    router.post('/course', [RaceController, 'store']).as('race.store')
    router.post('/course/start', [RaceController, 'startRace']).as('race.start')
    router.post('/course/stop', [RaceController, 'stopRace']).as('race.stop')
    router.get('/objets', [ConnectedObjectsController, 'index']).as('objets')
    router.post('/objets', [ConnectedObjectsController, 'store']).as('objets.store')
    router.put('/objets/:identifier', [ConnectedObjectsController, 'update']).as('objets.update')
    router.delete('/objets/:identifier', [ConnectedObjectsController, 'destroy']).as('objets.destroy')
  })
  .use(middleware.role({ minimumRole: 'complexe' }))
