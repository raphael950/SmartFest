import { router } from '@inertiajs/react'
import { AlertCircle, Check, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ConnectedObjectAdmin } from '@/types/admin-objets.types'
import '@/css/components/objets/ConnectedObjectsTable.css'

const statusLabel = {
  online: 'EN LIGNE',
  alert: 'ALERTE',
  maintenance: 'MAINTENANCE',
  offline: 'HORS LIGNE',
} as const

const statusClass = {
  online: 'is-online',
  alert: 'is-alert',
  maintenance: 'is-maintenance',
  offline: 'is-offline',
} as const


type ConnectedObjectsAdminTableProps = {
  devices: ConnectedObjectAdmin[]
}

const ConnectedObjectsAdminTable = ({ devices: initialDevices }: ConnectedObjectsAdminTableProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [candidateToApprove, setCandidateToApprove] = useState<ConnectedObjectAdmin | null>(null)
  const [candidateToReject, setCandidateToReject] = useState<ConnectedObjectAdmin | null>(null)

  const filteredDevices = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    if (!normalizedSearch) {
      return initialDevices
    }

    return initialDevices.filter((device) => {
      const searchableContent = [
        device.name,
        device.identifier,
        device.type,
        device.sector,
        device.teamName ?? 'fia direction de course',
        statusLabel[device.status as keyof typeof statusLabel],
        device.requestedDeletionByUserName ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return searchableContent.includes(normalizedSearch)
    })
  }, [initialDevices, searchQuery])

  const approveDelete = (device: ConnectedObjectAdmin) => {
    router.post(`/admin/objets/${device.id}/approve-destroy`, {}, { preserveScroll: true })
  }

  const rejectDelete = (device: ConnectedObjectAdmin) => {
    router.post(`/admin/objets/${device.id}/reject-destroy`, {}, { preserveScroll: true })
  }

  return (
    <section className="iot-registry">
      <header className="iot-registry__head">
        <p className="iot-registry__breadcrumb">BUGATTI IOT / ADMIN</p>
        <h2 className="iot-registry__title">SUPPRESSIONS EN ATTENTE</h2>
      </header>

      <div className="iot-registry__stats">
        <article className="iot-stat-card">
          <p className="iot-stat-card__label">DEMANDES EN ATTENTE</p>
          <p className="iot-stat-card__value">{initialDevices.length}</p>
        </article>
      </div>

      <div className="iot-registry__toolbar">
        <div className="iot-registry__toolbar-actions">
          <label className="iot-search" aria-label="Rechercher une demande">
            <AlertCircle className="iot-search__icon" aria-hidden="true" />
            <input
              type="search"
              className="iot-search__input"
              placeholder="Rechercher nom, ID, équipe, utilisateur..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="iot-table-wrap">
        <table className="iot-table">
          <thead>
            <tr>
              <th>OBJET</th>
              <th>TYPE</th>
              <th>EQUIPE</th>
              <th>SECTEUR</th>
              <th>STATUT</th>
              <th>DEMANDE PAR</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td className="iot-table__empty" colSpan={11}>
                  {initialDevices.length === 0 ? 'Aucune demande de suppression en attente.' : 'Aucune demande ne correspond a la recherche.'}
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => (
                <tr key={device.identifier} className="iot-table__row">
                  <td className="iot-table__id">
                    <div className="iot-table__id-stack">
                      <span>{device.name}</span>
                      <span className="iot-table__muted">{device.identifier}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`iot-pill iot-pill--type ${device.type.toLowerCase()}`}>{device.type}</span>
                  </td>
                  <td className="iot-table__muted">{device.teamName ?? 'FIA / Direction de course'}</td>
                  <td className="iot-table__muted">{device.sector}</td>
                  <td>
                    <span className={`iot-pill iot-pill--status ${statusClass[device.status as keyof typeof statusClass]}`}>
                      {statusLabel[device.status as keyof typeof statusLabel]}
                    </span>
                  </td>
                  <td className="iot-table__muted">{device.requestedDeletionByUserName ?? '-'}</td>
                  <td>
                    <div className="iot-action-cell">
                      <button
                        type="button"
                        className="iot-action-btn is-toggle"
                        aria-label={`Valider suppression ${device.identifier}`}
                        title="Valider la suppression"
                        onClick={() => setCandidateToApprove(device)}
                      >
                        <Check className="iot-action-btn__icon" />
                      </button>
                      <button
                        type="button"
                        className="iot-action-btn is-delete"
                        aria-label={`Rejeter suppression ${device.identifier}`}
                        title="Rejeter la demande"
                        onClick={() => setCandidateToReject(device)}
                      >
                        <X className="iot-action-btn__icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={Boolean(candidateToApprove)} onOpenChange={(open) => !open && setCandidateToApprove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider la suppression ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'objet <strong>{candidateToApprove?.name}</strong> sera supprime definitivement de la base de donnees. Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (candidateToApprove) {
                  approveDelete(candidateToApprove)
                }
              }}
            >
              Valider la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(candidateToReject)} onOpenChange={(open) => !open && setCandidateToReject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter la demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La demande de suppression pour <strong>{candidateToReject?.name}</strong> sera rejetee. L'objet restera accessible et un nouvel email sera envoye a l'utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => {
                if (candidateToReject) {
                  rejectDelete(candidateToReject)
                }
              }}
            >
              Rejeter la demande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export default ConnectedObjectsAdminTable
