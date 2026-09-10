import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './map-overlay.css'

interface MapViewProps {
  onMapReady: (map: L.Map) => void
  addMode: boolean
  onMapClick: (latitude: number, longitude: number) => void
}

function MapView({ onMapReady, addMode, onMapClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onMapReadyRef = useRef(onMapReady)
  const onMapClickRef = useRef(onMapClick)
  const addModeRef = useRef(addMode)

  useEffect(() => {
    onMapReadyRef.current = onMapReady
    onMapClickRef.current = onMapClick
    addModeRef.current = addMode
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, {
      zoomControl: false,
    }).setView([-23.55, -46.63], 13)

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY ?? ''}`,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      },
    ).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (addModeRef.current) onMapClickRef.current(e.latlng.lat, e.latlng.lng)
    })

    onMapReadyRef.current(map)

    return () => {
      map.remove()
    }
  }, [])

  useEffect(() => {
    containerRef.current?.classList.toggle('add-mode', addMode)
  }, [addMode])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default MapView