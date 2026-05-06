import { useNotification } from '@/contexts/NotificationContext'
import { usePage } from '@inertiajs/react'
import { X, Bell, AlertTriangle, Flag, Play, Square } from 'lucide-react'
import { Link } from '@inertiajs/react'
import '@/css/components/ui/Notification.css'

export default function NotificationPanel() {
  const { notifications, removeNotification } = useNotification()
  const page = usePage()

  // Ne pas afficher sur le live-timing
  if (page.url === '/live-timing' || page.url.startsWith('/live-timing/')) {
    return null
  }

  if (notifications.length === 0) {
    return null
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'flag_change':
        return <Flag className="notif-panel__icon notif-panel__icon--flag" />
      case 'race_started':
        return <Play className="notif-panel__icon notif-panel__icon--play" />
      case 'race_stopped':
        return <Square className="notif-panel__icon notif-panel__icon--stop" />
      case 'incident':
        return <AlertTriangle className="notif-panel__icon notif-panel__icon--incident" />
      default:
        return <Bell className="notif-panel__icon" />
    }
  }

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'red':
        return 'notif-panel__item--red'
      case 'green':
        return 'notif-panel__item--green'
      case 'yellow':
        return 'notif-panel__item--yellow'
      case 'orange':
        return 'notif-panel__item--orange'
      default:
        return ''
    }
  }

  const latestNotif = notifications[notifications.length - 1]

  return (
    <div className="notif-panel">
      <div className={`notif-panel__item ${getColorClass(latestNotif.color)}`}>
        <div className="notif-panel__header">
          <div className="notif-panel__header-content">
            {getIcon(latestNotif.type)}
            <div>
              <h3 className="notif-panel__title">{latestNotif.title}</h3>
              <p className="notif-panel__message">{latestNotif.message}</p>
            </div>
          </div>
          <button
            className="notif-panel__close"
            onClick={() => removeNotification(latestNotif.id)}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <Link href="/live-timing" className="notif-panel__action">
          Accéder au live timing
        </Link>

        {notifications.length > 1 && (
          <div className="notif-panel__queue">
            +{notifications.length - 1} notification{notifications.length > 2 ? 's' : ''} en attente
          </div>
        )}
      </div>
    </div>
  )
}
