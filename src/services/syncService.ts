import { db } from '../lib/db'
import { supabase } from '../lib/supabase'
import type { Hidrante } from '../lib/types'

const LAST_SYNC_KEY = 'last_synced_at'

async function getLastSync(): Promise<string | null> {
  const row = await db.meta.get(LAST_SYNC_KEY)
  return row?.value ?? null
}

async function setLastSync(value: string): Promise<void> {
  await db.meta.put({ key: LAST_SYNC_KEY, value })
}

type SyncMode = 'delta' | 'full'

let syncInProgress = false

export async function runSync(mode: SyncMode = 'delta'): Promise<number> {
  if (syncInProgress) return 0
  syncInProgress = true
  try {
    if (!supabase) throw new Error('Supabase não configurado')

    let query = supabase
      .from('hidrantes')
      .select('*')
      .order('updated_at', { ascending: true })

    if (mode === 'delta') {
      const lastSync = await getLastSync()
      if (lastSync) query = query.gt('updated_at', lastSync)
    }

    const { data, error } = await query
    if (error) throw error

    const rows = (data ?? []) as Hidrante[]
    const now = Date.now()

    await db.transaction('rw', db.hidrantes, db.meta, async () => {
      if (mode === 'full') await db.hidrantes.clear()
      if (rows.length > 0) {
        await db.hidrantes.bulkPut(
          rows.map((row) => ({ ...row, synced_at: now })),
        )
      }
      const lastUpdated =
        rows.length > 0
          ? rows[rows.length - 1].updated_at
          : await getLastSync()
      if (lastUpdated) await setLastSync(lastUpdated)
    })

    return rows.length
  } finally {
    syncInProgress = false
  }
}