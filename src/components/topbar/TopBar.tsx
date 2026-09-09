import { useEffect, useRef, useState } from 'react'
import SearchBar from '../search/SearchBar'
import { useSyncStatus, type SyncStatus } from '../../hooks/useSyncStatus'
import type { Hidrante } from '../../lib/types'
import './TopBar.css'

interface TopBarProps {
  hidrantes: Hidrante[]
  onSelect: (hidrante: Hidrante) => void
}

const STATUS_TEXT: Record<SyncStatus, string> = {
  syncing: 'Sincronizando…',
  online: 'Sincronizado',
  offline: 'Offline — dados locais',
  unconfigured: 'Supabase não configurado',
}

function TopBar({ hidrantes, onSelect }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { status, lastSync, refreshAll } = useSyncStatus()

  useEffect(() => {
    if (!menuOpen) return

    const onClickOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('click', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <div className="topbar">
      <SearchBar hidrantes={hidrantes} onSelect={onSelect} />

      <div className="menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="menu-button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {menuOpen && (
          <div className="menu-dropdown">
            <div className="menu-item status">
              <span className={`sync-dot ${status}`} />
              <span>{STATUS_TEXT[status]}</span>
            </div>
            {lastSync && (
              <div className="menu-item sub">Última sincronização: {lastSync}</div>
            )}
            <button
              type="button"
              className="menu-item action"
              onClick={() => {
                refreshAll()
                setMenuOpen(false)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              Atualizar agora
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopBar