export interface Hidrante {
  id: number
  latitude: number
  longitude: number
  tipo: string | null
  bairro: string | null
  distrito: string | null
  subprefeitura: string | null
  regiao: string | null
  endereco: string | null
  ativo: string | null
  status_sgz: string | null
  status_bombeiro: string | null
  updated_at: string
  synced_at?: number
}

export interface SavedHidrante {
  hydranteId: number
  notes: string
  typeId?: string
  color?: string
  createdAt: number
}

export interface MetaRow {
  key: string
  value: string
}