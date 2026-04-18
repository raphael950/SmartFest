import { Form, Link } from '@adonisjs/inertia/react'
import { InertiaProps } from '~/types'
import { Briefcase, Cake, Save, Trophy, User, UserRound, VenusAndMars } from 'lucide-react'
import '~/css/profile.css'

type EditableProfile = {
  fullName: string | null
  pseudo: string | null
  gender: string | null
  birthDate: string | null
  jobTitle: string | null
  followedTeam: string | null
}

type ProfileEditPageProps = {
  profile: EditableProfile
  hasPublicProfile: boolean
}

export default function ProfileEdit({ profile, hasPublicProfile }: InertiaProps<ProfileEditPageProps>) {
  return (
    <section className="profile-page">
      <div className="profile-hero-card profile-hero-card--edit">
        <div className="profile-hero-glow profile-hero-glow--left" />
        <div className="profile-hero-glow profile-hero-glow--right" />

        <div className="profile-headline">
          <span className="profile-badge">Mon profil</span>
          <h1>Edition du profil</h1>
          <p>
            Renseigne ton profil public pour que les autres puissent te retrouver facilement.
          </p>
        </div>

        <Form route="profile.update" className="profile-edit-form">
          {({ errors }) => (
            <>
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
                  <label htmlFor="gender">Sexe / Genre</label>
                  <div className="input-wrap">
                    <VenusAndMars size={18} className="field-icon" />
                    <input
                      id="gender"
                      name="gender"
                      type="text"
                      defaultValue={profile.gender || ''}
                      placeholder="Homme, Femme, Non-binaire..."
                      data-invalid={errors.gender ? 'true' : undefined}
                    />
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
                  <label htmlFor="followedTeam">Equipe suivie</label>
                  <div className="input-wrap">
                    <Trophy size={18} className="field-icon" />
                    <input
                      id="followedTeam"
                      name="followedTeam"
                      type="text"
                      defaultValue={profile.followedTeam || ''}
                      placeholder="Ferrari AF Corse"
                      data-invalid={errors.followedTeam ? 'true' : undefined}
                    />
                  </div>
                  {errors.followedTeam ? <div className="field-error">{errors.followedTeam}</div> : null}
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
                  <p className="profile-hint">
                    Ton profil public sera accessible apres definition d&apos;un pseudo valide.
                  </p>
                )}
              </div>
            </>
          )}
        </Form>
      </div>
    </section>
  )
}
