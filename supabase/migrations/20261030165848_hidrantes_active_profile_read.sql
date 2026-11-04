-- Restringe a leitura de hidrantes a usuários autenticados com perfil ativo.
-- A função é SECURITY DEFINER para consultar public.profiles sem depender das
-- políticas de RLS daquela tabela (evita recursão e permite bloquear inativos).

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and ativo = true
  );
$$;

revoke all on function public.is_active_user() from public;
grant execute on function public.is_active_user() to authenticated;

drop policy if exists "authenticated read hidrantes" on public.hidrantes;

create policy "authenticated active read hidrantes"
  on public.hidrantes
  for select
  to authenticated
  using (public.is_active_user());
