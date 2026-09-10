import { useCallback, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ReloadPrompt from './ReloadPrompt'
import TopBar from './components/topbar/TopBar'
import MapView from './components/map/MapView'
import HydrantLayer from './components/map/HydrantLayer'
import HydrantDetailSheet from './components/hydrant/HydrantDetailSheet'
import MarkerEditSheet, { type Point } from './components/hydrant/MarkerEditSheet'
import MarkerDetailSheet from './components/hydrant/MarkerDetailSheet'
import { useHydrantes } from './hooks/useHydrantes'
import { useCustomMarkers } from './hooks/useCustomMarkers'
import type { Hidrante, LocalMarker } from './lib/types'

function App() {
  const [map, setMap] = useState<L.Map | null>(null)
  const [selectedHidrante, setSelectedHidrante] = useState<Hidrante | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<LocalMarker | null>(null)
  const [draftPoint, setDraftPoint] = useState<Point | null>(null)

  const hidrantes = useHydrantes()
  const markers = useCustomMarkers()

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
    },
    [flyTo],
  )

  const handleSelectMarker = useCallback(
    (marker: LocalMarker) => setSelectedMarker(marker),
    [],
  )

  const closeSheets = () => {
    setDraftPoint(null)
    setSelectedMarker(null)
    setSelectedHidrante(null)
  }

  const handleHidranteSearch = (hidrante: Hidrante) => {
    flyTo(hidrante.latitude, hidrante.longitude)
    setSelectedHidrante(hidrante)
  }

  const handleAddMarkerAtHidrante = (hidrante: Hidrante) => {
    setSelectedHidrante(null)
    setDraftPoint({
      latitude: hidrante.latitude,
      longitude: hidrante.longitude,
    })
  }

  return (
    <>
      <MapView onMapReady={handleMapReady} />
      <HydrantLayer
        map={map}
        hidrantes={hidrantes}
        markers={markers}
        onSelectHidrante={handleSelectHidrante}
        onSelectMarker={handleSelectMarker}
      />
      <TopBar hidrantes={hidrantes} onSelect={handleHidranteSearch} />

      <HydrantDetailSheet
        open={!!selectedHidrante}
        hidrante={selectedHidrante}
        onClose={() => setSelectedHidrante(null)}
        onAddMarker={() =>
          selectedHidrante && handleAddMarkerAtHidrante(selectedHidrante)
        }
      />

      <MarkerEditSheet
        key={selectedMarker?.id ?? 'new'}
        open={!!draftPoint}
        point={draftPoint}
        marker={selectedMarker}
        onClose={closeSheets}
        onSaved={closeSheets}
      />

      <MarkerDetailSheet
        open={!!selectedMarker && !draftPoint}
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