import ConnectedObjectsTable from '@/components/ConnectedObjectsTable'
import type { InertiaProps } from '@/types'
import type { ConnectedObject } from '../types/connected-objects.types.ts'

type ObjetsPageProps = {
  devices: ConnectedObject[]
}

const ObjetsPage = ({ devices }: InertiaProps<ObjetsPageProps>) => {
  return (
    <section className="h-full min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:overflow-hidden">
      <ConnectedObjectsTable devices={devices} />
    </section>
  )
}

export default ObjetsPage
