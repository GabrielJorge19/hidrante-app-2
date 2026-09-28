export type NavOption = 'google' | 'waze'

export const NAV_OPTIONS: { id: NavOption; label: string }[] = [
  { id: 'google', label: 'Google Maps' },
  { id: 'waze', label: 'Waze' },
]

const STORAGE_KEY = 'nav-option'

export function getNavOption(): NavOption {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'waze' || value === 'google' ? value : 'google'
}

export function setNavOption(option: NavOption): void {
  localStorage.setItem(STORAGE_KEY, option)
}

export type MapStyle = 'carto' | 'osm'

const MAP_STYLE_KEY = 'map-style'

export function getMapStyle(): MapStyle {
  const value = localStorage.getItem(MAP_STYLE_KEY)
  return value === 'carto' || value === 'osm' ? value : 'carto'
}

export function setMapStyle(style: MapStyle): void {
  localStorage.setItem(MAP_STYLE_KEY, style)
}