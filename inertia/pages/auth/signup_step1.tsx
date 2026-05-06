import { Form, Link } from '@adonisjs/inertia/react'
import { User } from 'lucide-react'
import '~/css/pages/auth/signup.css'

export default function SignupStep1() {
  return (
    <div className="auth-page signup-page">
      <div className="auth-card signup-card">
        <div className="auth-inner">
          <div className="auth-header signup-header">
            <h1>Creer votre compte</h1>
            <p>Commençons par vos informations de base.</p>
            <div className="signup-step">Étape 1/4</div>
          </div>

          <Form route="new_account.store_identity" className="auth-form">
            {({ errors }) => (
              <>
                <div className="field">
                  <label htmlFor="fullName">Nom complet</label>
                  <div className="input-wrap">
                    <User size={18} className="field-icon" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Nom"
                      data-invalid={errors.fullName ? 'true' : undefined}
                    />
                  </div>
                  {errors.fullName ? <div className="field-error">{errors.fullName}</div> : null}
                </div>

                <div className="field">
                  <label htmlFor="firstName">Prénom</label>
                  <div className="input-wrap">
                    <User size={18} className="field-icon" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Prénom"
                      data-invalid={errors.firstName ? 'true' : undefined}
                    />
                  </div>
                  {errors.firstName ? <div className="field-error">{errors.firstName}</div> : null}
                </div>

                <button type="submit" className="auth-submit">
                  Suivant
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
