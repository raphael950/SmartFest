import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useNotification } from '@/contexts/NotificationContext'
import type { FlagState } from '@/types/live-timing.types'
import type { RaceState } from '@/types/race-state.types'
import type { Incident } from '@/types/incidents.types'

/**
 * Composant qui écoute les événements du websocket et émet des notifications
 * Doit être intégré dans le layout principal
 */
export default function NotificationGateway() {
  const { addNotification } = useNotification()
  const prevFlagRef = useRef<FlagState | null>(null)
  const prevRaceStateRef = useRef<RaceState | null>(null)
  const socketRef = useRef<ReturnType<typeof io> | null>(null)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL || window.location.origin)
    socketRef.current = socket

    socket.on('flag_update', (data: FlagState) => {
      if (prevFlagRef.current && data.color !== prevFlagRef.current.color) {
        const colorLabel = {
          vert: 'Drapeau Vert',
          jaune: 'Drapeau Jaune',
          rouge: 'Drapeau Rouge',
        }[data.color] || 'Changement de drapeau'

        const colorMap = {
          vert: 'green',
          jaune: 'yellow',
          rouge: 'red',
        } as Record<string, 'green' | 'yellow' | 'red'>

        addNotification({
          type: 'flag_change',
          title: colorLabel,
          message: 'Le drapeau du circuit a changé',
          color: colorMap[data.color] || 'green',
        })
      }
      prevFlagRef.current = data
    })

    socket.on('race_state_update', (data: RaceState) => {
      if (prevRaceStateRef.current && data.status !== prevRaceStateRef.current.status) {
        if (data.status === 'running') {
          addNotification({
            type: 'race_started',
            title: 'Course démarrée',
            message: 'La course a commencé',
            color: 'green',
          })
        } else if (data.status === 'stopped') {
          addNotification({
            type: 'race_stopped',
            title: 'Course arrêtée',
            message: 'La course s\'est terminée',
            color: 'red',
          })
        }
      }
      prevRaceStateRef.current = data
    })

    socket.on('incident_reported', (data: Incident) => {
      const severityLabel = {
        leger: 'Incident léger',
        moyen: 'Incident moyen',
        grave: 'Incident grave',
        critique: 'Incident critique',
      }[data.severity] || 'Incident'

      const severityColorMap = {
        leger: 'yellow',
        moyen: 'orange',
        grave: 'red',
        critique: 'red',
      } as Record<string, 'yellow' | 'orange' | 'red'>

      addNotification({
        type: 'incident',
        title: severityLabel,
        message: `Incident signalé au secteur ${data.sector}`,
        color: severityColorMap[data.severity] || 'orange',
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [addNotification])

  return null
}
