import { useEffect } from 'react'
import L from 'leaflet'
import { DEFAULT_MARKER_COLOR } from '../../lib/markerTypes'
import type { Hidrante, LocalMarker } from '../../lib/types'

interface HydrantLayerProps {
  map: L.Map | null
  hidrantes: Hidrante[]
  markers: LocalMarker[]
  onSelectHidrante: (hidrante: Hidrante) => void
  onSelectMarker: (marker: LocalMarker) => void
}

function hydranteIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<span class="pin pin-hydrante"></span>',
    iconSize: [22, 30],
    iconAnchor: [11, 30],
  })
}

function localIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="pin pin-local" style="--pin-color:${color}"></span>`,
    iconSize: [22, 30],
    iconAnchor: [11, 30],
  })
}

function HydrantLayer({
  map,
  hidrantes,
  markers,
  onSelectHidrante,
  onSelectMarker,
}: HydrantLayerProps) {
  useEffect(() => {
    if (!map) return

    const group = L.layerGroup().addTo(map)

    hidrantes.forEach((hidrante) => {
      const marker = L.marker([hidrante.latitude, hidrante.longitude], {
        icon: hydranteIcon(),
      }).addTo(group)
      marker.on('click', () => onSelectHidrante(hidrante))
    })

    markers.forEach((localMarker) => {
      const marker = L.marker([localMarker.latitude, localMarker.longitude], {
        icon: localIcon(localMarker.color ?? DEFAULT_MARKER_COLOR),
      }).addTo(group)
      marker.on('click', () => onSelectMarker(localMarker))
    })

    return () => {
      group.clearLayers()
      map.removeLayer(group)
    }
  }, [map, hidrantes, markers, onSelectHidrante, onSelectMarker])

  return null
}

export default HydrantLayer