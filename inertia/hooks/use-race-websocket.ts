// inertia/hooks/use-race-websocket.ts
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

import type { Driver, FlagState, LiveTimingCamera, LiveTimingLed } from '@/types/live-timing.types'
import type { RaceState } from '@/types/race-state.types'

const DEFAULT_FLAG: FlagState = { color: 'vert', sectors: [] }
const DEFAULT_RACE: RaceState = { status: 'stopped', startedAt: null }

type CameraUpdatePayload = {
  cameraId: number
  status: LiveTimingCamera['status']
  sector: LiveTimingCamera['sector']
}

type LedUpdatePayload = {
  ledId: number
  status: LiveTimingLed['status']
  sector: LiveTimingLed['sector']
}

export function useRaceWebSocket(initialCameras: LiveTimingCamera[] = [], initialLeds: LiveTimingLed[] = []) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [flag, setFlag] = useState<FlagState>(DEFAULT_FLAG)
  const [raceState, setRaceState] = useState<RaceState>(DEFAULT_RACE)
  const [cameras, setCameras] = useState<LiveTimingCamera[]>(initialCameras)
  const [leds, setLeds] = useState<LiveTimingLed[]>(initialLeds)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCameras(initialCameras)
  }, [initialCameras])

  useEffect(() => {
    setLeds(initialLeds)
  }, [initialLeds])

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL || window.location.origin)

    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
    })

    socket.on('initial_state', (data) => {
      setDrivers(data.drivers)
      if (data.flag) setFlag(data.flag)
      if (data.raceState) setRaceState(data.raceState)
    })

    socket.on('race_update', (data) => {
      setDrivers(data.drivers)
      if (data.raceState) setRaceState(data.raceState)
    })

    socket.on('flag_update', (data: FlagState) => {
      setFlag(data)
    })

    socket.on('race_state_update', (data: RaceState) => {
      setRaceState(data)
    })

    socket.on('camera_update', ({ cameraId, status, sector }: CameraUpdatePayload) => {
      setCameras((prev) =>
        prev.map((camera) =>
          camera.id === cameraId
            ? { ...camera, status, sector }
            : camera,
        ),
      )
    })

    socket.on('led_update', ({ ledId, status, sector }: LedUpdatePayload) => {
      setLeds((prev) =>
        prev.map((led) =>
          led.id === ledId
            ? { ...led, status, sector }
            : led,
        ),
      )
    })

    socket.on('connect_error', () => {
      setError('Connexion au live timing perdue')
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { drivers, flag, raceState, cameras, leds, isConnected, error }
}