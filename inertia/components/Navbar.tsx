import type { Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import {
  Shield,
  AlertTriangle,
  BarChart3,
  Clock3,
  Flag,
  Home,
  LogOut,
  MessageSquare,
  Users,
  UserRound,
} from 'lucide-react'
import type { NavItem, NavbarProps } from '@/types/navbar.types'
import '../css/components/Navbar.css'

const baseNavItems: NavItem[] = [
  { label: 'Accueil', icon: Home, route: 'home' },
  { label: 'Mon profil', icon: UserRound, route: 'profile.edit' },
  { label: 'Networking', icon: Users, href: '/networking' },
  { label: 'Live Timing', icon: Clock3 },
  { label: 'Gestion Drapeaux', icon: Flag },
  { label: 'Gestion Incidents', icon: AlertTriangle, route: 'incidents' },
  { label: 'Communication', icon: MessageSquare },
  { label: 'Objets', icon: BarChart3, route: 'objets' },
]

const Navbar = ({ isMobileOpen, onMobileClose }: NavbarProps) => {
  const page = usePage<Data.SharedProps>()
  const user = page.props.user
  const currentPath = page.url
  const isAdmin = Boolean((user as { isAdmin?: boolean } | undefined)?.isAdmin)
  const [isAvatarBroken, setIsAvatarBroken] = useState(false)

  useEffect(() => {
    setIsAvatarBroken(false)
  }, [user?.avatarPath])

  const navItems = useMemo<NavItem[]>(() => {
    if (!isAdmin) {
      return baseNavItems
    }

    return [...baseNavItems, { label: 'Admin', icon: Shield, href: '/admin/users' } satisfies NavItem]
  }, [isAdmin])

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

      if (item.href === '/networking') {
        return currentPathname === '/networking' || currentPathname.startsWith('/networking/')
      }

      if (item.route === 'incidents') {
        return currentPathname === '/incidents' || currentPathname.startsWith('/incidents/')
      }

      if (item.route === 'objets') {
        return currentPathname === '/objets' || currentPathname.startsWith('/objets/')
      }

      if (item.href === '/admin/users') {
        return currentPathname === '/admin/users' || currentPathname.startsWith('/admin/users/')
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

            if (!item.route) {
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
            <Link route="profile.me" className="sf-shell__sidebar-profile-btn" onClick={onMobileClose}>
              <span className="sf-shell__profile-avatar">
                {user.avatarPath && !isAvatarBroken ? (
                  <img
                    src={`/${user.avatarPath}`}
                    alt="Avatar utilisateur"
                    className="sf-shell__profile-avatar-image"
                    onError={() => setIsAvatarBroken(true)}
                  />
                ) : (
                  <UserRound className="sf-shell__profile-avatar-icon" />
                )}
              </span>
              <span className="sf-shell__profile-name">{user.fullName || user.pseudo || 'Mon compte'}</span>
            </Link>
          ) : null}

          {user ? (
            <Form route="session.destroy" className="sf-shell__logout-form" onSubmit={onMobileClose}>
              <button type="submit" className="sf-shell__logout-btn">
                <LogOut className="sf-shell__nav-icon" />
                <span>Deconnexion</span>
              </button>
            </Form>
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
