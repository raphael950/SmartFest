import { useEffect, useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import TrackDisplay from './TrackDisplay'
import Leaderboard from './Leaderboard'
import '@/css/pages/live-timing/live-timing.base.css'
import '@/css/pages/live-timing/LiveTimingPanel.css'
import { useRaceWebSocket } from '@/hooks/use-race-websocket'
import type { FlagState, LiveTimingCamera } from '@/types/live-timing.types'

interface LiveTimingPanelProps {
  circuitPath: string
  cameras: LiveTimingCamera[]
}

const STACKED_BREAKPOINT = 1100
const DEFAULT_FLAG: FlagState = { color: 'vert', sectors: [] }

export default function LiveTimingPanel({ circuitPath, cameras }: LiveTimingPanelProps) {
  const [isStacked, setIsStacked] = useState(false)
  const [selectedDriverIds, setSelectedDriverIds] = useState<number[]>([])

  const { drivers, flag: wsFlag, raceState, isConnected, error } = useRaceWebSocket()
  const flag: FlagState = wsFlag ?? DEFAULT_FLAG
  const isRaceRunning = raceState?.status === 'running'

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${STACKED_BREAKPOINT}px)`)
    const update = () => setIsStacked(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const handleTrackClick = (id: number) => {
    setSelectedDriverIds([id])
  }

  const handleLeaderboardClick = (id: number) => {
    setSelectedDriverIds((prev) =>
      prev.includes(id) ? prev.filter((driverId) => driverId !== id) : [...prev, id],
    )
  }

  return (
    <div className="lt-panel-root">
      <div className="lt-panel-header">
        <h1 className="lt-panel-title">Bugatti Circuit Le Mans</h1>
        <p className="lt-panel-subtitle">Circuit automobile Le Mans Bugatti</p>
        {!isRaceRunning && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🛑 COURSE ARRÊTÉE
          </p>
        )}
        {isRaceRunning && (
          <p style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🏁 COURSE EN COURS
          </p>
        )}
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
            <TrackDisplay
              circuitPath={circuitPath}
              drivers={drivers}
              cameras={cameras}
              flag={flag}
              raceState={raceState}
              selectedDriverIds={selectedDriverIds}
              onDriverClick={handleTrackClick}
            />
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
            <Leaderboard
              drivers={drivers}
              selectedDriverIds={selectedDriverIds}
              onDriverClick={handleLeaderboardClick}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}