import type { CSSProperties } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { EventCard } from '../../types/home.types.ts'
import '@/css/components/home/HomeDialog.css'

const eventEmoji = '\u{1F3C1}'

type HomeEventDialogProps = {
  event: EventCard | null
  onClose: () => void
}

const HomeEventDialog = ({ event, onClose }: HomeEventDialogProps) => {
  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="home-team-dialog">
        {event ? (
          <>
            <DialogHeader className="home-team-dialog__header">
              <div
                className="home-team-dialog__badge"
                style={{ '--team-accent': event.accent } as CSSProperties}
                aria-hidden="true"
              >
                {eventEmoji}
              </div>
              <div>
                <DialogTitle className="home-team-dialog__title">{event.title}</DialogTitle>
                <DialogDescription className="home-team-dialog__subtitle">
                  {event.date} / {event.status}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="home-team-dialog__grid">
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Debut</span>
                <strong>{event.startDate}</strong>
              </article>
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Fin</span>
                <strong>{event.endDate ?? 'Date unique'}</strong>
              </article>
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Format</span>
                <strong>{event.format}</strong>
              </article>
              <article className="home-team-dialog__info-card">
                <span className="home-team-dialog__label">Duree</span>
                <strong>{event.duration}</strong>
              </article>
            </div>

            <div className="home-team-dialog__body">
              <p className="home-team-dialog__label">Description</p>
              <p className="home-team-dialog__text">{event.description}</p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default HomeEventDialog
