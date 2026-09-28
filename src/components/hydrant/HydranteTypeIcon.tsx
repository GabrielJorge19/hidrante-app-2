import type { ReactElement } from 'react'
import { hydranteTipoKey, hydranteTipoLabel } from '../../lib/hydranteTypes'
import colunaIco from '../../assets/hidrantes/coluna.ico'
import subterraneoIco from '../../assets/hidrantes/subterraneo.ico'

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

function RetiradoIcon(): ReactElement {
  return (
    <svg {...baseProps}>
      <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
      <path d="M8 16l8-8" />
      <path d="M16 16L8 8" />
    </svg>
  )
}

const IMAGES: Record<string, string> = {
  coluna: colunaIco,
  subterraneo: subterraneoIco,
}

export function HydranteTipoIcon({ tipo }: { tipo?: string | null }): ReactElement {
  const key = hydranteTipoKey(tipo)
  const src = IMAGES[key]
  if (src) {
    return (
      <img
        src={src}
        alt={`Hidrante ${hydranteTipoLabel(tipo)}`}
        className="hydrant-type-img"
      />
    )
  }
  if (key === 'bica') return <BicaIcon />
  return <RetiradoIcon />
}

export default HydranteTipoIcon