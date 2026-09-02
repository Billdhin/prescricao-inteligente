-- ===========================================================================
-- 0010 · O QUE O ALUNO INFORMA SOBRE SI MESMO, ANTES DE O PROFISSIONAL CONFIRMAR
--
-- Pedido de campo (colega do Filipe, personal): o aluno preencher os próprios dados em
-- vez de o professor digitar tudo. A regra que já existe no produto vale aqui: o
-- classificador sugere, o profissional confirma. O aluno DECLARA fatos sobre a própria
-- vida (idade, objetivo, remédios pelo nome, dores, equipamento em casa); a tradução
-- disso em nível, condição clínica, restrição estruturada ou classe de fármaco é do CREF.
--
-- Por isso a declaração não escreve na ficha (`alunos`): ela é uma linha própria, com
-- status, que o profissional confirma, ajusta ou dispensa. Uma linha por campo por aluno
-- (o id é aluno + campo), e a resposta mais nova substitui a anterior voltando a
-- "pendente". "Não sei" é resposta, distinta de campo vazio, porque silêncio não é resposta.
--
-- ADITIVO e idempotente, no padrão da 0005 e da 0007.
-- ===========================================================================

create table if not exists public.declaracoes_aluno (
  id              text primary key,
  aluno_id        text not null,
  professional_id uuid not null references auth.users on delete cascade,
  campo           text not null,
  valor           text,
  nao_sei         boolean not null default false,
  status          text not null default 'pendente',
  declarada_em    timestamptz not null default now(),
  revisada_em     timestamptz
);
create index if not exists declaracoes_aluno_idx
  on public.declaracoes_aluno (professional_id, aluno_id, status);
alter table public.declaracoes_aluno enable row level security;

-- o aluno vinculado (auth_user_id) grava e lê as próprias declarações; amarrado ao
-- profissional dono para não cruzar ids de aluno iguais entre profissionais.
drop policy if exists declaracoes_aluno_rw on public.declaracoes_aluno;
create policy declaracoes_aluno_rw on public.declaracoes_aluno
  for all
  using (exists (select 1 from public.alunos a
                 where a.id = declaracoes_aluno.aluno_id and a.user_id = declaracoes_aluno.professional_id
                   and a.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.alunos a
                 where a.id = declaracoes_aluno.aluno_id and a.user_id = declaracoes_aluno.professional_id
                   and a.auth_user_id = auth.uid()));

-- o profissional dono lê e REVISA (status, revisada_em) as declarações da carteira dele.
drop policy if exists declaracoes_prof_rw on public.declaracoes_aluno;
create policy declaracoes_prof_rw on public.declaracoes_aluno
  for all
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid());

comment on table public.declaracoes_aluno is
  'O que o aluno informou sobre si no app, aguardando (ou depois de) revisão do profissional. Nunca entra na ficha sem confirmação.';
