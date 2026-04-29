import { useEffect, useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import TrackDisplay from './TrackDisplay'
import Leaderboard from './Leaderboard'
import './live-timing.base.css'
import './LiveTimingPanel.css'
import type { LiveTimingPageProps } from '@/types/live-timing.types'
import { DriverSeed, useRaceSimulation } from '@/hooks/use-race-simulation'

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * On étend LiveTimingPageProps pour recevoir les seeds depuis Inertia.
 * Le champ `drivers` de la page (snapshot statique) n'est plus utilisé
 * pour la simulation — seuls les `driverSeeds` pilotent le hook.
 */
interface LiveTimingPanelProps extends LiveTimingPageProps {
  driverSeeds: DriverSeed[]
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const STACKED_BREAKPOINT = 1100

// ─── Composant ────────────────────────────────────────────────────────────────

export default function LiveTimingPanel({ driverSeeds, circuitPath }: LiveTimingPanelProps) {
  const [isStacked, setIsStacked] = useState(false)

  // Tout le timing et les positions sont gérés ici, côté front uniquement.
  // Aucun polling, aucune requête réseau — requestAnimationFrame à ~60fps.
  const drivers = useRaceSimulation(driverSeeds)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${STACKED_BREAKPOINT}px)`)
    const update = () => setIsStacked(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <div className="lt-panel-root">
      <div className="lt-panel-header">
        <h1 className="lt-panel-title">Bugatti Circuit Le Mans</h1>
        <p className="lt-panel-subtitle">Circuit automobile Le Mans Bugatti</p>
      </div>

      <div className="lt-panel-sections">
        <ResizablePanelGroup
          className="lt-panel-resizable"
          orientation={isStacked ? 'vertical' : 'horizontal'}
        >
          <ResizablePanel
            className="lt-panel-pane"
            defaultSize={isStacked ? 42 : 52}
            minSize={isStacked ? 28 : 30}
          >
            <TrackDisplay circuitPath={circuitPath} drivers={drivers} />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="lt-panel-handle"
            style={isStacked ? { width: '100%', height: 12 } : { width: 12 }}
          />

          <ResizablePanel
            className="lt-panel-pane"
            defaultSize={isStacked ? 58 : 48}
            minSize={30}
          >
            <Leaderboard drivers={drivers} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}