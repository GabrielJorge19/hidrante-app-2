import { useCallback, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ReloadPrompt from './ReloadPrompt'
import TopBar from './components/topbar/TopBar'
import MapView from './components/map/MapView'
import HydrantLayer from './components/map/HydrantLayer'
import ExploreToggle from './components/map/ExploreToggle'
import LocateButton from './components/map/LocateButton'
import NearbyButton from './components/map/NearbyButton'
import BaseMarker from './components/map/BaseMarker'
import HydrantDetailSheet from './components/hydrant/HydrantDetailSheet'
import MarkerEditSheet, { type Point } from './components/hydrant/MarkerEditSheet'
import MarkerDetailSheet from './components/hydrant/MarkerDetailSheet'
import { useHydrantes } from './hooks/useHydrantes'
import { useCustomMarkers } from './hooks/useCustomMarkers'
import { db } from './lib/db'
import {
  EMPTY_FILTERS,
  activeFilterCount,
  matchesFilters,
  type HidranteFilters,
} from './lib/hidranteFilters'
import { distanceInMeters } from './lib/geo'
import type { Hidrante, LocalMarker } from './lib/types'

function App() {
  const [map, setMap] = useState<L.Map | null>(null)
  const [selectedHidrante, setSelectedHidrante] = useState<Hidrante | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<LocalMarker | null>(null)
  const [draftPoint, setDraftPoint] = useState<Point | null>(null)
  const [draftHydranteId, setDraftHydranteId] = useState<number | undefined>(undefined)
  const [filters, setFilters] = useState<HidranteFilters>({ ...EMPTY_FILTERS })
  const [exploreMode, setExploreMode] = useState(false)
  const [focusedHidrante, setFocusedHidrante] = useState<Hidrante | null>(null)
  const [nearby, setNearby] = useState<{
    lat: number
    lng: number
    radius: number
  } | null>(null)

  const hidrantes = useHydrantes()
  const markers = useCustomMarkers()

  const filteredHidrantes = useMemo(
    () => hidrantes.filter((h) => matchesFilters(h, filters)),
    [hidrantes, filters],
  )

  const nearbyHidrantes = useMemo(() => {
    if (!nearby) return []
    return hidrantes.filter(
      (h) =>
        distanceInMeters(h.latitude, h.longitude, nearby.lat, nearby.lng) <=
        nearby.radius,
    )
  }, [hidrantes, nearby])

  const visibleHidrantes = useMemo(() => {
    if (focusedHidrante) return [focusedHidrante]
    if (nearby) return nearbyHidrantes
    return exploreMode ? filteredHidrantes : []
  }, [focusedHidrante, nearby, nearbyHidrantes, exploreMode, filteredHidrantes])

  const handleMapReady = useCallback((nextMap: L.Map) => setMap(nextMap), [])

  const flyTo = useCallback(
    (latitude: number, longitude: number) => {
      map?.flyTo([latitude, longitude], 17)
    },
    [map],
  )

  const handleSelectHidrante = useCallback(
    (hidrante: Hidrante) => {
      flyTo(hidrante.latitude, hidrante.longitude)
      setSelectedHidrante(hidrante)
      setSelectedMarker(null)
    },
    [flyTo],
  )

  const handleSelectMarker = useCallback(
    (marker: LocalMarker) => {
      setSelectedMarker(marker)
      const linked =
        marker.hydranteId != null
          ? hidrantes.find((h) => h.id === marker.hydranteId) ?? null
          : null
      setSelectedHidrante(linked)
    },
    [hidrantes],
  )

  const closeSheets = () => {
    setDraftPoint(null)
    setDraftHydranteId(undefined)
    setSelectedMarker(null)
    setSelectedHidrante(null)
    setFocusedHidrante(null)
  }

  const closeHidranteSheet = () => {
    setSelectedHidrante(null)
    setSelectedMarker(null)
    setFocusedHidrante(null)
  }

  const handleHidranteSearch = (hidrante: Hidrante) => {
    flyTo(hidrante.latitude, hidrante.longitude)
    setFocusedHidrante(hidrante)
    setSelectedHidrante(hidrante)
  }

  const handleAddMarkerAtHidrante = (hidrante: Hidrante) => {
    setSelectedHidrante(null)
    setFocusedHidrante(null)
    setSelectedMarker(null)
    setDraftHydranteId(hidrante.id)
    setDraftPoint({
      latitude: hidrante.latitude,
      longitude: hidrante.longitude,
    })
  }

  const handleEditMarker = useCallback(() => {
    if (!selectedMarker) return
    setSelectedHidrante(null)
    setFocusedHidrante(null)
    setDraftHydranteId(selectedMarker.hydranteId)
    setDraftPoint({
      latitude: selectedMarker.latitude,
      longitude: selectedMarker.longitude,
    })
  }, [selectedMarker])

  const handleDeleteMarker = useCallback(() => {
    if (!selectedMarker) return
    db.markers.delete(selectedMarker.id)
    setDraftPoint(null)
    setSelectedMarker(null)
    setSelectedHidrante(null)
    setFocusedHidrante(null)
  }, [selectedMarker])

  const handleNearbyLocate = useCallback(
    (lat: number, lng: number, radius: number) => {
      setNearby({ lat, lng, radius })
      if (map) {
        map.fitBounds(L.circle([lat, lng], radius).getBounds(), { maxZoom: 17 })
      }
    },
    [map],
  )

  const handleNearbyDeactivate = useCallback(() => setNearby(null), [])

  const handleFiltersChange = useCallback((next: HidranteFilters) => {
    setFilters(next)
    if (activeFilterCount(next) > 0) setExploreMode(true)
  }, [])

  return (
    <>
      <MapView onMapReady={handleMapReady} />
      <BaseMarker map={map} />
      <HydrantLayer
        map={map}
        hidrantes={visibleHidrantes}
        markers={markers}
        onSelectHidrante={handleSelectHidrante}
        onSelectMarker={handleSelectMarker}
      />
      <ExploreToggle active={exploreMode} onClick={() => setExploreMode((value) => !value)} />
      <NearbyButton
        map={map}
        active={!!nearby}
        onLocate={handleNearbyLocate}
        onDeactivate={handleNearbyDeactivate}
      />
      <LocateButton map={map} />
      <TopBar
        hidrantes={hidrantes}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSelect={handleHidranteSearch}
      />

      <HydrantDetailSheet
        open={!!selectedHidrante}
        hidrante={selectedHidrante}
        marker={selectedMarker}
        onClose={closeHidranteSheet}
        onAddMarker={() =>
          selectedHidrante && handleAddMarkerAtHidrante(selectedHidrante)
        }
        onEditMarker={handleEditMarker}
        onDeleteMarker={handleDeleteMarker}
      />

      <MarkerEditSheet
        key={selectedMarker?.id ?? 'new'}
        open={!!draftPoint}
        point={draftPoint}
        marker={selectedMarker}
        hydranteId={draftHydranteId}
        onClose={closeSheets}
        onSaved={closeSheets}
      />

      <MarkerDetailSheet
        open={!!selectedMarker && !draftPoint && !selectedHidrante}
        marker={selectedMarker}
        onClose={() => setSelectedMarker(null)}
        onEdit={() =>
          selectedMarker &&
          setDraftPoint({
            latitude: selectedMarker.latitude,
            longitude: selectedMarker.longitude,
          })
        }
        onDeleted={closeSheets}
      />

      <ReloadPrompt />
    </>
  )
}

export default App