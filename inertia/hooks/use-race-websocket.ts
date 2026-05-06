// inertia/hooks/use-race-websocket.ts
import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import type { Driver, FlagState, LiveTimingCamera, LiveTimingLed, LiveTimingChatMessage } from '@/types/live-timing.types'
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

type ChatMessagePayload = {
  authorName: string
  authorInitials: string
  avatarPath?: string | null
  authorRole?: string | null
  text: string
  clientId: string
}

type DeleteChatMessagePayload = {
  messageId: string
  requesterRole: string
}

export function useRaceWebSocket(initialCameras: LiveTimingCamera[] = [], initialLeds: LiveTimingLed[] = []) {
  const socketRef = useRef<Socket | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [flag, setFlag] = useState<FlagState>(DEFAULT_FLAG)
  const [raceState, setRaceState] = useState<RaceState>(DEFAULT_RACE)
  const [cameras, setCameras] = useState<LiveTimingCamera[]>(initialCameras)
  const [leds, setLeds] = useState<LiveTimingLed[]>(initialLeds)
  const [chatMessages, setChatMessages] = useState<LiveTimingChatMessage[]>([])
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
    socketRef.current = socket

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

    socket.on('chat_history', (messages: LiveTimingChatMessage[]) => {
      setChatMessages(messages)
    })

    socket.on('chat_message', (message: LiveTimingChatMessage) => {
      setChatMessages((prev) => [...prev, message].slice(-50))
    })

    socket.on('connect_error', () => {
      setError('Connexion au live timing perdue')
      setIsConnected(false)
    })

    return () => {
      socketRef.current = null
      socket.disconnect()
    }
  }, [])

  const sendChatMessage = (message: ChatMessagePayload) => {
    if (!socketRef.current || !isConnected) return false
    socketRef.current.emit('chat_message', message)
    return true
  }

  const deleteChatMessage = (payload: DeleteChatMessagePayload) => {
    if (!socketRef.current || !isConnected) return false
    socketRef.current.emit('chat_delete_message', payload)
    return true
  }

  return { drivers, flag, raceState, cameras, leds, chatMessages, isConnected, error, sendChatMessage, deleteChatMessage }
}