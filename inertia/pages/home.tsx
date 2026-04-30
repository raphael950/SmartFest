import { useState } from 'react'
import HomeEventDialog from '@/components/home/HomeEventDialog'
import HomeEventsSection from '@/components/home/HomeEventsSection'
import HomeHero from '@/components/home/HomeHero'
import HomeTeamDialog from '@/components/home/HomeTeamDialog'
import HomeTeamsSection from '@/components/home/HomeTeamsSection'
import type { EventCard, HomePageProps, TeamCard } from '../types/home.types.ts'
import type { InertiaProps } from '~/types'
import '~/css/pages/home.css'

const Home = ({ events, teams }: InertiaProps<HomePageProps>) => {
  const [teamStart, setTeamStart] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<TeamCard | null>(null)
  const calendarSectionId = 'home-calendar'
  const canSlideTeams = teams.length > 3
  const visibleTeams = canSlideTeams
    ? Array.from({ length: 3 }, (_, offset) => teams[(teamStart + offset) % teams.length])
    : teams

  return (
    <section className="home-page">
      <div className="home-page__inner">
        <HomeHero />

        <HomeEventsSection
          sectionId={calendarSectionId}
          events={events}
          onSelectEvent={(event) => setSelectedEvent(event)}
        />

        <HomeTeamsSection
          visibleTeams={visibleTeams}
          canSlideTeams={canSlideTeams}
          onPrevious={() =>
            canSlideTeams && setTeamStart((current) => (current - 1 + teams.length) % teams.length)
          }
          onNext={() => canSlideTeams && setTeamStart((current) => (current + 1) % teams.length)}
          onSelectTeam={(team) => setSelectedTeam(team)}
        />
      </div>

      <HomeEventDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <HomeTeamDialog team={selectedTeam} onClose={() => setSelectedTeam(null)} />
    </section>
  )
}

export default Home
