import type { ReactElement } from 'react'

/**
 * Diagrama técnico original: vista superior da área pintada do hidrante de coluna.
 *
 * Escala do desenho: 2,2 px por centímetro.
 *  - Área vermelha central: 70 × 70 cm  -> 154 px
 *  - Faixa amarela ao redor: 15 cm      -> 33 px
 *  - Dimensão externa total: 100 × 100 cm -> 220 px
 * (154 + 33 + 33 = 220, proporções coerentes com as medidas informadas.)
 */
function ColumnPaintingDiagram(): ReactElement {
  return (
    <svg
      className="manual-diagram-svg"
      viewBox="0 0 360 344"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Vista superior da pintura do hidrante de coluna: área vermelha de 70 por 70 centímetros e faixa amarela de 15 centímetros, totalizando 1 por 1 metro."
    >
      {/* Área externa total (faixa amarela) */}
      <rect className="diagram-band" x="70" y="64" width="220" height="220" />
      {/* Área central vermelha */}
      <rect className="diagram-area" x="103" y="97" width="154" height="154" />

      {/* Cotas — largura total (topo) */}
      <line className="diagram-ext" x1="70" y1="52" x2="70" y2="64" />
      <line className="diagram-ext" x1="290" y1="52" x2="290" y2="64" />
      <line className="diagram-dim" x1="70" y1="50" x2="290" y2="50" />
      <line className="diagram-tick" x1="70" y1="44" x2="70" y2="56" />
      <line className="diagram-tick" x1="290" y1="44" x2="290" y2="56" />
      <text className="diagram-dim-text" x="180" y="40" textAnchor="middle">
        1,00 m
      </text>

      {/* Cotas — largura da área vermelha (base) */}
      <line className="diagram-ext" x1="103" y1="284" x2="103" y2="302" />
      <line className="diagram-ext" x1="257" y1="284" x2="257" y2="302" />
      <line className="diagram-dim" x1="103" y1="300" x2="257" y2="300" />
      <line className="diagram-tick" x1="103" y1="294" x2="103" y2="306" />
      <line className="diagram-tick" x1="257" y1="294" x2="257" y2="306" />
      <text className="diagram-dim-text" x="180" y="322" textAnchor="middle">
        70 cm
      </text>

      {/* Cotas — altura total (esquerda) */}
      <line className="diagram-ext" x1="52" y1="64" x2="70" y2="64" />
      <line className="diagram-ext" x1="52" y1="284" x2="70" y2="284" />
      <line className="diagram-dim" x1="54" y1="64" x2="54" y2="284" />
      <line className="diagram-tick" x1="48" y1="64" x2="60" y2="64" />
      <line className="diagram-tick" x1="48" y1="284" x2="60" y2="284" />
      <text
        className="diagram-dim-text"
        x="40"
        y="174"
        textAnchor="middle"
        transform="rotate(-90 40 174)"
      >
        1,00 m
      </text>

      {/* Cota — largura da faixa amarela (direita) */}
      <line className="diagram-dim" x1="257" y1="174" x2="290" y2="174" />
      <line className="diagram-tick" x1="257" y1="168" x2="257" y2="180" />
      <line className="diagram-tick" x1="290" y1="168" x2="290" y2="180" />
      <text className="diagram-dim-text" x="300" y="178" textAnchor="start">
        15 cm
      </text>

      {/* Rótulos internos */}
      <text className="diagram-label-light" x="180" y="178" textAnchor="middle">
        Área vermelha
      </text>
    </svg>
  )
}

export default ColumnPaintingDiagram
