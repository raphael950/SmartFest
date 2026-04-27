import RaceEvent from '#models/race_event'
import Team from '#models/team'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

const EVENT_STATUS_LABELS: Record<'live' | 'upcoming', string> = {
  live: 'En cours',
  upcoming: 'A venir',
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const formatSingleDate = (date: DateTime) => `${date.toFormat('d')} ${capitalize(date.setLocale('fr').toFormat('LLLL yyyy'))}`

const formatDateRange = (startDate: DateTime, endDate: DateTime | null) => {
  if (!endDate || startDate.hasSame(endDate, 'day')) {
    return formatSingleDate(startDate)
  }

  if (startDate.hasSame(endDate, 'month')) {
    return `${startDate.toFormat('d')}-${endDate.toFormat('d')} ${capitalize(startDate.setLocale('fr').toFormat('LLLL yyyy'))}`
  }

  return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`
}

const getEventDurationLabel = (startDate: DateTime, endDate: DateTime | null) => {
  if (!endDate || startDate.hasSame(endDate, 'day')) {
    return '1 jour'
  }

  const days = Math.round(endDate.diff(startDate, 'days').days) + 1
  return `${days} jours`
}

const getEventFormatLabel = (startDate: DateTime, endDate: DateTime | null) => {
  if (endDate && !startDate.hasSame(endDate, 'day')) {
    return 'Week-end endurance'
  }

  return 'Session piste'
}

const getEventDescription = (title: string, status: 'live' | 'upcoming', startDate: DateTime, endDate: DateTime | null) => {
  if (status === 'live') {
    return `${title} est actuellement en cours sur le circuit avec un suivi en continu des relais, du rythme de course et des interventions piste.`
  }

  if (endDate && !startDate.hasSame(endDate, 'day')) {
    return `${title} se deroulera sur plusieurs jours au circuit Bugatti, avec une preparation equipee pour les seances, la course et les operations de stand.`
  }

  return `${title} est programme sur une journee au circuit Bugatti, avec un suivi centre sur la session en piste et l execution sportive.`
}

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const [events, teams] = await Promise.all([
      RaceEvent.query().orderBy('display_order', 'asc').orderBy('id', 'asc'),
      Team.query().orderBy('display_order', 'asc').orderBy('id', 'asc'),
    ])

    return inertia.render('home', {
      events: events.map((event) => ({
        id: event.id,
        date: formatDateRange(event.startDate, event.endDate),
        startDate: formatSingleDate(event.startDate),
        endDate: event.endDate ? formatSingleDate(event.endDate) : null,
        title: event.title,
        status: EVENT_STATUS_LABELS[event.status] ?? event.status,
        tone: event.status,
        accent: event.accentColor,
        duration: getEventDurationLabel(event.startDate, event.endDate),
        format: getEventFormatLabel(event.startDate, event.endDate),
        description: getEventDescription(event.title, event.status, event.startDate, event.endDate),
      })),
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        country: team.country,
        accent: team.accentColor,
        description: team.description,
        category: team.category,
        carModel: team.carModel,
        teamPrincipal: team.teamPrincipal,
      })),
    })
  }
}
