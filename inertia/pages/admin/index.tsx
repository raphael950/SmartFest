import { useState } from 'react'
import type { InertiaProps } from '@/types'
import type { AdminObjetsPageProps } from '@/types/admin-objets.types'
import type { AdminUsersPageProps } from '@/types/admin-users.types'
import AdminUsersPanel from '@/components/admin/AdminUsersPanel'
import ConnectedObjectsAdminTable from '@/components/admin/ConnectedObjectsAdminTable'
import '@/css/pages/admin/admin-users.css'

type Props = InertiaProps<AdminUsersPageProps & AdminObjetsPageProps>

const AdminIndexPage = ({ users, devices, stats }: Props) => {
  const [activeTab, setActiveTab] = useState<'users' | 'objets'>('users')

  return (
    <section className="admin-index-page h-full min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:overflow-hidden">
      <nav className="admin-tabs" role="tablist" aria-label="Administration">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'users'}
          className={`admin-tabs__btn ${activeTab === 'users' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'objets'}
          className={`admin-tabs__btn ${activeTab === 'objets' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('objets')}
        >
          <span>Objets</span>
          <span className="admin-tabs__badge">{stats.total}</span>
        </button>
      </nav>

      <div className="admin-tabs__panel">
        <div
          role="tabpanel"
          aria-hidden={activeTab !== 'users'}
          className="admin-tabs__content"
          style={{ display: activeTab === 'users' ? 'block' : 'none' }}
        >
          <AdminUsersPanel users={users} />
        </div>
        <div
          role="tabpanel"
          aria-hidden={activeTab !== 'objets'}
          className="admin-tabs__content"
          style={{ display: activeTab === 'objets' ? 'block' : 'none' }}
        >
          <ConnectedObjectsAdminTable devices={devices} />
        </div>
      </div>
    </section>
  )
}

export default AdminIndexPage
