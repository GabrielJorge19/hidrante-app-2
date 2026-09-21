import type { ReactElement } from 'react'
import { hydranteTipoKey } from '../../lib/hydranteTypes'

const baseProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
} as const

function ColunaIcon(): ReactElement {
  return (
    <svg {...baseProps}>
      <path d="M9.5 3.5v17.5" />
      <path d="M14.5 3.5v17.5" />
      <path d="M9.5 3.5a2.5 2.5 0 0 1 5 0" />
      <path d="M7 21h10" />
    </svg>
  )
}

function SubterraneoIcon(): ReactElement {
  return (
    <svg {...baseProps}>
      <path d="M3 12h6" />
      <path d="M15 12h6" />
      <rect x="9" y="8" width="6" height="8" rx="1.2" />
      <path d="M12 12h.01" />
    </svg>
  )
}

function BicaIcon(): ReactElement {
  return (
    <svg {...baseProps}>
      <path d="M4 14h9" />
      <circle cx="13.5" cy="8.5" r="2.6" />
      <path d="M13.5 11.1v8.4" />
      <path d="M9 19.5h10" />
    </svg>
  )
}

function GenericoIcon(): ReactElement {
  return (
    <svg {...baseProps}>
      <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
    </svg>
  )
}

const ICONS: Record<string, () => ReactElement> = {
  coluna: ColunaIcon,
  subterraneo: SubterraneoIcon,
  bica: BicaIcon,
}

export function HydranteTipoIcon({ tipo }: { tipo?: string | null }): ReactElement {
  const key = hydranteTipoKey(tipo)
  const Icon = ICONS[key] ?? GenericoIcon
  return <Icon />
}

export default HydranteTipoIcon