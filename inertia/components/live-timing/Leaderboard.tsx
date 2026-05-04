import DataPanelTable, { type DataPanelTableColumn } from '@/components/ui/DataPanelTable'
import DriverRow, { type LeaderboardDriver } from './DriverRow'
import './live-timing.base.css'
import './Leaderboard.css'
import type { Driver } from '@/types/live-timing.types'

interface LeaderboardProps {
  drivers: Driver[]
  selectedDriverId: number | null
}

const LEADERBOARD_COLUMNS: DataPanelTableColumn[] = [
  { key: 'position', label: 'POS', className: 'lt-leaderboard__col--pos' },
  { key: 'team', label: 'EQUIPE', className: 'lt-leaderboard__col--team' },
  { key: 'laps', label: 'TOURS', className: 'lt-leaderboard__col--laps' },
  { key: 'gap', label: 'ECART', className: 'lt-leaderboard__col--gap' },
]

export default function Leaderboard({ drivers, selectedDriverId }: LeaderboardProps) {
  const sortedDrivers = [...drivers].sort((a, b) => {
    const aBucket = a.gpsActive ? 0 : a.hasGps ? 1 : 2
    const bBucket = b.gpsActive ? 0 : b.hasGps ? 1 : 2
    if (aBucket !== bBucket) return aBucket - bBucket
    return (a.position ?? 0) - (b.position ?? 0)
  })

  const enrichedDrivers: LeaderboardDriver[] = sortedDrivers
    .filter((driver) => driver.gpsRevealPending !== true)
    .map((driver, index) => ({
    id: driver.id,
    name: driver.pilote ?? '',
    shortName: driver.shortName ?? '',
    number: String(driver.id),
    team: driver.team,
    carModel: driver.carModel,
    accentColor: driver.accentColor ?? '#888',
    position: driver.position ?? index + 1,
    bestLap: driver.hasGps === false ? '---' : driver.bestLap ?? '--:--.---',
    lapsCompleted: driver.hasGps === false ? 0 : driver.lapsCompleted ?? 0,
    gap: driver.hasGps === false ? '---' : driver.gap ?? '--',
    lastLap: driver.hasGps === false ? '---' : driver.lastLap ?? '--:--.---',
    hasGps: driver.hasGps,
    gpsActive: driver.gpsActive,
    gpsRevealPending: driver.gpsRevealPending,
    sectors: driver.sectors ?? [
      { sector: 1, time: '--', delta: '--', status: 'normal' },
      { sector: 2, time: '--', delta: '--', status: 'normal' },
      { sector: 3, time: '--', delta: '--', status: 'normal' },
    ],
    }))

  return (
    <DataPanelTable
      className="lt-glass lt-panel-section lt-leaderboard"
      columns={LEADERBOARD_COLUMNS}
      title="Classement direct"
      badge={<span className="lt-leaderboard__badge">LIVE</span>}
      scrollClassName="lt-leaderboard__scroll"
      tableClassName="lt-leaderboard__table"
      tableStyle={{ minWidth: 500 }}
    >
      {enrichedDrivers.length === 0 ? (
        <tr>
          <td className="lt-leaderboard__empty" colSpan={LEADERBOARD_COLUMNS.length}>
            Aucun pilote disponible pour le moment.
          </td>
        </tr>
      ) : (
        enrichedDrivers.map((driver, index) => (
          <DriverRow
            key={driver.id}
            columnCount={LEADERBOARD_COLUMNS.length}
            driver={driver}
            rank={index + 1}
            isSelected={driver.id === selectedDriverId}
          />
        ))
      )}
    </DataPanelTable>
  )
}