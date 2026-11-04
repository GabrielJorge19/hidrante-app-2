import { useAuth } from './auth/AuthContext'
import AuthSplash from './components/auth/AuthSplash'
import LoginScreen from './components/auth/LoginScreen'
import HidranteApp from './HidranteApp'
import ReloadPrompt from './ReloadPrompt'

function App() {
  const { status } = useAuth()

  return (
    <>
      {status === 'loading' ? (
        <AuthSplash />
      ) : status === 'authenticated' ? (
        <HidranteApp />
      ) : (
        <LoginScreen />
      )}
      <ReloadPrompt />
    </>
  )
}

export default App
