-- Aplicar SOMENTE quando a versão com login for publicada.
-- Enquanto esta migration não roda, a política "anon read hidrantes" mantém o
-- app antigo funcionando, mas permite leitura sem autenticação.
--
-- Antes de aplicar, confirme que o build com AuthProvider/LoginScreen está no ar.
-- Depois de aplicar, o app só lê hidrantes com um usuário autenticado e ativo.

drop policy if exists "anon read hidrantes" on public.hidrantes;

-- Remove também o acesso anônimo à tabela e à função auxiliar.
revoke all on public.hidrantes from anon;
revoke all on function public.is_active_user() from anon;
