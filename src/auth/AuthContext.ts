import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'unconfigured'

export interface UserProfile {
  id: string
  email: string | null
  nome: string | null
  role: string
  ativo: boolean
}

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  profile: UserProfile | null
  authMessage: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearAuthMessage: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
