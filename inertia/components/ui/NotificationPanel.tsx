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

  return (
    <div className="notif-panel">
      {notifications.map((notif) => (
        <div key={notif.id} className={`notif-panel__item ${getColorClass(notif.color)}`}>
          <div className="notif-panel__header">
            <div className="notif-panel__header-content">
              {getIcon(notif.type)}
              <div>
                <h3 className="notif-panel__title">{notif.title}</h3>
                <p className="notif-panel__message">{notif.message}</p>
              </div>
            </div>
            <button
              className="notif-panel__close"
              onClick={() => removeNotification(notif.id)}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <Link href="/live-timing" className="notif-panel__action">
            Accéder au live timing
          </Link>
        </div>
      ))}
    </div>
  )
}
