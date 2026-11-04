import type { ReactElement } from 'react'
import type { ManualDiagramId, ManualDiagLegend } from '../../lib/manual/manualContent'
import ManualIcon from './ManualIcon'
import ColumnPaintingDiagram from './diagrams/ColumnPaintingDiagram'
import UndergroundPaintingDiagram from './diagrams/UndergroundPaintingDiagram'

interface ManualDiagramProps {
  id: ManualDiagramId
  title: string
  caption?: string
  legend?: ManualDiagLegend[]
  expandable?: boolean
  onExpand: () => void
}

export function ManualDiagramSvg({ id }: { id: ManualDiagramId }): ReactElement {
  return id === 'coluna' ? <ColumnPaintingDiagram /> : <UndergroundPaintingDiagram />
}

function ManualDiagram({
  id,
  title,
  caption,
  legend,
  expandable = true,
  onExpand,
}: ManualDiagramProps): ReactElement {
  return (
    <figure className="manual-diagram">
      <figcaption className="manual-diagram-head">
        <span className="manual-diagram-title">{title}</span>
        {expandable && (
          <button
            type="button"
            className="manual-diagram-expand"
            onClick={onExpand}
            aria-label={`Ampliar ${title}`}
          >
            <ManualIcon name="maximize" size={15} strokeWidth={2} />
            <span>Ampliar</span>
          </button>
        )}
      </figcaption>

      {expandable ? (
        <button
          type="button"
          className="manual-diagram-canvas"
          onClick={onExpand}
          aria-label={`Ampliar diagrama: ${title}`}
        >
          <ManualDiagramSvg id={id} />
        </button>
      ) : (
        <div className="manual-diagram-canvas static">
          <ManualDiagramSvg id={id} />
        </div>
      )}

      {legend && legend.length > 0 && (
        <ul className="manual-legend">
          {legend.map((item) => (
            <li key={item.label} className="manual-legend-item">
              <span className="manual-legend-swatch" style={{ background: item.color }} />
              {item.label}
            </li>
          ))}
        </ul>
      )}

      {caption && <p className="manual-diagram-caption">{caption}</p>}
    </figure>
  )
}

export default ManualDiagram
