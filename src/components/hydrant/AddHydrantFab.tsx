import './hydrant-ui.css'

interface AddHydrantFabProps {
  onClick: () => void
}

function AddHydrantFab({ onClick }: AddHydrantFabProps) {
  return (
    <button
      className="fab"
      aria-label="Adicionar marcador"
      onClick={onClick}
    >
      +
    </button>
  )
}

export default AddHydrantFab