import { Link } from '@adonisjs/inertia/react'
import { InertiaProps } from '~/types'
import { Briefcase, Cake, Sparkles, Trophy, UserRound, VenusAndMars } from 'lucide-react'
import { useEffect, useState } from 'react'
import profileBg from '~/images/profile/profile-bg.jpg'
import '~/css/profile.css'

type PublicProfile = {
  id: number
  fullName: string | null
  pseudo: string | null
  avatarUrl: string | null
  gender: string | null
  birthDate: string | null
  jobTitle: string | null
  followedTeam: string | null
  points: number
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert'
  levelLabel: string
  levelProgress: {
    nextLevel: 'debutant' | 'intermediaire' | 'avance' | 'expert' | null
    nextLevelLabel: string | null
    currentLevelMinPoints: number
    nextLevelThreshold: number | null
    progressPercent: number
    pointsToNextLevel: number
    isMaxLevel: boolean
  }
}

type ProfilePageProps = {
  profile: PublicProfile
}

const formatBirthDate = (value: string | null) => {
  if (!value) {
    return 'Non renseignee'
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const computeAge = (birthDate: string | null) => {
  if (!birthDate) {
    return null
  }

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) {
    return null
  }

  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years -= 1
  }

  return years >= 0 ? years : null
}

const splitIdentity = (fullName: string | null, pseudo: string | null) => {
  if (!fullName || !fullName.trim()) {
    return {
      firstName: pseudo || 'Fan',
      lastName: 'SmartFest',
    }
  }

  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ') || '-'

  return { firstName, lastName }
}

export default function ProfileShow({ profile }: InertiaProps<ProfilePageProps>) {
  const [isAvatarBroken, setIsAvatarBroken] = useState(false)
  const age = computeAge(profile.birthDate)
  const identity = splitIdentity(profile.fullName, profile.pseudo)

  useEffect(() => {
    setIsAvatarBroken(false)
  }, [profile.avatarUrl])

  return (
    <section className="profile-page">
      <div
        className="profile-hero-card profile-hero-card--public"
        style={{ '--profile-cover-image': `url(${profileBg})` } as React.CSSProperties}
      >
        <div className="profile-hero-glow profile-hero-glow--left" />
        <div className="profile-hero-glow profile-hero-glow--right" />

        <div className="profile-headline">
          <span className="profile-badge">
            <Sparkles size={14} />
            Profil public
          </span>
          <h1>
            @{profile.pseudo || `fan-${profile.id}`}
          </h1>
          <p>Un profil SmartFest public pour partager sa vibe course et sa team preferee.</p>
        </div>

        <article className="profile-identity-card">
          <div className="profile-identity-avatar-wrap">
            {profile.avatarUrl && !isAvatarBroken ? (
              <img
                src={profile.avatarUrl}
                alt={`Photo de ${profile.pseudo || 'profil'}`}
                className="profile-identity-avatar"
                onError={() => setIsAvatarBroken(true)}
              />
            ) : (
              <div className="profile-identity-avatar-placeholder">
                <UserRound size={42} />
              </div>
            )}
          </div>

          <div className="profile-identity-info">
            <p className="profile-identity-kicker">Fiche identite</p>
            <div className="profile-identity-names">
              <div>
                <p className="profile-item-label">Prenom</p>
                <p className="profile-item-value">{identity.firstName}</p>
              </div>
              <div>
                <p className="profile-item-label">Nom</p>
                <p className="profile-item-value">{identity.lastName}</p>
              </div>
              <div>
                <p className="profile-item-label">Age</p>
                <p className="profile-item-value">{age !== null ? `${age} ans` : 'Non renseigne'}</p>
              </div>
            </div>
          </div>
        </article>

        <div className="profile-grid">
          <article className="profile-item">
            <span className="profile-item-icon">
              <VenusAndMars size={16} />
            </span>
            <div>
              <p className="profile-item-label">Sexe / Genre</p>
              <p className="profile-item-value">{profile.gender || 'Non renseigne'}</p>
            </div>
          </article>

          <article className="profile-item">
            <span className="profile-item-icon">
              <Cake size={16} />
            </span>
            <div>
              <p className="profile-item-label">Date de naissance</p>
              <p className="profile-item-value">{formatBirthDate(profile.birthDate)}</p>
            </div>
          </article>

          <article className="profile-item">
            <span className="profile-item-icon">
              <Briefcase size={16} />
            </span>
            <div>
              <p className="profile-item-label">Metier</p>
              <p className="profile-item-value">{profile.jobTitle || 'Non renseigne'}</p>
            </div>
          </article>

          <article className="profile-item">
            <span className="profile-item-icon">
              <Sparkles size={16} />
            </span>
            <div className="profile-progress-card">
              <div className="profile-progress-card__header">
                <div>
                  <p className="profile-item-label">Points & niveau</p>
                  <p className="profile-item-value">{profile.levelLabel}</p>
                </div>
                <span className="profile-progress-card__target">{profile.points} pts</span>
              </div>
              <p className="profile-progress-card__summary">
                {profile.levelProgress.isMaxLevel
                  ? 'Niveau maximum atteint'
                  : `${profile.levelProgress.pointsToNextLevel} pts avant ${profile.levelProgress.nextLevelLabel}`}
              </p>
              <div className="profile-progress-bar" aria-hidden="true">
                <span
                  className="profile-progress-bar__fill"
                  style={{ width: `${profile.levelProgress.progressPercent}%` }}
                />
              </div>
              <div className="profile-progress-card__scale">
                <span>{profile.levelProgress.currentLevelMinPoints} pts</span>
                <span>{profile.levelProgress.nextLevelThreshold ?? profile.points} pts</span>
              </div>
            </div>
          </article>

          <article className="profile-item">
            <span className="profile-item-icon">
              <Trophy size={16} />
            </span>
            <div>
              <p className="profile-item-label">Equipe suivie</p>
              <p className="profile-item-value">{profile.followedTeam || 'Non renseignee'}</p>
            </div>
          </article>
        </div>

        <div className="profile-actions">
          <Link route="home" className="profile-btn profile-btn--ghost">
            Retour accueil
          </Link>
        </div>
      </div>
    </section>
  )
}
