import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { db } from '../../lib/db'
import { MARKER_TYPES } from '../../lib/markerTypes'
import type { LocalMarker } from '../../lib/types'
import './hydrant-ui.css'

export interface Point {
  latitude: number
  longitude: number
}

interface MarkerEditSheetProps {
  open: boolean
  point: Point | null
  marker: LocalMarker | null
  onClose: () => void
  onSaved: () => void
}

function MarkerEditSheet({ open, point, marker, onClose, onSaved }: MarkerEditSheetProps) {
  const [label, setLabel] = useState(marker?.label ?? '')
  const [typeId, setTypeId] = useState(marker?.typeId ?? MARKER_TYPES[0].id)
  const [color, setColor] = useState(marker?.color ?? MARKER_TYPES[0].color)
  const [notes, setNotes] = useState(marker?.notes ?? '')
  const [error, setError] = useState('')

  const trimmedLabel = label.trim()

  function handleTypeSelect(id: string) {
    setTypeId(id)
    const preset = MARKER_TYPES.find((t) => t.id === id)
    if (preset && preset.id !== 'outro') setColor(preset.color)
  }

  async function handleSave() {
    if (!point) return
    if (!trimmedLabel) {
      setError('Informe um nome/tipo para o marcador.')
      return
    }
    const payload = {
      label: trimmedLabel,
      notes: notes.trim(),
      typeId,
      color,
      latitude: point.latitude,
      longitude: point.longitude,
    }
    if (marker) {
      await db.markers.update(marker.id, payload)
    } else {
      await db.markers.add({
        id: crypto.randomUUID(),
        ...payload,
        createdAt: Date.now(),
      })
    }
    onSaved()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={marker ? 'Editar marcador' : 'Novo marcador'}
    >
      <form
        className="marker-form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
      >
        <div className="field">
          <span className="field-label">Tipo de marcador</span>
          <div className="type-picker">
            {MARKER_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`type-chip ${typeId === t.id ? 'selected' : ''}`}
                onClick={() => handleTypeSelect(t.id)}
              >
                <span
                  className="type-dot"
                  style={{
                    background: t.id === 'outro' ? color : t.color,
                  }}
                />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field-label">Nome do marcador</span>
          <input
            className="field-input"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value)
              setError('')
            }}
            placeholder="Ex: Setor 4, hidrante reservado…"
          />
        </label>

        {typeId === 'outro' && (
          <label className="field color-field">
            <span className="field-label">Cor do marcador</span>
            <div className="color-picker">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
              <span className="color-value">{color}</span>
            </div>
          </label>
        )}

        <label className="field">
          <span className="field-label">Observações</span>
          <textarea
            className="field-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações opcionais"
            rows={3}
          />
        </label>

        {point && (
          <div className="coords-hint">
            {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
          </div>
        )}
        {error && <div className="form-error">{error}</div>}

        <div className="sheet-actions">
          <button type="button" className="sheet-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="sheet-button primary">
            Salvar
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}

export default MarkerEditSheet