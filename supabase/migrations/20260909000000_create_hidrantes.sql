-- Tabela de hidrantes (fonte de dados - somente leitura pelo cliente)

create table if not exists public.hidrantes (
  id text primary key,
  latitude double precision not null,
  longitude double precision not null,
  tipo text,
  bairro text,
  distrito text,
  subprefeitura text,
  regiao text,
  endereco text,
  ativo boolean default true,
  status_sgz text,
  status_bombeiro text,
  updated_at timestamptz not null default now()
);

alter table public.hidrantes enable row level security;

-- Cliente consome os dados sem escrever (apenas SELECT)
create policy "anon read hidrantes"
  on public.hidrantes
  for select
  to anon
  using (true);

-- Índice para sincronização incremental via updated_at
create index if not exists idx_hidrantes_updated_at
  on public.hidrantes (updated_at);