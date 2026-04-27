import type { CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import type { TeamCard } from '@/types/home'
import '@/css/components/home/HomeSections.css'
import '@/css/components/home/HomeTeamSection.css'

const teamEmoji = '\u{1F3CE}\uFE0F'

type HomeTeamsSectionProps = {
  visibleTeams: TeamCard[]
  canSlideTeams: boolean
  onPrevious: () => void
  onNext: () => void
  onSelectTeam: (team: TeamCard) => void
}

const HomeTeamsSection = ({
  visibleTeams,
  canSlideTeams,
  onPrevious,
  onNext,
  onSelectTeam,
}: HomeTeamsSectionProps) => {
  return (
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
            onClick={onPrevious}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="home-section__control"
            aria-label="Voir les equipes suivantes"
            disabled={!canSlideTeams}
            onClick={onNext}
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
              onClick={() => onSelectTeam(team)}
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
  )
}

export default HomeTeamsSection
