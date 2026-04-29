import type { InertiaProps } from '~/types'
import type { LiveTimingPageProps } from '@/types/live-timing.types'
import LiveTimingPanel from '@/components/live-timing/LiveTimingPanel'

export default function LiveTimingPage({
  circuitPath,
}: InertiaProps<LiveTimingPageProps>) {
  return (
    <div className="lt-page">
      <LiveTimingPanel circuitPath={circuitPath} />
    </div>
  )
}
