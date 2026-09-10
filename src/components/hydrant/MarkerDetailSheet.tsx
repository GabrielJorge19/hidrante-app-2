import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { db } from '../../lib/db'
import { markerTypeLabel } from '../../lib/markerTypes'
import { openInGoogleMaps } from '../../lib/maps'
import type { LocalMarker } from '../../lib/types'
import './hydrant-ui.css'

interface MarkerDetailSheetProps {
  open: boolean
  marker: LocalMarker | null
  onClose: () => void
  onEdit: () => void
  onDeleted: () => void
}

function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString('pt-BR')
  } catch {
    return String(timestamp)
  }
}

function MarkerDetailSheet({
  open,
  marker,
  onClose,
  onEdit,
  onDeleted,
}: MarkerDetailSheetProps) {
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    if (!marker) return
    await db.markers.delete(marker.id)
    setConfirming(false)
    onDeleted()
  }

  const close = () => {
    setConfirming(false)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={close} title={marker?.label ?? ''}>
      {marker && (
        <>
          <div className="detail-grid">
            <div className="field">
              <span className="field-label">Tipo</span>
              <span className="field-value field-value-row">
                <span
                  className="type-dot"
                  style={{ background: marker.color ?? '#1a73e8' }}
                />
                {markerTypeLabel(marker.typeId)}
              </span>
            </div>
            <div className="field">
              <span className="field-label">Latitude / Longitude</span>
              <span className="field-value">
                {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
              </span>
            </div>
            {marker.notes && (
              <div className="field">
                <span className="field-label">Observações</span>
                <span className="field-value">{marker.notes}</span>
              </div>
            )}
            <div className="field">
              <span className="field-label">Criado em</span>
              <span className="field-value">{formatDate(marker.createdAt)}</span>
            </div>
          </div>

          {confirming ? (
            <div className="sheet-actions">
              <button type="button" className="sheet-button" onClick={() => setConfirming(false)}>
                Voltar
              </button>
              <button type="button" className="sheet-button danger" onClick={handleDelete}>
                Excluir definitivamente
              </button>
            </div>
          ) : (
            <div className="sheet-actions">
              <button
                type="button"
                className="sheet-button"
                onClick={() => openInGoogleMaps(marker.latitude, marker.longitude)}
              >
                Ir para
              </button>
              <button type="button" className="sheet-button" onClick={onEdit}>
                Editar
              </button>
              <button type="button" className="sheet-button danger" onClick={() => setConfirming(true)}>
                Excluir
              </button>
            </div>
          )}
        </>
      )}
    </BottomSheet>
  )
}

export default MarkerDetailSheet