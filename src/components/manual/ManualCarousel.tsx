import { useRef, useState, type ReactElement } from 'react'
import type { ManualModule } from '../../lib/manual/manualContent'
import ManualIcon from './ManualIcon'
import ManualContent, { type ManualZoomTarget } from './ManualContent'

interface ManualCarouselProps {
  modules: ManualModule[]
  index: number
  onIndexChange: (index: number) => void
  onBack: () => void
  onZoom: (target: ManualZoomTarget) => void
}

function ManualCarousel({
  modules,
  index,
  onIndexChange,
  onBack,
  onZoom,
}: ManualCarouselProps): ReactElement {
  const viewportRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<{ x: number; y: number; id: number } | null>(null)
  const suppressClickRef = useRef(false)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const total = modules.length
  const safeIndex = Math.min(Math.max(index, 0), total - 1)

  const goPrev = (): void => {
    if (safeIndex > 0) onIndexChange(safeIndex - 1)
  }
  const goNext = (): void => {
    if (safeIndex < total - 1) onIndexChange(safeIndex + 1)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>): void {
    const start = startRef.current
    if (!start || start.id !== e.pointerId) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y

    if (!dragging) {
      if (Math.abs(dx) < 8) return
      // Gesto predominantemente vertical: deixa a rolagem nativa agir.
      if (Math.abs(dx) < Math.abs(dy)) {
        startRef.current = null
        return
      }
      setDragging(true)
    }

    const atStart = safeIndex === 0 && dx > 0
    const atEnd = safeIndex === total - 1 && dx < 0
    setDragX(atStart || atEnd ? dx * 0.35 : dx)
  }

  function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>): void {
    const start = startRef.current
    if (!start || start.id !== e.pointerId) return
    const dx = e.clientX - start.x
    const wasDragging = dragging
    startRef.current = null
    setDragging(false)
    setDragX(0)

    if (!wasDragging) return

    suppressClickRef.current = true
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)

    const width = viewportRef.current?.clientWidth ?? 320
    const threshold = Math.min(80, width * 0.18)
    if (dx <= -threshold) goNext()
    else if (dx >= threshold) goPrev()
  }

  function handlePointerCancel(): void {
    startRef.current = null
    setDragging(false)
    setDragX(0)
  }

  return (
    <div className="manual-carousel">
      <button
        type="button"
        className="manual-carousel-fab"
        onClick={onBack}
        aria-label="Voltar ao menu do manual"
      >
        <ManualIcon name="arrow-left" size={20} strokeWidth={2} />
      </button>

      <div
        className="manual-viewport"
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <div
          className={`manual-track${dragging ? ' dragging' : ''}`}
          style={{ transform: `translateX(calc(${-safeIndex * 100}% + ${dragX}px))` }}
        >
          {modules.map((module, i) => (
            <section
              key={module.id}
              className="manual-slide"
              aria-hidden={i !== safeIndex}
              inert={i !== safeIndex}
              aria-label={module.title}
            >
              <ManualContent
                module={module}
                index={i}
                total={total}
                onZoom={onZoom}
              />
            </section>
          ))}
        </div>
      </div>

      <div className="manual-dots">
        <div className="manual-dots-track" role="group" aria-label="Ir para uma seção">
          {modules.map((module, i) => (
            <button
              key={module.id}
              type="button"
              className={`manual-dot${i === safeIndex ? ' active' : ''}`}
              onClick={() => onIndexChange(i)}
              aria-label={`Ir para a seção ${i + 1}: ${module.shortTitle}`}
              aria-current={i === safeIndex ? 'true' : undefined}
              title={module.shortTitle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManualCarousel
