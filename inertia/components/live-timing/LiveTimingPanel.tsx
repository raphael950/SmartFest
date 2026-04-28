import { useEffect, useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import TrackDisplay from './TrackDisplay'
import Leaderboard from './Leaderboard'
import './live-timing.base.css'
import './LiveTimingPanel.css'
import type { LiveTimingPageProps } from '~/types/live-timing.types'

interface LiveTimingPanelProps extends LiveTimingPageProps {}

const STACKED_BREAKPOINT = 1100

export default function LiveTimingPanel({ drivers, circuitPath }: LiveTimingPanelProps) {
  const [isStacked, setIsStacked] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${STACKED_BREAKPOINT}px)`)

    const updateLayout = () => {
      setIsStacked(mediaQuery.matches)
    }

    updateLayout()
    mediaQuery.addEventListener('change', updateLayout)

    return () => mediaQuery.removeEventListener('change', updateLayout)
  }, [])

  const orientation = isStacked ? 'vertical' : 'horizontal'

  return (
    <div className="lt-panel-root">
      <div className="lt-panel-header">
        <h1 className="lt-panel-title">Bugatti Circuit Le Mans</h1>
        <p className="lt-panel-subtitle">Circuit automobile Le Mans Bugatti</p>
      </div>

      <div className="lt-panel-sections">
        <ResizablePanelGroup
          className="lt-panel-resizable"
          orientation={orientation}
        >
          <ResizablePanel
            className="lt-panel-pane"
            defaultSize={isStacked ? 42 : 52}
            minSize={isStacked ? 28 : 30}
          >
            <TrackDisplay circuitPath={circuitPath} />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="lt-panel-handle"
            style={isStacked ? { width: '100%', height: 12 } : { width: 12 }}
          />

          <ResizablePanel className="lt-panel-pane" defaultSize={isStacked ? 58 : 48} minSize={30}>
            <Leaderboard drivers={drivers} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
