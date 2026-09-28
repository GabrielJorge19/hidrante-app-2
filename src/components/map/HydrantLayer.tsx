import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { DEFAULT_SAVED_COLOR } from '../../lib/savedTypes'
import type { Hidrante, SavedHidrante } from '../../lib/types'

interface HydrantLayerProps {
  map: L.Map | null
  hidrantes: Hidrante[]
  allHidrantes: Hidrante[]
  saved: SavedHidrante[]
  onSelectHidrante: (hidrante: Hidrante) => void
}

function hydranteIcon(id: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="pin-marker"><span class="pin-label">${id}</span><span class="pin pin-hydrante"></span></span>`,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
  })
}

function savedIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="pin pin-saved" style="--pin-color:${color}"></span>`,
    iconSize: [22, 30],
    iconAnchor: [11, 30],
  })
}

const CLUSTER_DISABLE_AT_ZOOM = 16
const LABEL_MIN_ZOOM = CLUSTER_DISABLE_AT_ZOOM
const CULL_MIN_ZOOM = CLUSTER_DISABLE_AT_ZOOM

function HydrantLayer({
  map,
  hidrantes,
  allHidrantes,
  saved,
  onSelectHidrante,
}: HydrantLayerProps) {
  useEffect(() => {
    if (!map) return

    const savedById = new Map(saved.map((s) => [s.hydranteId, s]))

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      spiderfyOnEveryZoom: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 100,
      disableClusteringAtZoom: CLUSTER_DISABLE_AT_ZOOM,
    }).addTo(map)

    const savedGroup = L.layerGroup().addTo(map)

    const container = map.getContainer()
    const applyLabels = () =>
      container.classList.toggle('show-labels', map.getZoom() >= LABEL_MIN_ZOOM)
    applyLabels()
    map.on('zoomend', applyLabels)

    const render = () => {
      const cull = map.getZoom() >= CULL_MIN_ZOOM
      const bounds = cull ? map.getBounds().pad(0.2) : null
      const visible = hidrantes
        .filter((h) => !savedById.has(h.id))
        .filter((h) => !bounds || bounds.contains([h.latitude, h.longitude]))

      cluster.clearLayers()
      visible.forEach((hidrante) => {
        const marker = L.marker([hidrante.latitude, hidrante.longitude], {
          icon: hydranteIcon(hidrante.id),
        })
        marker.on('click', () => onSelectHidrante(hidrante))
        cluster.addLayer(marker)
      })
    }

    let scheduleId = 0
    const scheduleRender = () => {
      if (map.getZoom() < CULL_MIN_ZOOM) return
      if (scheduleId) return
      scheduleId = window.setTimeout(() => {
        scheduleId = 0
        render()
      }, 120)
    }

    render()

    map.on('zoomend', render)
    map.on('moveend', scheduleRender)

    saved.forEach((savedItem) => {
      const hidrante = allHidrantes.find((h) => h.id === savedItem.hydranteId)
      if (!hidrante) return

      const marker = L.marker([hidrante.latitude, hidrante.longitude], {
        icon: savedIcon(savedItem.color ?? DEFAULT_SAVED_COLOR),
      }).addTo(savedGroup)
      marker.on('click', () => onSelectHidrante(hidrante))
    })

    return () => {
      if (scheduleId) window.clearTimeout(scheduleId)
      cluster.clearLayers()
      map.removeLayer(cluster)
      savedGroup.clearLayers()
      map.removeLayer(savedGroup)
      map.off('zoomend', applyLabels)
      map.off('zoomend', render)
      map.off('moveend', scheduleRender)
      container.classList.remove('show-labels')
    }
  }, [map, hidrantes, allHidrantes, saved, onSelectHidrante])

  return null
}

export default HydrantLayer