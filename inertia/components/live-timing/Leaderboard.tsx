import DataPanelTable, { type DataPanelTableColumn } from '@/components/ui/DataPanelTable'
import DriverRow, { type LeaderboardDriver } from './DriverRow'
import './live-timing.base.css'
import './Leaderboard.css'
import type { Driver } from '~/types/live-timing.types'

interface LeaderboardProps {
  drivers: Driver[]
}

const LEADERBOARD_COLUMNS: DataPanelTableColumn[] = [
  { key: 'position', label: 'POS', className: 'lt-leaderboard__col--pos' },
  { key: 'team', label: 'EQUIPE', className: 'lt-leaderboard__col--team' },
  { key: 'laps', label: 'TOURS', className: 'lt-leaderboard__col--laps' },
  { key: 'gap', label: 'ECART', className: 'lt-leaderboard__col--gap' },
]

const MOCK_DRIVERS_DATA: LeaderboardDriver[] = [
  {
    id: 1,
    name: 'M. Vaxiviere',
    shortName: 'VAX',
    number: 'A424',
    team: 'Alpine Racing',
    teamColor: '#e8352a',
    position: 1,
    lapsCompleted: 11,
    gap: '+0.059',
    lastLap: '1:53.298',
    sectors: [
      { sector: 1, time: '0:28.12', delta: '-0.04', status: 'personal-best' },
      { sector: 2, time: '0:42.77', delta: '+0.11', status: 'normal' },
      { sector: 3, time: '0:42.41', delta: '-0.09', status: 'personal-best' },
    ],
  },
  {
    id: 2,
    name: 'A. Pier Guidi',
    shortName: 'PGU',
    number: '499P',
    team: 'Ferrari Corse',
    teamColor: '#fbbf24',
    position: 2,
    lapsCompleted: 12,
    gap: '+2.994',
    lastLap: '1:33.552',
    sectors: [
      { sector: 1, time: '0:27.88', delta: '-0.28', status: 'fastest' },
      { sector: 2, time: '0:43.10', delta: '+0.44', status: 'slow' },
      { sector: 3, time: '0:42.56', delta: '+0.06', status: 'normal' },
    ],
  },
  {
    id: 3,
    name: 'K. Estre',
    shortName: 'EST',
    number: '963',
    team: 'Porsche Team',
    teamColor: '#60a5fa',
    position: 3,
    lapsCompleted: 13,
    gap: '+2.350',
    lastLap: '1:32.000',
    sectors: [
      { sector: 1, time: '0:28.44', delta: '+0.32', status: 'slow' },
      { sector: 2, time: '0:41.98', delta: '-0.68', status: 'fastest' },
      { sector: 3, time: '0:41.58', delta: '-0.92', status: 'fastest' },
    ],
  },
  {
    id: 4,
    name: 'T. Bamber',
    shortName: 'BAM',
    number: '75',
    team: 'Corvette Racing',
    teamColor: '#34d399',
    position: 4,
    lapsCompleted: 10,
    gap: '+5.112',
    lastLap: '1:34.881',
    sectors: [
      { sector: 1, time: '0:29.01', delta: '+0.89', status: 'slow' },
      { sector: 2, time: '0:43.55', delta: '+0.89', status: 'slow' },
      { sector: 3, time: '0:42.33', delta: '-0.17', status: 'personal-best' },
    ],
  },
  {
    id: 5,
    name: 'N. Jani',
    shortName: 'JAN',
    number: '38',
    team: 'Hertz JOTA',
    teamColor: '#a78bfa',
    position: 5,
    lapsCompleted: 9,
    gap: '+8.490',
    lastLap: '1:35.442',
    sectors: [
      { sector: 1, time: '0:29.22', delta: '+1.10', status: 'normal' },
      { sector: 2, time: '0:43.81', delta: '+1.15', status: 'slow' },
      { sector: 3, time: '0:42.41', delta: '-0.09', status: 'personal-best' },
    ],
  },
]

export default function Leaderboard({ drivers }: LeaderboardProps) {
  const enrichedDrivers: LeaderboardDriver[] = drivers.map((driver, index) => {
    const mockDriver = MOCK_DRIVERS_DATA[index % MOCK_DRIVERS_DATA.length]

    return {
      ...mockDriver,
      ...driver,
      id: driver.id,
      team: driver.team || mockDriver.team,
      name: driver.pilote || mockDriver.name,
    }
  })

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
          />
        ))
      )}
    </DataPanelTable>
  )
}
