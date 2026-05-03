import type { InertiaProps } from '@/types'
import ConnectedObjectsTable from '@/components/object/ConnectedObjectsTable'
import type { ObjetsPageProps } from '@/types/connected-objects.types'

const ObjetsPage = ({ devices, teams, pendingDeletionRequests }: InertiaProps<ObjetsPageProps>) => {
  return (
    <section className="h-full min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:overflow-hidden">
      <ConnectedObjectsTable devices={devices} teams={teams} pendingDeletionRequests={pendingDeletionRequests} />
    </section>
  )
}

export default ObjetsPage
