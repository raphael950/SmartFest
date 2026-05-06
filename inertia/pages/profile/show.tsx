import { router } from '@inertiajs/react'
import { InertiaProps } from '~/types'
import { ArrowUp, Briefcase, Trophy, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
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
    return 'Non renseigné'
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
      lastName: null,
    }
  }

  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ') || null

  return { firstName, lastName }
}

export default function ProfileShow({ profile, teams, canEdit }: InertiaProps<ProfilePageProps>) {
  const [isAvatarBroken, setIsAvatarBroken] = useState(false)
  const [isTeamLogoBroken, setIsTeamLogoBroken] = useState(false)
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
  const shouldShowTeamLogo = Boolean(followedTeamLogo) && !isTeamLogoBroken

  useEffect(() => {
    setIsAvatarBroken(false)
  }, [profile.avatarUrl])

  useEffect(() => {
    setIsTeamLogoBroken(false)
  }, [followedTeamLogo])

  return (
    <section className="profile-page">
      <div
        className="profile-hero-card profile-hero-card--public"
        style={{ '--profile-cover-image': `url(${profileBg})` } as CSSProperties}
      >
        <div className="profile-hero-glow profile-hero-glow--left" />
        <div className="profile-hero-glow profile-hero-glow--right" />

        <div className="profile-hero-main">
          <div className="hero-left">
            <div className="profile-avatar-frame" aria-hidden="false">
              {profile.avatarUrl && !isAvatarBroken ? (
                <img
                  className="profile-avatar-frame__image"
                  src={profile.avatarUrl}
                  alt={profile.pseudo || 'Photo de profil'}
                  onError={() => setIsAvatarBroken(true)}
                />
              ) : (
                <div className="profile-avatar-frame__image profile-avatar-frame__image--placeholder" aria-hidden="true">
                  <UserRound size={42} />
                </div>
              )}
            </div>

            <div className="identity-compact">
              <h2 className="identity-name">
                {identity.firstName}
                {identity.lastName ? <span className="identity-last"> {identity.lastName}</span> : null}
              </h2>
              <p className="identity-meta">
                {age !== null ? `${age} ans` : 'Âge non renseigné'} • {profile.gender || 'Sexe non renseigné'} • {formatBirthDate(profile.birthDate)}
              </p>
              <p className="identity-job"><Briefcase size={14} /> {profile.jobTitle || 'Métier non renseigné'}</p>
            </div>
          </div>

          <aside className="hero-right">
            <div className="instrument instrument--level">
              <div className="instrument-header">
                <p className="instrument-label">Niveau</p>
                <p className="instrument-value">{profile.levelLabel}</p>
              </div>
              <div
                className="level-gauge"
                role="img"
                aria-label={`Progression ${profile.levelProgress.progressPercent} %`}
                style={{ ['--progress' as any]: profile.levelProgress.progressPercent }}
              >
                <svg viewBox="0 0 120 120" aria-hidden="true" className="level-gauge__svg">
                  <circle className="level-gauge__track" cx="60" cy="60" r="46" />
                  <circle className="level-gauge__value" cx="60" cy="60" r="46" />
                </svg>
                <div className="level-center">{Math.round(profile.levelProgress.progressPercent)}%</div>
                <div className="level-gauge__bubbles" aria-hidden="true">
                  <span className="level-gauge__bubble level-gauge__bubble--one" />
                  <span className="level-gauge__bubble level-gauge__bubble--two" />
                  <span className="level-gauge__bubble level-gauge__bubble--three" />
                </div>
              </div>
              <div className="instrument-footer">
                <span className="points">{profile.points} pts</span>
                {canUpgradeLevel ? (
                  <button className="instrument-btn instrument-btn--upgrade" onClick={upgradeLevel} aria-label="Passer niveau">
                    <ArrowUp size={14} />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="instrument instrument--team">
              <div className="instrument-header">
                <p className="instrument-label">Equipe suivie</p>
                <p className="instrument-value">{followedTeamName || 'Aucune'}</p>
              </div>
              <div className="team-display">
                {shouldShowTeamLogo ? (
                  <img src={followedTeamLogo!} alt={followedTeamName || 'Equipe'} className="team-logo" />
                ) : (
                  <div className="team-placeholder"><Trophy size={20} /></div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {canEdit ? (
        <div className="profile-actions profile-actions--outside">
          <button type="button" className="profile-btn profile-btn--primary" onClick={() => setIsEditOpen(true)}>
            Editer mon profil
          </button>
        </div>
      ) : null}

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
