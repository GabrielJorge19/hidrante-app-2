import './ExploreToggle.css'

interface ExploreToggleProps {
  active: boolean
  onClick: () => void
}

function ExploreToggle({ active, onClick }: ExploreToggleProps) {
  return (
    <button
      type="button"
      className={`explore-toggle${active ? ' active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 13V8a2.5 2.5 0 0 1 5 0v5" />
        <path d="M16 13V8a2.5 2.5 0 0 0-5 0v5" />
        <circle cx="7.5" cy="17" r="3.5" />
        <circle cx="16.5" cy="17" r="3.5" />
        <path d="M5 17h14" />
      </svg>
      {active ? 'Hidrantes visíveis' : 'Ver hidrantes'}
    </button>
  )
}

export default ExploreToggle