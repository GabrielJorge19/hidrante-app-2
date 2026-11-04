import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          // Mantém a sessão no dispositivo e renova o token automaticamente.
          persistSession: true,
          autoRefreshToken: true,
          // Não usamos links mágicos nem confirmação por URL neste app.
          detectSessionInUrl: false,
        },
      })
    : null

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
