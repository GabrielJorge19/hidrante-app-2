import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { type MapStyle } from '../../lib/preferences'
import './map-overlay.css'

interface MapViewProps {
  onMapReady: (map: L.Map) => void
  mapStyle: MapStyle
}

function mapStyleConfig(style: MapStyle): {
  url: string
  attribution: string
  maxZoom: number
} {
  if (style === 'osm') {
    return {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }
  }
  return {
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY ?? ''}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  }
}

function MapView({ onMapReady, mapStyle }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const onMapReadyRef = useRef(onMapReady)

  useEffect(() => {
    onMapReadyRef.current = onMapReady
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, {
      zoomControl: false,
    }).setView([-23.55, -46.63], 13)

    mapRef.current = map
    onMapReadyRef.current(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const config = mapStyleConfig(mapStyle)
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: 'abcd',
      maxZoom: config.maxZoom,
    }).addTo(map)

    return () => {
      map.removeLayer(tileLayer)
    }
  }, [mapStyle])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default MapView