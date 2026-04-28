import { Form, Link } from '@adonisjs/inertia/react'
import { ChangeEvent, useState } from 'react'
import { Briefcase, Cake, Camera, Save, Trophy, User, UserRound, VenusAndMars } from 'lucide-react'
import '~/css/profile.css'

export type EditableProfile = {
  fullName: string | null
  pseudo: string | null
  gender: string | null
  birthDate: string | null
  jobTitle: string | null
  followedTeamId: number | null
  followedTeamName: string | null
  avatarUrl: string | null
}

export type TeamOption = {
  id: number
  name: string
}

type ProfileEditFormProps = {
  profile: EditableProfile
  teams: TeamOption[]
  hasPublicProfile: boolean
}

const ProfileEditForm = ({ profile, teams, hasPublicProfile }: ProfileEditFormProps) => {
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl)
  const [isAvatarBroken, setIsAvatarBroken] = useState(false)

  const hasAvatarPreview = Boolean(avatarPreview) && !isAvatarBroken

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) {
      setAvatarPreview(profile.avatarUrl)
      setIsAvatarBroken(false)
      return
    }

    setAvatarPreview(URL.createObjectURL(file))
    setIsAvatarBroken(false)
  }

  return (
    <Form route="profile.update" className="profile-edit-form" encType="multipart/form-data">
      {({ errors }) => (
        <>
          <div className="profile-avatar-edit-card">
            <div className="profile-avatar-preview">
              {hasAvatarPreview ? (
                <img
                  src={avatarPreview!}
                  alt="Apercu photo de profil"
                  className="profile-avatar-image"
                  onError={() => setIsAvatarBroken(true)}
                />
              ) : (
                <UserRound size={38} />
              )}
            </div>

            <div className="profile-avatar-copy">
              <h2>Photo de profil</h2>
              <p>Ajoute une photo claire pour etre reconnaissable sur ton profil public.</p>
            </div>

            <label htmlFor="profilePhoto" className="profile-avatar-upload-btn">
              <Camera size={16} />
              Importer une image
            </label>

            <input
              id="profilePhoto"
              name="profilePhoto"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="profile-avatar-file-input"
              onChange={onAvatarChange}
            />
          </div>

          <div className="profile-edit-grid">
            <div className="field">
              <label htmlFor="fullName">Nom complet (optionnel)</label>
              <div className="input-wrap">
                <User size={18} className="field-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  defaultValue={profile.fullName || ''}
                  placeholder="Alex Martin"
                  data-invalid={errors.fullName ? 'true' : undefined}
                />
              </div>
              {errors.fullName ? <div className="field-error">{errors.fullName}</div> : null}
            </div>

            <div className="field">
              <label htmlFor="pseudo">Pseudo public</label>
              <div className="input-wrap">
                <UserRound size={18} className="field-icon" />
                <input
                  id="pseudo"
                  name="pseudo"
                  type="text"
                  defaultValue={profile.pseudo || ''}
                  placeholder="VibeMaster2026"
                  autoComplete="nickname"
                  data-invalid={errors.pseudo ? 'true' : undefined}
                />
              </div>
              {errors.pseudo ? <div className="field-error">{errors.pseudo}</div> : null}
            </div>

            <div className="field">
              <label htmlFor="gender">Sexe</label>
              <div className="input-wrap">
                <VenusAndMars size={18} className="field-icon" />
                <select
                  id="gender"
                  name="gender"
                  defaultValue={profile.gender || ''}
                  data-invalid={errors.gender ? 'true' : undefined}
                >
                  <option value="" disabled>
                    Selectionner
                  </option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              </div>
              {errors.gender ? <div className="field-error">{errors.gender}</div> : null}
            </div>

            <div className="field">
              <label htmlFor="birthDate">Date de naissance</label>
              <div className="input-wrap">
                <Cake size={18} className="field-icon" />
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={profile.birthDate || ''}
                  data-invalid={errors.birthDate ? 'true' : undefined}
                />
              </div>
              {errors.birthDate ? <div className="field-error">{errors.birthDate}</div> : null}
            </div>

            <div className="field">
              <label htmlFor="jobTitle">Nom du metier</label>
              <div className="input-wrap">
                <Briefcase size={18} className="field-icon" />
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  defaultValue={profile.jobTitle || ''}
                  placeholder="Chef de projet evenementiel"
                  data-invalid={errors.jobTitle ? 'true' : undefined}
                />
              </div>
              {errors.jobTitle ? <div className="field-error">{errors.jobTitle}</div> : null}
            </div>

            <div className="field field-full-row">
              <label htmlFor="followedTeamId">Equipe suivie</label>
              <div className="input-wrap">
                <Trophy size={18} className="field-icon" />
                <select
                  id="followedTeamId"
                  name="followedTeamId"
                  defaultValue={profile.followedTeamId?.toString() || ''}
                  data-invalid={errors.followedTeamId ? 'true' : undefined}
                >
                  <option value="" disabled>
                    Selectionner une equipe
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.followedTeamId ? <div className="field-error">{errors.followedTeamId}</div> : null}
            </div>
          </div>

          <div className="profile-actions profile-actions--edit">
            <button type="submit" className="auth-submit profile-save-btn">
              <Save size={16} />
              Enregistrer mon profil
            </button>

            {hasPublicProfile && profile.pseudo ? (
              <Link href={`/profil/${profile.pseudo}`} className="profile-btn profile-btn--ghost">
                Voir mon profil public
              </Link>
            ) : (
              <p className="profile-hint">Ton profil public sera accessible apres definition d&apos;un pseudo valide.</p>
            )}
          </div>
        </>
      )}
    </Form>
  )
}

export default ProfileEditForm