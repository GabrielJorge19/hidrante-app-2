import { useCallback, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ReloadPrompt from './ReloadPrompt'
import TopBar from './components/topbar/TopBar'
import MapView from './components/map/MapView'
import HydrantLayer from './components/map/HydrantLayer'
import AddHydrantFab from './components/hydrant/AddHydrantFab'
import HydrantDetailSheet from './components/hydrant/HydrantDetailSheet'
import MarkerEditSheet, { type Point } from './components/hydrant/MarkerEditSheet'
import MarkerDetailSheet from './components/hydrant/MarkerDetailSheet'
import { useHydrantes } from './hooks/useHydrantes'
import { useCustomMarkers } from './hooks/useCustomMarkers'
import type { Hidrante, LocalMarker } from './lib/types'

function App() {
  const [map, setMap] = useState<L.Map | null>(null)
  const [addMode, setAddMode] = useState(false)
  const [selectedHidrante, setSelectedHidrante] = useState<Hidrante | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<LocalMarker | null>(null)
  const [draftPoint, setDraftPoint] = useState<Point | null>(null)

  const hidrantes = useHydrantes()
  const markers = useCustomMarkers()

  const handleMapReady = useCallback((nextMap: L.Map) => setMap(nextMap), [])

  const handleMapClick = useCallback((latitude: number, longitude: number) => {
    setDraftPoint({ latitude, longitude })
  }, [])

  const handleSelectHidrante = useCallback(
    (hidrante: Hidrante) => setSelectedHidrante(hidrante),
    [],
  )

  const handleSelectMarker = useCallback(
    (marker: LocalMarker) => setSelectedMarker(marker),
    [],
  )

  const flyTo = useCallback(
    (latitude: number, longitude: number) => {
      map?.flyTo([latitude, longitude], 17)
    },
    [map],
  )

  const cancelAddMode = () => {
    setAddMode(false)
    setDraftPoint(null)
    setSelectedMarker(null)
  }

  const handleHidranteSearch = (hidrante: Hidrante) => {
    flyTo(hidrante.latitude, hidrante.longitude)
    setSelectedHidrante(hidrante)
  }

  return (
    <>
      <MapView
        onMapReady={handleMapReady}
        addMode={addMode}
        onMapClick={handleMapClick}
      />
      <HydrantLayer
        map={map}
        hidrantes={hidrantes}
        markers={markers}
        onSelectHidrante={handleSelectHidrante}
        onSelectMarker={handleSelectMarker}
      />
      <TopBar hidrantes={hidrantes} onSelect={handleHidranteSearch} />

      {!addMode && <AddHydrantFab onClick={() => setAddMode(true)} />}

      {addMode && (
        <div className="add-mode-banner">
          <span>Toque no mapa para adicionar um marcador</span>
          <button onClick={cancelAddMode}>Cancelar</button>
        </div>
      )}

      <HydrantDetailSheet
        open={!!selectedHidrante}
        hidrante={selectedHidrante}
        onClose={() => setSelectedHidrante(null)}
        onCenter={() =>
          selectedHidrante &&
          flyTo(selectedHidrante.latitude, selectedHidrante.longitude)
        }
      />

      <MarkerEditSheet
        key={selectedMarker?.id ?? 'new'}
        open={!!draftPoint}
        point={draftPoint}
        marker={selectedMarker}
        onClose={cancelAddMode}
        onSaved={cancelAddMode}
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
        onDeleted={() => {
          setSelectedMarker(null)
          setDraftPoint(null)
        }}
      />

      <ReloadPrompt />
    </>
  )
}

export default App