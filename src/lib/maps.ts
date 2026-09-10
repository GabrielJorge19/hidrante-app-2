export function openInGoogleMaps(latitude: number, longitude: number): void {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  window.open(url, '_blank', 'noopener,noreferrer')
}