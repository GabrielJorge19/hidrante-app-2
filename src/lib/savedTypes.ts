export interface SavedTagOption {
  id: string
  label: string
  color: string
}

export const SAVED_TAGS: SavedTagOption[] = [
  { id: 'manutencao', label: 'Manutenção', color: '#e65100' },
  { id: 'voltar', label: 'Voltar', color: '#c62828' },
  { id: 'outro', label: 'Outro', color: '#546e7a' },
]

export const DEFAULT_SAVED_COLOR = '#1a73e8'

export function savedTagById(typeId?: string): SavedTagOption | undefined {
  return SAVED_TAGS.find((t) => t.id === typeId)
}

export function savedTagLabel(typeId?: string): string {
  return savedTagById(typeId)?.label ?? 'Hidrante salvo'
}