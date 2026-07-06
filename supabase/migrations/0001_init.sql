-- ============================================================================
-- Prescrição Inteligente — schema inicial (Supabase / PostgreSQL)
-- Espelha os tipos de src/data/types.ts. Estruturas aninhadas usam JSONB para
-- fidelidade 1:1 com o front (podem ser normalizadas depois, se necessário).
-- Aplicar via: supabase db push  (ou copiar no SQL Editor do painel).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Perfis (espelham auth.users). Plano controla o gating (free/assinante/admin).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text,
  plan       text not null default 'free' check (plan in ('free','assinante','admin')),
  created_at timestamptz not null default now()
);

-- Cria o profile automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Conteúdo (público para leitura). Escrita só por service_role / admin.
-- ---------------------------------------------------------------------------
create table if not exists public.exercises (
  id                        text primary key,
  slug                      text unique not null,
  nome                      text not null,
  grupo_muscular            text,
  equipamento               text,
  nivel                     text,
  articulacao_predominante  text,
  objetivo                  jsonb not null default '[]',   -- string[]
  restricoes                jsonb not null default '[]',   -- string[]
  premium                   boolean not null default false,
  resumo_pratico            text,
  angulo_articular          text,
  imagem                    text,
  imagem_analise            text,
  ativacao                  jsonb not null default '[]',   -- MuscleActivation[]
  indice_eficiencia         jsonb,                          -- IndiceEficiencia
  fases                     jsonb not null default '[]',   -- Fase[]
  hotspots                  jsonb not null default '[]',   -- Hotspot[]
  blocos                    jsonb,                          -- Blocos
  conteudo                  jsonb,                          -- Conteudo
  trust_level               text,
  tem_cena                  boolean not null default false,
  ordem                     int,
  created_at                timestamptz not null default now()
);
create index if not exists exercises_grupo_idx on public.exercises (grupo_muscular);

-- Camada vetorial de análise (força + ângulo) por exercício.
create table if not exists public.analysis_overlays (
  slug   text primary key references public.exercises(slug) on delete cascade,
  angle  jsonb,   -- { x, y, value }
  force  jsonb    -- { x1, y1, x2, y2 }
);

create table if not exists public.cases (
  id             text primary key,
  slug           text unique not null,
  titulo         text not null,
  tema           text,
  dificuldade    text,
  premium        boolean not null default false,
  contexto       text,
  pergunta       text,
  opcoes         jsonb not null default '[]',   -- CaseOption[]
  melhor_opcao_id text,
  trust_level    text,
  created_at     timestamptz not null default now()
);

create table if not exists public.tracks (
  id          text primary key,
  slug        text unique not null,
  nome        text not null,
  descricao   text,
  nivel       text,
  lessons     jsonb not null default '[]',   -- Lesson[]
  created_at  timestamptz not null default now()
);

create table if not exists public.library_entries (
  id             text primary key,
  termo          text not null,
  categoria      text,
  resumo         text,
  detalhe        text,
  ver_exercicio  text,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Dados por usuário (favoritos / progresso / uso do GPS).
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id       uuid not null references auth.users on delete cascade,
  exercise_slug text not null,
  created_at    timestamptz not null default now(),
  primary key (user_id, exercise_slug)
);

create table if not exists public.user_progress (
  user_id           uuid primary key references auth.users on delete cascade,
  xp                int  not null default 0,
  streak            int  not null default 0,
  casos_resolvidos  jsonb not null default '[]',   -- string[] (ids)
  updated_at        timestamptz not null default now()
);

create table if not exists public.activities (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  label      text not null,
  created_at timestamptz not null default now()
);
create index if not exists activities_user_idx on public.activities (user_id, created_at desc);

-- Log de consultas do GPS (para gating do plano free).
create table if not exists public.gps_consultations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  payload    jsonb,   -- respostas do wizard (opcional)
  created_at timestamptz not null default now()
);
create index if not exists gps_user_idx on public.gps_consultations (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.exercises         enable row level security;
alter table public.analysis_overlays enable row level security;
alter table public.cases             enable row level security;
alter table public.tracks            enable row level security;
alter table public.library_entries   enable row level security;
alter table public.favorites         enable row level security;
alter table public.user_progress     enable row level security;
alter table public.activities        enable row level security;
alter table public.gps_consultations enable row level security;

-- Conteúdo: leitura pública (anon + authenticated).
create policy "content read: exercises"  on public.exercises         for select using (true);
create policy "content read: overlays"   on public.analysis_overlays for select using (true);
create policy "content read: cases"      on public.cases             for select using (true);
create policy "content read: tracks"     on public.tracks            for select using (true);
create policy "content read: library"    on public.library_entries   for select using (true);

-- Perfil: cada um lê/edita o próprio.
create policy "own profile: select" on public.profiles for select using (auth.uid() = id);
create policy "own profile: update" on public.profiles for update using (auth.uid() = id);

-- Favoritos / progresso / atividades / gps: dono total (CRUD do próprio).
create policy "own favorites"   on public.favorites         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress"    on public.user_progress     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own activities"  on public.activities        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own gps"         on public.gps_consultations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Nota: escrita nas tabelas de conteúdo é feita via service_role (seed/admin),
-- que ignora RLS. Um painel admin autenticado precisaria de policies próprias.
