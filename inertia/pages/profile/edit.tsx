import ProfileEditForm, { type EditableProfile } from '@/components/profile/ProfileEditForm'
import { InertiaProps } from '~/types'
import '~/css/profile.css'

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

        <ProfileEditForm profile={profile} hasPublicProfile={hasPublicProfile} />
      </div>
    </section>
  )
}
