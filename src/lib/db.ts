import Dexie, { type Table } from 'dexie'
import type { Hidrante, LocalMarker, MetaRow } from './types'

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
  }
}

export const db = new HidranteDB()