export interface MarkerTypeOption {
  id: string
  label: string
  color: string
}

export const MARKER_TYPES: MarkerTypeOption[] = [
  { id: 'manutencao', label: 'Manutenção', color: '#e65100' },
  { id: 'voltar', label: 'Voltar', color: '#c62828' },
  { id: 'outro', label: 'Outro', color: '#546e7a' },
]

export const DEFAULT_MARKER_COLOR = '#1a73e8'

export function markerTypeById(typeId?: string): MarkerTypeOption | undefined {
  return MARKER_TYPES.find((t) => t.id === typeId)
}

export function markerTypeLabel(typeId?: string): string {
  return markerTypeById(typeId)?.label ?? 'Marcador'
}

export function requiresNotes(typeId?: string): boolean {
  return typeId === 'voltar' || typeId === 'outro'
}