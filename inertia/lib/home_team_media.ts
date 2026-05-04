import type { TeamCard, TeamCardWithMedia } from '@/types/home.types'

const TEAM_IMAGE_MODULES = import.meta.glob('../images/home/teams/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const normalizeTeamName = (teamName: string) =>
  teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const resolveImageSrc = (teamName: string, imageType: 'car' | 'logo') => {
  const normalizedName = normalizeTeamName(teamName)
  const brandStem = normalizedName.split('-')[0]
  const candidateStems = [normalizedName, brandStem].filter(Boolean)

  for (const stem of candidateStems) {
    const namedKey = `../images/home/teams/${stem}.png`
    const typedKey = `../images/home/teams/${stem}-${imageType}.png`

    if (TEAM_IMAGE_MODULES[namedKey]) return TEAM_IMAGE_MODULES[namedKey]
    if (TEAM_IMAGE_MODULES[typedKey]) return TEAM_IMAGE_MODULES[typedKey]
  }

  return ''
}

export const attachTeamMedia = (team: TeamCard): TeamCardWithMedia => {
  return {
    ...team,
    carImageSrc: resolveImageSrc(team.name, 'car'),
    carImageAlt: `Voiture de ${team.name}`,
    logoImageSrc: resolveImageSrc(team.name, 'logo'),
    logoImageAlt: `Logo de ${team.name}`,
  }
}
