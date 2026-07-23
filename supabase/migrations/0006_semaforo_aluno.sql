-- ===========================================================================
-- Semáforo diário no portal do aluno: leitura das próprias liberações.
--
-- O app do aluno (StudentApp) mostra um alerta de "treino em pausa" quando o
-- último semáforo do aluno foi "não liberado" e não houve um novo depois. Para
-- isso, a conta do aluno precisa LER as liberações do próprio registro.
--
-- Hoje a tabela `liberacoes` só tem a policy "own liberacoes" (user_id = auth.uid()),
-- que é do PROFISSIONAL. Esta migração adiciona uma policy de SELECT para o aluno
-- vinculado, no mesmo padrão de `avaliacoes_aluno_read`/`planos_aluno_read` da
-- migração 0005. ADITIVO: SOMA (OR) com a policy existente, não remove nada.
-- Idempotente: "drop policy if exists" + "create policy".
-- ===========================================================================

-- O aluno vinculado (alunos.auth_user_id = auth.uid()) lê as liberações do seu
-- próprio registro, amarradas ao profissional dono (user_id), para não cruzar ids
-- de aluno iguais entre profissionais diferentes.
drop policy if exists liberacoes_aluno_read on public.liberacoes;
create policy liberacoes_aluno_read on public.liberacoes
  for select using (exists (select 1 from public.alunos a
                            where a.id = liberacoes.aluno_id and a.user_id = liberacoes.user_id
                              and a.auth_user_id = auth.uid()));
