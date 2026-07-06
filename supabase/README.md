# Backend (Supabase) — base preparada para a Fase 5

O app roda hoje 100% em **mock local** (dados em `src/data/*`, estado do usuário em
`localStorage` via Zustand). Esta pasta adianta o que dá para o backend **sem quebrar**
o que já funciona — quando as credenciais forem configuradas, a troca é um drop-in.

## O que já está pronto

| Arquivo | Papel |
|---|---|
| `migrations/0001_init.sql` | Schema completo + RLS (conteúdo público p/ leitura; favoritos/progresso por usuário). Espelha `src/data/types.ts`. |
| `seed.sql` | Seed do **conteúdo** (13 exercícios, overlays, 6 casos, 3 trilhas, 12 verbetes), gerado de `src/data/*`. Idempotente. |
| `../scripts/gen-seed-sql.ts` | Regenera o `seed.sql` a partir dos dados atuais (`npm run gen:seed`). |
| `../src/lib/backend/dataProvider.ts` | Interface `ContentProvider` + `localProvider` (mock). Ponto único onde a `supabaseProvider` pluga. |
| `../src/lib/backend/supabaseClient.ts` | Config/guard de env (`isSupabaseConfigured()`). Cliente comentado, pronto p/ ativar. |
| `../.env.example` | Variáveis `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. |

## Como ligar o Supabase (Fase 5)

1. Criar projeto no Supabase e instalar o cliente:
   ```bash
   npm i @supabase/supabase-js
   cp .env.example .env   # preencher URL + anon key (Project Settings → API)
   ```
2. Aplicar o schema e o seed (SQL Editor do painel, ou CLI):
   ```bash
   supabase db execute -f supabase/migrations/0001_init.sql
   npm run gen:seed
   supabase db execute -f supabase/seed.sql
   ```
3. Ativar o cliente em `src/lib/backend/supabaseClient.ts` (descomentar `getSupabase`)
   e criar a `supabaseProvider` implementando `ContentProvider` (mesma interface do
   `localProvider`), lendo das tabelas. Apontar `getContentProvider()` para ela.
4. Migrar as telas de leitura direta (`import { exercises } from "@/data/..."`) para
   `getContentProvider()` — a UI não muda, só a origem dos dados.
5. Auth (Supabase Auth) substitui o `useUser` mock; `favorites` / `user_progress` /
   `activities` / `gps_consultations` passam a persistir por usuário (RLS já cobre).

## Decisões

- **JSONB** para estruturas aninhadas (ativação, fases, hotspots, blocos, conteúdo,
  opções, lições): fidelidade 1:1 com os tipos do front, sem explodir em N tabelas.
  Dá para normalizar depois se houver necessidade de query relacional.
- **RLS ligado em tudo.** Conteúdo é leitura pública; dados de usuário são acessíveis
  só pelo dono (`auth.uid() = user_id`). Escrita de conteúdo via `service_role`/admin.
- O trigger `on_auth_user_created` cria o `profile` automaticamente no cadastro.
