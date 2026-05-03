import type { InertiaProps } from '@/types'
import ConnectedObjectsAdminTable from '@/components/admin/ConnectedObjectsAdminTable'
import type { AdminObjetsPageProps } from '@/types/admin-objets.types'

const AdminObjetsPage = ({ devices }: InertiaProps<AdminObjetsPageProps>) => {
  return (
    <section className="h-full min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:overflow-hidden">
      <ConnectedObjectsAdminTable devices={devices} />
    </section>
  )
}

export default AdminObjetsPage
