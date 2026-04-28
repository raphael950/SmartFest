import type { CSSProperties, ReactNode } from 'react'
import '@/css/components/ui/DataPanelTable.css'
import { cn } from '@/lib/utils'

export interface DataPanelTableColumn {
  key: string
  label: ReactNode
  className?: string
  style?: CSSProperties
}

interface DataPanelTableProps {
  className?: string
  columns: DataPanelTableColumn[]
  title: ReactNode
  badge?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  scrollClassName?: string
  tableClassName?: string
  tableStyle?: CSSProperties
}

export default function DataPanelTable({
  className,
  columns,
  title,
  badge,
  toolbar,
  children,
  scrollClassName,
  tableClassName,
  tableStyle,
}: DataPanelTableProps) {
  return (
    <div className={cn('data-panel-table', className)}>
      <div className="data-panel-table__header">
        <div className="data-panel-table__title-group">
          <span className="data-panel-table__accent" aria-hidden="true" />
          <h2 className="data-panel-table__title">{title}</h2>
        </div>
        {badge ? <div className="data-panel-table__badge">{badge}</div> : null}
      </div>

      {toolbar ? <div className="data-panel-table__toolbar">{toolbar}</div> : null}

      <div className={cn('data-panel-table__scroll', scrollClassName)}>
        <table className={cn('data-panel-table__table', tableClassName)} style={tableStyle}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className} style={column.style}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}
