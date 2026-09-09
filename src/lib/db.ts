import Dexie, { type Table } from 'dexie'
import type { Hidrante, LocalMarker, MetaRow } from './types'

class HidranteDB extends Dexie {
  hidrantes!: Table<Hidrante, string>
  markers!: Table<LocalMarker, string>
  meta!: Table<MetaRow, string>

  constructor() {
    super('hidrante-app-db')
    this.version(1).stores({
      hidrantes: 'id, updated_at',
      markers: 'id, label',
      meta: 'key',
    })
  }
}

export const db = new HidranteDB()