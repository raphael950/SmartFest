import { router } from '@inertiajs/react'
import { CheckCircle2, KeyRound, Mail, Shield, Trash2, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InertiaProps } from '@/types'
import '@/css/admin-users.css'

type AdminUser = {
  id: number
  email: string
  fullName: string | null
  pseudo: string | null
  isVerified: boolean
  isAdmin: boolean
  createdAt: string
}

type AdminUsersPageProps = {
  users: AdminUser[]
}

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const AdminUsersPage = ({ users }: InertiaProps<AdminUsersPageProps>) => {
  const [passwordByUser, setPasswordByUser] = useState<Record<number, string>>({})
  const [searchTerm, setSearchTerm] = useState('')

  const stats = useMemo(() => {
    const total = users.length
    const verified = users.filter((user) => user.isVerified).length
    const pending = total - verified

    return { total, verified, pending }
  }, [users])

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) => {
      const haystack = [user.email, user.fullName ?? '', user.pseudo ?? ''].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [users, searchTerm])

  const setPassword = (userId: number, password: string) => {
    setPasswordByUser((current) => ({
      ...current,
      [userId]: password,
    }))
  }

  const updatePassword = (userId: number) => {
    const password = (passwordByUser[userId] ?? '').trim()

    if (!password) {
      return
    }

    router.put(`/admin/users/${userId}/password`, { password }, {
      preserveScroll: true,
      onSuccess: () => {
        setPasswordByUser((current) => ({
          ...current,
          [userId]: '',
        }))
      },
    })
  }

  const verifyUser = (userId: number) => {
    router.post(`/admin/users/${userId}/verify`, {}, { preserveScroll: true })
  }

  const deleteUser = (userId: number, email: string) => {
    const confirmed = window.confirm(`Supprimer le compte ${email} ? Cette action est irreversible.`)

    if (!confirmed) {
      return
    }

    router.delete(`/admin/users/${userId}`, { preserveScroll: true })
  }

  return (
    <section className="admin-users-page">
      <header className="admin-users-hero">
        <div>
          <p className="admin-users-hero__eyebrow">Administration</p>
          <h1 className="admin-users-hero__title">Gestion des utilisateurs</h1>
          <p className="admin-users-hero__subtitle">
            Controlez les nouveaux comptes, validez les inscriptions et mettez a jour les acces en direct.
          </p>
        </div>
        <div className="admin-users-stats" aria-label="Statistiques utilisateurs">
          <article className="admin-users-stat-card">
            <span>Total</span>
            <strong>{stats.total}</strong>
          </article>
          <article className="admin-users-stat-card is-verified">
            <span>Verifies</span>
            <strong>{stats.verified}</strong>
          </article>
          <article className="admin-users-stat-card is-pending">
            <span>En attente</span>
            <strong>{stats.pending}</strong>
          </article>
        </div>
      </header>

      <div className="admin-users-grid">
        <div className="admin-users-toolbar">
          <label htmlFor="admin-users-search" className="admin-users-toolbar__label">
            Recherche utilisateur
          </label>
          <input
            id="admin-users-search"
            type="search"
            className="admin-users-toolbar__search"
            placeholder="Rechercher par email, pseudo ou nom"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <p className="admin-users-toolbar__meta">
            {filteredUsers.length} resultat(s) sur {users.length}
          </p>
        </div>

        {filteredUsers.map((user) => {
          const displayName = user.fullName || user.pseudo || 'Utilisateur'
          const passwordValue = passwordByUser[user.id] ?? ''

          return (
            <article className="admin-user-card" key={user.id}>
              <div className="admin-user-card__head">
                <div className="admin-user-card__identity">
                  <span className="admin-user-card__avatar">
                    <UserRound size={18} />
                  </span>
                  <div>
                    <p className="admin-user-card__name">{displayName}</p>
                    <p className="admin-user-card__email">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </p>
                  </div>
                </div>
                <div className="admin-user-card__badges">
                  {user.isAdmin ? (
                    <span className="admin-user-card__badge is-admin">
                      <Shield size={13} /> Admin
                    </span>
                  ) : null}
                  <span className={`admin-user-card__badge ${user.isVerified ? 'is-verified' : 'is-pending'}`}>
                    <CheckCircle2 size={13} />
                    {user.isVerified ? 'Verifie' : 'A valider'}
                  </span>
                </div>
              </div>

              <p className="admin-user-card__meta">Inscription: {formatDate(user.createdAt)}</p>

              <div className="admin-user-card__password-row">
                <label htmlFor={`password-${user.id}`} className="admin-user-card__label">
                  Nouveau mot de passe
                </label>
                <div className="admin-user-card__password-controls">
                  <input
                    id={`password-${user.id}`}
                    className="admin-user-card__input"
                    type="password"
                    value={passwordValue}
                    placeholder="8 caracteres minimum"
                    onChange={(event) => setPassword(user.id, event.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-user-card__action"
                    onClick={() => updatePassword(user.id)}
                    disabled={!passwordValue.trim()}
                  >
                    <KeyRound size={15} />
                    Modifier
                  </button>
                </div>
              </div>

              <div className="admin-user-card__footer">
                {!user.isVerified ? (
                  <button type="button" className="admin-user-card__validate" onClick={() => verifyUser(user.id)}>
                    Valider le compte
                  </button>
                ) : (
                  <span className="admin-user-card__validated-text">Compte deja verifie</span>
                )}

                <button
                  type="button"
                  className="admin-user-card__delete"
                  onClick={() => deleteUser(user.id, user.email)}
                >
                  <Trash2 size={15} />
                  Supprimer
                </button>
              </div>
            </article>
          )
        })}

        {filteredUsers.length === 0 ? (
          <p className="admin-users-empty">Aucun utilisateur ne correspond a la recherche.</p>
        ) : null}
      </div>
    </section>
  )
}

export default AdminUsersPage
