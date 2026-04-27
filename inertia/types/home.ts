export type EventTone = 'live' | 'upcoming'

export type EventCard = {
  id: number
  date: string
  startDate: string
  endDate: string | null
  title: string
  status: string
  tone: EventTone
  accent: string
  duration: string
  format: string
  description: string
}

export type TeamCard = {
  id: number
  name: string
  country: string
  accent: string
  description: string
  category: string
  carModel: string
  teamPrincipal: string
}

export type HomePageProps = {
  events: EventCard[]
  teams: TeamCard[]
}
