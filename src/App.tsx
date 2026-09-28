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
import SettingsSheet from './components/settings/SettingsSheet'
import { useHydrantes } from './hooks/useHydrantes'
import { useSavedHydrantes } from './hooks/useSavedHydrantes'
import { useSyncStatus } from './hooks/useSyncStatus'
import {
  EMPTY_FILTERS,
  activeFilterCount,
  matchesFilters,
  type HidranteFilters,
} from './lib/hidranteFilters'
import { distanceInMeters } from './lib/geo'
import {
  getMapStyle,
  setMapStyle as persistMapStyle,
  type MapStyle,
} from './lib/preferences'
import type { Hidrante } from './lib/types'

function App() {
  const [map, setMap] = useState<L.Map | null>(null)
  const [selectedHidrante, setSelectedHidrante] = useState<Hidrante | null>(null)
  const [filters, setFilters] = useState<HidranteFilters>({ ...EMPTY_FILTERS })
  const [exploreMode, setExploreMode] = useState(false)
  const [focusedHidrante, setFocusedHidrante] = useState<Hidrante | null>(null)
  const [nearby, setNearby] = useState<{
    lat: number
    lng: number
    radius: number
  } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mapStyle, setMapStyleState] = useState<MapStyle>(getMapStyle)

  const hidrantes = useHydrantes()
  const saved = useSavedHydrantes()
  useSyncStatus()

  const selectedSaved = useMemo(
    () =>
      selectedHidrante
        ? saved.find((s) => s.hydranteId === selectedHidrante.id) ?? null
        : null,
    [saved, selectedHidrante],
  )

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

  const handleMapStyleChange = useCallback((style: MapStyle) => {
    persistMapStyle(style)
    setMapStyleState(style)
  }, [])

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
    },
    [flyTo],
  )

  const closeHidranteSheet = () => {
    setSelectedHidrante(null)
    setFocusedHidrante(null)
  }

  const handleHidranteSearch = (hidrante: Hidrante) => {
    flyTo(hidrante.latitude, hidrante.longitude)
    setFocusedHidrante(hidrante)
    setSelectedHidrante(hidrante)
  }

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
      <MapView onMapReady={handleMapReady} mapStyle={mapStyle} />
      <BaseMarker map={map} />
      <HydrantLayer
        map={map}
        hidrantes={visibleHidrantes}
        allHidrantes={hidrantes}
        saved={saved}
        onSelectHidrante={handleSelectHidrante}
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
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <HydrantDetailSheet
        open={!!selectedHidrante}
        hidrante={selectedHidrante}
        saved={selectedSaved}
        onClose={closeHidranteSheet}
      />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        mapStyle={mapStyle}
        onMapStyleChange={handleMapStyleChange}
      />

      <ReloadPrompt />
    </>
  )
}

export default App