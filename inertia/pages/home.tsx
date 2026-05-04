import { useState } from 'react'
import HomeEventDialog from '@/components/home/HomeEventDialog'
import HomeEventsSection from '@/components/home/HomeEventsSection'
import HomeHero from '@/components/home/HomeHero'
import HomeTeamDialog from '@/components/home/HomeTeamDialog'
import HomeTeamsSection from '@/components/home/HomeTeamsSection'
import { attachTeamMedia } from '@/lib/home_team_media'
import type { EventCard, HomePageProps, TeamCardWithMedia } from '../types/home.types.ts'
import type { InertiaProps } from '~/types'
import '~/css/pages/home.css'

const Home = ({ events, teams }: InertiaProps<HomePageProps>) => {
  const [teamStart, setTeamStart] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<TeamCardWithMedia | null>(null)
  const calendarSectionId = 'home-calendar'
  const teamsWithMedia = teams.map(attachTeamMedia)
  const canSlideTeams = teamsWithMedia.length > 3
  const visibleTeams = canSlideTeams
    ? Array.from(
        { length: 3 },
        (_, offset) => teamsWithMedia[(teamStart + offset) % teamsWithMedia.length]
      )
    : teamsWithMedia

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
            canSlideTeams &&
            setTeamStart((current) => (current - 1 + teamsWithMedia.length) % teamsWithMedia.length)
          }
          onNext={() =>
            canSlideTeams && setTeamStart((current) => (current + 1) % teamsWithMedia.length)
          }
          onSelectTeam={(team) => setSelectedTeam(team)}
        />
      </div>

      <HomeEventDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <HomeTeamDialog team={selectedTeam} onClose={() => setSelectedTeam(null)} />
    </section>
  )
}

export default Home
