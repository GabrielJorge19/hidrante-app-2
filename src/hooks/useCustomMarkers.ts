import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { LocalMarker } from '../lib/types'

export function useCustomMarkers(): LocalMarker[] {
  const markers = useLiveQuery(() => db.markers.toArray(), [])
  return markers ?? []
}