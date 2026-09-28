import Dexie, { type Table } from 'dexie'
import type { Hidrante, MetaRow, SavedHidrante } from './types'
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
  }
}

export const db = new HidranteDB()