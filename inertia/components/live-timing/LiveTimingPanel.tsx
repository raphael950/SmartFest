import { useEffect, useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import TrackDisplay from './TrackDisplay'
import Leaderboard from './Leaderboard'
import './live-timing.base.css'
import './LiveTimingPanel.css'
import { useRaceWebSocket } from '@/hooks/use-race-websocket'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LiveTimingPanelProps {
  circuitPath: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const STACKED_BREAKPOINT = 1100

// ─── Composant ────────────────────────────────────────────────────────────────

export default function LiveTimingPanel({ circuitPath }: LiveTimingPanelProps) {
  const [isStacked, setIsStacked] = useState(false)

  // Connexion WebSocket au serveur pour recevoir les données en temps réel
  const { drivers, isConnected, error } = useRaceWebSocket()

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
        {error && (
          <p className="lt-panel-error" style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 4 }}>
            ⚠️ {error}
          </p>
        )}
        {!isConnected && !error && (
          <p className="lt-panel-connecting" style={{ color: '#fbbf24', fontSize: '0.8rem', marginTop: 4 }}>
            🔌 Connexion en cours...
          </p>
        )}
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
