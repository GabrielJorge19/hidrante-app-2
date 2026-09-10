import { db } from '../lib/db'
import { supabase } from '../lib/supabase'
import type { Hidrante } from '../lib/types'

const LAST_SYNC_KEY = 'last_synced_at'
const PAGE_SIZE = 1000

async function setLastSync(value: string): Promise<void> {
  await db.meta.put({ key: LAST_SYNC_KEY, value })
}

async function getLocalMaxUpdatedAt(): Promise<string | null> {
  const last = await db.hidrantes.orderBy('updated_at').last()
  return last?.updated_at ?? null
}

async function getServerTotal(): Promise<number> {
  if (!supabase) return 0
  const { count } = await supabase
    .from('hidrantes')
    .select('id', { count: 'exact', head: true })
  return count ?? 0
}

type SyncMode = 'delta' | 'full'

let syncInProgress = false

export async function runSync(mode: SyncMode = 'delta'): Promise<number> {
  if (syncInProgress) return 0
  syncInProgress = true
  try {
    if (!supabase) throw new Error('Supabase não configurado')

    const dataQuery = supabase
      .from('hidrantes')
      .select('*')
      .order('updated_at', { ascending: true })

    type DataQuery = typeof dataQuery

    async function fetchAllPages(query: DataQuery): Promise<Hidrante[]> {
      const rows: Hidrante[] = []
      let from = 0
      for (;;) {
        const { data, error } = await query.range(from, from + PAGE_SIZE - 1)
        if (error) throw error
        const page = (data ?? []) as Hidrante[]
        rows.push(...page)
        if (page.length < PAGE_SIZE) break
        from += PAGE_SIZE
      }
      return rows
    }

    const serverTotal = await getServerTotal()
    const localCount = await db.hidrantes.count()
    const localMax = await getLocalMaxUpdatedAt()
    const needsFullReload = mode === 'full' || localCount !== serverTotal

    const now = Date.now()

    if (needsFullReload) {
      const rows = await fetchAllPages(dataQuery)
      await db.transaction('rw', db.hidrantes, db.meta, async () => {
        await db.hidrantes.clear()
        if (rows.length > 0) {
          await db.hidrantes.bulkPut(
            rows.map((row) => ({ ...row, synced_at: now })),
          )
        }
        const lastUpdated =
          rows.length > 0 ? rows[rows.length - 1].updated_at : localMax
        if (lastUpdated) await setLastSync(lastUpdated)
      })
      return rows.length
    }

    let query = dataQuery
    if (localMax) query = query.gt('updated_at', localMax)

    const rows = await fetchAllPages(query)
    await db.transaction('rw', db.hidrantes, db.meta, async () => {
      if (rows.length > 0) {
        await db.hidrantes.bulkPut(
          rows.map((row) => ({ ...row, synced_at: now })),
        )
      }
      const lastUpdated =
        rows.length > 0 ? rows[rows.length - 1].updated_at : localMax
      if (lastUpdated) await setLastSync(lastUpdated)
    })

    return rows.length
  } finally {
    syncInProgress = false
  }
}