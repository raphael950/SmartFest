import type { CSSProperties } from 'react'
import { useState } from 'react'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { InertiaProps } from '~/types'
import '~/css/home.css'

type EventTone = 'live' | 'upcoming'

type EventCard = {
  id: number
  date: string
  title: string
  status: string
  tone: EventTone
  accent: string
}

type TeamCard = {
  id: number
  name: string
  country: string
  accent: string
  description: string
  category: string
  carModel: string
  teamPrincipal: string
}

type HomePageProps = {
  events: EventCard[]
  teams: TeamCard[]
}

const teamEmoji = '\u{1F3CE}\uFE0F'

const Home = ({ events, teams }: InertiaProps<HomePageProps>) => {
  const [teamStart, setTeamStart] = useState(0)
  const [selectedTeam, setSelectedTeam] = useState<TeamCard | null>(null)
  const canSlideTeams = teams.length > 3
  const visibleTeams = canSlideTeams
    ? Array.from({ length: 3 }, (_, offset) => teams[(teamStart + offset) % teams.length])
    : teams

  return (
    <section className="home-page">
      <div className="home-page__inner">
        <section className="home-hero">
          <div className="home-hero__content">
            <span className="home-hero__badge">
              <span className="home-hero__badge-dot" />
              En direct
            </span>

            <div className="home-hero__copy">
              <h2>
                Bienvenue au
                <span>Circuit Bugatti</span>
              </h2>
              <p>
                Suivez en temps reel les evenements de course automobile sur le mythique circuit du
                Mans.
              </p>
            </div>

            <a href="#home-calendar" className="home-hero__cta">
              <span>Suivre l&apos;evenement en direct</span>
              <ArrowRight className="home-hero__cta-icon" />
            </a>
          </div>
        </section>

        <section id="home-calendar" className="home-section">
          <header className="home-section__header">
            <div className="home-section__title">
              <CalendarDays className="home-section__title-icon" />
              <h3>Calendrier des evenements</h3>
            </div>
          </header>

          <div className="home-events-grid">
            {events.length ? (
              events.map((event) => (
                <article
                  key={event.id}
                  className="home-event-card"
                  style={{ '--event-accent': event.accent } as CSSProperties}
                >
                  <p className="home-event-card__date">{event.date}</p>
                  <h4>{event.title}</h4>
                  <span className="home-status-pill" data-tone={event.tone}>
                    {event.status}
                  </span>
                </article>
              ))
            ) : (
              <article className="home-event-card home-event-card--empty">
                <p className="home-event-card__date">Aucun evenement</p>
                <h4>Le calendrier sera rempli automatiquement quand des evenements seront ajoutes en base.</h4>
              </article>
            )}
          </div>
        </section>

        <section className="home-section">
          <header className="home-section__header">
            <div className="home-section__title">
              <Flag className="home-section__title-icon" />
              <h3>Equipes engagees</h3>
            </div>

            <div className="home-section__controls">
              <button
                type="button"
                className="home-section__control"
                aria-label="Voir les equipes precedentes"
                disabled={!canSlideTeams}
                onClick={() =>
                  canSlideTeams && setTeamStart((current) => (current - 1 + teams.length) % teams.length)
                }
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                className="home-section__control"
                aria-label="Voir les equipes suivantes"
                disabled={!canSlideTeams}
                onClick={() => canSlideTeams && setTeamStart((current) => (current + 1) % teams.length)}
              >
                <ChevronRight />
              </button>
            </div>
          </header>

          <div className="home-teams-grid">
            {visibleTeams.length ? (
              visibleTeams.map((team) => (
                <button
                  type="button"
                  key={team.id}
                  className="home-team-card home-team-card--interactive"
                  style={{ '--team-accent': team.accent } as CSSProperties}
                  onClick={() => setSelectedTeam(team)}
                >
                  <span className="home-team-card__emoji" aria-hidden="true">
                    {teamEmoji}
                  </span>
                  <h4>{team.name}</h4>
                  <p>{team.country}</p>
                  <span className="home-team-card__cta">Voir la fiche equipe</span>
                </button>
              ))
            ) : (
              <article className="home-team-card home-team-card--empty">
                <span className="home-team-card__emoji" aria-hidden="true">
                  {teamEmoji}
                </span>
                <h4>Aucune equipe</h4>
                <p>Ajoute des equipes dans la base pour remplir cette section.</p>
              </article>
            )}
          </div>
        </section>
      </div>

      <Dialog open={Boolean(selectedTeam)} onOpenChange={(open) => !open && setSelectedTeam(null)}>
        <DialogContent className="home-team-dialog">
          {selectedTeam ? (
            <>
              <DialogHeader className="home-team-dialog__header">
                <div
                  className="home-team-dialog__badge"
                  style={{ '--team-accent': selectedTeam.accent } as CSSProperties}
                  aria-hidden="true"
                >
                  {teamEmoji}
                </div>
                <div>
                  <DialogTitle className="home-team-dialog__title">{selectedTeam.name}</DialogTitle>
                  <DialogDescription className="home-team-dialog__subtitle">
                    {selectedTeam.country} / {selectedTeam.category}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="home-team-dialog__grid">
                <article className="home-team-dialog__info-card">
                  <span className="home-team-dialog__label">Voiture</span>
                  <strong>{selectedTeam.carModel}</strong>
                </article>
                <article className="home-team-dialog__info-card">
                  <span className="home-team-dialog__label">Team principal</span>
                  <strong>{selectedTeam.teamPrincipal}</strong>
                </article>
                <article className="home-team-dialog__info-card">
                  <span className="home-team-dialog__label">Pays</span>
                  <strong>{selectedTeam.country}</strong>
                </article>
                <article className="home-team-dialog__info-card">
                  <span className="home-team-dialog__label">Categorie</span>
                  <strong>{selectedTeam.category}</strong>
                </article>
              </div>

              <div className="home-team-dialog__body">
                <p className="home-team-dialog__label">Description</p>
                <p className="home-team-dialog__text">{selectedTeam.description}</p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default Home
