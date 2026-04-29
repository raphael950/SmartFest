// inertia/hooks/use-race-websocket.ts
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

import type { Driver } from '@/types/live-timing.types'


export function useRaceWebSocket() {
  const [drivers, setDrivers] = useState<Driver[]>([])
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
    })

    socket.on('race_update', (data) => {
      setDrivers(data.drivers)
    })

    socket.on('connect_error', () => {
      setError("Connexion au live timing perdue")
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { drivers, isConnected, error }
}
