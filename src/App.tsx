import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ReloadPrompt from './ReloadPrompt'

function App() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current, {
      zoomControl: true,
    }).setView([-23.55, -46.63], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    return () => {
      map.remove()
    }
  }, [])

  return (
    <>
      <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
      <ReloadPrompt />
    </>
  )
}

export default App
