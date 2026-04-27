import type { CSSProperties } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { TeamCard } from '@/types/home'
import '@/css/components/home/HomeDialog.css'

const teamEmoji = '\u{1F3CE}\uFE0F'

type HomeTeamDialogProps = {
  team: TeamCard | null
  onClose: () => void
}

const HomeTeamDialog = ({ team, onClose }: HomeTeamDialogProps) => {
  return (
    <Dialog open={Boolean(team)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="home-team-dialog">
        {team ? (
          <>
            <DialogHeader className="home-team-dialog__header">
              <div
                className="home-team-dialog__badge"
                style={{ '--team-accent': team.accent } as CSSProperties}
                aria-hidden="true"
              >
                {teamEmoji}
              </div>
              <div>
                <DialogTitle className="home-team-dialog__title">{team.name}</DialogTitle>
                <DialogDescription className="home-team-dialog__subtitle">
                  {team.country} / {team.category}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="home-team-dialog__grid">
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Voiture</span>
                <strong>{team.carModel}</strong>
              </article>
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Team principal</span>
                <strong>{team.teamPrincipal}</strong>
              </article>
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Pays</span>
                <strong>{team.country}</strong>
              </article>
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Categorie</span>
                <strong>{team.category}</strong>
              </article>
            </div>

            <div className="home-team-dialog__body">
              <p className="home-team-dialog__label">Description</p>
              <p className="home-team-dialog__text">{team.description}</p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default HomeTeamDialog
