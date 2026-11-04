import { useEffect, useRef, useState, type ReactElement } from 'react'
import { MANUAL_MODULES, MANUAL_TITLE } from '../../lib/manual/manualContent'
import ManualIcon from './ManualIcon'
import ManualMenu from './ManualMenu'
import ManualCarousel from './ManualCarousel'
import { ManualDiagramSvg } from './ManualDiagram'
import type { ManualZoomTarget } from './ManualContent'
import './manual.css'

interface ManualOverlayProps {
  onClose: () => void
}

type ManualView = number | 'menu'

/**
 * O manual é montado apenas enquanto está aberto (ver App.tsx), então o
 * estado sempre começa no menu e o aplicativo permanece intacto ao sair.
 */
function ManualOverlay({ onClose }: ManualOverlayProps): ReactElement {
  const [view, setView] = useState<ManualView>('menu')
  const [zoom, setZoom] = useState<ManualZoomTarget | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Foco inicial + trava da rolagem do documento enquanto o manual está aberto.
  useEffect(() => {
    rootRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (zoom) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setZoom(null)
        }
        return
      }
      if (view === 'menu') {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setView('menu')
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setView((v) =>
          typeof v === 'number' ? Math.min(v + 1, MANUAL_MODULES.length - 1) : v,
        )
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setView((v) => (typeof v === 'number' ? Math.max(v - 1, 0) : v))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view, zoom, onClose])

  return (
    <div
      className="manual-root"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={MANUAL_TITLE}
      tabIndex={-1}
    >
      {view === 'menu' ? (
        <ManualMenu onClose={onClose} onOpen={(index) => setView(index)} />
      ) : (
        <ManualCarousel
          modules={MANUAL_MODULES}
          index={view}
          onIndexChange={(index) => setView(index)}
          onBack={() => setView('menu')}
          onZoom={(target) => setZoom(target)}
        />
      )}

      {zoom && (
        <div
          className="manual-zoom"
          role="dialog"
          aria-modal="true"
          aria-label={`Diagrama ampliado: ${zoom.title}`}
        >
          <div className="manual-zoom-head">
            <span className="manual-zoom-title">{zoom.title}</span>
            <button
              type="button"
              className="manual-icon-btn"
              onClick={() => setZoom(null)}
              aria-label="Fechar ampliação"
            >
              <ManualIcon name="x" size={20} strokeWidth={2} />
            </button>
          </div>
          <div className="manual-zoom-body" onClick={() => setZoom(null)}>
            <div className="manual-zoom-canvas" onClick={(e) => e.stopPropagation()}>
              <ManualDiagramSvg id={zoom.id} />
            </div>
          </div>
          <p className="manual-zoom-hint">Toque fora do diagrama para voltar.</p>
        </div>
      )}
    </div>
  )
}

export default ManualOverlay
