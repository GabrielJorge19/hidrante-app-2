import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { openInGoogleMaps } from '../../lib/maps'
import { hydranteTipoLabel } from '../../lib/hydranteTypes'
import { markerTypeLabel, DEFAULT_MARKER_COLOR } from '../../lib/markerTypes'
import HydranteTipoIcon from './HydranteTypeIcon'
import type { Hidrante, LocalMarker } from '../../lib/types'
import './hydrant-ui.css'

interface HydrantDetailSheetProps {
  open: boolean
  hidrante: Hidrante | null
  marker: LocalMarker | null
  onClose: () => void
  onAddMarker: () => void
  onEditMarker: () => void
  onDeleteMarker: () => void
}

function bombeirosUrl(id: number): string {
  return `https://cbaplang.corpodebombeiros.sp.gov.br/hidrantes/03individual/${id}.html`
}

function HydrantDetailSheet({
  open,
  hidrante,
  marker,
  onClose,
  onAddMarker,
  onEditMarker,
  onDeleteMarker,
}: HydrantDetailSheetProps) {
  const [confirming, setConfirming] = useState(false)

  const close = () => {
    setConfirming(false)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      compact
      title={hidrante ? `Hidrante ${hidrante.id}` : ''}
    >
      {hidrante && (
        <div className="hydrant-summary">
          <div className="hydrant-summary-type">
            <HydranteTipoIcon tipo={hidrante.tipo} />
            <span>{hydranteTipoLabel(hidrante.tipo)}</span>
          </div>

          {marker && (
            <div className="marker-context">
              <div className="marker-context-list">
                <span
                  className="type-dot"
                  style={{ background: marker.color ?? DEFAULT_MARKER_COLOR }}
                />
                <span>Na lista {markerTypeLabel(marker.typeId)}</span>
              </div>
              {marker.notes && (
                <div className="marker-context-notes">{marker.notes}</div>
              )}
            </div>
          )}

          {confirming ? (
            <div className="sheet-actions">
              <button
                type="button"
                className="sheet-button"
                onClick={() => setConfirming(false)}
              >
                Voltar
              </button>
              <button
                type="button"
                className="sheet-button danger"
                onClick={onDeleteMarker}
              >
                Excluir definitivamente
              </button>
            </div>
          ) : marker ? (
            <div className="sheet-actions">
              <button type="button" className="sheet-button primary" onClick={onEditMarker}>
                Editar marcador
              </button>
              <button
                type="button"
                className="sheet-button"
                onClick={() => openInGoogleMaps(hidrante.latitude, hidrante.longitude)}
              >
                Ir para
              </button>
              <button type="button" className="sheet-button danger" onClick={() => setConfirming(true)}>
                Excluir
              </button>
            </div>
          ) : (
            <div className="sheet-actions">
              <button type="button" className="sheet-button primary" onClick={onAddMarker}>
                Adicionar marcador
              </button>
              <button
                type="button"
                className="sheet-button"
                onClick={() => openInGoogleMaps(hidrante.latitude, hidrante.longitude)}
              >
                Ir para
              </button>
              <a
                className="sheet-button wide"
                href={bombeirosUrl(hidrante.id)}
                target="_blank"
                rel="noopener noreferrer"
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
                  <path d="M14 4h6v6" />
                  <path d="M20 4L10 14" />
                  <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
                </svg>
                Ficha Bombeiros
              </a>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  )
}

export default HydrantDetailSheet