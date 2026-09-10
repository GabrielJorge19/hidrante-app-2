import BottomSheet from '../ui/BottomSheet'
import { openInGoogleMaps } from '../../lib/maps'
import type { Hidrante } from '../../lib/types'
import './hydrant-ui.css'

interface HydrantDetailSheetProps {
  open: boolean
  hidrante: Hidrante | null
  onClose: () => void
  onAddMarker: () => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  )
}

function HydrantDetailSheet({
  open,
  hidrante,
  onClose,
  onAddMarker,
}: HydrantDetailSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={hidrante ? `Hidrante ${hidrante.id}` : ''}>
      {hidrante && (
        <>
          <div className="detail-grid">
            <Field label="Tipo" value={hidrante.tipo ?? ''} />
            <Field label="Endereço" value={hidrante.endereco ?? ''} />
            <Field label="Bairro" value={hidrante.bairro ?? ''} />
            <Field label="Distrito" value={hidrante.distrito ?? ''} />
            <Field label="Subprefeitura" value={hidrante.subprefeitura ?? ''} />
            <Field label="Região" value={hidrante.regiao ?? ''} />
            <Field label="Ativo" value={hidrante.ativo ?? ''} />
            <Field label="Status SGZ" value={hidrante.status_sgz ?? ''} />
            <Field label="Status Bombeiro" value={hidrante.status_bombeiro ?? ''} />
            <Field label="Atualizado em" value={formatDate(hidrante.updated_at)} />
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
          </div>
        </>
      )}
    </BottomSheet>
  )
}

export default HydrantDetailSheet