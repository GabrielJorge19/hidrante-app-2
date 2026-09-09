export interface MarkerTypeOption {
  id: string
  label: string
  color: string
}

export const MARKER_TYPES: MarkerTypeOption[] = [
  { id: 'apoio', label: 'Ponto de apoio', color: '#00838f' },
  { id: 'obra', label: 'Obra', color: '#e65100' },
  { id: 'reservado', label: 'Reservado', color: '#6a1b9a' },
  { id: 'manutencao', label: 'Em manutenção', color: '#c62828' },
  { id: 'risco', label: 'Ponto de risco', color: '#b71c1c' },
  { id: 'outro', label: 'Outro (personalizado)', color: '#546e7a' },
]

export const DEFAULT_MARKER_COLOR = '#1a73e8'

export function markerTypeLabel(typeId?: string): string {
  const found = MARKER_TYPES.find((t) => t.id === typeId)
  return found ? found.label : 'Personalizado'
}