import type { ReactElement } from 'react'
import {
  MANUAL_DISCLAIMER,
  MANUAL_MODULES,
  MANUAL_SUBTITLE,
  MANUAL_TITLE,
} from '../../lib/manual/manualContent'
import ManualIcon from './ManualIcon'

interface ManualMenuProps {
  onClose: () => void
  onOpen: (index: number) => void
}

function ManualMenu({ onClose, onOpen }: ManualMenuProps): ReactElement {
  return (
    <div className="manual-menu">
      <header className="manual-menu-head">
        <div className="manual-menu-headings">
          <span className="manual-menu-eyebrow">
            <ManualIcon name="list" size={15} strokeWidth={2} />
            Consulta rápida
          </span>
          <h1 className="manual-menu-title">{MANUAL_TITLE}</h1>
          <p className="manual-menu-subtitle">{MANUAL_SUBTITLE}</p>
        </div>
        <button
          type="button"
          className="manual-icon-btn"
          onClick={onClose}
          aria-label="Fechar manual"
        >
          <ManualIcon name="x" size={20} strokeWidth={2} />
        </button>
      </header>

      <div className="manual-menu-grid" role="list">
        {MANUAL_MODULES.map((module, index) => (
          <button
            key={module.id}
            type="button"
            role="listitem"
            className={`manual-card accent-${module.accent}`}
            onClick={() => onOpen(index)}
            aria-label={`Abrir: ${module.title}`}
          >
            <span className="manual-card-top">
              <span className="manual-card-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="manual-card-icon">
                <ManualIcon name={module.icon} size={22} />
              </span>
            </span>
            <span className="manual-card-title">{module.shortTitle}</span>
            <span className="manual-card-desc">{module.description}</span>
            <span className="manual-card-foot">
              <span className="manual-card-time">{module.readTime}</span>
              <span className="manual-card-open">
                Abrir
                <ManualIcon name="chevron-right" size={16} strokeWidth={2.4} />
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="manual-menu-disclaimer">
        <ManualIcon name="info" size={15} />
        {MANUAL_DISCLAIMER}
      </p>
    </div>
  )
}

export default ManualMenu
