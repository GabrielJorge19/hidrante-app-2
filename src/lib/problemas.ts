import { hydranteTipoKey } from './hydranteTypes'

export const TIPOS_PROBLEMA = [
  'hidrante_danificado',
  'falta_flange_rosca',
  'vazamento',
  'hidrante_nao_localizado',
  'registro_obstruido',
  'troca_de_tampa',
] as const

export type TipoProblema = (typeof TIPOS_PROBLEMA)[number]

export const ROTULO_PROBLEMA: Record<TipoProblema, string> = {
  hidrante_danificado: 'Hidrante danificado',
  falta_flange_rosca: 'Falta flange com rosca (bujão)',
  vazamento: 'Vazamento',
  hidrante_nao_localizado: 'Hidrante não localizado',
  registro_obstruido: 'Registro obstruído',
  troca_de_tampa: 'Troca de tampa',
}

const COMUNS: TipoProblema[] = [
  'hidrante_danificado',
  'falta_flange_rosca',
  'vazamento',
  'hidrante_nao_localizado',
]

/** Opções do formulário conforme o tipo do hidrante. */
export function problemasDoTipo(tipo?: string | null): TipoProblema[] {
  const chave = hydranteTipoKey(tipo)
  if (chave === 'coluna') return [...COMUNS, 'registro_obstruido']
  if (chave === 'subterraneo') return [...COMUNS, 'troca_de_tampa']
  return COMUNS
}

/** Pasta da OS no bucket. Sem OS, o caminho usa "_". */
export function pastaDaOs(ordemServico: string | null): string {
  const limpa = ordemServico?.trim()
  return limpa ? limpa : '_'
}

export function caminhosDasFotos(
  rotaId: number,
  hidranteId: number,
  ordemServico: string | null,
  quantidade: number,
): string[] {
  const prefixo = `${rotaId}/${hidranteId}/${pastaDaOs(ordemServico)}`
  return Array.from({ length: quantidade }, (_, indice) => `${prefixo}/${indice + 1}.jpg`)
}
