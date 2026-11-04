import type { ReactElement } from 'react'

/**
 * Ícones do manual — SVGs simples e originais (traço, 24×24, `currentColor`),
 * seguindo o mesmo padrão dos ícones já usados no aplicativo. Não há
 * biblioteca de ícones instalada, então mantemos os desenhos aqui.
 */
export type ManualIconName =
  | 'paint-roller'
  | 'cover'
  | 'alert-triangle'
  | 'route'
  | 'check-circle'
  | 'block'
  | 'paint'
  | 'square-x'
  | 'droplet'
  | 'shield-alert'
  | 'barrier'
  | 'map-pin'
  | 'check-square'
  | 'search'
  | 'flag'
  | 'camera'
  | 'database'
  | 'clock'
  | 'x-octagon'
  | 'alert-circle'
  | 'info'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-left'
  | 'x'
  | 'maximize'
  | 'list'
  | 'check'

const PATHS: Record<ManualIconName, ReactElement> = {
  'paint-roller': (
    <>
      <rect x="2" y="3" width="15" height="6" rx="2" />
      <path d="M9.5 17v-2a2 2 0 0 1 2-2H19a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <rect x="7.5" y="17" width="4" height="5" rx="1" />
    </>
  ),
  cover: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M10.3 3.9 1.9 18.1A2 2 0 0 0 3.6 21h16.8a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4.5" />
      <path d="M12 17h.01" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2.6" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="2.6" />
    </>
  ),
  'check-circle': (
    <>
      <path d="M21.8 10.2a9.5 9.5 0 1 1-4.3-5.9" />
      <path d="m9 11.5 3 3L22 4" />
    </>
  ),
  block: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </>
  ),
  paint: (
    <>
      <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2a2 2 0 0 0 2.8 0L19 11Z" />
      <path d="m5 2 5 5" />
      <path d="M2 13h15" />
      <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" />
    </>
  ),
  'square-x': (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="m9.5 9.5 5 5" />
      <path d="m14.5 9.5-5 5" />
    </>
  ),
  droplet: <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z" />,
  'shield-alert': (
    <>
      <path d="M12 2.5 20 6v5.8c0 4.6-3.4 7.9-8 9.7-4.6-1.8-8-5.1-8-9.7V6z" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </>
  ),
  barrier: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  'check-square': (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="m8 12 2.6 2.6L16 9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4-4" />
    </>
  ),
  flag: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22V4" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5h2.8l1.4-2h7.6l1.4 2H20a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 18.5H4A1.5 1.5 0 0 1 2.5 17v-7A1.5 1.5 0 0 1 4 8.5z" />
      <circle cx="12" cy="13" r="3.2" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  'x-octagon': (
    <>
      <path d="M8 2.5h8l5.5 5.5v8L16 21.5H8L2.5 16V8z" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </>
  ),
  'alert-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.5h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  'chevron-left': <path d="m14.5 6-6 6 6 6" />,
  'chevron-right': <path d="m9.5 6 6 6-6 6" />,
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  maximize: (
    <>
      <path d="M8 3H5.5A2.5 2.5 0 0 0 3 5.5V8" />
      <path d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8" />
      <path d="M16 21h2.5a2.5 2.5 0 0 0 2.5-2.5V16" />
      <path d="M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3.5 6h.01" />
      <path d="M3.5 12h.01" />
      <path d="M3.5 18h.01" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
}

interface ManualIconProps {
  name: ManualIconName
  size?: number
  strokeWidth?: number
  className?: string
}

export function ManualIcon({
  name,
  size = 24,
  strokeWidth = 1.8,
  className,
}: ManualIconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}

export default ManualIcon
