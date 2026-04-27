import { router } from '@inertiajs/react'
import { Plus, RefreshCw, Search, Trash2, Wifi } from 'lucide-react'
import { useMemo, useState } from 'react'
import '@/css/components/ConnectedObjectsTable.css'
import type { ConnectedObject, DeviceStatus } from '@/types/connected-objects'
import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal'
import ConnectedObjectEditModal from '@/components/ConnectedObjectEditModal'
import ConnectedObjectCreateModal from '@/components/ConnectedObjectCreateModal'
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

type ConnectedObjectsTableProps = {
  devices: ConnectedObject[]
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

const ConnectedObjectsTable = ({ devices: initialDevices }: ConnectedObjectsTableProps) => {
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

  const handleDelete = (identifier: string) => {
    if (!identifier) {
      return
    }

    router.delete(getObjectPath(identifier), {
      preserveScroll: true,
      onSuccess: () => {
        closeEditModal()
        setDeleteCandidate(null)
      },
    })
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

      <div className="iot-table-wrap">
        <table className="iot-table">
          <thead>
            <tr>
              <th>OBJET</th>
              <th>TYPE</th>
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
                <td className="iot-table__empty" colSpan={9}>
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
                  <td className="iot-table__id">{device.name}</td>
                  <td>
                    <span className={`iot-pill iot-pill--type ${device.type === 'LED' ? 'is-led' : 'is-cam'}`}>
                      {device.type}
                    </span>
                  </td>
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
                        className="iot-action-btn is-delete"
                        aria-label={`Supprimer ${device.name}`}
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
        onClose={closeEditModal}
        onSave={handleUpdate}
      />

      <ConnectedObjectCreateModal open={isCreateOpen} onClose={closeCreateModal} onCreate={handleCreate} />

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && closeDeleteConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet objet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. L&apos;objet
              {deleteCandidate ? ` ${deleteCandidate.name}` : ''}
              {' '}sera supprime definitivement.
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
                handleDelete(deleteCandidate.identifier)
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export default ConnectedObjectsTable
