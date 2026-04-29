import type { InertiaProps } from '~/types'
import type { LiveTimingPageProps } from '@/types/live-timing.types'
import LiveTimingPanel from '@/components/live-timing/LiveTimingPanel'
import { DriverSeed } from '@/hooks/use-race-simulation'

export default function LiveTimingPage({
  drivers,
  circuitPath,
}: InertiaProps<LiveTimingPageProps>) {
  const driverSeeds: DriverSeed[] = drivers.map((driver, i) => ({
    id: driver.id,
    team: driver.team,
    pilote: driver.pilote,
    carModel: driver.carModel ?? '???',
    shortName: driver.pilote
      ? driver.pilote.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()
      : '???',
    accentColor: driver.accentColor ?? '#888',
    speed: 0.0001 + Math.random() * 0.0002,
    startProgression: i * (1 / Math.max(drivers.length, 1)),
  }))
  return (
    <div className="lt-page">
      <LiveTimingPanel driverSeeds={driverSeeds} circuitPath={circuitPath} drivers={drivers}/>
    </div>
  )
}
