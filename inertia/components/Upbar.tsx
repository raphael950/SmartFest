import type { Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { ChevronDown, Menu, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import '../css/components/upbar.css'

type UpbarProps = {
  isMobileNavOpen: boolean
  onToggleMobileNav: () => void
}

const Upbar = ({ isMobileNavOpen, onToggleMobileNav }: UpbarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAvatarBroken, setIsAvatarBroken] = useState(false)
  const profileWrapRef = useRef<HTMLDivElement | null>(null)
  const page = usePage<Data.SharedProps>()
  const user = page.props.user
  const isAdmin = Boolean((user as { isAdmin?: boolean } | undefined)?.isAdmin)

  useEffect(() => {
    setIsAvatarBroken(false)
  }, [user?.avatarPath])

  useEffect(() => {
    if (!isProfileOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileWrapRef.current) {
        return
      }

      if (!profileWrapRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isProfileOpen])

  return (
    <header className="sf-shell__topbar">
      <div className="sf-shell__topbar-left">
        <button
          type="button"
          className="sf-shell__mobile-nav-btn"
          aria-label="Ouvrir le menu"
          aria-expanded={isMobileNavOpen}
          onClick={onToggleMobileNav}
        >
          <Menu className="sf-shell__mobile-nav-icon" />
        </button>
        <h1 className="sf-shell__page-title">Accueil</h1>
      </div>

      {user ? (
        <div
          className="sf-shell__profile-wrap"
          ref={profileWrapRef}
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          <button
            type="button"
            className="sf-shell__profile-btn"
            onClick={() => setIsProfileOpen((state) => !state)}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
          >
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
            <span className="sf-shell__profile-text">
              <span className="sf-shell__profile-name">{user.fullName || user.pseudo || 'Mon compte'}</span>
              <span className="sf-shell__profile-role">{isAdmin ? 'Admin' : 'Connecte'}</span>
            </span>
            <ChevronDown className="sf-shell__profile-chevron" />
          </button>

          {isProfileOpen && (
            <div className="sf-shell__profile-menu" role="menu">
              <Link route="profile.edit" className="sf-shell__profile-menu-item">
                Editer mon profil
              </Link>
              <Link route="profile.me" className="sf-shell__profile-menu-item">
                Voir mon profil public
              </Link>
              <button type="button" className="sf-shell__profile-menu-item">
                Paramètres
              </button>
              <Form
                route="session.destroy"
                className="sf-shell__profile-menu-item-form"
                onSubmit={() => setIsProfileOpen(false)}
              >
                <button type="submit" className="sf-shell__profile-menu-item is-danger">
                  Déconnexion
                </button>
              </Form>
            </div>
          )}
        </div>
      ) : (
        <Link route="session.create" className="sf-shell__login-btn">
          Se connecter
        </Link>
      )}
    </header>
  )
}

export default Upbar
