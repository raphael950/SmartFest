import { Link } from '@adonisjs/inertia/react'
import { useMemo, useState } from 'react'
import { Mail, Search, Sparkles, Trophy, UserRound, Users } from 'lucide-react'
import type { InertiaProps } from '@/types'
import '@/css/pages/networking/networking.css'
import { NetworkingPageProps, NetworkingUser } from '@/types/networking.types'

const NetworkingPage = ({ users, teams }: InertiaProps<NetworkingPageProps>) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return users
    }

    const teamById = new Map(teams.map((t: any) => [t.id, t.name]))

    return users.filter((user: NetworkingUser) => {
      const teamName = user.followedTeamId ? teamById.get(user.followedTeamId) ?? '' : ''
      const haystack = [user.pseudo, user.email, user.fullName ?? '', user.jobTitle ?? '', teamName]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [users, searchTerm])

  return (
    <section className="networking-page">
      <header className="networking-hero">
        <div className="networking-hero__copy">
          <p className="networking-hero__eyebrow">Community Hub</p>
          <h1>Networking SmartFest</h1>
          <p>
            Retrouve les profils de la communaute, accede vite a ton profil et explore les passionnes du circuit.
          </p>
        </div>

        <div className="networking-hero__actions">
          <Link route="profile.me" className="networking-hero__btn networking-hero__btn--primary">
            <UserRound size={16} />
            Voir mon profil public
          </Link>
          <Link route="profile.edit" className="networking-hero__btn networking-hero__btn--ghost">
            Editer mon profil
          </Link>
        </div>
      </header>

      <section className="networking-panel">
        <div className="networking-toolbar">
          <div className="networking-toolbar__search-wrap">
            <Search size={16} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher par pseudo, email, nom, métier, équipe"
              aria-label="Recherche profils"
            />
          </div>

          <p className="networking-toolbar__meta">
            <Users size={14} />
            {filteredUsers.length} profil(s) visible(s)
          </p>
        </div>

        <div className="networking-grid">
          {filteredUsers.map((user: NetworkingUser) => (
            <article key={user.id} className="networking-card">
              <div className="networking-card__head">
                <div className="networking-card__avatar-wrap">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={`Avatar de ${user.pseudo}`} className="networking-card__avatar" />
                  ) : (
                    <span className="networking-card__avatar-placeholder">
                      <UserRound size={18} />
                    </span>
                  )}
                </div>

                <div className="networking-card__identity">
                  <p className="networking-card__pseudo">@{user.pseudo}</p>
                  <p className="networking-card__name">{user.fullName || 'Membre SmartFest'}</p>
                </div>

                {user.isCurrentUser ? (
                  <span className="networking-card__chip">
                    <Sparkles size={13} />
                    Moi
                  </span>
                ) : null}
              </div>

              <div className="networking-card__info">
                <p>
                  <Mail size={14} />
                  <span>{user.email}</span>
                </p>
                <p>
                  <UserRound size={14} />
                  <span>{user.jobTitle || 'Métier non renseigné'}</span>
                </p>
                <p>
                  <Trophy size={14} />
                  <span>
                    {String(
                      user.followedTeamId
                        ? new Map(teams.map((t: { id: any; name: any }) => [t.id, t.name])).get(user.followedTeamId) ?? 'Équipe non renseignée'
                        : 'Équipe non renseignée'
                    )}
                  </span>
                </p>
              </div>

              <div className="networking-card__actions">
                <Link href={`/profil/${user.pseudo}`} className="networking-card__btn">
                  Voir profil public
                </Link>
                {user.isCurrentUser ? (
                  <Link route="profile.edit" className="networking-card__btn networking-card__btn--secondary">
                    Editer
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {filteredUsers.length === 0 ? (
          <p className="networking-empty">Aucun profil ne correspond a ta recherche.</p>
        ) : null}
      </section>
    </section>
  )
}

export default NetworkingPage
