import { router, usePage } from '@inertiajs/react'
import { Plus, Power, RefreshCw, Search, Trash2, Wifi } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Data } from '@generated/data'
import '@/css/components/objets/ConnectedObjectsTable.css'
import ConnectedObjectEditModal from '@/components/object/ConnectedObjectEditModal'
import ConnectedObjectCreateModal from '@/components/object/ConnectedObjectCreateModal'
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
import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal.types'
import { ConnectedObject, DeviceStatus, PendingDeletionRequest, TeamOption } from '@/types/connected-objects.types'

type ConnectedObjectsTableProps = {
  devices: ConnectedObject[]
  teams: TeamOption[]
  pendingDeletionRequests: PendingDeletionRequest[]
}

type DeviceFilter = 'all' | 'online' | 'warning' | 'offline' | 'maintenance'

const OBJECTS_BASE_PATH = '/objets'

const getObjectPath = (identifier?: string) => {
  if (!identifier) {
    return OBJECTS_BASE_PATH
  }

  return `${OBJECTS_BASE_PATH}/${identifier}`
}

const filterOptions: Array<{ key: DeviceFilter; label: string }> = [
  { key: 'all', label: 'TOUT' },
  { key: 'online', label: 'ONLINE' },
  { key: 'warning', label: 'WARNING' },
  { key: 'offline', label: 'OFFLINE' },
  { key: 'maintenance', label: 'MAINTENANCE' },
]

const statusLabel: Record<DeviceStatus, string> = {
  online: 'EN LIGNE',
  alert: 'ALERTE',
  maintenance: 'MAINTENANCE',
  offline: 'HORS LIGNE',
}

const statusClass: Record<DeviceStatus, string> = {
  online: 'is-online',
  alert: 'is-alert',
  maintenance: 'is-maintenance',
  offline: 'is-offline',
}

const getBatteryTone = (battery: number) => {
  if (battery >= 75) {
    return 'is-good'
  }
  if (battery >= 35) {
    return 'is-medium'
  }
  return 'is-critical'
}

const getLatencyTone = (latencyMs: number) => {
  if (latencyMs <= 15) {
    return 'is-good'
  }
  if (latencyMs <= 60) {
    return 'is-medium'
  }
  return 'is-critical'
}

const getMeterSegments = (value: number, max = 100, segments = 5) => {
  const safe = Math.max(0, Math.min(value, max))
  return Math.round((safe / max) * segments)
}

const canToggleAvailability = (status: DeviceStatus) => status === 'online' || status === 'offline'

const ConnectedObjectsTable = ({ devices: initialDevices, teams, pendingDeletionRequests }: ConnectedObjectsTableProps) => {
  const page = usePage<Data.SharedProps>()
  const currentRole = String((page.props.user as { role?: string } | undefined)?.role || '').toLowerCase()
  const isAdmin = currentRole === 'admin'
  const [activeFilter, setActiveFilter] = useState<DeviceFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<ConnectedObject | null>(null)

  const countByStatus = (status: DeviceStatus) =>
    initialDevices.filter((device) => device.status === status).length

  const total = initialDevices.length
  const online = countByStatus('online')
  const alerts = countByStatus('alert')
  const maintenance = countByStatus('maintenance')
  const disconnected = countByStatus('offline')

  const selectedDevice = useMemo(
    () => initialDevices.find((device) => device.identifier === selectedIdentifier) ?? null,
    [initialDevices, selectedIdentifier]
  )

  const openEditModal = (device: ConnectedObject) => {
    setSelectedIdentifier(device.identifier)
    setIsEditOpen(true)
  }

  const closeEditModal = () => {
    setIsEditOpen(false)
    setSelectedIdentifier(null)
  }

  const openCreateModal = () => {
    setIsCreateOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateOpen(false)
  }

  const handleCreate = (values: ConnectedObjectEditableFields) => {
    router.post(getObjectPath(), values, {
      preserveScroll: true,
      onSuccess: () => {
        setActiveFilter('all')
        closeCreateModal()
      },
    })
  }

  const handleUpdate = (identifier: string, updates: ConnectedObjectEditableFields) => {
    if (!identifier) {
      return
    }

    router.put(getObjectPath(identifier), updates, {
      preserveScroll: true,
      onSuccess: () => {
        closeEditModal()
      },
    })
  }

  const approveDeleteRequest = (deviceId: number) => {
    router.post(`/admin/objets/${deviceId}/approve-destroy`, {}, { preserveScroll: true })
  }

  const rejectDeleteRequest = (deviceId: number) => {
    router.post(`/admin/objets/${deviceId}/reject-destroy`, {}, { preserveScroll: true })
  }

  const handleToggleAvailability = (device: ConnectedObject) => {
    if (!canToggleAvailability(device.status)) {
      return
    }

    const nextStatus: DeviceStatus = device.status === 'online' ? 'offline' : 'online'
    const updates: ConnectedObjectEditableFields = {
      name: device.name,
      type: device.type,
      sector: device.sector,
      status: nextStatus,
      teamId: device.teamId,
    }

    handleUpdate(device.identifier, updates)
  }

  const openDeleteConfirm = (device: ConnectedObject) => {
    setDeleteCandidate(device)
  }

  const closeDeleteConfirm = () => {
    setDeleteCandidate(null)
  }

  const filteredDevices = useMemo(() => {
    const statusFiltered = (() => {
      switch (activeFilter) {
        case 'online':
          return initialDevices.filter((device) => device.status === 'online')
        case 'warning':
          return initialDevices.filter((device) => device.status === 'alert')
        case 'offline':
          return initialDevices.filter((device) => device.status === 'offline')
        case 'maintenance':
          return initialDevices.filter((device) => device.status === 'maintenance')
        case 'all':
        default:
          return initialDevices
      }
    })()

    const normalizedSearch = searchQuery.trim().toLowerCase()
    if (!normalizedSearch) {
      return statusFiltered
    }

    return statusFiltered.filter((device) => {
      const searchableContent = [
        device.name,
        device.identifier,
        device.type,
        device.sector,
        device.teamName ?? 'fia direction de course',
        statusLabel[device.status],
        device.firmware,
      ]
        .join(' ')
        .toLowerCase()

      return searchableContent.includes(normalizedSearch)
    })
  }, [activeFilter, initialDevices, searchQuery])

  return (
    <section className="iot-registry">
      <header className="iot-registry__head">
        <p className="iot-registry__breadcrumb">BUGATTI IOT / REGISTRE SYSTEME</p>
        <h2 className="iot-registry__title">SYSTEM REGISTRY</h2>
      </header>

      <div className="iot-registry__stats">
        <article className="iot-stat-card">
          <p className="iot-stat-card__label">TOTAL OBJETS</p>
          <p className="iot-stat-card__value">{total}</p>
        </article>
        <article className="iot-stat-card">
          <p className="iot-stat-card__label">EN LIGNE</p>
          <p className="iot-stat-card__value is-online">{online}</p>
        </article>
        <article className="iot-stat-card">
          <p className="iot-stat-card__label">ALERTES</p>
          <p className="iot-stat-card__value is-alert">{alerts}</p>
        </article>
        <article className="iot-stat-card">
          <p className="iot-stat-card__label">MAINTENANCE</p>
          <p className="iot-stat-card__value is-maintenance">{maintenance}</p>
        </article>
        <article className="iot-stat-card">
          <p className="iot-stat-card__label">DECONNECTES</p>
          <p className="iot-stat-card__value is-offline">{disconnected}</p>
        </article>
      </div>

      <div className="iot-registry__toolbar">
        <div className="iot-registry__filters">
          {filterOptions.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`iot-filter-chip is-${filter.key} ${activeFilter === filter.key ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="iot-registry__toolbar-actions">
          <label className="iot-search" aria-label="Rechercher un objet">
            <Search className="iot-search__icon" aria-hidden="true" />
            <input
              type="search"
              className="iot-search__input"
              placeholder="Rechercher nom, ID, secteur, firmware..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <button type="button" className="iot-create-btn" onClick={openCreateModal}>
            <Plus className="iot-create-btn__icon" />
            AJOUTER OBJET
          </button>
        </div>
      </div>

      {isAdmin && pendingDeletionRequests.length > 0 ? (
        <div className="iot-registry__toolbar iot-pending-toolbar">
          <div className="iot-registry__filters iot-pending-toolbar__content">
            <strong className="iot-pending-toolbar__title">Demandes de suppression en attente: {pendingDeletionRequests.length}</strong>
            {pendingDeletionRequests.map((request) => (
              <div key={request.id} className="iot-action-cell iot-pending-request-item">
                <span className="iot-table__muted">
                  {request.name} ({request.identifier}) - demande par {request.requestedBy}
                </span>
                <button
                  type="button"
                  className="iot-action-btn iot-action-btn--text is-toggle"
                  aria-label={`Valider suppression ${request.identifier}`}
                  onClick={() => approveDeleteRequest(request.id)}
                >
                  Valider
                </button>
                <button
                  type="button"
                  className="iot-action-btn iot-action-btn--text"
                  aria-label={`Rejeter suppression ${request.identifier}`}
                  onClick={() => rejectDeleteRequest(request.id)}
                >
                  Rejeter
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="iot-table-wrap">
        <table className="iot-table">
          <thead>
            <tr>
              <th>OBJET</th>
              <th>TYPE</th>
              <th>EQUIPE</th>
              <th>SECTEUR</th>
              <th>STATUT</th>
              <th>BATTERIE</th>
              <th>LATENCE</th>
              <th>SIGNAL</th>
              <th>FIRMWARE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td className="iot-table__empty" colSpan={10}>
                  Aucun objet ne correspond a la recherche.
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => (
                <tr
                  key={device.identifier}
                  className="iot-table__row-interactive"
                  onClick={() => openEditModal(device)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openEditModal(device)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Modifier ${device.name}`}
                >
                  <td className="iot-table__id">
                    <div className="iot-table__id-stack">
                      <span>{device.name}</span>
                      {device.isDeletionRequested ? (
                        <span className="iot-pending-badge" title={`Demande en attente${device.requestedDeletionByUserName ? ` (${device.requestedDeletionByUserName})` : ''}`}>
                          EN ATTENTE VALIDATION ADMIN
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className={`iot-pill iot-pill--type ${device.type.toLowerCase()}`}>
                      {device.type}
                    </span>
                  </td>
                  <td className="iot-table__muted">{device.teamName ?? 'FIA / Direction de course'}</td>
                  <td className="iot-table__muted">{device.sector}</td>
                  <td>
                    <span className={`iot-pill iot-pill--status ${statusClass[device.status]}`}>
                      {statusLabel[device.status]}
                    </span>
                  </td>
                  <td>
                    <div className="iot-progress-cell">
                      <div className={`iot-meter iot-meter--battery ${getBatteryTone(device.battery)}`}>
                        <div className="iot-meter__bars" aria-hidden="true">
                          {Array.from({ length: 5 }, (_, index) => (
                            <span
                              key={`${device.identifier}-battery-${index}`}
                              className={`iot-meter__bar ${index < getMeterSegments(device.battery) ? 'is-filled' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span>{device.battery}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="iot-progress-cell">
                      <div className={`iot-meter iot-meter--latency ${getLatencyTone(device.latencyMs)}`}>
                        <Wifi className="iot-meter__icon" />
                        <div className="iot-meter__bars" aria-hidden="true">
                          {Array.from({ length: 5 }, (_, index) => (
                            <span
                              key={`${device.identifier}-latency-${index}`}
                              className={`iot-meter__bar ${index < getMeterSegments(Math.max(0, 100 - Math.min(device.latencyMs, 100))) ? 'is-filled' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span>{device.latencyMs}ms</span>
                    </div>
                  </td>
                  <td>
                    <div className="iot-progress-cell">
                      <progress max={100} value={device.signal} className="iot-progress iot-progress--signal" />
                      <span>{device.signal}%</span>
                    </div>
                  </td>
                  <td className="iot-table__muted">{device.firmware}</td>
                  <td>
                    <div className="iot-action-cell">
                      <button
                        type="button"
                        className="iot-action-btn"
                        aria-label={`Mettre a jour ${device.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditModal(device)
                        }}
                      >
                        <RefreshCw className="iot-action-btn__icon" />
                      </button>
                      <button
                        type="button"
                        className={`iot-action-btn is-toggle ${device.status === 'online' ? 'is-online-status' : ''} ${canToggleAvailability(device.status) ? '' : 'is-disabled'}`}
                        aria-label={
                          canToggleAvailability(device.status)
                            ? (device.status === 'online' ? `Desactiver ${device.name}` : `Activer ${device.name}`)
                            : `Activation indisponible pour ${device.name}`
                        }
                        title={
                          canToggleAvailability(device.status)
                            ? (device.status === 'online' ? 'Desactiver' : 'Activer')
                            : 'Indisponible en maintenance ou en alerte'
                        }
                        disabled={!canToggleAvailability(device.status)}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleToggleAvailability(device)
                        }}
                      >
                        <Power className="iot-action-btn__icon" />
                      </button>
                      <button
                        type="button"
                        className="iot-action-btn is-delete"
                        aria-label={isAdmin ? `Supprimer ${device.name}` : `Demander suppression ${device.name}`}
                        disabled={device.isDeletionRequested}
                        title={
                          device.isDeletionRequested
                            ? `Demande en attente${device.requestedDeletionByUserName ? ` (${device.requestedDeletionByUserName})` : ''}`
                            : (isAdmin ? 'Supprimer' : 'Demander validation admin')
                        }
                        onClick={(event) => {
                          event.stopPropagation()
                          openDeleteConfirm(device)
                        }}
                      >
                        <Trash2 className="iot-action-btn__icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConnectedObjectEditModal
        open={isEditOpen}
        device={selectedDevice}
        teams={teams}
        onClose={closeEditModal}
        onSave={handleUpdate}
      />

      <ConnectedObjectCreateModal
        open={isCreateOpen}
        teams={teams}
        onClose={closeCreateModal}
        onCreate={handleCreate}
      />

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && closeDeleteConfirm()}>
            <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet objet ?</AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin ? 'Cette action est irréversible. L\'objet' : 'Cette demande sera envoyée à un administrateur pour validation de suppression de l\'objet'}
              {deleteCandidate ? ` ${deleteCandidate.name}` : ''}
              {isAdmin ? ' sera supprime definitivement.' : '.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteCandidate) {
                  return
                }

                if (isAdmin) {
                  // Admins approve immediately via admin endpoint
                  approveDeleteRequest((deleteCandidate as any).id)
                } else {
                  // Non-admins send a deletion request
                  router.post(`${getObjectPath(deleteCandidate.identifier)}/request-delete`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                      closeEditModal()
                      setDeleteCandidate(null)
                    },
                  })
                }
              }}
            >
              {isAdmin ? 'Supprimer' : 'Envoyer la demande'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export default ConnectedObjectsTable
