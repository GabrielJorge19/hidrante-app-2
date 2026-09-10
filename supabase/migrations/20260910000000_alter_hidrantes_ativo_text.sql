-- "ativo" é um identificador numérico vindo de outro sistema, não um boolean
alter table public.hidrantes
  alter column ativo drop default,
  alter column ativo type text using ativo::text;