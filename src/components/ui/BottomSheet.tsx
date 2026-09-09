import type { ReactNode } from 'react'
import './BottomSheet.css'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {title && <h2 className="sheet-title">{title}</h2>}
        <div className="sheet-content">{children}</div>
      </div>
    </div>
  )
}

export default BottomSheet