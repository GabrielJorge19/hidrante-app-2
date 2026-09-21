import type { Hidrante } from './types'

export interface HidranteFilters {
  tipo: string
  subprefeitura: string
  statusSgz: string
  statusBombeiro: string
}

export const EMPTY_FILTERS: HidranteFilters = {
  tipo: '',
  subprefeitura: '',
  statusSgz: '',
  statusBombeiro: '',
}

export type HidranteFilterKey = keyof HidranteFilters

export function getFilterValue(h: Hidrante, key: HidranteFilterKey): string {
  switch (key) {
    case 'tipo':
      return h.tipo ?? ''
    case 'subprefeitura':
      return h.subprefeitura ?? ''
    case 'statusSgz':
      return h.status_sgz ?? ''
    case 'statusBombeiro':
      return h.status_bombeiro ?? ''
    default:
      return ''
  }
}

export function uniqueFilterValues(
  hidrantes: Hidrante[],
  key: HidranteFilterKey,
): string[] {
  const values = new Set<string>()
  for (const h of hidrantes) {
    const value = getFilterValue(h, key).trim()
    if (value) values.add(value)
  }
  return [...values].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function matchesFilters(h: Hidrante, filters: HidranteFilters): boolean {
  return (
    (!filters.tipo || h.tipo === filters.tipo) &&
    (!filters.subprefeitura || h.subprefeitura === filters.subprefeitura) &&
    (!filters.statusSgz || h.status_sgz === filters.statusSgz) &&
    (!filters.statusBombeiro || h.status_bombeiro === filters.statusBombeiro)
  )
}

export function activeFilterCount(filters: HidranteFilters): number {
  return Object.values(filters).filter(Boolean).length
}