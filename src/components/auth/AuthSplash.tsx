import AuthLogo from './AuthLogo'
import './auth.css'

function AuthSplash() {
  return (
    <div className="auth-splash" role="status" aria-live="polite">
      <div className="auth-splash-content">
        <div className="auth-splash-logo">
          <AuthLogo />
        </div>
        <span className="auth-splash-text">Carregando…</span>
        <span className="auth-splash-spinner" aria-hidden="true" />
      </div>
    </div>
  )
}

export default AuthSplash
