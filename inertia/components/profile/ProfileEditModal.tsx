import ProfileEditForm, { type EditableProfile, type TeamOption } from '@/components/profile/ProfileEditForm'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type ProfileEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: EditableProfile
  teams: TeamOption[]
  hasPublicProfile: boolean
}

const ProfileEditModal = ({ open, onOpenChange, profile, teams, hasPublicProfile }: ProfileEditModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="profile-edit-modal">
        <DialogHeader className="profile-edit-modal__header">
          <DialogTitle>Edition du profil</DialogTitle>
          <DialogDescription>Modifie tes informations et ton avatar sans quitter la page profil.</DialogDescription>
        </DialogHeader>

        <ProfileEditForm profile={profile} teams={teams} hasPublicProfile={hasPublicProfile} />
      </DialogContent>
    </Dialog>
  )
}

export default ProfileEditModal