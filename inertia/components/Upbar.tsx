import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { ChevronDown, UserRound } from 'lucide-react'
import { useState } from 'react'
import '../css/components/upbar.css'

const Upbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const page = usePage<Data.SharedProps>()
  const user = page.props.user

  return (
    <header className="sf-shell__topbar">
      <h1 className="sf-shell__page-title">Accueil</h1>

      <div className="sf-shell__profile-wrap">
        <button
          type="button"
          className="sf-shell__profile-btn"
          onClick={() => setIsProfileOpen((state) => !state)}
        >
          <span className="sf-shell__profile-avatar">
            <UserRound className="sf-shell__profile-avatar-icon" />
          </span>
          <span className="sf-shell__profile-text">
            <span className="sf-shell__profile-name">{user?.fullName || 'Jean Dupont'}</span>
            <span className="sf-shell__profile-role">Direction</span>
          </span>
          <ChevronDown className="sf-shell__profile-chevron" />
        </button>

        {isProfileOpen && (
          <div className="sf-shell__profile-menu">
            <button type="button" className="sf-shell__profile-menu-item">
              Profil
            </button>
            <button type="button" className="sf-shell__profile-menu-item">
              Paramètres
            </button>
            {user ? (
              <button type="button" className="sf-shell__profile-menu-item is-danger">
                Déconnexion
              </button>
            ) : (
              <Link route="session.create" className="sf-shell__profile-menu-item is-danger">
                Se connecter
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Upbar
