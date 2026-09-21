import BottomSheet from '../ui/BottomSheet'
import { openInGoogleMaps } from '../../lib/maps'
import { hydranteTipoLabel } from '../../lib/hydranteTypes'
import HydranteTipoIcon from './HydranteTypeIcon'
import type { Hidrante } from '../../lib/types'
import './hydrant-ui.css'

interface HydrantDetailSheetProps {
  open: boolean
  hidrante: Hidrante | null
  onClose: () => void
  onAddMarker: () => void
}

function bombeirosUrl(id: number): string {
  return `https://cbaplang.corpodebombeiros.sp.gov.br/hidrantes/03individual/${id}.html`
}

function HydrantDetailSheet({
  open,
  hidrante,
  onClose,
  onAddMarker,
}: HydrantDetailSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      compact
      title={hidrante ? `Hidrante ${hidrante.id}` : ''}
    >
      {hidrante && (
        <div className="hydrant-summary">
          <div className="hydrant-summary-type">
            <HydranteTipoIcon tipo={hidrante.tipo} />
            <span>{hydranteTipoLabel(hidrante.tipo)}</span>
          </div>
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
        </div>
      )}
    </BottomSheet>
  )
}

export default HydrantDetailSheet