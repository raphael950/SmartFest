import User from '#models/user'
import Team from '#models/team'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailMailer from '#mailers/verify_email_mailer'
import AccountPendingMailer from '#mailers/account_pending_mailer'
import router from '@adonisjs/core/services/router'
import vine from '@vinejs/vine'
import env from '#start/env'

export default class NewAccountController {
  /**
   * Step 1: Get identity (name, firstname)
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup_step1', {})
  }

  /**
   * Step 1: Store identity and move to step 2
   */
  async storeIdentity({ request, response, session }: HttpContext) {
    const identityValidator = vine.create({
      fullName: vine.string().trim().minLength(2).maxLength(140),
      firstName: vine.string().trim().minLength(2).maxLength(140),
    })

    const { fullName, firstName } = await request.validateUsing(identityValidator)

    // Store in session
    session.put('signup_fullName', fullName)
    session.put('signup_firstName', firstName)

    return response.redirect().toRoute('new_account.email_step')
  }

  /**
   * Step 2: Email verification page
   */
  async emailStep({ inertia, session }: HttpContext) {
    const fullName = session.get('signup_fullName')
    const firstName = session.get('signup_firstName')

    if (!fullName || !firstName) {
      return inertia.render('auth/signup_step1', {})
    }

    return inertia.render('auth/signup_step2', {
      fullName,
      firstName,
    })
  }

  /**
   * Step 2: Send verification email
   */
  async sendVerificationEmail({ request, response, session }: HttpContext) {
    const emailValidator = vine.create({
      email: vine
        .string()
        .email()
        .maxLength(254)
        .unique({ table: 'users', column: 'email' }),
    })

    const { email } = await request.validateUsing(emailValidator)

    const fullName = session.get('signup_fullName')
    const firstName = session.get('signup_firstName')

    // Generate a signed verification URL (1 hour expiry)
    const signedPath = router.makeSignedUrl(
      'verify.email',
      {},
      {
        expiresIn: '1h',
        qs: { email, fullName, firstName },
      }
    )
    const verificationUrl = `${env.get('APP_URL')}${signedPath}`

    // Create temporary user object for email
    const tempUser = {
      email,
      fullName,
      pseudo: firstName,
    }

    // Send verification email with firstName included
    await mail.send(new VerifyEmailMailer(tempUser as any, verificationUrl, firstName))

    // Store email in session
    session.put('signup_email', email)

    // Redirect to waiting page
    return response.redirect().toRoute('new_account.waiting_step')
  }

  /**
   * Step 3: Waiting for email verification
   */
  async waitingStep({ inertia, session }: HttpContext) {
    const email = session.get('signup_email')
    const fullName = session.get('signup_fullName')
    const firstName = session.get('signup_firstName')

    if (!email || !fullName || !firstName) {
      return inertia.render('auth/signup_step1', {})
    }

    return inertia.render('auth/signup_step3_waiting', {
      email,
      firstName,
    })
  }

  /**
   * Confirm email and move to finalization
   */
  async confirmEmail({ request, response, session }: HttpContext) {
    // Validate the signed URL
    if (!request.hasValidSignature()) {
      session.flash('error', 'Lien de vérification invalide ou expiré.')
      return response.redirect().toRoute('session.create')
    }

    const email = request.input('email')
    const fullName = request.input('fullName')
    const firstName = request.input('firstName')

    // Store verified info in session
    session.put('signup_email_verified', email)
    session.put('signup_fullName', fullName)
    session.put('signup_firstName', firstName)

    // Redirect to finalization page
    return response.redirect().toRoute('new_account.finalization_step')
  }

  /**
   * Step 4: Finalization page (profile details + password)
   */
  async finalizationStep({ inertia, session }: HttpContext) {
    const email = session.get('signup_email_verified')
    const fullName = session.get('signup_fullName')
    const firstName = session.get('signup_firstName')

    if (!email || !fullName || !firstName) {
      return inertia.render('auth/signup_step1', {})
    }

    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('name', 'asc')

    return inertia.render('auth/signup_step4_finalization', {
      email,
      fullName,
      firstName,
      teams: teams.map((team) => ({
        id: team.id,
        label: team.name,
      })),
    })
  }

  /**
   * Step 4: Store final profile and create user
   */
  async store({ request, response, session, auth }: HttpContext) {
    const email = session.get('signup_email_verified')
    const fullName = session.get('signup_fullName')
    const firstName = session.get('signup_firstName')

    if (!email || !fullName || !firstName) {
      session.flash('error', 'Session expirée. Veuillez recommencer.')
      return response.redirect().toRoute('new_account.create')
    }

    const finalValidator = vine.create({
      pseudo: vine
        .string()
        .trim()
        .minLength(3)
        .maxLength(30)
        .alphaNumeric({ allowDashes: true, allowUnderscores: true })
        .unique({ table: 'users', column: 'pseudo' }),
      gender: vine.enum(['Homme', 'Femme'] as const),
      birthDate: vine.date(),
      jobTitle: vine.string().trim().minLength(2).maxLength(120),
      followedTeamId: vine.number().withoutDecimals().positive().exists({ table: 'teams', column: 'id' }),
      password: vine.string().minLength(8).maxLength(32),
      passwordConfirmation: vine.string().confirmed({
        confirmationField: 'password',
      }),
    })

    const payload = await request.validateUsing(finalValidator)

    // Check if this is the first user
    const hasExistingUser = Boolean(await User.query().select('id').first())
    const role = hasExistingUser ? 'simple' : 'admin'

    // Create the user
    const user = await User.create({
      email,
      fullName,
      pseudo: payload.pseudo,
      gender: payload.gender,
      birthDate: payload.birthDate,
      jobTitle: payload.jobTitle,
      followedTeamId: payload.followedTeamId,
      password: payload.password,
      role,
      isVerified: !hasExistingUser, // First user is auto-verified
    })

    // Clear session data
    session.forget('signup_email_verified')
    session.forget('signup_fullName')
    session.forget('signup_firstName')
    session.forget('signup_email')

    // If first user, auto-login
    if (!hasExistingUser) {
      await auth.use('web').login(user)
      session.flash('success', 'Premier compte créé en mode administrateur.')
      return response.redirect().toRoute('profile.show', { pseudo: user.pseudo! })
    }

    // For other users, send pending email and redirect to login
    await mail.send(new AccountPendingMailer(user))
    session.flash('success', 'Compte créé. Un administrateur doit valider votre compte avant connexion.')
    return response.redirect().toRoute('session.create')
  }
}
