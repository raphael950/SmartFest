import type { CSSProperties } from 'react'
import { CalendarDays } from 'lucide-react'
import type { EventCard } from '../../types/home.types.ts'
import '@/css/components/home/HomeSections.css'
import '@/css/components/home/HomeEventSection.css'

type HomeEventsSectionProps = {
  sectionId: string
  events: EventCard[]
  onSelectEvent: (event: EventCard) => void
}

const HomeEventsSection = ({ sectionId, events, onSelectEvent }: HomeEventsSectionProps) => {
  return (
    <section id={sectionId} className="home-section">
      <header className="home-section__header">
        <div className="home-section__title">
          <CalendarDays className="home-section__title-icon" />
          <h3>Calendrier des evenements</h3>
        </div>
      </header>

      <div className="home-events-grid">
        {events.length ? (
          events.map((event) => (
            <button
              type="button"
              key={event.id}
              className="home-event-card home-event-card--interactive"
              style={{ '--event-accent': event.accent } as CSSProperties}
              onClick={() => onSelectEvent(event)}
            >
              <p className="home-event-card__date">{event.date}</p>
              <h4>{event.title}</h4>
              <span className="home-status-pill" data-tone={event.tone}>
                {event.status}
              </span>
              <span className="home-event-card__cta">Voir le detail</span>
            </button>
          ))
        ) : (
          <article className="home-event-card home-event-card--empty">
            <p className="home-event-card__date">Aucun evenement</p>
            <h4>Le calendrier sera rempli automatiquement quand des evenements seront ajoutes en base.</h4>
          </article>
        )}
      </div>
    </section>
  )
}

export default HomeEventsSection
