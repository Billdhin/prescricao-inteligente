-- ===========================================================================
-- Feedback da sessao: como o aluno sentiu o TREINO inteiro (PSE da sessao,
-- duracao medida pelo modo guiado e recado para o professor).
-- ADITIVO e idempotente, no mesmo padrao da 0005: so cria a tabela nova, o indice
-- e as policies (com "if not exists" / "drop policy if exists" + "create policy").
-- Nao altera nem remove nada do que ja existe.
-- ===========================================================================

create table if not exists public.sessao_feedbacks (
  id              text primary key,
  aluno_id        text not null,
  professional_id uuid not null references auth.users on delete cascade,
  plano_id        text,
  semana          int,
  sessao_ref      text,
  pse             int,
  duracao_min     int,
  observacao      text,
  concluida_em    timestamptz not null default now()
);
create index if not exists sessao_feedbacks_aluno_idx
  on public.sessao_feedbacks (professional_id, aluno_id, concluida_em desc);
alter table public.sessao_feedbacks enable row level security;

-- o aluno vinculado (auth_user_id) insere/le os proprios feedbacks; amarrado ao
-- profissional dono para nao cruzar ids de aluno iguais entre profissionais.
drop policy if exists sessao_feedbacks_aluno_rw on public.sessao_feedbacks;
create policy sessao_feedbacks_aluno_rw on public.sessao_feedbacks
  for all
  using (exists (select 1 from public.alunos a
                 where a.id = sessao_feedbacks.aluno_id and a.user_id = sessao_feedbacks.professional_id
                   and a.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.alunos a
                 where a.id = sessao_feedbacks.aluno_id and a.user_id = sessao_feedbacks.professional_id
                   and a.auth_user_id = auth.uid()));

-- o profissional dono le os feedbacks dos seus alunos
drop policy if exists sessao_feedbacks_prof_read on public.sessao_feedbacks;
create policy sessao_feedbacks_prof_read on public.sessao_feedbacks
  for select using (professional_id = auth.uid());
