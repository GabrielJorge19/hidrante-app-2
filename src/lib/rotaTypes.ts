import type { TipoProblema } from './problemas'

export type RotaStatus = 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'

export type ParadaStatus = 'pendente' | 'em_andamento' | 'concluido' | 'nao_realizado' | 'cancelado'

export const ROTULO_ROTA_STATUS: Record<RotaStatus, string> = {
  planejada: 'Planejada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export const ROTULO_PARADA_STATUS: Record<ParadaStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  nao_realizado: 'Problema reportado',
  cancelado: 'Cancelado',
}

/** Cabeçalho da rota guardado no dispositivo. */
export interface RotaCache {
  id: number
  data: string | null
  status: RotaStatus
  subprefeitura: string | null
  distrito: string | null
  observacao: string | null
  cachedAt: number
}

/** OS do ativo, lida na view. Não identifica a parada. */
export interface OrdemServicoDaParada {
  ordem_servico: string
  status: string
}

/** Parada guardada no dispositivo, já com os dados do hidrante. */
export interface RotaParadaCache {
  /** Chave da parada: rota + hidrante. */
  paradaKey: string
  rota_id: number
  hidrante_id: number
  ativo: string | null
  endereco: string | null
  bairro: string | null
  distrito: string | null
  subprefeitura: string | null
  ordens_servico: OrdemServicoDaParada[]
  tipo: string | null
  status: ParadaStatus
  observacao: string | null
  latitude: number
  longitude: number
  checkin_at: string | null
  checkin_lat: number | null
  checkin_lng: number | null
  concluido_em: string | null
  /** Momento em que o problema foi reportado (paradas não realizadas). */
  problema_reportado_em: string | null
  created_at: string
}

/** Alteração feita sem internet, aguardando envio ao Supabase. */
export interface ParadaPendente {
  key?: number
  paradaKey: string
  rotaId: number
  hidranteId: number
  status: ParadaStatus
  observacao: string | null
  latitude: number | null
  longitude: number | null
  problemaTipo: TipoProblema | null
  problemaObservacao: string | null
  fotos: Blob[] | null
  criadoEm: number
}

export interface MinhaRota {
  rota: RotaCache
  paradas: RotaParadaCache[]
}

export interface PosicaoAtual {
  latitude: number
  longitude: number
}
