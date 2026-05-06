import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type NotificationType = 'flag_change' | 'race_started' | 'race_stopped' | 'incident'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  icon?: string
  color?: 'green' | 'red' | 'yellow' | 'orange'
  autoHide?: boolean
}

type NotificationContextType = {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotif: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      autoHide: notification.autoHide !== false,
    }

    setNotifications((prev) => [...prev, newNotif])

    if (newNotif.autoHide) {
      setTimeout(() => {
        removeNotification(id)
      }, 6000)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification doit être utilisé dans NotificationProvider')
  }
  return context
}
