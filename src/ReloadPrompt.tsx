import { useRegisterSW } from 'virtual:pwa-register/react'
import './ReloadPrompt.css'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="ReloadPrompt-container">
      {offlineReady && (
        <div className="ReloadPrompt-toast">
          <div className="ReloadPrompt-message">
            <span>App instalado e pronto para uso offline!</span>
          </div>
          <button className="ReloadPrompt-toast-button" onClick={close}>
            Fechar
          </button>
        </div>
      )}
      {needRefresh && (
        <div className="ReloadPrompt-toast">
          <div className="ReloadPrompt-message">
            <span>Nova versão disponível!</span>
          </div>
          <button
            className="ReloadPrompt-toast-button"
            onClick={() => updateServiceWorker(true)}
          >
            Atualizar
          </button>
          <button className="ReloadPrompt-toast-button" onClick={close}>
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}

export default ReloadPrompt
