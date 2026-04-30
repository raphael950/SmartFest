import alpineCar from '@/images/home/teams/alpine-car.png'
import alpineLogo from '@/images/home/teams/alpine-logo.png'
import bmwCar from '@/images/home/teams/bmw-car.png'
import bmwLogo from '@/images/home/teams/bmw-logo.png'
import cadillacCar from '@/images/home/teams/cadillac-car.png'
import cadillacLogo from '@/images/home/teams/cadillac-logo.png'
import ferrariCar from '@/images/home/teams/ferrari-car.png'
import ferrariLogo from '@/images/home/teams/ferrari-logo.png'
import peugeotCar from '@/images/home/teams/peugeot-car.png'
import peugeotLogo from '@/images/home/teams/peugeot-logo.png'
import porscheCar from '@/images/home/teams/porsche-car.png'
import porscheLogo from '@/images/home/teams/porsche-logo.png'
import toyotaCar from '@/images/home/teams/toyota-car.png'
import toyotaLogo from '@/images/home/teams/toyota-logo.png'
import type { TeamCard, TeamCardWithMedia } from '@/types/home.types'

type TeamAssetSet = {
  carImageSrc: string
  carImageAlt: string
  logoImageSrc: string
  logoImageAlt: string
}

const TEAM_ASSETS: Record<string, TeamAssetSet> = {
  alpine: {
    carImageSrc: alpineCar,
    carImageAlt: 'Hypercar Alpine A424',
    logoImageSrc: alpineLogo,
    logoImageAlt: 'Logo Alpine',
  },
  ferrari: {
    carImageSrc: ferrariCar,
    carImageAlt: 'Hypercar Ferrari 499P',
    logoImageSrc: ferrariLogo,
    logoImageAlt: 'Logo Ferrari',
  },
  porsche: {
    carImageSrc: porscheCar,
    carImageAlt: 'Hypercar Porsche 963',
    logoImageSrc: porscheLogo,
    logoImageAlt: 'Logo Porsche',
  },
  toyota: {
    carImageSrc: toyotaCar,
    carImageAlt: 'Hypercar Toyota GR010 Hybrid',
    logoImageSrc: toyotaLogo,
    logoImageAlt: 'Logo Toyota',
  },
  cadillac: {
    carImageSrc: cadillacCar,
    carImageAlt: 'Hypercar Cadillac V-Series.R',
    logoImageSrc: cadillacLogo,
    logoImageAlt: 'Logo Cadillac',
  },
  peugeot: {
    carImageSrc: peugeotCar,
    carImageAlt: 'Hypercar Peugeot 9X8',
    logoImageSrc: peugeotLogo,
    logoImageAlt: 'Logo Peugeot',
  },
  bmw: {
    carImageSrc: bmwCar,
    carImageAlt: 'Hypercar BMW M Hybrid V8',
    logoImageSrc: bmwLogo,
    logoImageAlt: 'Logo BMW',
  },
}

const resolveTeamAssetKey = (
  team: Pick<TeamCard, 'name' | 'carModel'>
): keyof typeof TEAM_ASSETS | undefined => {
  const fingerprint = `${team.name} ${team.carModel}`.toLowerCase()

  if (fingerprint.includes('alpine')) return 'alpine'
  if (fingerprint.includes('ferrari')) return 'ferrari'
  if (fingerprint.includes('porsche')) return 'porsche'
  if (fingerprint.includes('toyota')) return 'toyota'
  if (fingerprint.includes('cadillac')) return 'cadillac'
  if (fingerprint.includes('peugeot')) return 'peugeot'
  if (fingerprint.includes('bmw')) return 'bmw'
}

export const attachTeamMedia = (team: TeamCard): TeamCardWithMedia => {
  const key = resolveTeamAssetKey(team)
  const assets = key ? TEAM_ASSETS[key] : undefined

  return {
    ...team,
    carImageSrc: assets?.carImageSrc ?? '',
    carImageAlt: assets?.carImageAlt ?? `Voiture de ${team.name}`,
    logoImageSrc: assets?.logoImageSrc ?? '',
    logoImageAlt: assets?.logoImageAlt ?? `Logo de ${team.name}`,
  }
}
