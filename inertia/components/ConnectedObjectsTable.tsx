import connectedObjectsData from '@/data/connected-objects.json'
import { Plus, RefreshCw, Wifi } from 'lucide-react'
import { useMemo, useState } from 'react'
import '@/css/components/ConnectedObjectsTable.css'
import type { ConnectedObject, DeviceStatus } from '@/types/connected-objects'
import type { ConnectedObjectEditableFields } from '@/types/connected-object-edit-modal'
import ConnectedObjectEditModal from '@/components/ConnectedObjectEditModal'
import ConnectedObjectCreateModal from '@/components/ConnectedObjectCreateModal'

type DeviceFilter = 'all' | 'online' | 'warning' | 'offline' | 'maintenance'

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

const initialDevices = connectedObjectsData as ConnectedObject[]

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

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const generateFirmwareVersion = () => {
  const major = getRandomInt(1, 5)
  const minor = getRandomInt(0, 9)
  const patch = getRandomInt(0, 9)
  return `v${major}.${minor}.${patch}`
}

const generateIdentifier = (devices: ConnectedObject[], type: string) => {
  const prefix = (type || 'DEV')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3) || 'DEV'

  let identifier = `${prefix}-${getRandomInt(100, 999)}`
  while (devices.some((device) => device.identifier === identifier)) {
    identifier = `${prefix}-${getRandomInt(100, 999)}`
  }

  return identifier
}

const ConnectedObjectsTable = () => {
  const [devices, setDevices] = useState<ConnectedObject[]>(initialDevices)
  const [activeFilter, setActiveFilter] = useState<DeviceFilter>('all')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null)

  const countByStatus = (status: DeviceStatus) => devices.filter((device) => device.status === status).length

  const total = devices.length
  const online = countByStatus('online')
  const alerts = countByStatus('alert')
  const disconnected = countByStatus('offline')

  const selectedDevice = useMemo(
    () => devices.find((device) => device.identifier === selectedIdentifier) ?? null,
    [devices, selectedIdentifier]
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
    setDevices((prevDevices) => {
      const createdDevice: ConnectedObject = {
        identifier: generateIdentifier(prevDevices, values.type),
        name: values.name,
        type: values.type,
        sector: values.sector,
        status: values.status,
        battery: getRandomInt(15, 100),
        latencyMs: getRandomInt(5, 220),
        signal: getRandomInt(20, 100),
        firmware: generateFirmwareVersion(),
      }

      return [createdDevice, ...prevDevices]
    })

    setActiveFilter('all')
    closeCreateModal()
  }

  const handleUpdate = (identifier: string, updates: ConnectedObjectEditableFields) => {
    if (!identifier) {
      return
    }

    setDevices((prevDevices) =>
      prevDevices.map((device) => {
        if (device.identifier !== identifier) {
          return device
        }

        return {
          ...device,
          ...updates,
        }
      })
    )

    closeEditModal()
  }

  const filteredDevices = useMemo(() => {
    switch (activeFilter) {
      case 'online':
        return devices.filter((device) => device.status === 'online')
      case 'warning':
        return devices.filter((device) => device.status === 'alert')
      case 'offline':
        return devices.filter((device) => device.status === 'offline')
      case 'maintenance':
        return devices.filter((device) => device.status === 'maintenance')
      case 'all':
      default:
        return devices
    }
  }, [activeFilter, devices])

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

        <button type="button" className="iot-create-btn" onClick={openCreateModal}>
          <Plus className="iot-create-btn__icon" />
          AJOUTER OBJET
        </button>
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
            {filteredDevices.map((device) => (
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
                </td>
              </tr>
            ))}
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
    </section>
  )
}

export default ConnectedObjectsTable
