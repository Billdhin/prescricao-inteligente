-- 0009 — a mesma conta pode atender alunos E ser aluna de alguém.
--
-- POR QUE ESTA MIGRAÇÃO EXISTE
--
-- O modelo de dados já suportava os dois vínculos desde a 0005: `alunos.user_id` é quem
-- ATENDE e `alunos.auth_user_id` é quem é ATENDIDO, colunas separadas, com uma policy para
-- cada leitura. O que forçava a escolha excludente era só `profiles.role`, tratado como
-- identidade da pessoa em vez de "qual espaço estou usando agora".
--
-- No app isso já foi corrigido (ver alternarEspaco em src/lib/backend/cloudAuth.ts): trocar
-- de espaço grava só `role` e preserva `professional_id` e `alunos.auth_user_id`, então
-- nenhum vínculo se perde e a volta existe sempre.
--
-- Ficou faltando o caminho inverso, que mora aqui: `claim_convite` RECUSA o convite quando a
-- conta já atende alunos ("Esta conta ja atua como profissional. Use uma conta nova para o
-- acesso do aluno."). Com a troca de espaço no ar, essa recusa virou incoerência: dá para ir
-- de aluno para profissional, mas não de profissional para aluno.
--
-- O QUE A REGRA ORIGINAL PROTEGIA, E COMO ISSO SE MANTÉM
--
-- A regra N6 existia para um risco real: um profissional não pode ter o próprio perfil
-- sequestrado para 'aluno' por causa de um convite. A proteção certa nunca foi RECUSAR o
-- vínculo, e sim NÃO TROCAR O ESPAÇO de quem já trabalha. É o que esta versão faz:
--
--   conta sem carteira  -> vincula a ficha E entra no espaço do aluno (como sempre foi)
--   conta com carteira  -> vincula a ficha e CONTINUA no espaço profissional
--
-- Nos dois casos o vínculo é criado e o convite é consumido; o que muda é só onde a pessoa
-- é deixada. Quem já atendia continua na própria carteira e alterna quando quiser, pelo
-- botão que já existe na tela de Conta.
--
-- Vale lembrar que `claim_convite` não roda ao ABRIR o link: ele é chamado depois de um
-- login ou cadastro deliberado dentro do portão do aluno (ver AlunoPortal). Ou seja, ninguém
-- ganha vínculo por clicar sem querer.

create or replace function public.claim_convite(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv public.convites%rowtype;
  v_ja_atende boolean;
begin
  select * into v_conv from public.convites
   where token = p_token and usado_em is null and expira_em > now();
  if not found then
    raise exception 'Convite invalido ou expirado';
  end if;

  -- A conta já tem carteira própria? Isso decide se o espaço em uso muda ou não.
  select exists (select 1 from public.alunos where user_id = auth.uid()) into v_ja_atende;

  update public.alunos
     set auth_user_id = auth.uid()
   where id = v_conv.aluno_id and user_id = v_conv.professional_id;

  if v_ja_atende then
    -- Quem já atende mantém o espaço profissional: o vínculo passa a existir, mas ninguém
    -- é jogado para fora da própria carteira sem pedir. `professional_id` é o que faz o
    -- botão "Ver o meu treino" aparecer em Conta.
    update public.profiles
       set professional_id = v_conv.professional_id
     where id = auth.uid();
  else
    update public.profiles
       set role = 'aluno', professional_id = v_conv.professional_id
     where id = auth.uid();
  end if;

  update public.convites set usado_em = now() where token = p_token;
end $$;

grant execute on function public.claim_convite(text) to authenticated;
