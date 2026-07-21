-- ---------------------------------------------------------------------------
-- Cor da marca do profissional
-- ---------------------------------------------------------------------------
-- Hex (ex.: "#2563EB"). Tinge o cabecalho dos documentos entregues ao aluno e,
-- no portal do aluno (fase seguinte), o app inteiro. Vazio usa a cor do produto.
alter table public.profiles add column if not exists cor_primaria text default '';
