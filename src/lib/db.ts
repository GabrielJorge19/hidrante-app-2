import Dexie, { type Table } from 'dexie'
import type { Hidrante, MetaRow, SavedHidrante } from './types'
import type { ParadaPendente, RotaCache, RotaParadaCache } from './rotaTypes'
import { distanceInMeters } from './geo'

type LegacyMarker = {
  id: string
  label: string
  notes: string
  typeId?: string
  color?: string
  hydranteId?: number
  latitude: number
  longitude: number
  createdAt: number
}

class HidranteDB extends Dexie {
  hidrantes!: Table<Hidrante, number>
  saved!: Table<SavedHidrante, number>
  meta!: Table<MetaRow, string>
  rotas!: Table<RotaCache, number>
  rotaParadas!: Table<RotaParadaCache, string>
  paradasPendentes!: Table<ParadaPendente, number>

  constructor() {
    super('hidrante-app-db')
    this.version(1).stores({
      hidrantes: 'id, updated_at',
      markers: 'id, label',
      meta: 'key',
    })
    this.version(2)
      .stores({
        hidrantes: 'id, updated_at',
        markers: 'id, label',
        meta: 'key',
      })
      .upgrade((tx) => tx.table('hidrantes').clear())
    this.version(3)
      .stores({
        hidrantes: 'id, updated_at',
        markers: 'id, label, hydranteId',
        meta: 'key',
      })
      .upgrade(async (tx) => {
        const hidrantes: Hidrante[] = await tx.table('hidrantes').toArray()
        await tx
          .table('markers')
          .toCollection()
          .modify((marker: LegacyMarker) => {
            if (marker.hydranteId != null || hidrantes.length === 0) return
            let bestId: number | undefined
            let bestDist = Infinity
            for (const h of hidrantes) {
              const d = distanceInMeters(
                marker.latitude,
                marker.longitude,
                h.latitude,
                h.longitude,
              )
              if (d < bestDist) {
                bestDist = d
                bestId = h.id
              }
            }
            if (bestId != null && bestDist <= 50) marker.hydranteId = bestId
          })
      })
    this.version(4)
      .stores({
        hidrantes: 'id, updated_at',
        saved: 'hydranteId',
        meta: 'key',
      })
      .upgrade(async (tx) => {
        const markers = await tx.table('markers').toArray()
        const payload: SavedHidrante[] = markers
          .filter((marker) => marker.hydranteId != null)
          .map((marker) => ({
            hydranteId: marker.hydranteId as number,
            notes: marker.notes,
            typeId: marker.typeId,
            color: marker.color,
            createdAt: marker.createdAt,
          }))
        if (payload.length > 0) {
          await tx.table('saved').bulkPut(payload)
        }
        await tx.table('markers').clear()
      })
    this.version(5).stores({
      hidrantes: 'id, updated_at',
      saved: 'hydranteId',
      meta: 'key',
      rotas: 'id, data, status',
      rotaParadas: 'id, rota_id, status',
      paradasPendentes: '++key, paradaId, rotaId',
    })
    // A parada passou a ser identificada por rota + hidrante + OS, sem id próprio.
    // O Dexie não altera a chave primária de uma tabela existente, então as duas
    // tabelas de rota são removidas na versão 6 e recriadas na versão 7.
    this.version(6).stores({
      rotaParadas: null,
      paradasPendentes: null,
    })
    this.version(7).stores({
      hidrantes: 'id, updated_at',
      saved: 'hydranteId',
      meta: 'key',
      rotas: 'id, data, status',
      rotaParadas: 'paradaKey, rota_id, status',
      paradasPendentes: '++key, paradaKey, rotaId',
    })
    // A fila offline é lida em ordem de criação (`criadoEm`), então a coluna
    // precisa estar indexada para o orderBy funcionar no IndexedDB.
    this.version(8).stores({
      hidrantes: 'id, updated_at',
      saved: 'hydranteId',
      meta: 'key',
      rotas: 'id, data, status',
      rotaParadas: 'paradaKey, rota_id, status',
      paradasPendentes: '++key, paradaKey, rotaId, criadoEm',
    })
  }
}

export const db = new HidranteDB()