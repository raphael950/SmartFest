import { Link } from '@adonisjs/inertia/react'
import { InertiaProps } from '~/types'
import { Briefcase, Cake, Sparkles, Trophy, UserRound, VenusAndMars } from 'lucide-react'
import '~/css/profile.css'

type PublicProfile = {
  id: number
  pseudo: string | null
  gender: string | null
  birthDate: string | null
  jobTitle: string | null
  followedTeam: string | null
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

export default function ProfileShow({ profile }: InertiaProps<ProfilePageProps>) {
  return (
    <section className="profile-page">
      <div className="profile-hero-card">
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

        <div className="profile-grid">
          <article className="profile-item">
            <span className="profile-item-icon">
              <UserRound size={16} />
            </span>
            <div>
              <p className="profile-item-label">Pseudo</p>
              <p className="profile-item-value">{profile.pseudo || 'Non renseigne'}</p>
            </div>
          </article>

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
              <p className="profile-item-label">Nom du metier</p>
              <p className="profile-item-value">{profile.jobTitle || 'Non renseigne'}</p>
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
