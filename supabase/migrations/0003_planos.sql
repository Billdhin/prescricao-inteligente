-- Planos de treino (periodização longitudinal do "Prescrever treino").
--
-- O macrociclo inteiro (mesociclos -> microciclos -> sessões -> blocos) é jsonb:
-- a árvore é editável pelo profissional e não tem forma fixa por linha, então
-- guardar como documento evita uma explosão de tabelas e mantém o round-trip
-- simples. As consultas do app são sempre por (user_id, aluno_id).

create table if not exists public.planos (
  id            text not null,
  user_id       uuid not null references auth.users on delete cascade,
  aluno_id      text not null,
  data          timestamptz not null,
  titulo        text,
  objetivo      text,
  nivel         text,
  semanas       int,
  frequencia    int,
  disponibilidade text,
  modelo_id     text,
  modelo_alt_id text,
  grupo_especial text,
  macrociclo    jsonb not null default '{}',   -- Macrociclo (mesociclos -> microciclos -> sessões)
  alternativa   jsonb,                          -- Macrociclo alternativo, quando houver
  raciocinio    text,                           -- rastro da decisão (modelo, faixas, cuidados)
  ref_ids       jsonb not null default '[]',    -- referências que sustentam o plano
  status        text not null default 'ativo' check (status in ('ativo','arquivado')),
  created_at    timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists planos_aluno_idx on public.planos (user_id, aluno_id, data desc);

alter table public.planos enable row level security;
create policy "own planos" on public.planos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
