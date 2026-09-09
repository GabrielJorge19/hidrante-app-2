import { useMemo, useState } from 'react'
import type { Hidrante } from '../../lib/types'
import './SearchBar.css'

interface SearchBarProps {
  hidrantes: Hidrante[]
  onSelect: (hidrante: Hidrante) => void
}

function SearchBar({ hidrantes, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return hidrantes
      .filter((h) => h.id.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query, hidrantes])

  const showList = focused && query.trim().length > 0

  const handleSelect = (hidrante: Hidrante) => {
    onSelect(hidrante)
    setQuery('')
    setFocused(false)
  }

  return (
    <div className="search-wrap">
      <input
        className="search-input"
        type="text"
        placeholder="Buscar hidrante…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length === 1) handleSelect(results[0])
        }}
      />
      {showList && (
        <ul className="search-results">
          {results.length === 0 && <li className="search-empty">Nenhum hidrante encontrado</li>}
          {results.map((h) => (
            <li key={h.id}>
              <button
                className="search-result"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(h)
                }}
              >
                <span className="search-result-id">{h.id}</span>
                {h.endereco && <span className="search-result-sub">{h.endereco}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar