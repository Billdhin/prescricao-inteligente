-- 0008 · A CONDUTA DO PROFISSIONAL QUANDO ELA DIVERGE DO SEMÁFORO
--
-- O semáforo é apoio à decisão, e a decisão é de quem assina, por lei. Até aqui o produto
-- fazia as duas metades ao mesmo tempo: pausava o app do aluno num resultado vermelho, mas
-- deixava o profissional prescrever, e não guardava o motivo em lugar nenhum.
--
-- O efeito prático era um prontuário que mentia por omissão: ele mostrava "não liberado" e
-- um treino feito no mesmo dia, sem nada explicando a distância entre os dois. Num documento
-- que existe justamente para provar COMO se decidiu, essa lacuna é a pior que há.
--
-- A coluna guarda { justificativa, em }. Ausente significa que o profissional seguiu o que
-- o semáforo indicou, que é o caso comum e não precisa de registro extra.

alter table public.liberacoes
  add column if not exists decisao_contraria jsonb;

comment on column public.liberacoes.decisao_contraria is
  'Conduta do profissional quando diverge do semáforo: { justificativa: text, em: epoch_ms }. Nulo = seguiu a indicação.';
