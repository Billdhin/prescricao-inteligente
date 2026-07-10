-- ============================================================================
-- Prescrição Inteligente — schema dos domínios atuais (Atender + Aprender)
-- Complementa 0001_init.sql com: perfil completo, alunos/avaliações/prescrições/
-- liberações (dados do profissional) e progresso do módulo Aprender.
-- Aplicar via SQL Editor do painel Supabase (ou `supabase db push`).
-- Tudo com Row Level Security: cada usuário só enxerga os próprios dados.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Perfil completo (marca nos documentos + modo). Complementa public.profiles.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists cref        text default '';
alter table public.profiles add column if not exists email       text default '';
alter table public.profiles add column if not exists telefone    text default '';
alter table public.profiles add column if not exists empresa     text default '';
alter table public.profiles add column if not exists site        text default '';
alter table public.profiles add column if not exists foto_url    text default '';
alter table public.profiles add column if not exists logo_url    text default '';
alter table public.profiles add column if not exists mode        text not null default 'atender' check (mode in ('atender','aprender'));

-- ---------------------------------------------------------------------------
-- Alunos do profissional (owner = user_id).
-- Campos aninhados/variáveis ficam em JSONB para fidelidade 1:1 com o front.
-- ---------------------------------------------------------------------------
create table if not exists public.alunos (
  id                    text not null,
  user_id               uuid not null references auth.users on delete cascade,
  nome                  text not null,
  iniciais              text,
  idade                 int,
  sexo                  text,
  objetivo              text,
  nivel                 text,
  nivel_desde           timestamptz,
  restricoes            jsonb not null default '[]',
  equipamentos          jsonb not null default '[]',
  observacoes           text,
  status                text not null default 'ativo' check (status in ('ativo','inativo')),
  criado_em             timestamptz not null default now(),
  ultima_avaliacao_em   timestamptz,
  proxima_reavaliacao_em timestamptz,
  grupo_especial        text,
  fase_jornada          int,
  jornada               jsonb,   -- modalidades/parametros/criterio da jornada
  updated_at            timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists alunos_user_idx on public.alunos (user_id);

create table if not exists public.avaliacoes (
  id            text not null,
  user_id       uuid not null references auth.users on delete cascade,
  aluno_id      text not null,
  data          timestamptz not null,
  medidas       jsonb not null default '{}',
  dor_escala    int,
  observacoes   text,
  tipo          text,
  condicao      text,
  regioes_dor   jsonb,
  perimetros    jsonb,
  testes        jsonb,
  fotos         jsonb,           -- dataURLs (considere Supabase Storage no futuro)
  personalizadas jsonb,
  created_at    timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists avaliacoes_aluno_idx on public.avaliacoes (user_id, aluno_id, data desc);

create table if not exists public.prescricoes (
  id            text not null,
  user_id       uuid not null references auth.users on delete cascade,
  aluno_id      text not null,
  data          timestamptz not null,
  titulo        text,
  answers       jsonb not null default '{}',
  itens         jsonb not null default '[]',
  observacoes   text,
  status        text not null default 'ativa' check (status in ('ativa','arquivada')),
  jornada       jsonb,        -- grupo/modalidades/parametros/criterios/raciocinio
  prontuario    jsonb,        -- ProntuarioSnapshot (rastro do Motor RCD)
  created_at    timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists prescricoes_aluno_idx on public.prescricoes (user_id, aluno_id, data desc);

create table if not exists public.liberacoes (
  id            text not null,
  user_id       uuid not null references auth.users on delete cascade,
  aluno_id      text,
  grupo_slug    text not null,
  data          timestamptz not null,
  respostas     jsonb not null default '{}',
  resultado     text not null check (resultado in ('verde','amarelo','vermelho')),
  ajustes       jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists liberacoes_user_idx on public.liberacoes (user_id, data desc);

-- ---------------------------------------------------------------------------
-- Aprender: progresso, salvos, histórico, respostas e aplicações (owner = user).
-- O CONTEÚDO (disciplinas/módulos/aulas/casos/referências) é curado no app; aqui
-- ficam apenas os dados do usuário. Uma futura tabela de conteúdo editorial pode
-- ser adicionada quando o painel editorial existir.
-- ---------------------------------------------------------------------------
create table if not exists public.learning_lesson_progress (
  user_id     uuid not null references auth.users on delete cascade,
  lesson_id   text not null,
  status      text not null default 'nao-iniciado',
  progress    int  not null default 0,
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.learning_case_progress (
  user_id     uuid not null references auth.users on delete cascade,
  case_id     text not null,
  status      text not null default 'em-andamento',
  choices     jsonb not null default '{}',
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, case_id)
);

create table if not exists public.learning_quiz_answers (
  user_id     uuid not null references auth.users on delete cascade,
  question_id text not null,
  answer      text,
  correct     boolean,
  updated_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.learning_bookmarks (
  id          text not null,   -- `${type}:${targetId}`
  user_id     uuid not null references auth.users on delete cascade,
  type        text not null,
  target_id   text not null,
  title       text,
  href        text,
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.learning_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  type        text not null,
  title       text,
  href        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists learning_history_idx on public.learning_history (user_id, created_at desc);

create table if not exists public.learning_applications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users on delete cascade,
  lesson_id      text,
  lesson_title   text,
  student_id     text,
  student_name   text,
  prescription_id text,
  justification  text,
  created_at     timestamptz not null default now()
);
create index if not exists learning_apps_idx on public.learning_applications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: dono total em todas as tabelas por usuário.
-- ---------------------------------------------------------------------------
alter table public.alunos                   enable row level security;
alter table public.avaliacoes               enable row level security;
alter table public.prescricoes              enable row level security;
alter table public.liberacoes               enable row level security;
alter table public.learning_lesson_progress enable row level security;
alter table public.learning_case_progress   enable row level security;
alter table public.learning_quiz_answers    enable row level security;
alter table public.learning_bookmarks       enable row level security;
alter table public.learning_history         enable row level security;
alter table public.learning_applications    enable row level security;

create policy "own alunos"       on public.alunos                   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own avaliacoes"   on public.avaliacoes               for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own prescricoes"  on public.prescricoes              for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own liberacoes"   on public.liberacoes               for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own lprogress"    on public.learning_lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cprogress"    on public.learning_case_progress   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own quiz"         on public.learning_quiz_answers    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own bookmarks"    on public.learning_bookmarks       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own history"      on public.learning_history         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own applications" on public.learning_applications    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Perfil: garantir policy de insert (o trigger de 0001 já cria; insert manual é útil).
drop policy if exists "own profile: insert" on public.profiles;
create policy "own profile: insert" on public.profiles for insert with check (auth.uid() = id);
