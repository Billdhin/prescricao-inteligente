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
| `migrations/0003_planos.sql` | Planos de treino (periodização) do "Prescrever treino". |
| `migrations/0004_marca_cor.sql` | Coluna `cor_primaria` na marca do profissional. |
| `migrations/0005_aluno_portal.sql` | Papel `aluno`, vínculo `alunos.auth_user_id`, `convites`, `execucoes` e as políticas RLS do portal do aluno. |
| `seed.sql` | Seed do **conteúdo** (gerado de `src/data/*`). Idempotente. |
| `../scripts/gen-seed-sql.ts` | Regenera o `seed.sql` (`npm run gen:seed`). |
| `../src/lib/backend/supabaseClient.ts` | Cliente singleton real (`getSupabase()`), guardado por `isSupabaseConfigured()`. |
| `../src/lib/backend/supabaseAuth.ts` | Cadastro, login, logout, sessão, redefinir senha e assinatura de mudança de sessão. |
| `../src/lib/backend/supabaseRepo.ts` | CRUD tipado de perfil, alunos, avaliações, prescrições e liberações, mapeando o formato do app <-> tabelas (camelCase/aninhado <-> snake_case/JSONB). |
| `../.env.example` | `VITE_SUPABASE_URL` (já com a URL do projeto) + `VITE_SUPABASE_ANON_KEY` (a preencher). |

## Passo 1 — criar as tabelas (no painel Supabase)

1. Abra o **SQL Editor** em https://supabase.com/dashboard/project/asbaydbxujgsnowmfmbe
2. Rode **na ordem completa**: `0001_init.sql`, `0002_domains.sql`, `0003_planos.sql`,
   `0004_marca_cor.sql`, `0005_aluno_portal.sql`. Pular alguma quebra planos, marca ou o
   portal do aluno em runtime. (Ou, com a CLI: `supabase db push`.)
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

## Passo 3 — login em nuvem (JÁ LIGADO no código)

Com as credenciais no `.env` (ou nos secrets do CI), o app passa a exigir **login real**
(Supabase Auth) no lugar da senha local, e os stores (`useAlunos`, `useUser`) hidratam da
nuvem no login e espelham cada escrita. Peças: `src/lib/backend/cloudAuth.ts` (estado da
sessão + hidratação), `src/components/app/CloudAuthGate.tsx` (entrar/criar conta/esqueci
senha), `src/lib/backend/cloudSync.ts` (espelhamento). Sem credenciais, nada disso ativa e
o app segue 100% local com a senha local de sempre.

Notas de operação:
- **Confirmação de e-mail:** por padrão o Supabase manda um e-mail de confirmação no
  cadastro (a conta só entra depois de confirmar). Para um cadastro que entra na hora,
  desligue em **Authentication > Providers > Email > Confirm email**.
- **Primeiro login:** se a nuvem estiver vazia e houver dados só neste aparelho, eles são
  enviados para a conta automaticamente; nos próximos logins, a nuvem é a fonte.
- **Site publicado:** para ligar o login no GitHub Pages, cadastre os secrets
  `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a chave **publicável**) em
  Settings > Secrets and variables > Actions. Enquanto não cadastrar, o site publicado
  continua 100% local.

## Decisões

- **JSONB** para estruturas aninhadas (jornada, prontuário, medidas, perímetros, testes,
  fotos, blocos): fidelidade 1:1 com os tipos do front, sem explodir em N tabelas.
- **RLS ligado em tudo.** Conteúdo é leitura pública; todo dado por usuário é acessível
  só pelo dono (`auth.uid() = user_id`), mesmo com a anon key (que é pública por design
  e não dá acesso administrativo). Escrita de conteúdo usa `service_role`/admin.
- O trigger `on_auth_user_created` cria o `profile` automaticamente no cadastro.
- As fotos de avaliação hoje vão como dataURL no JSONB; para volume, migre-as para o
  **Supabase Storage** (bucket privado) numa etapa posterior.
