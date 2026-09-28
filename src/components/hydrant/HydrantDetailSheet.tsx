import { useEffect, useRef, useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { openInNavigator } from '../../lib/maps'
import { SAVED_TAGS, savedTagLabel, DEFAULT_SAVED_COLOR } from '../../lib/savedTypes'
import { db } from '../../lib/db'
import HydranteTipoIcon from './HydranteTypeIcon'
import type { Hidrante, SavedHidrante } from '../../lib/types'
import './hydrant-ui.css'

interface HydrantDetailSheetProps {
  open: boolean
  hidrante: Hidrante | null
  saved: SavedHidrante | null
  onClose: () => void
}

function bombeirosUrl(id: number): string {
  return `https://cbaplang.corpodebombeiros.sp.gov.br/hidrantes/03individual/${id}.html`
}

function currentTimestamp(): number {
  return Date.now()
}

function HydrantDetailSheet({ open, hidrante, saved, onClose }: HydrantDetailSheetProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number; above: boolean } | null>(null)
  const [typeId, setTypeId] = useState(saved?.typeId ?? SAVED_TAGS[0].id)
  const [color, setColor] = useState(saved?.color ?? SAVED_TAGS[0].color)
  const [notesDraft, setNotesDraft] = useState(saved?.notes ?? '')
  const [confirmingUnsave, setConfirmingUnsave] = useState(false)

  const savedColor = saved?.color ?? DEFAULT_SAVED_COLOR
  const savedRef = useRef(saved)
  const notesRef = useRef(notesDraft)
  const notesElRef = useRef<HTMLTextAreaElement>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    savedRef.current = saved
  }, [saved])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!controlRef.current?.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmingUnsave(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setConfirmingUnsave(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  useEffect(
    () => () => {
      const current = savedRef.current
      if (current) {
        db.saved.put({ ...current, notes: notesRef.current.trim() })
      }
    },
    [],
  )

  function handleUnsave(): void {
    if (!hidrante) return
    db.saved.delete(hidrante.id)
    notesRef.current = ''
    setNotesDraft('')
    setMenuOpen(false)
    setConfirmingUnsave(false)
  }

  async function handleSelectTag(id: string): Promise<void> {
    if (!hidrante) return
    if (saved && saved.typeId === id) {
      if (notesRef.current.trim()) {
        setConfirmingUnsave(true)
        return
      }
      handleUnsave()
      return
    }
    const preset = SAVED_TAGS.find((t) => t.id === id)
    const nextColor = preset && preset.id !== 'outro' ? preset.color : color
    await db.saved.put({
      hydranteId: hidrante.id,
      notes: saved?.notes ?? notesRef.current.trim(),
      typeId: id,
      color: nextColor,
      createdAt: saved?.createdAt ?? currentTimestamp(),
    })
    setTypeId(id)
    setColor(nextColor)
    setMenuOpen(false)
  }

  function handleTagColorChange(next: string): void {
    setColor(next)
    if (saved && typeId === 'outro') {
      db.saved.put({ ...saved, color: next })
    }
  }

  function handleNotesChange(value: string): void {
    notesRef.current = value
    setNotesDraft(value)
  }

  function handleSaveNotes(): void {
    const current = savedRef.current
    if (current) {
      db.saved.put({ ...current, notes: notesRef.current.trim() })
    }
  }

  useEffect(() => {
    const el = notesElRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [notesDraft])

  function handleChipClick(): void {
    if (menuOpen) {
      setMenuOpen(false)
      setConfirmingUnsave(false)
      return
    }
    setConfirmingUnsave(false)
    const rect = chipRef.current?.getBoundingClientRect()
    if (rect) {
      const halfWidth = 120
      const x = Math.min(
        Math.max(rect.left + rect.width / 2, halfWidth),
        window.innerWidth - halfWidth,
      )
      const estimatedHeight = 170
      const above = rect.bottom + 8 + estimatedHeight > window.innerHeight
      setMenuAnchor({
        x,
        y: above ? rect.top - 8 : rect.bottom + 8,
        above,
      })
    }
    setMenuOpen(true)
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      compact
      title={hidrante ? String(hidrante.id) : ''}
      titleAriaLabel={hidrante ? `Hidrante ${hidrante.id}` : undefined}
    >
      {hidrante && (
        <div className="hydrant-summary" key={hidrante.id}>
          <div className="hydrant-type-row">
            <div className="hydrant-type-box">
              <HydranteTipoIcon tipo={hidrante.tipo} />
            </div>

            <div className="save-control" ref={controlRef}>
              <button
                type="button"
                ref={chipRef}
                className={`save-chip${saved ? ' saved' : ''}`}
                onClick={handleChipClick}
                aria-pressed={!!saved}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-controls="save-menu"
                style={{
                  color: saved ? savedColor : undefined,
                  borderColor: saved ? savedColor : undefined,
                  background: saved ? `${savedColor}1f` : undefined,
                }}
              >
                <span className="save-chip-dot" style={{ background: saved ? savedColor : '#bdbdbd' }} />
                <span>{saved ? savedTagLabel(saved.typeId) : 'Salvar'}</span>
              </button>

              {menuOpen && menuAnchor && (
                <div
                  id="save-menu"
                  role="group"
                  aria-label="Finalidade"
                  className={`save-menu${menuAnchor.above ? ' above' : ''}`}
                  style={{ left: menuAnchor.x, top: menuAnchor.y }}
                >
                  {confirmingUnsave ? (
                    <div className="save-menu-confirm">
                      <p className="save-menu-confirm-title">Remover hidrante?</p>
                      <p className="save-menu-confirm-text">
                        As observações serão apagadas.
                      </p>
                      <div className="save-menu-confirm-actions">
                        <button
                          type="button"
                          className="sheet-button"
                          onClick={() => setConfirmingUnsave(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="sheet-button danger"
                          onClick={handleUnsave}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="type-picker">
                        {SAVED_TAGS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className={`type-chip ${typeId === t.id ? 'selected' : ''}`}
                            onClick={() => handleSelectTag(t.id)}
                          >
                            <span
                              className="type-dot"
                              style={{ background: t.id === 'outro' ? color : t.color }}
                            />
                            {t.label}
                          </button>
                        ))}
                      </div>
                      {typeId === 'outro' && (
                        <label className="field color-field save-menu-color">
                          <span className="field-label">Cor do pin</span>
                          <div className="color-picker">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => handleTagColorChange(e.target.value)}
                              className="color-input"
                            />
                            <span className="color-value">{color}</span>
                          </div>
                        </label>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {saved && (
            <textarea
              ref={notesElRef}
              className="field-input save-notes"
              value={notesDraft}
              onChange={(e) => handleNotesChange(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Observações (opcional)"
              aria-label="Observações"
              rows={1}
            />
          )}

          <div className="sheet-actions">
            <a
              className="sheet-button"
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
            <button
              type="button"
              className="sheet-button primary"
              onClick={() => openInNavigator(hidrante.latitude, hidrante.longitude)}
            >
              Ir para
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}

export default HydrantDetailSheet