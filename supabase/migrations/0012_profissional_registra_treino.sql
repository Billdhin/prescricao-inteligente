-- ===========================================================================
-- 0012 · O PROFISSIONAL TAMBÉM GRAVA O TREINO REGISTRADO DO SEU ALUNO
--
-- Até aqui `execucoes` e `sessao_feedbacks` só aceitavam gravação da conta do ALUNO
-- (policies *_aluno_rw da 0005 e da 0007); o profissional só lia. Isso deixava de fora
-- dois casos reais:
--
--  1. Aluno sem conta no app (os alunos de exemplo, e quem treina presencialmente sem
--     usar o celular): o histórico de treino não tinha como chegar à nuvem, e o que o
--     profissional via no próprio aparelho sumia no próximo login, porque a hidratação
--     troca as execuções locais pelas da nuvem.
--  2. Remover um aluno: a cascata de `removerAluno` apaga `execucoes` pelo profissional
--     dono, e sem policy de DELETE essa linha não apagava nada.
--
-- A regra nova vale só para aluno DA PRÓPRIA carteira: a linha tem de levar o próprio
-- profissional como dono E o aluno tem de ser dele (`alunos.user_id = auth.uid()`). Nada
-- muda para o aluno, e nenhum profissional alcança aluno de outro.
--
-- ADITIVO e idempotente, no padrão da 0005 e da 0007: as policies somam (OR) com as
-- existentes, e nada é removido.
-- ===========================================================================

-- Execuções -----------------------------------------------------------------
drop policy if exists execucoes_prof_insert on public.execucoes;
create policy execucoes_prof_insert on public.execucoes
  for insert
  with check (
    professional_id = auth.uid()
    and exists (select 1 from public.alunos a where a.id = execucoes.aluno_id and a.user_id = auth.uid())
  );

drop policy if exists execucoes_prof_update on public.execucoes;
create policy execucoes_prof_update on public.execucoes
  for update
  using (professional_id = auth.uid())
  with check (
    professional_id = auth.uid()
    and exists (select 1 from public.alunos a where a.id = execucoes.aluno_id and a.user_id = auth.uid())
  );

drop policy if exists execucoes_prof_delete on public.execucoes;
create policy execucoes_prof_delete on public.execucoes
  for delete
  using (professional_id = auth.uid());

-- Feedback da sessão (PSE, duração, recado) ----------------------------------
drop policy if exists sessao_feedbacks_prof_insert on public.sessao_feedbacks;
create policy sessao_feedbacks_prof_insert on public.sessao_feedbacks
  for insert
  with check (
    professional_id = auth.uid()
    and exists (select 1 from public.alunos a where a.id = sessao_feedbacks.aluno_id and a.user_id = auth.uid())
  );

drop policy if exists sessao_feedbacks_prof_update on public.sessao_feedbacks;
create policy sessao_feedbacks_prof_update on public.sessao_feedbacks
  for update
  using (professional_id = auth.uid())
  with check (
    professional_id = auth.uid()
    and exists (select 1 from public.alunos a where a.id = sessao_feedbacks.aluno_id and a.user_id = auth.uid())
  );

drop policy if exists sessao_feedbacks_prof_delete on public.sessao_feedbacks;
create policy sessao_feedbacks_prof_delete on public.sessao_feedbacks
  for delete
  using (professional_id = auth.uid());
