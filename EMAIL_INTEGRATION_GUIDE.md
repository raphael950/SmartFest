# Email Integration Guide

This document shows where to integrate the 4 transactional mailers into your controllers. Each integration point includes the necessary imports and code placement.

---

## 1. VerifyEmailMailer + AccountPendingMailer → `new_account_controller.ts`

**Location:** In the `store()` method, after user creation but before the conditional checks.

**Integration Code:**

```typescript
import User from '#models/user'
import Team from '#models/team'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailMailer from '#mailers/verify_email_mailer'
import AccountPendingMailer from '#mailers/account_pending_mailer'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    const teams = await Team.query().orderBy('display_order', 'asc').orderBy('name', 'asc')

    return inertia.render('auth/signup', {
      teams: teams.map((team) => ({
        id: team.id,
        label: team.name,
      })),
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)
    const hasExistingUser = Boolean(await User.query().select('id').first())
    const role = hasExistingUser ? 'simple' : 'admin'

    const user = await User.create({
      ...payload,
      role,
      isVerified: !hasExistingUser,
    })

    // ===== EMAIL INTEGRATION START =====
    // Generate verification URL (example - adapt to your routing)
    const verificationUrl = new URL('/verify-email', 'http://localhost:3333').toString()
    // Adjust with actual token/route: new URL(`/verify-email/${user.verificationToken}`, appUrl)

    await mail.send(new VerifyEmailMailer(user, verificationUrl))
    
    if (!hasExistingUser) {
      // First user is admin and already verified - no pending email
      await auth.use('web').login(user)
      session.flash('success', 'Premier compte cree en mode administrateur.')
      return response.redirect().toRoute('profile.show', { pseudo: user.pseudo! })
    }

    // Non-admin users get pending email
    await mail.send(new AccountPendingMailer(user))
    // ===== EMAIL INTEGRATION END =====

    session.flash('success', 'Compte cree. Un administrateur doit valider votre compte avant connexion.')
    return response.redirect().toRoute('session.create')
  }
}
```

---

## 2. AccountApprovedMailer → `admin_users_controller.ts`

**Location:** In the `verify()` method, after updating the user's `isVerified` status.

**Integration Code:**

```typescript
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { USER_ROLE_LABELS, hasMinimumRole, parseUserRole } from '#models/user_role'
import userLevelService from '#services/user_level_service'
import mail from '@adonisjs/mail/services/main'
import AccountApprovedMailer from '#mailers/account_approved_mailer'

export default class AdminUsersController {
  async index({ inertia }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'desc')

    return inertia.render('admin/users', {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        pseudo: user.pseudo,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt.toISO() ?? user.createdAt.toJSDate().toISOString(),
      })),
    })
  }

  async updatePassword({ request, response, session, params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const password = String(request.input('password', '')).trim()

    if (password.length < 8) {
      session.flash('error', 'Le mot de passe doit contenir au moins 8 caracteres.')
      return response.redirect().back()
    }

    user.password = password
    await user.save()

    session.flash('success', `Mot de passe mis a jour pour ${user.email}.`)
    return response.redirect().back()
  }

  async verify({ response, session, params }: HttpContext) {
    const user = await User.findOrFail(params.id)

    if (!user.isVerified) {
      user.isVerified = true
      await user.save()

      // ===== EMAIL INTEGRATION START =====
      await mail.send(new AccountApprovedMailer(user))
      // ===== EMAIL INTEGRATION END =====
    }

    session.flash('success', `Compte valide pour ${user.email}.`)
    return response.redirect().back()
  }
}
```

---

## 3. ResetPasswordMailer → Password Reset Controller

**Location:** You'll need to create a password reset flow. This example shows how to integrate it.

**New Controller Example** (`app/controllers/password_controller.ts`):

```typescript
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import ResetPasswordMailer from '#mailers/reset_password_mailer'

export default class PasswordController {
  /**
   * Show the forgot password form
   */
  async forgotPasswordForm({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password')
  }

  /**
   * Send password reset email
   */
  async sendResetLink({ request, response, session }: HttpContext) {
    const email = request.input('email')
    const user = await User.query().where('email', email).first()

    if (!user) {
      // Don't reveal if email exists for security
      session.flash('success', 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.')
      return response.redirect().back()
    }

    // Generate reset token (example - use your actual token generation)
    // You may want to store this in a password_reset_tokens table or similar
    const resetToken = 'generate-your-token-here' // implement your token logic
    const resetUrl = new URL(`/reset-password/${resetToken}`, 'http://localhost:3333').toString()

    // ===== EMAIL INTEGRATION START =====
    await mail.send(new ResetPasswordMailer(user, resetUrl))
    // ===== EMAIL INTEGRATION END =====

    session.flash('success', 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.')
    return response.redirect().back()
  }

  /**
   * Show the reset password form
   */
  async resetPasswordForm({ inertia, params }: HttpContext) {
    // Validate token and get user
    const token = params.token
    // Add token validation logic here
    return inertia.render('auth/reset_password', { token })
  }

  /**
   * Handle password reset
   */
  async resetPassword({ request, response, session }: HttpContext) {
    const { token, password, passwordConfirmation } = request.all()

    if (password !== passwordConfirmation) {
      session.flash('error', 'Les mots de passe ne correspondent pas.')
      return response.redirect().back()
    }

    if (password.length < 8) {
      session.flash('error', 'Le mot de passe doit contenir au moins 8 caracteres.')
      return response.redirect().back()
    }

    // Validate token and get user
    // const user = await validatePasswordResetToken(token)
    // If token invalid: return session.flash('error', 'Lien de réinitialisation invalide ou expiré.')

    // const user = ...
    // user.password = password
    // await user.save()

    session.flash('success', 'Votre mot de passe a été réinitialisé avec succès.')
    return response.redirect().toRoute('session.create')
  }
}
```

**Add routes** to `start/routes.ts`:

```typescript
router.group(() => {
  router.get('/forgot-password', 'PasswordController.forgotPasswordForm')
  router.post('/forgot-password', 'PasswordController.sendResetLink')
  router.get('/reset-password/:token', 'PasswordController.resetPasswordForm')
  router.post('/reset-password', 'PasswordController.resetPassword')
}).middleware('guest')
```

---

## Summary

| Email Type | Mailer | Integration Point | Trigger |
|---|---|---|---|
| Email Verification | `VerifyEmailMailer` | `new_account_controller.ts` → `store()` | After user creation |
| Account Pending | `AccountPendingMailer` | `new_account_controller.ts` → `store()` | After user creation (non-admin) |
| Account Approved | `AccountApprovedMailer` | `admin_users_controller.ts` → `verify()` | When admin approves user |
| Password Reset | `ResetPasswordMailer` | `password_controller.ts` → `sendResetLink()` | When user requests reset |

---

## Notes

- All mailers use `env.get('MAIL_FROM_ADDRESS')` and `env.get('MAIL_FROM_NAME')` from your `.env` file
- Ensure your `.env` has `MAIL_FROM_ADDRESS` and `MAIL_FROM_NAME` set correctly
- Resend is already configured in `config/mail.ts`
- Edge templates support all Edge.js syntax for conditional rendering, loops, etc.
- All email content is in French as requested
