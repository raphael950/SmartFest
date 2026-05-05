import { createPortal } from 'react-dom'
import type { ReactNode, PointerEventHandler, CSSProperties } from 'react'

type TrackObjectModalProps = {
  variant: 'camera' | 'led'
  badge: string
  title: string
  subtitle: string
  position: {
    x: number
    y: number
  }
  onClose: () => void
  onHeaderPointerDown: PointerEventHandler<HTMLDivElement>
  children: ReactNode
  footer?: ReactNode
}

export default function TrackObjectModal({
  variant,
  badge,
  title,
  subtitle,
  position,
  onClose,
  onHeaderPointerDown,
  children,
  footer,
}: TrackObjectModalProps) {
  const style: CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  }

  return createPortal(
    <div
      className={`lt-track-modal lt-track-modal--${variant}`}
      style={style}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="lt-track-modal__header" onPointerDown={onHeaderPointerDown}>
        <div className="lt-track-modal__title-wrap">
          <span className="lt-track-modal__badge">{badge}</span>
          <div>
            <p className="lt-track-modal__title">{title}</p>
            <p className="lt-track-modal__subtitle">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          className="lt-track-modal__close"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      <div className="lt-track-modal__body">
        {children}
        {footer ? <div className="lt-track-modal__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}