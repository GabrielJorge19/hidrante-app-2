import { useEffect, useState } from 'react'
import { runSync } from '../services/syncService'
import { isSupabaseConfigured } from '../lib/supabase'

export type SyncStatus = 'syncing' | 'online' | 'offline' | 'unconfigured'

const SYNC_INTERVAL_MS = 60_000

function nowLabel(): string {
  return new Date().toLocaleTimeString('pt-BR')
}

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(
    isSupabaseConfigured() ? 'syncing' : 'unconfigured',
  )
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    let alive = true

    async function sync() {
      try {
        await runSync('delta')
        if (alive) {
          setStatus('online')
          setLastSync(nowLabel())
        }
      } catch {
        if (alive) setStatus('offline')
      }
    }

    sync()

    const onOnline = () => sync()
    window.addEventListener('online', onOnline)

    const intervalId = setInterval(sync, SYNC_INTERVAL_MS)

    return () => {
      alive = false
      window.removeEventListener('online', onOnline)
      clearInterval(intervalId)
    }
  }, [])

  async function refreshAll() {
    setStatus('syncing')
    try {
      await runSync('full')
      setStatus('online')
      setLastSync(nowLabel())
    } catch {
      setStatus('offline')
    }
  }

  return { status, lastSync, refreshAll }
}