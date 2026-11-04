import type { ManualIconName } from '../../components/manual/ManualIcon'

/**
 * Conteúdo do Manual de Manutenção.
 *
 * Este arquivo mantém o conteúdo separado da apresentação: os componentes
 * apenas renderizam os blocos tipados declarados aqui. Todo o conteúdo é
 * demonstrativo e local (não depende de rede nem do banco de dados).
 */

export type ManualAccent = 'red' | 'yellow'

export type ManualDiagramId = 'coluna' | 'subterraneo'

export type ManualDiagLegend = {
  color: string
  label: string
}

export type ManualSpec = {
  value: string
  label: string
  color?: string
}

export type ManualBlock =
  | { kind: 'specs'; items: ManualSpec[] }
  | {
      kind: 'diagram'
      id: ManualDiagramId
      title: string
      caption?: string
      legend?: ManualDiagLegend[]
      expandable?: boolean
    }

export type ManualModule = {
  id: string
  title: string
  shortTitle: string
  description: string
  icon: ManualIconName
  accent: ManualAccent
  readTime: string
  blocks: ManualBlock[]
}

export const MANUAL_TITLE = 'Manual de Manutenção'

export const MANUAL_SUBTITLE =
  'Referência rápida para as equipes de campo: padrões de pintura do hidrante de coluna e do hidrante subterrâneo.'

export const MANUAL_DISCLAIMER =
  'Conteúdo demonstrativo e ilustrativo, sujeito à validação técnica. Não substitui o procedimento oficial nem autoriza intervenções por conta própria.'

export const MANUAL_MODULES: ManualModule[] = [
  {
    id: 'pintura-coluna',
    title: 'Pintura do hidrante de coluna',
    shortTitle: 'Pintura da coluna',
    description: 'Padrão visual da área pintada no entorno do hidrante de coluna.',
    icon: 'paint-roller',
    accent: 'red',
    readTime: '1 min',
    blocks: [
      {
        kind: 'diagram',
        id: 'coluna',
        title: 'Vista superior da área pintada',
        expandable: false,
      },
      {
        kind: 'specs',
        items: [
          { value: '70 × 70 cm', label: 'Área vermelha central', color: '#c62828' },
          { value: '15 cm', label: 'Faixa amarela ao redor', color: '#f9a825' },
          { value: '1 × 1 m', label: 'Dimensão externa total', color: '#455a64' },
        ],
      },
    ],
  },
  {
    id: 'pintura-subterraneo',
    title: 'Pintura do hidrante subterrâneo',
    shortTitle: 'Pintura subterrânea',
    description: 'Faixa amarela que contorna a tampa do hidrante subterrâneo.',
    icon: 'cover',
    accent: 'yellow',
    readTime: '1 min',
    blocks: [
      {
        kind: 'diagram',
        id: 'subterraneo',
        title: 'Tampa em vista superior',
        expandable: false,
      },
      {
        kind: 'specs',
        items: [
          { value: '10 cm', label: 'Largura da faixa amarela', color: '#f9a825' },
        ],
      },
    ],
  },
]
