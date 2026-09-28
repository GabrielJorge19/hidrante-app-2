import BottomSheet from '../ui/BottomSheet'
import { NAV_OPTIONS, type MapStyle } from '../../lib/preferences'
import { useNavPreference } from '../../hooks/useNavPreference'
import './settings.css'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  mapStyle: MapStyle
  onMapStyleChange: (style: MapStyle) => void
}

const MAP_STYLE_LABEL: Record<MapStyle, string> = {
  carto: 'Claro (CARTO)',
  osm: 'OpenStreetMap',
}

function SettingsSheet({ open, onClose, mapStyle, onMapStyleChange }: SettingsSheetProps) {
  const { navOption, setNav } = useNavPreference()

  const nextMapStyle: MapStyle = mapStyle === 'carto' ? 'osm' : 'carto'

  return (
    <BottomSheet open={open} onClose={onClose} title="Configurações">
      <div className="settings-section">
        <span className="settings-label">Navegação padrão</span>
        <div className="settings-options" role="radiogroup" aria-label="Navegação padrão">
          {NAV_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={navOption === o.id}
              className={`settings-option${navOption === o.id ? ' selected' : ''}`}
              onClick={() => setNav(o.id)}
            >
              <span className="settings-option-label">{o.label}</span>
              {navOption === o.id && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
        <span className="settings-note">
          Usado no botão "Ir para" da ficha do hidrante.
        </span>
      </div>

      <div className="settings-section">
        <span className="settings-label">Estilo do mapa</span>
        <button
          type="button"
          className="settings-option toggle"
          onClick={() => onMapStyleChange(nextMapStyle)}
          aria-label={`Alternar para ${MAP_STYLE_LABEL[nextMapStyle]}`}
        >
          <span className="settings-toggle-text">
            <span className="settings-option-label">Estilo do mapa</span>
            <span className="settings-toggle-desc">
              O OpenStreetMap mostra o sentido das ruas em zoom alto.
            </span>
          </span>
          <span className="settings-toggle-value">
            {MAP_STYLE_LABEL[mapStyle]}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </span>
        </button>
      </div>
    </BottomSheet>
  )
}

export default SettingsSheet