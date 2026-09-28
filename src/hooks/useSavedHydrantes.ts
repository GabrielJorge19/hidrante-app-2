import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { SavedHidrante } from '../lib/types'

export function useSavedHydrantes(): SavedHidrante[] {
  const saved = useLiveQuery(() => db.saved.toArray(), [])
  return saved ?? []
}