import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { DEFAULT_SAVED_COLOR } from '../../lib/savedTypes'
import type { ParadaStatus } from '../../lib/rotaTypes'
import type { Hidrante, SavedHidrante } from '../../lib/types'

/** Mesmas cores do mapa de rota no painel. */
const COR_SERVICO: Record<ParadaStatus, string> = {
  pendente: '#2563eb',
  em_andamento: '#7c3aed',
  concluido: '#16a34a',
  nao_realizado: '#d97706',
  cancelado: '#dc2626',
}

export interface MarcadorServico {
  hidrante: Hidrante
  numero: number
  status: ParadaStatus
  paradaKey: string
  rotaId: number
  ordemServico: string | null
}

interface HydrantLayerProps {
  map: L.Map | null
  hidrantes: Hidrante[]
  allHidrantes: Hidrante[]
  saved: SavedHidrante[]
  rotaDoDia?: MarcadorServico[]
  onSelectHidrante: (hidrante: Hidrante) => void
  onSelectServico?: (servico: MarcadorServico) => void
}

function hydranteIcon(id: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="pin-marker"><span class="pin-label">${id}</span><span class="pin pin-hydrante"></span></span>`,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
  })
}

function servicoIcon(numero: number, status: ParadaStatus): L.DivIcon {
  const cor = COR_SERVICO[status]

  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:30px;height:30px;border-radius:9999px;
      background:${cor};color:#fff;font-size:12px;font-weight:700;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);
    ">${numero}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
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
  rotaDoDia = [],
  onSelectHidrante,
  onSelectServico,
}: HydrantLayerProps) {
  useEffect(() => {
    if (!map) return

    const savedById = new Map(saved.map((s) => [s.hydranteId, s]))
    const rotaIds = new Set(rotaDoDia.map((item) => item.hidrante.id))

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
    const rotaGroup = L.layerGroup().addTo(map)

    const container = map.getContainer()
    const applyLabels = () =>
      container.classList.toggle('show-labels', map.getZoom() >= LABEL_MIN_ZOOM)
    applyLabels()
    map.on('zoomend', applyLabels)

    const render = () => {
      const cull = map.getZoom() >= CULL_MIN_ZOOM
      const bounds = cull ? map.getBounds().pad(0.2) : null
      const visible = hidrantes
        .filter((h) => !savedById.has(h.id) && !rotaIds.has(h.id))
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
      if (rotaIds.has(savedItem.hydranteId)) return
      const hidrante = allHidrantes.find((h) => h.id === savedItem.hydranteId)
      if (!hidrante) return

      const marker = L.marker([hidrante.latitude, hidrante.longitude], {
        icon: savedIcon(savedItem.color ?? DEFAULT_SAVED_COLOR),
      }).addTo(savedGroup)
      marker.on('click', () => onSelectHidrante(hidrante))
    })

    rotaDoDia.forEach((item) => {
      const marker = L.marker([item.hidrante.latitude, item.hidrante.longitude], {
        icon: servicoIcon(item.numero, item.status),
        zIndexOffset: 500,
      }).addTo(rotaGroup)
      marker.on('click', () => onSelectServico?.(item))
    })

    return () => {
      if (scheduleId) window.clearTimeout(scheduleId)
      cluster.clearLayers()
      map.removeLayer(cluster)
      savedGroup.clearLayers()
      map.removeLayer(savedGroup)
      rotaGroup.clearLayers()
      map.removeLayer(rotaGroup)
      map.off('zoomend', applyLabels)
      map.off('zoomend', render)
      map.off('moveend', scheduleRender)
      container.classList.remove('show-labels')
    }
  }, [map, hidrantes, allHidrantes, saved, rotaDoDia, onSelectHidrante, onSelectServico])

  return null
}

export default HydrantLayer