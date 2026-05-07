import { Form, Link } from '@adonisjs/inertia/react'
import { Mail } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import '~/css/pages/auth/signup.css'

export default function SignupStep2() {
  const { props } = usePage()
  const fullName = (props.fullName as string) || ''

  const { flash } = usePage().props as {
    flash?: { error?: string; success?: string }
  }

  return (
    <div className="auth-page signup-page">
      <div className="auth-card signup-card">
        <div className="auth-inner">
          <div className="auth-header signup-header">
            <h1>Creer votre compte</h1>
            <p>Entrez votre adresse email pour continuer, {fullName}.</p>
            <div className="signup-step">Étape 2/4</div>
          </div>

          {flash?.error ? (
            <div className="auth-alert">
              <strong>Erreur</strong>
              <p>{flash.error}</p>
            </div>
          ) : null}

          <Form route="new_account.send_verification" className="auth-form">
            {({ errors }) => (
              <>
                <div className="field">
                  <label htmlFor="email">Adresse Email</label>
                  <div className="input-wrap">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="festivalier@gmail.com"
                      data-invalid={errors.email ? 'true' : undefined}
                    />
                  </div>
                  {errors.email ? <div className="field-error">{errors.email}</div> : null}
                </div>

                <button type="submit" className="auth-submit">
                  Valider
                </button>

                <div className="signup-footer-inline">
                  <p>
                    Déjà un compte ? <Link route="session.create">Se connecter</Link>
                  </p>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  )
}
