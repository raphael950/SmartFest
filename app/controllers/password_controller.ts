import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import ResetPasswordMailer from '#mailers/reset_password_mailer'
import router from '@adonisjs/core/services/router'
import env from '#start/env'

export default class PasswordController {
  /**
   * Send password reset email
   */
  async sendResetLink({ request, response, session }: HttpContext) {
    const email = request.input('email', '').trim()

    const user = await User.query().where('email', email).first()

    if (user) {
      // Generate a signed reset URL that expires in 1 hour
      // The URL includes the userId as a query parameter and is signed by the framework
      const signedPath = router.makeSignedUrl(
        'password.reset',
        {},
        {
          expiresIn: '1h',
          qs: { userId: user.id },
        }
      )
      const resetUrl = `${env.get('APP_URL')}${signedPath}`

      // Send the reset email
      await mail.send(new ResetPasswordMailer(user, resetUrl))
    }

    // Always return the same message for security
    session.flash('success', 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.')
    return response.redirect().back()
  }

  /**
   * Show the reset password form
   */
  async showResetForm({ request, inertia, session }: HttpContext) {
    // Validate the signed URL
    if (!request.hasValidSignature()) {
      session.flash('error', 'Lien de réinitialisation invalide ou expiré.')
      return inertia.render('auth/login')
    }

    return inertia.render('auth/reset_password')
  }

  /**
   * Handle password reset
   */
  async resetPassword({ request, response, session }: HttpContext) {
    const { password, passwordConfirmation, userId } = request.all()

    // Validate passwords
    if (!password || !passwordConfirmation) {
      session.flash('error', 'Veuillez remplir tous les champs.')
      return response.redirect().back()
    }

    if (password !== passwordConfirmation) {
      session.flash('error', 'Les mots de passe ne correspondent pas.')
      return response.redirect().back()
    }

    if (password.length < 8) {
      session.flash('error', 'Le mot de passe doit contenir au moins 8 caractères.')
      return response.redirect().back()
    }

    // Validate the signed request (signature is in query params)
    if (!request.hasValidSignature()) {
      session.flash('error', 'Requête invalide. Veuillez recommencer.')
      return response.redirect().toRoute('session.create')
    }

    if (!userId) {
      session.flash('error', 'Lien de réinitialisation invalide.')
      return response.redirect().toRoute('session.create')
    }

    const user = await User.find(userId)

    if (!user) {
      session.flash('error', 'Utilisateur non trouvé.')
      return response.redirect().toRoute('session.create')
    }

    // Update the password
    user.password = password
    await user.save()

    session.flash('success', 'Votre mot de passe a été réinitialisé avec succès.')
    return response.redirect().toRoute('session.create')
  }
}
