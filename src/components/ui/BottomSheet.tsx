import type { ReactNode } from 'react'
import './BottomSheet.css'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  compact?: boolean
  children: ReactNode
}

function BottomSheet({ open, onClose, title, compact = false, children }: BottomSheetProps) {
  if (!open) return null

  return (
    <div className={`sheet-backdrop${compact ? ' compact' : ''}`} onClick={onClose}>
      <div
        className={`sheet${compact ? ' compact' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!compact && <div className="sheet-handle" />}
        {compact && (
          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
        {title && <h2 className="sheet-title">{title}</h2>}
        <div className="sheet-content">{children}</div>
      </div>
    </div>
  )
}

export default BottomSheet