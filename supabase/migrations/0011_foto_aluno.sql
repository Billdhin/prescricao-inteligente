-- ===========================================================================
-- 0011 · A FOTO DO ALUNO, QUE O PRÓPRIO ALUNO OU O PROFISSIONAL PODE ENVIAR
--
-- Pedido do Dilton (10/09/2026): não havia como pôr a foto do aluno, nem pelo aluno no app
-- nem pelo profissional na ficha. A carteira inteira se reconhecia por iniciais.
--
-- POR QUE UMA TABELA PRÓPRIA, e não o blob `jornada` da tabela `alunos` (onde telefone e
-- cobrança moram sem migração): a ficha é gravada INTEIRA a cada edição do profissional
-- (upsert da linha toda). Se a foto morasse nela, o aluno enviaria a foto pelo app e a
-- próxima edição qualquer do profissional, feita com a cópia que ele carregou antes,
-- apagaria a foto sem ninguém perceber. E o aluno não tem permissão de escrita em `alunos`,
-- de propósito: a ficha clínica é do profissional. Aqui cada um escreve uma coisa só.
--
-- O conteúdo é um data URL JPEG de 160 x 160 (a mesma função que reduz a foto do profissional em
-- `profiles.foto_url`), na casa dos 10 KB. O `check` de tamanho é a trava contra alguém
-- mandar uma foto crua de 8 MP pela API.
--
-- ADITIVO e idempotente, no padrão da 0005, da 0007 e da 0010.
-- ===========================================================================

create table if not exists public.fotos_aluno (
  aluno_id        text not null,
  professional_id uuid not null references auth.users on delete cascade,
  foto            text not null check (length(foto) < 200000),
  enviada_por     text not null check (enviada_por in ('aluno', 'profissional')),
  atualizada_em   timestamptz not null default now(),
  primary key (professional_id, aluno_id)
);
alter table public.fotos_aluno enable row level security;

-- o aluno vinculado (auth_user_id) grava, troca, lê e remove a PRÓPRIA foto; amarrado ao
-- profissional dono para não cruzar ids de aluno iguais entre profissionais.
drop policy if exists fotos_aluno_rw on public.fotos_aluno;
create policy fotos_aluno_rw on public.fotos_aluno
  for all
  using (exists (select 1 from public.alunos a
                 where a.id = fotos_aluno.aluno_id and a.user_id = fotos_aluno.professional_id
                   and a.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.alunos a
                 where a.id = fotos_aluno.aluno_id and a.user_id = fotos_aluno.professional_id
                   and a.auth_user_id = auth.uid()));

-- o profissional dono grava, troca, lê e remove a foto dos alunos da carteira dele.
drop policy if exists fotos_aluno_prof_rw on public.fotos_aluno;
create policy fotos_aluno_prof_rw on public.fotos_aluno
  for all
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid());

comment on table public.fotos_aluno is
  'Foto de perfil do aluno (data URL 160x160). Enviada pelo próprio aluno no app ou pelo profissional na ficha; a mais recente vale.';
