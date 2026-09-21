export const HIDRANTE_TIPO_LABELS: Record<string, string> = {
  coluna: 'Coluna',
  subterraneo: 'Subterrâneo',
  bica: 'Bica',
}

export function hydranteTipoKey(tipo?: string | null): string {
  const clear = (tipo ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (clear.includes('colun')) return 'coluna'
  if (clear.includes('subterr')) return 'subterraneo'
  if (clear.includes('bica')) return 'bica'
  return clear
}

export function hydranteTipoLabel(tipo?: string | null): string {
  const key = hydranteTipoKey(tipo)
  return HIDRANTE_TIPO_LABELS[key] ?? (tipo?.trim() || 'Sem tipo')
}