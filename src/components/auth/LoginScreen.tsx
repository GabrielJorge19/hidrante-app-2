import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import AuthLogo from './AuthLogo'
import './auth.css'

function LoginScreen() {
  const { status, signIn, authMessage, clearAuthMessage } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const unconfigured = status === 'unconfigured'
  const message = error ?? authMessage

  function handleEmailChange(value: string) {
    setEmail(value)
    setError(null)
    clearAuthMessage()
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setError(null)
    clearAuthMessage()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || unconfigured) return

    setError(null)
    clearAuthMessage()

    if (!navigator.onLine) {
      setError('Você está offline. Conecte-se à internet para entrar.')
      return
    }

    setSubmitting(true)
    try {
      await signIn(email, password)
      setPassword('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen">
      <main className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <AuthLogo />
          </div>
          <h1 className="login-title">Hidrante App</h1>
          <p className="login-subtitle">
            Acesso restrito às equipes de manutenção
          </p>
        </div>

        {unconfigured && (
          <p className="login-error" role="alert">
            Serviço de autenticação não configurado. Verifique as variáveis
            VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          </p>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-label">E-mail</span>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="seu.email@empresa.com"
              disabled={unconfigured || submitting}
              aria-invalid={!!message}
              aria-describedby={message ? 'login-error' : undefined}
              required
            />
          </label>

          <label className="login-field">
            <span className="login-label">Senha</span>
            <span className="login-input-wrap">
              <input
                className="login-input with-toggle"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                autoComplete="current-password"
                placeholder="Sua senha"
                disabled={unconfigured || submitting}
                aria-invalid={!!message}
                aria-describedby={message ? 'login-error' : undefined}
                required
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                disabled={unconfigured || submitting}
              >
                {showPassword ? (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.4 5.2A10.7 10.7 0 0 1 12 5c5 0 9 4.5 9 7a11.8 11.8 0 0 1-2.3 3.1" />
                    <path d="M6.6 6.6A11.6 11.6 0 0 0 3 12c0 2.5 4 7 9 7a10.6 10.6 0 0 0 4.2-.9" />
                  </svg>
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
                    <circle cx="12" cy="12" r="2.6" />
                  </svg>
                )}
              </button>
            </span>
          </label>

          {message && (
            <p id="login-error" className="login-error" role="alert" aria-live="polite">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={unconfigured || submitting || !email.trim() || !password}
          >
            {submitting && <span className="login-spinner" aria-hidden="true" />}
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="login-help">
          Esqueceu a senha? Fale com o administrador para redefini-la.
        </p>

        <p className="login-footer">Acesso fornecido pelo administrador</p>
      </main>
    </div>
  )
}

export default LoginScreen
