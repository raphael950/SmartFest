import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import User from '#models/user'

export default class AccountPendingMailer extends BaseMail {
  constructor(private user: User) {
    super()
  }

  prepare() {
    this.message.htmlView('emails/account_pending', {
      user: this.user,
    })
    this.message.from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
    this.message.to(this.user.email)
    this.message.subject('Votre compte est en attente de validation')
  }
}
