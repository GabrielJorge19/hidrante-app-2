import { useEffect } from 'react'
import L from 'leaflet'
import './map-overlay.css'

const BASE_POSITION: [number, number] = [-23.5395833333333, -46.5894166666667]

interface BaseMarkerProps {
  map: L.Map | null
}

function BaseMarker({ map }: BaseMarkerProps) {
  useEffect(() => {
    if (!map) return
    const marker = L.marker(BASE_POSITION, {
      interactive: false,
      icon: L.divIcon({
        className: '',
        html: '<span class="base-pin-marker"><span class="base-pin-label">Base</span><span class="base-pin"></span></span>',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
      }),
    }).addTo(map)

    return () => {
      map.removeLayer(marker)
    }
  }, [map])

  return null
}

export default BaseMarker