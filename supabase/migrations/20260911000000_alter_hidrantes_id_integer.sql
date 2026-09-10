-- id é um número proveniente do sistema de origem
alter table public.hidrantes
  alter column id type integer using id::integer;