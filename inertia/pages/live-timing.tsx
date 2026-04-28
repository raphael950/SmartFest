import type { InertiaProps } from '~/types'
import LiveTimingPanel from '@/components/live-timing/LiveTimingPanel'
import type { LiveTimingPageProps } from '@/types/live-timing.types'

export default function LiveTimingPage({
  drivers,
  circuitPath,
}: InertiaProps<LiveTimingPageProps>) {
  return (
    <div className="lt-page">
      <LiveTimingPanel drivers={drivers} circuitPath={circuitPath} />
    </div>
  )
}
