import { useEffect, useMemo, useRef, useState } from 'react'
import type { Hidrante } from '../../lib/types'
import {
  EMPTY_FILTERS,
  activeFilterCount,
  uniqueFilterValues,
  type HidranteFilterKey,
  type HidranteFilters,
} from '../../lib/hidranteFilters'
import './FilterButton.css'

interface FilterButtonProps {
  hidrantes: Hidrante[]
  filters: HidranteFilters
  onChange: (filters: HidranteFilters) => void
}

const FIELDS: { key: HidranteFilterKey; label: string }[] = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'subprefeitura', label: 'Subprefeitura' },
  { key: 'statusSgz', label: 'Status SGZ' },
  { key: 'statusBombeiro', label: 'Status Bombeiro' },
]

function FilterButton({ hidrantes, filters, onChange }: FilterButtonProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const activeCount = activeFilterCount(filters)

  useEffect(() => {
    if (!open) return

    const onClickOutside = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('click', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const fields = useMemo(
    () =>
      FIELDS.map((field) => ({
        ...field,
        options: uniqueFilterValues(hidrantes, field.key),
      })),
    [hidrantes],
  )

  return (
    <div className="filter-wrap" ref={wrapRef}>
      <button
        type="button"
        className="filter-button"
        aria-label="Filtros"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" />
        </svg>
        {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
      </button>

      {open && (
        <div className="filter-dropdown">
          <div className="filter-dropdown-title">Filtros</div>
          {fields.map(({ key, label, options }) => (
            <label key={key} className="filter-field">
              <span className="filter-field-label">{label}</span>
              <select
                className="filter-select"
                value={filters[key]}
                onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
              >
                <option value="">Todos</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {activeCount > 0 && (
            <button
              type="button"
              className="filter-clear"
              onClick={() => onChange({ ...EMPTY_FILTERS })}
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterButton