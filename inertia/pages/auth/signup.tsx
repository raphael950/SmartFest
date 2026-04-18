import { Form, Link } from '@adonisjs/inertia/react'
import { useMemo, useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import '~/css/signup.css'

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')

  const strength = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^a-zA-Z\d]/.test(password)) score += 1
    return score
  }, [password])

  const strengthText = ['', 'Faible', 'Moyen', 'Bon', 'Excellent']

  return (
    <div className="auth-page signup-page">
      <div className="auth-card signup-card">
        <div className="auth-inner">
          <div className="auth-header signup-header">
            <h1>Creer votre compte</h1>
            <p>
              Completez vos informations pour acceder a votre espace et aux services SmartFest.
            </p>
            <div className="signup-step">Étape 1/3</div>
          </div>

          <Form route="new_account.store" className="auth-form">
            {({ errors }) => (
              <>
                <div className="signup-columns">
                  <section className="signup-section">
                    <h2>Identité</h2>

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

                    <div className="field">
                      <label htmlFor="fullName">Nom d'utilisateur (Pseudo)</label>
                      <div className="input-wrap">
                        <User size={18} className="field-icon" />
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="VibeMaster2024"
                          data-invalid={errors.fullName ? 'true' : undefined}
                        />
                      </div>
                      {errors.fullName ? <div className="field-error">{errors.fullName}</div> : null}
                    </div>
                  </section>

                  <section className="signup-section">
                    <h2>Sécurité</h2>

                    <div className="field">
                      <label htmlFor="password">Mot de passe</label>
                      <div className="input-wrap">
                        <Lock size={18} className="field-icon" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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

                      {password ? (
                        <div className="password-strength">
                          <div className="strength-bars">
                            {[0, 1, 2, 3].map((i) => (
                              <span
                                key={i}
                                className={`strength-segment ${i < strength ? `level-${strength}` : ''}`}
                              />
                            ))}
                          </div>
                          <span className="strength-label">{strengthText[strength]}</span>
                        </div>
                      ) : null}

                      {errors.password ? <div className="field-error">{errors.password}</div> : null}
                    </div>

                    <div className="field">
                      <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
                      <div className="input-wrap">
                        <Lock size={18} className="field-icon" />
                        <input
                          id="passwordConfirmation"
                          name="passwordConfirmation"
                          type={showConfirm ? 'text' : 'password'}
                          autoComplete="new-password"
                          data-invalid={errors.passwordConfirmation ? 'true' : undefined}
                        />
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.passwordConfirmation ? (
                        <div className="field-error">{errors.passwordConfirmation}</div>
                      ) : null}
                    </div>
                  </section>
                </div>

                <button type="submit" className="auth-submit">
                  Continuer
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