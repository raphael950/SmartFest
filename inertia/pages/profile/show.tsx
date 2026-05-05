import { Link } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { InertiaProps } from '~/types'
import { ArrowUp, Briefcase, Sparkles, Trophy, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import profileBg from '~/images/profile/profile-bg.jpg'
import ProfileEditModal from '@/components/profile/ProfileEditModal'
import type { TeamOption } from '@/components/profile/ProfileEditForm'
import { resolveImageSrc } from '@/lib/home_team_media'
import '~/css/pages/auth/profile.css'
import { UserLevelProgress } from '#services/user_level_service'

type PublicProfile = {
  id: number
  fullName: string | null
  pseudo: string | null
  avatarUrl: string | null
  gender: string | null
  birthDate: string | null
  jobTitle: string | null
  followedTeamId: number | null
  points: number
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert'
  levelLabel: string
  levelProgress: UserLevelProgress
}

type ProfilePageProps = {
  profile: PublicProfile
  teams: TeamOption[]
  canEdit: boolean
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

export default function ProfileShow({ profile, teams, canEdit }: InertiaProps<ProfilePageProps>) {
  const [isAvatarBroken, setIsAvatarBroken] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const age = computeAge(profile.birthDate)
  const identity = splitIdentity(profile.fullName, profile.pseudo)
  const canUpgradeLevel = canEdit && !profile.levelProgress.isMaxLevel && profile.levelProgress.pointsToNextLevel === 0

  const upgradeLevel = () => {
    router.post('/mon-profil/niveau', {}, { preserveScroll: true })
  }
  const followedTeam = profile.followedTeamId
    ? teams.find((t: TeamOption) => t.id === profile.followedTeamId) ?? null
    : null
  const followedTeamName = followedTeam?.name ?? null
  const followedTeamLogo = followedTeam ? resolveImageSrc(followedTeam.name, 'logo') : null

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
          <p>Partage la vibe de la course.</p>
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
              <div>
                <p className="profile-item-label">Sexe</p>
                <p className="profile-item-value">{profile.gender || 'Non renseigne'}</p>
              </div>
              <div>
                <p className="profile-item-label">Naissance</p>
                <p className="profile-item-value">{formatBirthDate(profile.birthDate)}</p>
              </div>
            </div>
          </div>
        </article>

        <div className="profile-grid">
          <article className="profile-item">
            <span className="profile-item-icon">
              <Briefcase size={16} />
            </span>
            <div>
              <p className="profile-item-label">Metier</p>
              <p className="profile-item-value">{profile.jobTitle || 'Non renseigne'}</p>
            </div>
          </article>

          <article className="profile-item profile-item--wide">
            <span className="profile-item-icon profile-item-icon--accent">
              <Sparkles size={16} />
            </span>
            <div className="profile-progress-card">
              <div className="profile-progress-card__header">
                <div>
                  <p className="profile-item-label">Points & niveau</p>
                  <div className="profile-progress-card__level-with-btn">
                    <p className="profile-item-value">{profile.levelLabel}</p>
                    {canUpgradeLevel ? (
                      <button
                        type="button"
                        className="profile-progress-card__upgrade-btn profile-progress-card__upgrade-btn--in-header"
                        onClick={upgradeLevel}
                        aria-label="Passer au niveau supérieur"
                        title="Passer au niveau supérieur"
                      >
                        <ArrowUp size={16} />
                      </button>
                    ) : null}
                  </div>
                </div>
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
                <span>{profile.points} pts</span>
                <span>{profile.levelProgress.nextLevelThreshold ?? profile.points} pts</span>
              </div>
            </div>
          </article>

          {followedTeamName ? (
            <article className="profile-item profile-item--team">
              <div className="profile-team-logo-box">
                {followedTeamLogo ? (
                  <img
                    src={followedTeamLogo}
                    alt={`Logo de ${followedTeamName}`}
                    className="profile-team-logo"
                  />
                ) : (
                  <span className="profile-item-icon profile-item-icon--team">
                    <Trophy size={16} />
                  </span>
                )}
              </div>
              <div className="profile-team-card">
                <p className="profile-item-label">Equipe suivie</p>
                <p className="profile-item-value">{followedTeamName}</p>
              </div>
            </article>
          ) : null}
        </div>

        <div className="profile-actions">
          {canEdit ? (
            <button type="button" className="profile-btn profile-btn--primary" onClick={() => setIsEditOpen(true)}>
              Editer mon profil
            </button>
          ) : null}

          <Link route="home" className="profile-btn profile-btn--ghost">
            Retour accueil
          </Link>
        </div>
      </div>

      {canEdit ? (
        <ProfileEditModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          profile={{
            fullName: profile.fullName,
            pseudo: profile.pseudo,
            gender: profile.gender,
            birthDate: profile.birthDate,
            jobTitle: profile.jobTitle,
            followedTeamId: profile.followedTeamId,
            followedTeamName: followedTeamName,
            avatarUrl: profile.avatarUrl,
            points: profile.points,
            level: profile.level,
            levelLabel: profile.levelLabel,
            levelProgress: profile.levelProgress
          }}
          teams={teams}
          hasPublicProfile={Boolean(profile.pseudo)}
        />
      ) : null}
    </section>
  )
}
