-- ===========================================================================
-- Portal do aluno: papel, vinculo, convite, execucoes e RLS de leitura do aluno.
-- ADITIVO: nao altera nem remove nenhuma policy existente do profissional; so
-- adiciona colunas, tabelas e policies novas. Aplicavel com "add ... if not exists"
-- e "drop policy if exists" + "create policy" (idempotente).
-- ===========================================================================

-- 1) Papel e vinculo -------------------------------------------------------
-- role: 'profissional' (padrao) ou 'aluno'. professional_id: para o aluno, qual
-- profissional ele pertence (usado para carregar a MARCA no portal).
alter table public.profiles add column if not exists role            text not null default 'profissional';
alter table public.profiles add column if not exists professional_id uuid references auth.users on delete set null;
-- auth_user_id: a conta do aluno que reivindicou este registro de aluno.
alter table public.alunos   add column if not exists auth_user_id    uuid references auth.users on delete set null;

-- 2) Convites --------------------------------------------------------------
create table if not exists public.convites (
  token           text primary key,
  aluno_id        text not null,
  professional_id uuid not null references auth.users on delete cascade,
  criado_em       timestamptz not null default now(),
  expira_em       timestamptz not null default (now() + interval '30 days'),
  usado_em        timestamptz
);
alter table public.convites enable row level security;
drop policy if exists convites_own on public.convites;
create policy convites_own on public.convites
  for all using (professional_id = auth.uid()) with check (professional_id = auth.uid());

-- 3) Execucoes -------------------------------------------------------------
create table if not exists public.execucoes (
  id             text primary key,
  aluno_id       text not null,
  professional_id uuid not null references auth.users on delete cascade,
  plano_id       text,
  semana         int,
  sessao_ref     text,
  bloco_ref      text,
  exercicio_slug text,
  carga_feita    numeric,
  reps_feitas    int,
  rpe            int,
  concluido_em   timestamptz not null default now()
);
create index if not exists execucoes_aluno_idx on public.execucoes (professional_id, aluno_id, concluido_em desc);
alter table public.execucoes enable row level security;
-- o aluno vinculado (auth_user_id) insere/le as proprias; amarrado ao profissional
-- dono para nao cruzar ids de aluno iguais entre profissionais diferentes.
drop policy if exists execucoes_aluno_rw on public.execucoes;
create policy execucoes_aluno_rw on public.execucoes
  for all
  using (exists (select 1 from public.alunos a
                 where a.id = execucoes.aluno_id and a.user_id = execucoes.professional_id
                   and a.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.alunos a
                 where a.id = execucoes.aluno_id and a.user_id = execucoes.professional_id
                   and a.auth_user_id = auth.uid()));
-- o profissional dono le as execucoes dos seus alunos
drop policy if exists execucoes_prof_read on public.execucoes;
create policy execucoes_prof_read on public.execucoes
  for select using (professional_id = auth.uid());

-- 4) Leitura do aluno: alunos, planos e a MARCA do profissional ------------
-- Estas policies SOMAM (OR) com as "own ..." do profissional; nada e removido.
drop policy if exists alunos_aluno_read on public.alunos;
create policy alunos_aluno_read on public.alunos
  for select using (auth_user_id = auth.uid());

drop policy if exists planos_aluno_read on public.planos;
create policy planos_aluno_read on public.planos
  for select using (exists (select 1 from public.alunos a
                            where a.id = planos.aluno_id and a.user_id = planos.user_id
                              and a.auth_user_id = auth.uid()));

drop policy if exists avaliacoes_aluno_read on public.avaliacoes;
create policy avaliacoes_aluno_read on public.avaliacoes
  for select using (exists (select 1 from public.alunos a
                            where a.id = avaliacoes.aluno_id and a.user_id = avaliacoes.user_id
                              and a.auth_user_id = auth.uid()));

-- o aluno le o profile do profissional dele (para logo/nome/cor da marca)
drop policy if exists profiles_aluno_read_prof on public.profiles;
create policy profiles_aluno_read_prof on public.profiles
  for select using (exists (select 1 from public.profiles me
                            where me.id = auth.uid() and me.professional_id = profiles.id));

-- 5) RPC de reivindicacao do convite (security definer) --------------------
-- O aluno recem-cadastrado chama claim_convite(token): vincula a conta ao
-- registro de aluno, marca o profile como 'aluno' e consome o convite. Roda como
-- owner (bypassa RLS) mas so age sobre o convite valido do proprio token.
create or replace function public.claim_convite(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_conv public.convites%rowtype;
begin
  select * into v_conv from public.convites
   where token = p_token and usado_em is null and expira_em > now();
  if not found then
    raise exception 'Convite invalido ou expirado';
  end if;
  update public.alunos
     set auth_user_id = auth.uid()
   where id = v_conv.aluno_id and user_id = v_conv.professional_id;
  update public.profiles
     set role = 'aluno', professional_id = v_conv.professional_id
   where id = auth.uid();
  update public.convites set usado_em = now() where token = p_token;
end $$;

grant execute on function public.claim_convite(text) to authenticated;
