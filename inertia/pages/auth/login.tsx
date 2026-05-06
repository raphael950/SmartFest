import { Form, Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import '~/css/pages/auth/login.css'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotForm, setShowForgotForm] = useState(false)
  const { flash } = usePage().props as {
    flash?: { error?: string; success?: string }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-inner">
          <div className="auth-header">
            <h1>Bon retour !</h1>
            <p>Connectez-vous pour accéder au tableau de bord et aux outils en temps reel.</p>
          </div>

          {flash?.error ? (
            <div className="auth-alert">
              <strong>Connexion impossible</strong>
              <p>{flash.error}</p>
            </div>
          ) : null}

          {flash?.success && !showForgotForm ? (
            <div className="auth-alert" style={{ backgroundColor: '#dcfce7', borderColor: '#16a34a', color: '#15803d' }}>
              <strong>Succès</strong>
              <p>{flash.success}</p>
            </div>
          ) : null}

          {!showForgotForm ? (
            <Form route="session.store" className="auth-form">
              {({ errors }) => (
                <>
                  <div className="field">
                    <label htmlFor="email">Email ou Pseudo</label>
                    <div className="input-wrap">
                      <Mail size={18} className="field-icon" />
                      <input
                        id="email"
                        name="email"
                        type="text"
                        autoComplete="username"
                        placeholder="nom@exemple.com"
                        data-invalid={errors.email ? 'true' : undefined}
                      />
                    </div>
                    {errors.email ? <div className="field-error">{errors.email}</div> : null}
                  </div>

                  <div className="field">
                    <div className="forgot-row">
                      <label htmlFor="password">Mot de passe</label>
                      <button
                        type="button"
                        className="forgot-link"
                        onClick={() => setShowForgotForm(true)}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>

                    <div className="input-wrap">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        data-invalid={errors.password ? 'true' : undefined}
                      />
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password ? <div className="field-error">{errors.password}</div> : null}
                  </div>

                  <button type="submit" className="auth-submit">
                    Se connecter
                  </button>

                  <div className="login-footer">
                    <p>
                      Pas encore de compte ? <Link route="new_account.create">Creer un compte</Link>
                    </p>
                  </div>
                </>
              )}
            </Form>
          ) : (
            <Form route="password.send_reset" className="auth-form">
              {({ errors }) => (
                <>
                  <div className="field">
                    <label htmlFor="forgot-email">Adresse Email</label>
                    <div className="input-wrap">
                      <Mail size={18} className="field-icon" />
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="nom@exemple.com"
                        data-invalid={errors.email ? 'true' : undefined}
                      />
                    </div>
                    {errors.email ? <div className="field-error">{errors.email}</div> : null}
                  </div>

                  <button type="submit" className="auth-submit">
                    Envoyer le lien
                  </button>

                  <button
                    type="button"
                    className="auth-submit"
                    style={{ backgroundColor: '#6b7280', marginTop: '8px' }}
                    onClick={() => setShowForgotForm(false)}
                  >
                    Retour à la connexion
                  </button>
                </>
              )}
            </Form>
          )}
        </div>
      </div>
    </div>
  )
}