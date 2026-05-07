import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import User from '#models/user'

export default class VerifyEmailMailer extends BaseMail {
  constructor(
    private user: User | any,
    private verificationUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.htmlView('emails/verify_email', {
      user: this.user,
      fullName: this.user.fullName || 'Utilisateur',
      verificationUrl: this.verificationUrl,
    })
    this.message.from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
    this.message.to(this.user.email)
    this.message.subject('Vérifiez votre adresse email')
  }
}
