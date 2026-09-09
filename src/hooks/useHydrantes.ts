import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { Hidrante } from '../lib/types'

export function useHydrantes(): Hidrante[] {
  const hidrantes = useLiveQuery(() => db.hidrantes.toArray(), [])
  return hidrantes ?? []
}