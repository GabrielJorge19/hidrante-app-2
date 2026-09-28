import { getNavOption, type NavOption } from '../lib/preferences'

export function openInNavigator(latitude: number, longitude: number): void {
  const option = getNavOption()
  openInNavigatorWith(latitude, longitude, option)
}

export function openInNavigatorWith(
  latitude: number,
  longitude: number,
  option: NavOption,
): void {
  const url =
    option === 'waze'
      ? `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  window.open(url, '_blank', 'noopener,noreferrer')
}