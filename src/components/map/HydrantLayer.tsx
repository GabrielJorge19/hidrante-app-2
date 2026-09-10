import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
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

const CLUSTER_DISABLE_AT_ZOOM = 15

function HydrantLayer({
  map,
  hidrantes,
  markers,
  onSelectHidrante,
  onSelectMarker,
}: HydrantLayerProps) {
  useEffect(() => {
    if (!map) return

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 100,
      disableClusteringAtZoom: CLUSTER_DISABLE_AT_ZOOM,
    }).addTo(map)

    const localGroup = L.layerGroup().addTo(map)

    hidrantes.forEach((hidrante) => {
      const marker = L.marker([hidrante.latitude, hidrante.longitude], {
        icon: hydranteIcon(),
      })
      marker.on('click', () => onSelectHidrante(hidrante))
      cluster.addLayer(marker)
    })

    markers.forEach((localMarker) => {
      const marker = L.marker([localMarker.latitude, localMarker.longitude], {
        icon: localIcon(localMarker.color ?? DEFAULT_MARKER_COLOR),
      }).addTo(localGroup)
      marker.on('click', () => onSelectMarker(localMarker))
    })

    return () => {
      cluster.clearLayers()
      map.removeLayer(cluster)
      localGroup.clearLayers()
      map.removeLayer(localGroup)
    }
  }, [map, hidrantes, markers, onSelectHidrante, onSelectMarker])

  return null
}

export default HydrantLayer