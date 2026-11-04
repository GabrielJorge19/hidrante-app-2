import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { authErrorMessage } from '../lib/authErrors'
import {
  AuthContext,
  type AuthStatus,
  type UserProfile,
} from './AuthContext'

interface ProfileRow {
  id: string
  email: string | null
  nome: string | null
  role: string
  ativo: boolean
}

function fallbackProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? null,
    nome: user.email?.split('@')[0] ?? null,
    role: 'visualizador',
    ativo: true,
  }
}

function clearStoredSession() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
      localStorage.removeItem(key)
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loadedProfile, setLoadedProfile] = useState<UserProfile | null>(null)
  const [ready, setReady] = useState(!supabase)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return

    let alive = true
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return
      setSession(nextSession)
      setReady(true)
    })

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return
        setSession(data.session)
        setReady(true)
      })
      .catch(() => {
        if (!alive) return
        setReady(true)
      })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const client = supabase
    const user = session?.user

    if (!client || !user) return

    let alive = true

    async function loadProfile() {
      if (!client || !user) return

      const { data, error } = await client
        .from('profiles')
        .select('id, email, nome, role, ativo')
        .eq('id', user.id)
        .maybeSingle()

      if (!alive) return

      // Em modo offline, mantém o acesso local usando os dados do usuário.
      if (error) {
        setLoadedProfile(fallbackProfile(user))
        return
      }

      const row = data as ProfileRow | null
      if (!row) {
        setLoadedProfile(fallbackProfile(user))
        return
      }

      if (!row.ativo) {
        setLoadedProfile(null)
        setAuthMessage('Seu acesso está desativado. Fale com o administrador.')
        try {
          await client.auth.signOut({ scope: 'local' })
        } catch {
          void client.auth.stopAutoRefresh()
          clearStoredSession()
          setSession(null)
        }
        return
      }

      setLoadedProfile({ ...row, email: row.email ?? user.email ?? null })
    }

    void loadProfile()

    return () => {
      alive = false
    }
  }, [session])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Serviço de autenticação não configurado.')
    }

    setAuthMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) throw new Error(authErrorMessage(error))

    setSession(data.session)
    setReady(true)
    void supabase.auth.startAutoRefresh()
  }, [])

  const signOut = useCallback(async () => {
    setAuthMessage(null)

    if (supabase) {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        // Garante o logout no dispositivo mesmo se a API estiver indisponível.
        void supabase.auth.stopAutoRefresh()
        clearStoredSession()
      }
    }

    setSession(null)
    setLoadedProfile(null)
  }, [])

  const clearAuthMessage = useCallback(() => setAuthMessage(null), [])

  // Só considera o perfil carregado se ele pertencer à sessão atual.
  const profile = useMemo(
    () =>
      loadedProfile && loadedProfile.id === session?.user?.id
        ? loadedProfile
        : null,
    [loadedProfile, session],
  )

  const status: AuthStatus = !supabase
    ? 'unconfigured'
    : !ready
      ? 'loading'
      : session
        ? 'authenticated'
        : 'unauthenticated'

  const value = useMemo(
    () => ({
      status,
      user: session?.user ?? null,
      profile,
      authMessage,
      signIn,
      signOut,
      clearAuthMessage,
    }),
    [status, session, profile, authMessage, signIn, signOut, clearAuthMessage],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
