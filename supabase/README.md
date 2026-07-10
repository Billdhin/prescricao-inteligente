# Backend (Supabase)

O app roda hoje 100% em **modo local** (dados de conteúdo em `src/data/*`, estado do
usuário em `localStorage` via Zustand). Esta pasta traz tudo para ligar o backend em
nuvem (login real + dados sincronizados entre dispositivos) **sem quebrar** o que já
funciona: enquanto as credenciais não estiverem preenchidas, nada muda.

O projeto do Filipe já existe:
- **Project ref:** `asbaydbxujgsnowmfmbe`
- **Project URL:** `https://asbaydbxujgsnowmfmbe.supabase.co`
- **Painel:** https://supabase.com/dashboard/project/asbaydbxujgsnowmfmbe

## O que já está pronto no código

| Arquivo | Papel |
|---|---|
| `migrations/0001_init.sql` | Perfis + conteúdo público (13 exercícios, overlays, casos, trilhas, verbetes) + favoritos/progresso legado. RLS. Trigger que cria o `profile` no cadastro. |
| `migrations/0002_domains.sql` | Perfil completo (CREF, contato, marca, modo) + **alunos / avaliações / prescrições / liberações** + **progresso do módulo Aprender** (aulas, casos, quizzes, salvos, histórico, aplicações). RLS por usuário em tudo. |
| `seed.sql` | Seed do **conteúdo** (gerado de `src/data/*`). Idempotente. |
| `../scripts/gen-seed-sql.ts` | Regenera o `seed.sql` (`npm run gen:seed`). |
| `../src/lib/backend/supabaseClient.ts` | Cliente singleton real (`getSupabase()`), guardado por `isSupabaseConfigured()`. |
| `../src/lib/backend/supabaseAuth.ts` | Cadastro, login, logout, sessão, redefinir senha e assinatura de mudança de sessão. |
| `../src/lib/backend/supabaseRepo.ts` | CRUD tipado de perfil, alunos, avaliações, prescrições e liberações, mapeando o formato do app <-> tabelas (camelCase/aninhado <-> snake_case/JSONB). |
| `../.env.example` | `VITE_SUPABASE_URL` (já com a URL do projeto) + `VITE_SUPABASE_ANON_KEY` (a preencher). |

## Passo 1 — criar as tabelas (no painel Supabase)

1. Abra o **SQL Editor** em https://supabase.com/dashboard/project/asbaydbxujgsnowmfmbe
2. Rode, na ordem: `migrations/0001_init.sql`, depois `migrations/0002_domains.sql`.
   (Ou, com a CLI: `supabase db push`.)
3. Opcional (conteúdo): rode `seed.sql` para popular exercícios/casos/trilhas.
4. Em **Authentication > Providers**, confirme que **Email** está habilitado.

## Passo 2 — ligar as credenciais no app

1. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.
2. Crie um `.env` na raiz (a partir de `.env.example`) e preencha:
   ```
   VITE_SUPABASE_URL=https://asbaydbxujgsnowmfmbe.supabase.co
   VITE_SUPABASE_ANON_KEY=<sua anon public key>
   ```
3. `npm run dev` — a partir daí `isSupabaseConfigured()` fica true e as camadas de
   auth/repo podem ler e gravar no banco.
4. Para publicar no GitHub Pages com o backend ligado, guarde a anon key como
   **secret** do repositório (Settings > Secrets and variables > Actions) e injete
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` no passo de build do workflow.

## Passo 3 (próximo) — sincronizar os stores

Hoje as telas leem/gravam nos stores locais (`useAlunos`, `useUser`). O passo final da
migração é: quando houver sessão Supabase, hidratar esses stores a partir de
`supabaseRepo.listar*()` e espelhar cada escrita com `supabaseRepo.salvar*()`. A camada
já expõe exatamente essas funções, com o mesmo formato de dados dos stores, para uma
troca incremental sem reescrever a UI.

## Decisões

- **JSONB** para estruturas aninhadas (jornada, prontuário, medidas, perímetros, testes,
  fotos, blocos): fidelidade 1:1 com os tipos do front, sem explodir em N tabelas.
- **RLS ligado em tudo.** Conteúdo é leitura pública; todo dado por usuário é acessível
  só pelo dono (`auth.uid() = user_id`), mesmo com a anon key (que é pública por design
  e não dá acesso administrativo). Escrita de conteúdo usa `service_role`/admin.
- O trigger `on_auth_user_created` cria o `profile` automaticamente no cadastro.
- As fotos de avaliação hoje vão como dataURL no JSONB; para volume, migre-as para o
  **Supabase Storage** (bucket privado) numa etapa posterior.
