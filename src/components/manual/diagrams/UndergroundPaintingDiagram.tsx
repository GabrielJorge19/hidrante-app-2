import type { ReactElement } from 'react'

/**
 * Diagrama técnico original: vista superior da tampa do hidrante subterrâneo.
 *
 * Escala do desenho: 3 px por centímetro.
 * A faixa amarela tem 10 cm de largura (30 px). As dimensões externas da tampa
 * não foram especificadas, portanto a única medida numérica apresentada é a
 * largura da faixa.
 */
function UndergroundPaintingDiagram(): ReactElement {
  return (
    <svg
      className="manual-diagram-svg"
      viewBox="0 0 380 320"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Vista superior da tampa do hidrante subterrâneo, de formato retangular, com faixa amarela de 10 centímetros ao redor da tampa."
    >
      {/* Forma externa (tampa + faixa amarela) */}
      <rect className="diagram-band" x="70" y="90" width="240" height="160" />
      {/* Tampa central */}
      <rect className="diagram-cover" x="100" y="120" width="180" height="100" />

      {/* Cota — largura da faixa amarela (direita) */}
      <line className="diagram-dim" x1="280" y1="170" x2="310" y2="170" />
      <line className="diagram-tick" x1="280" y1="164" x2="280" y2="176" />
      <line className="diagram-tick" x1="310" y1="164" x2="310" y2="176" />
      <text className="diagram-dim-text" x="318" y="174" textAnchor="start">
        10 cm
      </text>

      {/* Rótulo interno */}
      <text className="diagram-label-light" x="190" y="175" textAnchor="middle">
        Tampa
      </text>
    </svg>
  )
}

export default UndergroundPaintingDiagram
