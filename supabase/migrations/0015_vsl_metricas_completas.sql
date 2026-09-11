-- 0015 · Métricas do VSL no nível da VTurb
--
-- A 0014 media o essencial (visitas, play, ponto máximo, pitch, clique). Esta completa com o
-- que o analytics da VTurb mostra e que um VSL precisa para ser otimizado:
--   * engajamento e tempo assistido de verdade (pausa e retomada não contam duas vezes);
--   * retenção certa para quem voltou pelo "continuar assistindo" (segundo_inicio);
--   * carregamento (até o primeiro quadro), travamentos no meio, pausas;
--   * sistema e navegador (só o nome; os internos do Instagram/Facebook/TikTok separados);
--   * todos os UTMs (origem, mídia, campanha, conteúdo = criativo, termo) e o fuso horário;
--   * segundo do clique no botão, tela cheia, mini player e velocidade;
--   * melhores horários e dias da semana, e exportação das sessões (só administrador).
--
-- Nada que identifique a pessoa entra aqui: continua sem nome, e-mail, IP, user-agent completo
-- ou endereço de quem indicou. A Política de Privacidade (seção 5) declara a lista.

alter table public.vsl_sessoes
  add column if not exists segundo_inicio  integer check (segundo_inicio between 0 and 36000),
  add column if not exists tempo_assistido integer not null default 0 check (tempo_assistido between 0 and 86400),
  add column if not exists pausas          integer not null default 0 check (pausas between 0 and 10000),
  add column if not exists travamentos     integer not null default 0 check (travamentos between 0 and 10000),
  add column if not exists carregamento_ms integer check (carregamento_ms between 0 and 600000),
  add column if not exists cta_em          integer check (cta_em between 0 and 36000),
  add column if not exists tela_cheia      boolean not null default false,
  add column if not exists mini_player     boolean not null default false,
  add column if not exists velocidade      numeric(3, 2) check (velocidade between 0.5 and 3),
  add column if not exists sistema         text check (char_length(sistema) <= 20),
  add column if not exists navegador       text check (char_length(navegador) <= 20),
  add column if not exists fuso            text check (char_length(fuso) <= 60),
  add column if not exists midia           text check (char_length(midia) <= 60),
  add column if not exists conteudo        text check (char_length(conteudo) <= 80),
  add column if not exists termo           text check (char_length(termo) <= 80);

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
  n jsonb := p;
  -- número inteiro dentro de uma faixa, ou nulo se vier qualquer outra coisa
  ini integer; car integer; cta integer; vel numeric;
begin
  begin
    v_sessao := (p->>'sessao')::uuid;
    v_visitante := (p->>'visitante')::uuid;
    -- ATENÇÃO: greatest/least IGNORAM nulo (greatest(null, 0) = 0). Estes campos precisam
    -- continuar nulos até terem valor: "começou no segundo 0" antes de a pessoa assistir
    -- estragaria a retenção de quem volta pelo "continuar assistindo".
    ini := case when jsonb_typeof(p->'segundo_inicio') = 'number' then least(greatest((p->>'segundo_inicio')::numeric, 0), 36000)::integer end;
    car := case when jsonb_typeof(p->'carregamento_ms') = 'number' then least(greatest((p->>'carregamento_ms')::numeric, 0), 600000)::integer end;
    cta := case when jsonb_typeof(p->'cta_em') = 'number' then least(greatest((p->>'cta_em')::numeric, 0), 36000)::integer end;
    vel := case when jsonb_typeof(p->'velocidade') = 'number' then least(greatest((p->>'velocidade')::numeric, 0.5), 3) end;
  exception when others then
    return; -- entrada inválida: ignora em silêncio, quem assiste não pode ver erro
  end;
  if v_sessao is null or v_visitante is null or coalesce(p->>'video', '') = '' then
    return;
  end if;

  insert into public.vsl_sessoes as s (
    sessao, visitante, video, variante, pagina, aparelho, origem, campanha,
    autoplay_ok, clicou_som, retomou, segundo_max, viu_pitch, clicou_cta, terminou,
    segundo_inicio, tempo_assistido, pausas, travamentos, carregamento_ms, cta_em,
    tela_cheia, mini_player, velocidade, sistema, navegador, fuso, midia, conteudo, termo
  ) values (
    v_sessao,
    v_visitante,
    left(n->>'video', 80),
    coalesce(nullif(left(n->>'variante', 60), ''), 'base'),
    left(n->>'pagina', 80),
    case when n->>'aparelho' in ('celular', 'tablet', 'computador') then n->>'aparelho' end,
    left(n->>'origem', 60),
    left(n->>'campanha', 80),
    coalesce((n->>'autoplay_ok')::boolean, false),
    coalesce((n->>'clicou_som')::boolean, false),
    coalesce((n->>'retomou')::boolean, false),
    least(greatest(coalesce((n->>'segundo_max')::numeric, 0), 0), 36000)::integer,
    coalesce((n->>'viu_pitch')::boolean, false),
    coalesce((n->>'clicou_cta')::boolean, false),
    coalesce((n->>'terminou')::boolean, false),
    ini,
    least(greatest(coalesce((n->>'tempo_assistido')::numeric, 0), 0), 86400)::integer,
    least(greatest(coalesce((n->>'pausas')::numeric, 0), 0), 10000)::integer,
    least(greatest(coalesce((n->>'travamentos')::numeric, 0), 0), 10000)::integer,
    car,
    cta,
    coalesce((n->>'tela_cheia')::boolean, false),
    coalesce((n->>'mini_player')::boolean, false),
    vel,
    left(n->>'sistema', 20),
    left(n->>'navegador', 20),
    left(n->>'fuso', 60),
    left(n->>'midia', 60),
    left(n->>'conteudo', 80),
    left(n->>'termo', 80)
  )
  on conflict (sessao) do update set
    autoplay_ok     = s.autoplay_ok or excluded.autoplay_ok,
    clicou_som      = s.clicou_som or excluded.clicou_som,
    retomou         = s.retomou or excluded.retomou,
    viu_pitch       = s.viu_pitch or excluded.viu_pitch,
    clicou_cta      = s.clicou_cta or excluded.clicou_cta,
    terminou        = s.terminou or excluded.terminou,
    tela_cheia      = s.tela_cheia or excluded.tela_cheia,
    mini_player     = s.mini_player or excluded.mini_player,
    segundo_max     = greatest(s.segundo_max, excluded.segundo_max),
    tempo_assistido = greatest(s.tempo_assistido, excluded.tempo_assistido),
    pausas          = greatest(s.pausas, excluded.pausas),
    travamentos     = greatest(s.travamentos, excluded.travamentos),
    segundo_inicio  = coalesce(s.segundo_inicio, excluded.segundo_inicio),
    carregamento_ms = coalesce(s.carregamento_ms, excluded.carregamento_ms),
    cta_em          = coalesce(s.cta_em, excluded.cta_em),
    atualizado_em   = now()
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
    select *, (criado_em at time zone 'America/Sao_Paulo') as local
      from public.vsl_sessoes where video = p_video and criado_em >= v_desde
  ),
  plays as (select * from base where clicou_som),
  grupos as (
    select d.dim, d.chave, count(*) as sessoes,
           count(*) filter (where b.clicou_som) as plays,
           count(*) filter (where b.viu_pitch) as pitch,
           count(*) filter (where b.clicou_cta) as cta,
           round(avg(least(b.segundo_max, v_dur) - coalesce(b.segundo_inicio, 0)) filter (where b.clicou_som) * 100.0 / v_dur, 1) as engajamento
      from base b
      cross join lateral (values
        ('variante', b.variante),
        ('aparelho', coalesce(b.aparelho, 'desconhecido')),
        ('sistema', coalesce(b.sistema, 'desconhecido')),
        ('navegador', coalesce(b.navegador, 'desconhecido')),
        ('origem', coalesce(b.origem, 'direto')),
        ('midia', coalesce(b.midia, '(sem utm_medium)')),
        ('campanha', coalesce(b.campanha, '(sem utm_campaign)')),
        ('conteudo', coalesce(b.conteudo, '(sem utm_content)')),
        ('fuso', coalesce(b.fuso, 'desconhecido'))
      ) as d(dim, chave)
     group by d.dim, d.chave
  )
  select jsonb_build_object(
    'sessoes', (select count(*) from base),
    'visitantes', (select count(distinct visitante) from base),
    'autoplay', (select count(*) from base where autoplay_ok),
    'plays', (select count(*) from plays),
    'plays_unicos', (select count(distinct visitante) from plays),
    'retomadas', (select count(*) from plays where retomou),
    'pitch', (select count(*) from base where viu_pitch),
    'cta', (select count(*) from base where clicou_cta),
    'terminaram', (select count(*) from base where terminou),
    'ao_vivo', (select count(*) from plays where atualizado_em > now() - interval '2 minutes' and not terminou),
    -- engajamento: a fração média do vídeo assistida por quem deu play, em %
    'engajamento', (select round(avg(least(segundo_max, v_dur) - coalesce(segundo_inicio, 0)) * 100.0 / v_dur, 1) from plays),
    'tempo_medio', (select round(avg(tempo_assistido)) from plays),
    'horas_assistidas', (select round(sum(tempo_assistido) / 3600.0, 1) from plays),
    'carregamento_mediana', (select percentile_cont(0.5) within group (order by carregamento_ms) from base where carregamento_ms is not null),
    'travamentos_por_play', (select round(avg(travamentos), 2) from plays),
    'pausas_por_play', (select round(avg(pausas), 2) from plays),
    'cta_mediana', (select percentile_cont(0.5) within group (order by cta_em) from base where cta_em is not null),
    'tela_cheia', (select count(*) from plays where tela_cheia),
    'mini_player', (select count(*) from plays where mini_player),
    -- retenção em 101 pontos (0% a 100%): dos que deram play, quantos estavam assistindo ali.
    -- Quem voltou pelo "continuar assistindo" conta a partir de onde retomou.
    'retencao', (
      select coalesce(jsonb_agg(n order by pct), '[]'::jsonb) from (
        select g.pct, (
          select count(*) from plays
           where coalesce(segundo_inicio, 0) <= floor(v_dur * g.pct / 100.0)
             and segundo_max >= floor(v_dur * g.pct / 100.0)
        ) as n
        from generate_series(0, 100) as g(pct)
      ) x
    ),
    'por_dia', (
      select coalesce(jsonb_agg(jsonb_build_object('dia', dia, 'sessoes', s, 'plays', pl, 'pitch', pi, 'cta', c) order by dia), '[]'::jsonb) from (
        select local::date as dia, count(*) as s, count(*) filter (where clicou_som) as pl,
               count(*) filter (where viu_pitch) as pi, count(*) filter (where clicou_cta) as c
          from base group by 1
      ) d
    ),
    -- "melhores horários" da VTurb: hora local de Brasília e dia da semana (0 = domingo)
    'por_hora', (
      select coalesce(jsonb_agg(jsonb_build_object('hora', h, 'sessoes', s, 'plays', pl, 'cta', c) order by h), '[]'::jsonb) from (
        select extract(hour from local)::int as h, count(*) as s,
               count(*) filter (where clicou_som) as pl, count(*) filter (where clicou_cta) as c
          from base group by 1
      ) d
    ),
    'por_semana', (
      select coalesce(jsonb_agg(jsonb_build_object('dia', w, 'sessoes', s, 'plays', pl, 'cta', c) order by w), '[]'::jsonb) from (
        select extract(dow from local)::int as w, count(*) as s,
               count(*) filter (where clicou_som) as pl, count(*) filter (where clicou_cta) as c
          from base group by 1
      ) d
    ),
    'grupos', (
      select coalesce(jsonb_agg(jsonb_build_object('dim', dim, 'chave', chave, 'sessoes', sessoes, 'plays', plays,
                                                   'pitch', pitch, 'cta', cta, 'engajamento', engajamento)
                                order by dim, sessoes desc), '[]'::jsonb) from grupos
    )
  ) into r;
  return r;
end;
$$;

revoke all on function public.vsl_painel(text, integer, integer) from public;
grant execute on function public.vsl_painel(text, integer, integer) to authenticated;

-- ---------------------------------------------------------------- exportação (planilha)

create or replace function public.vsl_exportar(p_video text, p_dias integer default 30)
returns setof public.vsl_sessoes
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.vsl_admins where email = lower(auth.jwt()->>'email')) then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  return query
    select * from public.vsl_sessoes
     where video = p_video
       and criado_em >= now() - make_interval(days => greatest(1, least(coalesce(p_dias, 30), 365)))
     order by criado_em desc
     limit 50000;
end;
$$;

revoke all on function public.vsl_exportar(text, integer) from public;
grant execute on function public.vsl_exportar(text, integer) to authenticated;
