import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import '~/css/pages/auth/login.css'

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { flash } = usePage().props as {
    flash?: { error?: string; success?: string }
  }
  
  // Get userId from URL query params
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const userId = searchParams.get('userId')
  const signature = searchParams.get('signature')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const passwordConfirmation = formData.get('passwordConfirmation') as string

    // Client-side validation
    if (!password || !passwordConfirmation) {
      setErrors({ form: 'Veuillez remplir tous les champs.' })
      setIsLoading(false)
      return
    }

    if (password !== passwordConfirmation) {
      setErrors({ form: 'Les mots de passe ne correspondent pas.' })
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setErrors({ form: 'Le mot de passe doit contenir au moins 8 caractères.' })
      setIsLoading(false)
      return
    }

    // Use Inertia router to post with CSRF token included automatically
    // Keep query params in URL for signature validation
    router.post(`/reset-password?userId=${userId}&signature=${signature}`, {
      password,
      passwordConfirmation,
      userId: userId || '',
    }, {
      preserveScroll: true,
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-inner">
          <div className="auth-header">
            <h1>Réinitialiser le mot de passe</h1>
            <p>Entrez votre nouveau mot de passe pour accéder à nouveau à votre compte.</p>
          </div>

          {flash?.error ? (
            <div className="auth-alert">
              <strong>Erreur</strong>
              <p>{flash.error}</p>
            </div>
          ) : null}

          {errors.form ? (
            <div className="auth-alert">
              <strong>Erreur</strong>
              <p>{errors.form}</p>
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Hidden userId field to include in signed request */}
            {userId && <input type="hidden" name="userId" value={userId} />}

            <div className="field">
              <label htmlFor="password">Nouveau mot de passe</label>
              <div className="input-wrap">
                <Lock size={18} className="field-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Au moins 8 caractères"
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
            </div>

            <button type="submit" className="auth-submit">
              Réinitialiser le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
