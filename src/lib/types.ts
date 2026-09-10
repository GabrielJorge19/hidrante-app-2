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

export interface LocalMarker {
  id: string
  label: string
  notes: string
  typeId?: string
  color?: string
  latitude: number
  longitude: number
  createdAt: number
}

export interface MetaRow {
  key: string
  value: string
}