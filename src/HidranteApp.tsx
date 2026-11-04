import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import TopBar from './components/topbar/TopBar'
import MapView from './components/map/MapView'
import HydrantLayer, { type MarcadorServico } from './components/map/HydrantLayer'
import LocateButton from './components/map/LocateButton'
import NearbyButton from './components/map/NearbyButton'
import BaseMarker from './components/map/BaseMarker'
import HydrantDetailSheet from './components/hydrant/HydrantDetailSheet'
import SettingsSheet from './components/settings/SettingsSheet'
import ManualOverlay from './components/manual/ManualOverlay'
import ServicoSheet from './components/rota/ServicoSheet'
import { useAuth } from './auth/AuthContext'
import { useHydrantes } from './hooks/useHydrantes'
import { useSavedHydrantes } from './hooks/useSavedHydrantes'
import { useSyncStatus } from './hooks/useSyncStatus'
import { useMinhaRota, type HidranteDoDia } from './hooks/useMinhaRota'
import { distanceInMeters } from './lib/geo'
import {
  getMapStyle,
  setMapStyle as persistMapStyle,
  type MapStyle,
} from './lib/preferences'
import type { Hidrante } from './lib/types'

function hidranteDaRota(parcial: HidranteDoDia, catalogo: Hidrante[]): Hidrante {
  const completo = catalogo.find((h) => h.id === parcial.hidranteId)
  if (completo) return { ...completo, tipo: completo.tipo ?? parcial.tipo }

  return {
    id: parcial.hidranteId,
    latitude: parcial.latitude,
    longitude: parcial.longitude,
    tipo: parcial.tipo,
    bairro: parcial.bairro,
    distrito: parcial.distrito,
    subprefeitura: parcial.subprefeitura,
    regiao: null,
    endereco: parcial.endereco,
    ativo: parcial.ativo,
    status_sgz: null,
    status_bombeiro: null,
    updated_at: '',
  }
}

function HidranteApp() {
  const { profile } = useAuth()
  const [map, setMap] = useState<L.Map | null>(null)
  const [selectedHidrante, setSelectedHidrante] = useState<Hidrante | null>(null)
  const [focusedHidrante, setFocusedHidrante] = useState<Hidrante | null>(null)
  const [nearby, setNearby] = useState<{
    lat: number
    lng: number
    radius: number
  } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [servicoAberto, setServicoAberto] = useState<MarcadorServico | null>(null)
  const [mapStyle, setMapStyleState] = useState<MapStyle>(getMapStyle)

  const hidrantes = useHydrantes()
  const saved = useSavedHydrantes()
  useSyncStatus()
  const minhaRota = useMinhaRota(profile?.id)
  const enquadrouRota = useRef(false)
  const usuarioMexeuMapa = useRef(false)

  const selectedSaved = useMemo(
    () =>
      selectedHidrante
        ? saved.find((s) => s.hydranteId === selectedHidrante.id) ?? null
        : null,
    [saved, selectedHidrante],
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
    return []
  }, [focusedHidrante, nearby, nearbyHidrantes])

  const rotaDoDia = useMemo((): MarcadorServico[] => {
    if (focusedHidrante || nearby) return []
    return minhaRota.hidrantesDoDia.map((parcial) => ({
      hidrante: hidranteDaRota(parcial, hidrantes),
      numero: parcial.numero,
      status: parcial.status,
      paradaKey: parcial.paradaKey,
      rotaId: parcial.rotaId,
      ordemServico: parcial.ordemServico,
    }))
  }, [focusedHidrante, nearby, minhaRota.hidrantesDoDia, hidrantes])

  const handleMapReady = useCallback((nextMap: L.Map) => setMap(nextMap), [])

  useEffect(() => {
    if (!map) return

    const aoArrastar = () => {
      usuarioMexeuMapa.current = true
    }
    const aoZoom = (evento: L.LeafletEvent) => {
      if ('originalEvent' in evento && evento.originalEvent) {
        usuarioMexeuMapa.current = true
      }
    }

    map.on('dragstart', aoArrastar)
    map.on('zoomstart', aoZoom)
    return () => {
      map.off('dragstart', aoArrastar)
      map.off('zoomstart', aoZoom)
    }
  }, [map])

  useEffect(() => {
    if (!map || enquadrouRota.current) return
    if (usuarioMexeuMapa.current || focusedHidrante || nearby) {
      enquadrouRota.current = true
      return
    }
    if (rotaDoDia.length === 0) return

    const bounds = L.latLngBounds(
      rotaDoDia.map(
        (item) =>
          [item.hidrante.latitude, item.hidrante.longitude] as [number, number],
      ),
    )
    if (!bounds.isValid()) return

    map.fitBounds(bounds, { padding: [72, 28], maxZoom: 16 })
    enquadrouRota.current = true
  }, [map, rotaDoDia, focusedHidrante, nearby])

  const servicoVisivel = useMemo(() => {
    if (!servicoAberto) return null
    return (
      rotaDoDia.find((item) => item.paradaKey === servicoAberto.paradaKey) ??
      servicoAberto
    )
  }, [servicoAberto, rotaDoDia])

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
      setServicoAberto(null)
      setSelectedHidrante(hidrante)
    },
    [flyTo],
  )

  const handleSelectServico = useCallback(
    (servico: MarcadorServico) => {
      flyTo(servico.hidrante.latitude, servico.hidrante.longitude)
      setSelectedHidrante(null)
      setServicoAberto(servico)
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
    setServicoAberto(null)
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

  return (
    <>
      <MapView onMapReady={handleMapReady} mapStyle={mapStyle} />
      <BaseMarker map={map} />
      <HydrantLayer
        map={map}
        hidrantes={visibleHidrantes}
        allHidrantes={hidrantes}
        saved={saved}
        rotaDoDia={rotaDoDia}
        onSelectHidrante={handleSelectHidrante}
        onSelectServico={handleSelectServico}
      />
      <NearbyButton
        map={map}
        active={!!nearby}
        onLocate={handleNearbyLocate}
        onDeactivate={handleNearbyDeactivate}
      />
      <LocateButton map={map} />
      <TopBar
        hidrantes={hidrantes}
        onSelect={handleHidranteSearch}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenManual={() => setManualOpen(true)}
      />

      <HydrantDetailSheet
        open={!!selectedHidrante}
        hidrante={selectedHidrante}
        saved={selectedSaved}
        onClose={closeHidranteSheet}
      />

      <ServicoSheet
        key={servicoVisivel?.paradaKey ?? 'fechado'}
        open={!!servicoVisivel}
        servico={servicoVisivel}
        pendente={minhaRota.pendencias.some(
          (item) => item.paradaKey === servicoVisivel?.paradaKey,
        )}
        onClose={() => setServicoAberto(null)}
        marcar={minhaRota.marcar}
      />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        mapStyle={mapStyle}
        onMapStyleChange={handleMapStyleChange}
      />

      {manualOpen && <ManualOverlay onClose={() => setManualOpen(false)} />}
    </>
  )
}

export default HidranteApp
