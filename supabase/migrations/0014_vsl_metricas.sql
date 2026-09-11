-- 0014 · Métricas do VSL (player no modelo da VTurb)
--
-- UMA LINHA POR SESSÃO de quem abre a página do vídeo. Nada que identifique a pessoa: um
-- identificador aleatório criado no navegador, o tipo de aparelho, a origem da visita (o
-- utm_source do link ou só o domínio de quem indicou) e o que aconteceu com o vídeo. A
-- Política de Privacidade declara isso (seção 5) e o check:legal cobra a declaração.
--
-- Ninguém lê nem escreve a tabela direto (RLS ligada e sem política). Quem assiste grava
-- pela função vsl_registrar, que só aceita estes campos e só AUMENTA o que já foi visto (o
-- ponto máximo não volta, um "clicou" não vira "não clicou"). Quem lê é o painel, pela
-- função vsl_painel, e só para e-mails cadastrados em vsl_admins.

create table if not exists public.vsl_sessoes (
  sessao        uuid primary key,
  visitante     uuid not null,
  video         text not null check (char_length(video) between 1 and 80),
  variante      text not null default 'base' check (char_length(variante) <= 60),
  pagina        text check (char_length(pagina) <= 80),
  aparelho      text check (aparelho in ('celular', 'tablet', 'computador')),
  origem        text check (char_length(origem) <= 60),
  campanha      text check (char_length(campanha) <= 80),
  autoplay_ok   boolean not null default false,
  clicou_som    boolean not null default false,
  retomou       boolean not null default false,
  segundo_max   integer not null default 0 check (segundo_max between 0 and 36000),
  viu_pitch     boolean not null default false,
  clicou_cta    boolean not null default false,
  terminou      boolean not null default false,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists vsl_sessoes_video_criado on public.vsl_sessoes (video, criado_em desc);
alter table public.vsl_sessoes enable row level security;

create table if not exists public.vsl_admins (
  email text primary key check (email = lower(email))
);
alter table public.vsl_admins enable row level security;

-- ---------------------------------------------------------------- gravação

create or replace function public.vsl_registrar(p jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sessao uuid;
  v_visitante uuid;
begin
  begin
    v_sessao := (p->>'sessao')::uuid;
    v_visitante := (p->>'visitante')::uuid;
  exception when others then
    return; -- identificador inválido: ignora em silêncio, quem assiste não pode ver erro
  end;
  if v_sessao is null or v_visitante is null or coalesce(p->>'video', '') = '' then
    return;
  end if;

  insert into public.vsl_sessoes as s (
    sessao, visitante, video, variante, pagina, aparelho, origem, campanha,
    autoplay_ok, clicou_som, retomou, segundo_max, viu_pitch, clicou_cta, terminou
  ) values (
    v_sessao,
    v_visitante,
    left(p->>'video', 80),
    coalesce(nullif(left(p->>'variante', 60), ''), 'base'),
    left(p->>'pagina', 80),
    case when p->>'aparelho' in ('celular', 'tablet', 'computador') then p->>'aparelho' end,
    left(p->>'origem', 60),
    left(p->>'campanha', 80),
    coalesce((p->>'autoplay_ok')::boolean, false),
    coalesce((p->>'clicou_som')::boolean, false),
    coalesce((p->>'retomou')::boolean, false),
    least(greatest(coalesce((p->>'segundo_max')::int, 0), 0), 36000),
    coalesce((p->>'viu_pitch')::boolean, false),
    coalesce((p->>'clicou_cta')::boolean, false),
    coalesce((p->>'terminou')::boolean, false)
  )
  on conflict (sessao) do update set
    autoplay_ok   = s.autoplay_ok or excluded.autoplay_ok,
    clicou_som    = s.clicou_som or excluded.clicou_som,
    retomou       = s.retomou or excluded.retomou,
    segundo_max   = greatest(s.segundo_max, excluded.segundo_max),
    viu_pitch     = s.viu_pitch or excluded.viu_pitch,
    clicou_cta    = s.clicou_cta or excluded.clicou_cta,
    terminou      = s.terminou or excluded.terminou,
    atualizado_em = now()
  -- sessão de mais de 12 h não é reescrita (e um identificador alheio não mexe em nada)
  where s.criado_em > now() - interval '12 hours' and s.visitante = excluded.visitante;
end;
$$;

revoke all on function public.vsl_registrar(jsonb) from public;
grant execute on function public.vsl_registrar(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------- leitura (painel)

create or replace function public.vsl_painel(p_video text, p_duracao integer, p_dias integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_desde timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_dias, 30), 365)));
  v_dur integer := greatest(1, coalesce(p_duracao, 1));
  r jsonb;
begin
  if not exists (select 1 from public.vsl_admins where email = lower(auth.jwt()->>'email')) then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;

  with base as (
    select * from public.vsl_sessoes where video = p_video and criado_em >= v_desde
  ),
  plays as (select * from base where clicou_som),
  grupos as (
    select 'variante' as dim, variante as chave, count(*) as sessoes,
           count(*) filter (where clicou_som) as plays,
           count(*) filter (where viu_pitch) as pitch,
           count(*) filter (where clicou_cta) as cta
      from base group by variante
    union all
    select 'aparelho', coalesce(aparelho, 'desconhecido'), count(*),
           count(*) filter (where clicou_som), count(*) filter (where viu_pitch), count(*) filter (where clicou_cta)
      from base group by aparelho
    union all
    select 'origem', coalesce(origem, 'direto'), count(*),
           count(*) filter (where clicou_som), count(*) filter (where viu_pitch), count(*) filter (where clicou_cta)
      from base group by origem
  )
  select jsonb_build_object(
    'sessoes', (select count(*) from base),
    'visitantes', (select count(distinct visitante) from base),
    'autoplay', (select count(*) from base where autoplay_ok),
    'plays', (select count(*) from plays),
    'retomadas', (select count(*) from plays where retomou),
    'pitch', (select count(*) from base where viu_pitch),
    'cta', (select count(*) from base where clicou_cta),
    'terminaram', (select count(*) from base where terminou),
    'ao_vivo', (select count(*) from plays where atualizado_em > now() - interval '2 minutes' and not terminou),
    -- retenção em 101 pontos (0% a 100% do vídeo): quantos dos que deram play chegaram lá
    'retencao', (
      select coalesce(jsonb_agg(n order by pct), '[]'::jsonb) from (
        select g.pct, (select count(*) from plays where segundo_max >= floor(v_dur * g.pct / 100.0)) as n
          from generate_series(0, 100) as g(pct)
      ) x
    ),
    'por_dia', (
      select coalesce(jsonb_agg(jsonb_build_object('dia', dia, 'sessoes', s, 'plays', pl, 'cta', c) order by dia), '[]'::jsonb) from (
        select date_trunc('day', criado_em at time zone 'America/Sao_Paulo')::date as dia,
               count(*) as s, count(*) filter (where clicou_som) as pl, count(*) filter (where clicou_cta) as c
          from base group by 1
      ) d
    ),
    'grupos', (
      select coalesce(jsonb_agg(jsonb_build_object('dim', dim, 'chave', chave, 'sessoes', sessoes, 'plays', plays, 'pitch', pitch, 'cta', cta)
                                order by dim, sessoes desc), '[]'::jsonb) from grupos
    )
  ) into r;
  return r;
end;
$$;

revoke all on function public.vsl_painel(text, integer, integer) from public;
grant execute on function public.vsl_painel(text, integer, integer) to authenticated;

-- Quem vê o painel: cadastre o e-mail de login (em minúsculas), por exemplo:
--   insert into public.vsl_admins (email) values ('seu-email@exemplo.com');
