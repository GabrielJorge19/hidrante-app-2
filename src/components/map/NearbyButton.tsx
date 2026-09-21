import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import './NearbyButton.css'

interface NearbyButtonProps {
  map: L.Map | null
  active: boolean
  onLocate: (lat: number, lng: number, radius: number) => void
  onDeactivate: () => void
}

const FIXED_RADIUS = 500

function NearbyButton({ map, active, onLocate, onDeactivate }: NearbyButtonProps) {
  const [message, setMessage] = useState('')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!message) return
    timerRef.current = window.setTimeout(() => setMessage(''), 6000)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [message])

  function handleClick() {
    if (!map) return
    if (active) {
      onDeactivate()
      return
    }
    setMessage('')
    if (!('geolocation' in navigator)) {
      setMessage('Geolocalização indisponível neste navegador')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocate(pos.coords.latitude, pos.coords.longitude, FIXED_RADIUS)
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
    <div className="nearby-wrap">
      {message && <div className="nearby-message">{message}</div>}
      <button
        type="button"
        className={`nearby-button${active ? ' active' : ''}`}
        onClick={handleClick}
        aria-label="Hidrantes perto de mim (500 m)"
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
          <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2" />
          <path d="M3.5 8a8.5 8.5 0 0 0 0 6M20.5 8a8.5 8.5 0 0 1 0 6" opacity="0.6" />
        </svg>
      </button>
    </div>
  )
}

export default NearbyButton