import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import './LocateButton.css'

interface LocateButtonProps {
  map: L.Map | null
}

interface UserPosition {
  lat: number
  lng: number
  accuracy: number
}

function LocateButton({ map }: LocateButtonProps) {
  const [position, setPosition] = useState<UserPosition | null>(null)
  const [message, setMessage] = useState('')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!message) return
    timerRef.current = window.setTimeout(() => setMessage(''), 6000)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [message])

  useEffect(() => {
    if (!map || !position) return
    const group = L.layerGroup().addTo(map)
    L.circle([position.lat, position.lng], {
      radius: position.accuracy,
      interactive: false,
      color: '#1a73e8',
      weight: 1,
      fillColor: '#1a73e8',
      fillOpacity: 0.12,
    }).addTo(group)
    L.circleMarker([position.lat, position.lng], {
      radius: 7,
      interactive: false,
      color: '#fff',
      weight: 2,
      fillColor: '#1a73e8',
      fillOpacity: 1,
    }).addTo(group)
    return () => {
      map.removeLayer(group)
    }
  }, [map, position])

  function handleClick() {
    if (!map) return
    if (!('geolocation' in navigator)) {
      setMessage('Geolocalização indisponível neste navegador')
      return
    }
    setMessage('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        setPosition(next)
        map.flyTo([next.lat, next.lng], Math.max(map.getZoom(), 16))
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Permissão de localização negada'
            : err.code === err.TIMEOUT
              ? 'Tempo esgotado ao obter a localização'
              : 'Não foi possível obter sua localização'
        setMessage(msg)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    )
  }

  return (
    <div className="locate-wrap">
      {message && <div className="locate-message">{message}</div>}
      <button
        type="button"
        className={`locate-button${position ? ' active' : ''}`}
        onClick={handleClick}
        aria-label="Centralizar em mim"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="7" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
    </div>
  )
}

export default LocateButton