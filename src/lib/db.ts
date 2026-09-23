import Dexie, { type Table } from 'dexie'
import type { Hidrante, LocalMarker, MetaRow } from './types'
import { distanceInMeters } from './geo'

class HidranteDB extends Dexie {
  hidrantes!: Table<Hidrante, number>
  markers!: Table<LocalMarker, string>
  meta!: Table<MetaRow, string>

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
          .modify((marker: LocalMarker) => {
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
  }
}

export const db = new HidranteDB()