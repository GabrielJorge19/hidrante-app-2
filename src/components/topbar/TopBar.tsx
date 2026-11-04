import { useEffect, useRef, useState } from 'react'
import SearchBar from '../search/SearchBar'
import { useAuth } from '../../auth/AuthContext'
import type { Hidrante } from '../../lib/types'
import './TopBar.css'

interface TopBarProps {
  hidrantes: Hidrante[]
  onSelect: (hidrante: Hidrante) => void
  onOpenSettings: () => void
  onOpenManual: () => void
}

function TopBar({
  hidrantes,
  onSelect,
  onOpenSettings,
  onOpenManual,
}: TopBarProps) {
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName =
    profile?.nome?.trim() || user?.email?.split('@')[0] || 'Usuário'
  const userEmail = profile?.email ?? user?.email ?? ''
  const userInitial = displayName.charAt(0).toUpperCase()

  function handleSignOut() {
    setMenuOpen(false)
    void signOut()
  }

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
            <div className="menu-account">
              <span className="menu-account-avatar" aria-hidden="true">
                {userInitial}
              </span>
              <span className="menu-account-info">
                <span className="menu-account-name">{displayName}</span>
                {userEmail && (
                  <span className="menu-account-email" title={userEmail}>
                    {userEmail}
                  </span>
                )}
              </span>
            </div>
            <div className="menu-separator" />
            <button
              type="button"
              className="menu-item action"
              onClick={() => {
                setMenuOpen(false)
                onOpenManual()
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.5C12 5 10.5 4 8.5 4H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5c1.7 0 3 .8 3 1.9" />
                <path d="M12 6.5C12 5 13.5 4 15.5 4H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-5c-1.7 0-3 .8-3 1.9" />
              </svg>
              Manual de Manutenção
            </button>
            <button
              type="button"
              className="menu-item action"
              onClick={() => {
                setMenuOpen(false)
                onOpenSettings()
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Configurações
            </button>
            <div className="menu-separator" />
            <button
              type="button"
              className="menu-item action signout"
              onClick={handleSignOut}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopBar