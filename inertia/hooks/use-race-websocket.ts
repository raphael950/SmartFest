// inertia/hooks/use-race-websocket.ts
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

import type { Driver, FlagState } from '@/types/live-timing.types'

const DEFAULT_FLAG: FlagState = { color: 'vert', sectors: [] }

export function useRaceWebSocket() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [flag, setFlag] = useState<FlagState>(DEFAULT_FLAG)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL || window.location.origin)

    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
    })

    socket.on('initial_state', (data) => {
      setDrivers(data.drivers)
      if (data.flag) setFlag(data.flag)
    })

    socket.on('race_update', (data) => {
      setDrivers(data.drivers)
    })

    socket.on('flag_update', (data: FlagState) => {
      setFlag(data)
    })

    socket.on('connect_error', () => {
      setError('Connexion au live timing perdue')
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { drivers, flag, isConnected, error }
}