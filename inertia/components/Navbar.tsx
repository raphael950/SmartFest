import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { useMemo } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  Flag,
  Home,
  LogOut,
  MessageSquare,
  UserRound,
} from 'lucide-react'
import '../css/components/Navbar.css'

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  route?: 'home'
  href?: string
}

const navItems: NavItem[] = [
  { label: 'Accueil', icon: Home, route: 'home' },
  { label: 'Mon profil', icon: UserRound, route: 'profile.edit' },
  { label: 'Live Timing', icon: Clock3 },
  { label: 'Dashboard Événement', icon: BarChart3 },
  { label: 'Gestion Drapeaux', icon: Flag },
  { label: 'Gestion Incidents', icon: AlertTriangle },
  { label: 'Communication', icon: MessageSquare },
  { label: 'Objets', icon: BarChart3, href: '/objets' },
]

type NavbarProps = {
  isMobileOpen: boolean
  onMobileClose: () => void
}

const Navbar = ({ isMobileOpen, onMobileClose }: NavbarProps) => {
  const page = usePage<Data.SharedProps>()
  const user = page.props.user
  const currentPath = page.url

  const currentPathname = useMemo(() => {
    return currentPath.split('?')[0].split('#')[0]
  }, [currentPath])

  const activeItem = useMemo(() => {
    const activeMatch = navItems.find((item) => {
      if (item.route === 'home') {
        return currentPathname === '/'
      }
      if (item.route === 'profile.edit') {
        return currentPathname.startsWith('/mon-profil')
      }

      if (item.href) {
        return currentPathname === item.href || currentPathname.startsWith(`${item.href}/`)
      }

      return false
    })

    return activeMatch?.label ?? ''
  }, [currentPathname])

  return (
    <>
      <aside className={`sf-shell__sidebar ${isMobileOpen ? 'is-mobile-open' : ''}`}>
        <div className="sf-shell__brand">
          <div className="sf-shell__brand-logo">
            <Flag className="sf-shell__brand-icon" />
          </div>
          <div>
            <p className="sf-shell__brand-title">Le Mans</p>
            <p className="sf-shell__brand-subtitle">Bugatti Circuit</p>
          </div>
        </div>

        <nav className="sf-shell__nav" aria-label="Navigation principale">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.label === activeItem

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`sf-shell__nav-link ${isActive ? 'is-active' : ''}`}
                  onClick={onMobileClose}
                >
                  <Icon className="sf-shell__nav-icon" />
                  <span>{item.label}</span>
                </Link>
              )
            }

            if (!item.route) {
              return (
                <button key={item.label} type="button" className="sf-shell__nav-link" onClick={onMobileClose}>
                  <Icon className="sf-shell__nav-icon" />
                  <span>{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.label}
                route={item.route}
                className={`sf-shell__nav-link ${isActive ? 'is-active' : ''}`}
                onClick={onMobileClose}
              >
                <Icon className="sf-shell__nav-icon" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sf-shell__sidebar-bottom">
          {user ? (
            <button type="button" className="sf-shell__logout-btn" onClick={onMobileClose}>
              <LogOut className="sf-shell__nav-icon" />
              <span>Déconnexion</span>
            </button>
          ) : (
            <Link route="session.create" className="sf-shell__logout-btn" onClick={onMobileClose}>
              <LogOut className="sf-shell__nav-icon" />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </aside>

      <button
        type="button"
        className={`sf-shell__mobile-overlay ${isMobileOpen ? 'is-visible' : ''}`}
        aria-label="Fermer le menu"
        onClick={onMobileClose}
      />
    </>
  )
}

export default Navbar
