import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import User from '#models/user'

export default class ResetPasswordMailer extends BaseMail {
  constructor(
    private user: User,
    private resetUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.htmlView('emails/reset_password', {
      user: this.user,
      resetUrl: this.resetUrl,
    })
    this.message.from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
    this.message.to(this.user.email)
    this.message.subject('Réinitialisation de votre mot de passe')
  }
}
