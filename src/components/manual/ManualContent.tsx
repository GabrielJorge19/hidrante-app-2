import type { ReactElement } from 'react'
import type { ManualBlock, ManualDiagramId, ManualModule } from '../../lib/manual/manualContent'
import ManualDiagram from './ManualDiagram'

export type ManualZoomTarget = { id: ManualDiagramId; title: string }

interface ManualContentProps {
  module: ManualModule
  index: number
  total: number
  onZoom: (target: ManualZoomTarget) => void
}

function BlockView({
  block,
  onZoom,
}: {
  block: ManualBlock
  onZoom: (target: ManualZoomTarget) => void
}): ReactElement | null {
  switch (block.kind) {
    case 'specs':
      return (
        <div className="manual-specs">
          {block.items.map((item) => (
            <div key={item.label} className="manual-spec">
              <span className="manual-spec-value">
                {item.color && (
                  <span className="manual-spec-dot" style={{ background: item.color }} />
                )}
                {item.value}
              </span>
              <span className="manual-spec-label">{item.label}</span>
            </div>
          ))}
        </div>
      )

    case 'diagram':
      return (
        <ManualDiagram
          id={block.id}
          title={block.title}
          caption={block.caption}
          legend={block.legend}
          expandable={block.expandable ?? true}
          onExpand={() => onZoom({ id: block.id, title: block.title })}
        />
      )

    default:
      return null
  }
}

function ManualContent({ module, index, total, onZoom }: ManualContentProps): ReactElement {
  return (
    <div className="manual-content">
      <header className={`manual-section-head accent-${module.accent}`}>
        <span className="manual-section-eyebrow">
          Seção {String(index + 1).padStart(2, '0')} de {String(total).padStart(2, '0')}
          <span className="manual-section-sep" aria-hidden="true" />
          {module.readTime}
        </span>
        <h1 className="manual-section-title">{module.title}</h1>
      </header>

      {module.blocks.map((block, blockIndex) => (
        <BlockView
          key={`${module.id}-${blockIndex}`}
          block={block}
          onZoom={onZoom}
        />
      ))}
    </div>
  )
}

export default ManualContent
