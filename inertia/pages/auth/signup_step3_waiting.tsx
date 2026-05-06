import { useEffect, useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import { router } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import '~/css/pages/auth/signup.css'

export default function SignupStep3Waiting() {
  const { props } = usePage()
  const email = (props.email as string) || ''
  const firstName = (props.firstName as string) || ''
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    // Poll every 3 seconds to check if email is verified
    const interval = setInterval(async () => {
      // You can add a check endpoint here if you want to detect when the link was clicked
      // For now, we'll rely on the user clicking the link in the email
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Countdown timer for resend button
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  const handleResend = async () => {
    setResendIn(60)
    // Resend the verification email
    router.post('new_account.send_verification', {}, { preserveScroll: true })
  }

  return (
    <div className="auth-page signup-page">
      <div className="auth-card signup-card">
        <div className="auth-inner">
          <div className="auth-header signup-header">
            <h1>Vérifiez votre email</h1>
            <p>Nous avons envoyé un lien de vérification à votre adresse email.</p>
            <div className="signup-step">Étape 3/4</div>
          </div>

          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={40} color="white" />
            </div>

            <p style={{ fontSize: '16px', color: '#cbd5e1', marginBottom: '10px' }}>
              Un lien a été envoyé à:
            </p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '30px' }}>
              {email}
            </p>

            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
              Cliquez sur le lien dans votre email pour vérifier votre adresse et continuer votre inscription.
            </p>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '30px' }}>
              Vous serez automatiquement redirigé après vérification.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleResend}
                disabled={resendIn > 0}
                style={{
                  padding: '10px 20px',
                  background: resendIn > 0 ? '#6b7280' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: resendIn > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: resendIn > 0 ? 0.6 : 1,
                }}
              >
                {resendIn > 0 ? `Renvoyer dans ${resendIn}s` : 'Renvoyer le lien'}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '30px' }}>
              Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
