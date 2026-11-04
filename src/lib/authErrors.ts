import type { AuthError } from '@supabase/supabase-js'

export function authErrorMessage(error: AuthError): string {
  if (error.status === 0 || error.name === 'AuthRetryableFetchError') {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.'
  }

  switch (error.code) {
    case 'invalid_credentials':
      return 'E-mail ou senha inválidos.'
    case 'email_not_confirmed':
      return 'Conta ainda não confirmada. Fale com o administrador.'
    case 'user_banned':
      return 'Este acesso foi desativado.'
    case 'too_many_requests':
    case 'over_request_rate_limit':
    case 'request_timeout':
      return 'Muitas tentativas ou tempo esgotado. Aguarde um instante e tente novamente.'
    case 'email_provider_disabled':
      return 'O login por e-mail está desabilitado no momento.'
    case 'signup_disabled':
      return 'O cadastro está desativado. Fale com o administrador.'
    case 'session_not_found':
    case 'refresh_token_not_found':
      return 'Sua sessão expirou. Entre novamente.'
    default:
      break
  }

  if (error.status === 429) {
    return 'Muitas tentativas. Aguarde um instante e tente novamente.'
  }

  return 'Não foi possível entrar. Tente novamente.'
}
