Tenho o suficiente para escrever a spec. Segue a SPEC COMPLETA (é o meu retorno ao orquestrador; não gravei arquivo).

---

# SPEC: Correção dos 12 itens do Filipe (Mapa da Prescrição)

Convenções para todos os agentes Opus:
- Texto visível ao usuário NUNCA usa travessão. Use ponto, ponto e vírgula ou parênteses.
- Nenhum número/corte clínico novo sem referência REAL de `src/data/referencias.ts`. Se a ref não cobrir explicitamente o número, a onda VERIFICA no PubMed antes e amplia a `nota` da ref.
- Ativação sempre no formato "NN/100 · Faixa". Dose de bloco sempre via `tokensDoBloco`, nunca copiada de `PrescricaoItem.series`. Rótulo colado ao valor (`LinhaDeDose`/`TokenRotulado`), nunca `justify-between`.
- Rodar `npm run check` (12 guardrails) e `npm run build` ao fim de cada onda. Os críticos são `check:faixas` e `check:progressao` (Onda F) e `check:menu` (Onda A).
- Toda mudança de valor persistido em `pi-*` exige bump de `version` + `migrate`. Duas ondas tocam `pi-alunos` (version atual 12, `src/lib/store.ts:575`): elas são SEQUENCIAIS, ver "Ordem de execução".

Ordem de execução (dependências):
- Paralelas entre si: A, B, C, D, E, G.
- SEQUENCIAIS e nesta ordem, porque ambas bumpam o `migrate` de `pi-alunos`: **Onda H (item 8) primeiro → version 13**, depois **Onda I (item 6) → version 14**. Não rodar em paralelo.
- Onda E (treino de hoje no profissional) e Onda H (rename do objetivo) tocam `AlunoDetail.tsx`: se rodarem juntas, resolver conflito manual; preferir E antes de H.

---

## Onda A — Item 1: ordem e rótulo do grupo "Estudar e referência"

Arquivo único: `src/components/app/nav.ts` (grupo em `:80-90`).

ORDEM DO FILIPE (literal, prevalece sobre qualquer outra sugestão): Estudar → Laboratório
Visual → Grupos Especiais → Protocolos → Consultar.

Mudança:
1. Reordenar os `items` do grupo `"Estudar e referência"` (`nav.ts:83-89`) para EXATAMENTE:
   `Estudar` (/aprender) → `Laboratório Visual` → `Grupos Especiais` → `Protocolos` → `Consultar`.
   Não alterar `to`, `match`, `icon` de cada item; só a ordem do array.
2. NÃO renomear o `label` do grupo (`"Estudar e referência"`). O estado comprimido persiste POR LABEL em `useUI` (`store.ts:157-169`); renomear exigiria migrate e órfã o estado. Se o Filipe pedir renome do grupo, aí sim: bump + migrate mapeando o label antigo no `useUI`.

Guardrail: `check:menu` (`scripts/check-menu.ts`) valida NAV vs títulos vs Landing vs tutoriais. Rodar e manter verde. `BOTTOM` (`nav.ts:107-113`) não muda (Estudar não está na barra mobile).

Aceite:
- `npm run check:menu` verde e `npm run build` ok.
- Sidebar mostra o grupo na nova ordem; o rail colapsado acende corretamente por rota (Consultar acende em `/consultar` e `/library`; Laboratório em `/movement-lab` e `/comparador`).

---

## Onda B — Itens 2 e 4: home do Aprender abre com o mapa + perguntas sugeridas que sempre acham resposta

Arquivos: `src/features/learning/pages/Home.tsx`, `src/features/learning/pages/Consulta.tsx`, novo `scripts/check-consulta-sugestoes.ts` + entrada em `package.json`.

### Item 2 — mapa como abertura
Hoje o mapa é a seção 7.4 no meio da página (`Home.tsx:96-104`), depois de cabeçalho, busca e ações. Filipe quer que a home ABRA com o mapa.

Mudança em `Home.tsx` (`:64-144`), reordenar as seções do return SEM criar componentes novos:
1. Manter o cabeçalho (`:66-88`) e a `ContextualSearch` (`:91`).
2. Mover a seção "Mapa das Ciências da Prescrição" (bloco `:97-104`) para LOGO ABAIXO da busca, antes de "Ações imediatas" (`:93-94`). O mapa é a primeira coisa de conteúdo que o profissional vê.
3. Trocar `<KnowledgeMap compact />` por `<KnowledgeMap />` (versão cheia) nessa posição de abertura, mantendo o link "Explorar o mapa" para `/aprender/mapa`. Confirmar em `src/features/learning/components/KnowledgeMap.tsx` que a prop `compact` existe e que a versão não-compacta cabe na largura `max-w-6xl`; se a versão cheia for alta demais, manter `compact` mas garantir que fique acima da dobra.
4. Ordem final das seções: cabeçalho → busca → **Mapa** → Ações imediatas → Recomendado → Estudar por objetivo → Disciplinas em destaque.

Aceite item 2: ao abrir `/aprender`, o mapa aparece imediatamente abaixo da busca (acima das "Ações imediatas"), sem regressão visual no mobile; `npm run check:aprender` verde.

### Item 4 — perguntas sugeridas que não acham resposta
Causa raiz confirmada: existem DUAS listas divergentes de sugestões. `Home.tsx:30-37` tem 6 perguntas longas em linguagem natural (ex.: "Como adaptar o treino para hipertensão?") e a `ContextualSearch` navega para `/consultar?q=<pergunta completa>` (`Home.tsx:187-192`). O matcher `pontuar()` de `Consulta.tsx:23-31` casa por substring contra `keywords`/`question`/`summary`; as perguntas longas do Home muitas vezes não casam com nenhum `QuickAnswer` e caem no `EmptyState` "Não encontramos uma resposta" (`Consulta.tsx:131-138`). Já `Consulta.tsx:14-21` tem sua PRÓPRIA lista de termos curtos que É verificada via `promovidas` (`:55-67`).

Mudança:
1. Eliminar a lista órfã do Home. Em `Home.tsx`, remover a const `SUGESTOES` local (`:30-37`) e, onde ela for usada para renderizar chips na `ContextualSearch`, passar a reusar termos JÁ verificados. Exportar de `Consulta.tsx` a lista `SUGESTOES` (`:14-21`) e uma função pura nova `sugestoesComResposta(): string[]` que roda o mesmo `pontuar` contra `repo.getQuickAnswers()` e devolve SÓ os termos com `score > 0` (garante um toque até o valor). `Home` importa e usa essa função para os chips de sugestão.
2. Em `Consulta.tsx`, o estado inicial (`:100-130`) já promove só o que casa; manter. Garantir que `restantes` (`:68`) também filtre por `pontuar > 0` (hoje mostra todos os `SUGESTOES` não promovidos, que podem não ter resposta): trocar `SUGESTOES.filter(...)` por `sugestoesComResposta().filter((s) => !promovidas.some((p) => p.termo === s))`.
3. Novo guardrail `scripts/check-consulta-sugestoes.ts`: importa `SUGESTOES` e `getQuickAnswers`, e falha se QUALQUER termo de `SUGESTOES` não produzir ao menos um resultado com `score > 0`. Adicionar `"check:consulta": "tsx scripts/check-consulta-sugestoes.ts"` em `package.json:12` dentro do encadeamento de `check`. Isso trava a regressão (sugestão sem resposta nunca mais entra).

Aceite item 4:
- Clicar em qualquer sugestão no `/aprender` ou no `/consultar` SEMPRE abre ao menos uma "Resposta visual"; nunca o `EmptyState`.
- `npm run check:consulta` verde e incluído em `npm run check`.
- Zero listas de sugestão duplicadas (a fonte única é `SUGESTOES` de `Consulta.tsx`).

---

## Onda C — Item 5: "Motor RCD" explicável (dialog) na ferramenta, mantido no marketing

Arquivos: `src/components/rcd/SeloRCD.tsx` (único componente alterado) e 4 call-sites: `src/components/rcd/SemaforoLiberacao.tsx:121`, `src/pages/Gps.tsx:407`, `src/pages/PrescreverTreino.tsx:262`, `src/components/rcd/ProntuarioView.tsx:65`.

Problema: no Semáforo o selo aparece como `<SeloRCD compacto />` (`SemaforoLiberacao.tsx:118-122`), sigla solta sem nenhuma explicação in-app (o glossário não tem verbete "RCD"). Filipe: "se tiver um hiperlink para explicar".

Mudança:
1. Em `SeloRCD.tsx` (`:10-45`), adicionar prop opcional `explicavel?: boolean`. Quando `true`, o selo vira `<button type="button">` (em vez de `<span>`) e abre um dialog curto no padrão de `src/components/metrica/MetricaInfo.tsx:31-50` usando `useDialog` (`src/lib/useDialog.ts`). Quando ausente/`false`, continua `<span>` estático (comportamento atual do marketing intacto).
2. Conteúdo do dialog (português claro, prudente, SEM travessão, SEM claim novo). Duas seções curtas:
   - "O que é": "O mecanismo que registra o porquê de cada decisão do seu atendimento: o semáforo antes da sessão, os exercícios escolhidos e os descartados com o motivo, e as referências numeradas."
   - "O que vira": "Um documento que apoia e registra a SUA decisão, pronto para você assinar." (linguagem alinhada a `Support.tsx:31`).
   Não citar versão nem números; nada além do que o motor faz de verdade.
3. z-index do overlay `z-[70]` (como `MetricaInfo`), e `e.stopPropagation()` no overlay para não fechar/disparar o dialog pai do Prontuário/Semáforo (que são `fixed z-50`).
4. Ligar `explicavel` nos 4 call-sites do APP; NÃO tocar nos call-sites de marketing (`Landing`, `Pricing`, `Roi`, `CasosRcd`, `CasoRcdDetail`, `Support`) nem nos PDFs (`pdfSelo.ts`/`pdfCabecalho.ts`/`exportProntuario`/`printSemaforo`): documento estático já se autoexplica por extenso.
5. Guardrail `check:design` (`scripts/check-design.mjs`): se o selo virar `button`, manter tokens de cor do selo (petróleo/analysis, nunca coral) e não introduzir `/NN` sobre cor-token. Rodar e manter verde.

Não mexer em `RCD_NOME/RCD_SIGLA/RCD_VERSAO` nem em `motorVersao` (persistido em prontuários, `prontuario.ts:101`); o dialog não toca dado persistido (zero migrate).

Aceite:
- No Semáforo, Treino do dia, Prescrever treino e Prontuário, o selo é clicável e abre a explicação; no marketing continua estático.
- `npm run check:design` e `npm run check:contraste` verdes; `npm run build` ok.

---

## Onda D — Item 11: popover "Ativação relativa (?)" legível (portal)

Arquivo único: `src/components/metrica/MetricaInfo.tsx`.

Causa raiz confirmada: `MetricaDialog` é renderizado INLINE na árvore (`MetricaInfo.tsx:47`) com overlay `fixed inset-0 z-[70]` (`:67`). Dentro do `BiomechanicsComparisonSlider`, o "(?)" (`:603`) vive num card com `backdrop-blur-md` (`:593-599`); `backdrop-filter` cria containing block para `position:fixed`, então `inset-0` preenche o card de 256px em vez do viewport, e o `overflow-hidden` da raiz do slider (`:374`) corta o resto. Modal espremido no canto.

Mudança:
1. Em `MetricaInfo.tsx`, envolver o `MetricaDialog` em `createPortal(..., document.body)` (`import { createPortal } from "react-dom"`). Conserta TODOS os usos de uma vez (o padrão popover-(?) só existe neste componente: `MetricaBar.tsx:50`, `Comparador.tsx:149,201`, `Gps.tsx:1812`, `MovementLabDetail.tsx:269,860`, `BiomechanicsComparisonSlider.tsx:603`).
2. Risco do slider: a raiz do `BiomechanicsComparisonSlider` tem `onClick` que alterna execução/análise (`:363-370`). Portais React propagam eventos pela árvore REACT, não DOM, então após portalizar o clique dentro do modal ainda borbulharia até esse `onClick`. Adicionar `e.stopPropagation()` no overlay do `MetricaDialog` (hoje ausente, `MetricaInfo.tsx:67-75`) e no `onClick` do conteúdo do dialog. `useDialog` (`:13-72`) opera por `document.addEventListener` + ref e funciona igual com portal (nada a mudar lá).
3. NÃO tocar em `overflow`/`max-width`/`backdrop-blur` do card do slider (estética aprovada). O fix é só o portal + `stopPropagation`.

Aceite:
- Abrir o "(?)" de "Ativação relativa" no slider desktop (na Landing e em `MovementLabDetail`) abre o modal centralizado no viewport, não espremido; e NÃO alterna o slider por baixo.
- Os demais "(?)" (Comparador, Gps, MovementLabDetail, MetricaBar) seguem funcionando. `npm run build` ok.

---

## Onda E — Itens 3, 9b e 10: treino de hoje visível no lado do profissional (semáforo recomendado, não escondendo o treino) + escalas acopladas

Arquivos: `src/pages/AlunoDetail.tsx`, `src/pages/Gps.tsx`, `src/lib/gps/proximoPasso.ts`. Reusar helpers puros de `src/data/periodizacao.ts` e `src/components/student/blocoRegistro.tsx` e `src/components/special/SpecialUI.tsx` (ParametroPills). Zero dado persistido novo (zero migrate).

Regra dura: a nova visão do profissional DEVE derivar a sessão com `sessaoDeHojeIndex(plano, execucoes)` + `sessoesDeHoje` + `semanaAtual` (`periodizacao.ts:294-326`), os MESMOS helpers do `StudentApp:302` e do `AplicarNoTreinoDialog:62`. Nunca reimplementar a regra (senão profissional e aluno divergem). NÃO reusar o `StudentApp` inteiro (ele aplica tema/marca do aluno, `StudentApp.tsx:131-145`); reusar SÓ os renderizadores puros `nomeDoBloco`/`tokensDoBloco`/`exercicioDoBloco` de `blocoRegistro.tsx:18-79`.

### Item 10 — mostrar o CONTEÚDO da sessão de hoje no perfil (AlunoDetail)
Hoje o `PlanoCard` (`AlunoDetail.tsx:1530-1637`) só mostra metadados (semana N de M, bloco atual, reavaliação, 3 links); o conteúdo da sessão só aparece indo à prévia `/alunos/:id/preview` ou ao editor.

Mudança:
1. `PlanoCard` passa a receber `execucoes` como prop (a `execucoesDoAluno` já é derivada em `AlunoDetail.tsx:315`; passar na chamada em `:528`).
2. Inserir seção "Treino de hoje" DENTRO do `PlanoCard`, entre o bloco "Bloco atual" (fecha em `:1580`) e o bloco de reavaliação (abre em `:1584`). Derivar `idxHoje = sessaoDeHojeIndex(planoAtivo, execucoes)` e `sessao = sessoesDeHoje(planoAtivo)[idxHoje]`; renderizar o nome da sessão (`nomeDoBloco`/`sessao.nome`) e os blocos via `tokensDoBloco` + `LinhaDeDose` (dose colada ao rótulo). Título da seção: "Treino de hoje".
3. O semáforo continua RECOMENDADO, não obrigatório: manter o resumo do Semáforo na coluna direita (`:685-695`) e o link "Fazer o semáforo de hoje", mas a sessão de hoje fica visível independentemente do semáforo. O único gate duro segue sendo `podeMontarTreino` (avaliação), `proximoPasso.ts:29-38`; NÃO criar gate novo.

### Item 9b — sensação de "semáforo obrigatório"
A etapa `liberar` de `proximoPasso.ts:122-132` gera o CTA "Fazer o semáforo de hoje" com `tone: primary` sempre que há plano ativo, reavaliação em dia e sem liberação no dia; esse passo é fonte única (alimenta `AlunoHeader`, `LinhaDoCuidado`, chip da lista, Painel, `avisosDoAluno`).

Mudança (mínima e cirúrgica, ciente do raio de alcance):
1. NÃO remover a etapa `liberar` nem mudar sua posição/condições (mudaria chips e avisos em todo o produto de uma vez, `proximoPasso.ts:78-163,198-246`). Apenas suavizar o TEXTO/tom para deixar claro que é recomendado, não bloqueante: em `proximoPasso.ts:122-132`, ajustar o rótulo/descrição da etapa `liberar` para linguagem de recomendação (ex.: label "Recomendado: fazer o semáforo de hoje" e uma descrição curta "O treino já está pronto; o semáforo confirma que hoje é um bom dia para treinar."). Manter o `to` indo à ABA do aluno (`irParaSemaforo` / `/alunos/:id?aba=semaforo`), nunca à página `/semaforo` (decisão travada do menu). Verificar que a mudança de string não quebra `check:menu`/`check:legibilidade`.
2. Manter `tone` primary é aceitável (é a ação recomendada), mas o texto deixa de soar obrigatório.

### Item 3 — escalas de monitoramento acopladas ao treino do dia (lado profissional)
Hoje as escalas (ParametroPills → ParametroDialog com "como aplicar" + ficha PDF) só aparecem no `JornadaCard` (exige `grupoEspecial`) e no `FocoAgora` do `/gps` (exige grupo). `ParametroPills({ ids, contexto })` resolve a identidade do profissional sozinho via `useUser` (`SpecialUI.tsx:92,183`).

Mudança:
1. No AlunoDetail, logo abaixo da nova seção "Treino de hoje" do `PlanoCard`, anexar `<ParametroPills ids={...} contexto={{ alunoNome, objetivo }} />`. `ids` derivados da fase do grupo com a MESMA derivação de `AlunoDetail.tsx:1358-1362` (`grupo.fases[fase-1].parametros`). Para aluno SEM grupo, fallback com ids genéricos seguros que já existem em `monitoringParameters.ts` (ex.: `["p-rpe"]`, e `["p-fc","p-rpe","p-adesao"]` quando o objetivo for Emagrecimento, alinhado a `FAIXAS_TREINO.Emagrecimento.parametros`). Nunca inventar id de parâmetro.
2. No `/gps` modo dia (`Gps.tsx:398-421`): enriquecer o banner "Personalizando o treino do dia" (`:413-421`) com a sessão-alvo real, hoje só revelada no fim no `AplicarNoTreinoDialog`. Usar `sessoesDeHoje(planoAtivo)[sessaoDeHojeIndex(planoAtivo, execucoes)]` (`planoAtivo` em `Gps.tsx:186`, `execucoes` já no escopo, `:573`) e mostrar nome + blocos via `tokensDoBloco`. Incluir `<ParametroPills>` nesse banner APENAS quando o aluno NÃO tem grupo (com grupo, o `FocoAgora` em `:519-528/965-973` já cobre; não duplicar).

Cuidado: `printFichaParametro` abre popup e imprime, só sob clique (`printFicha.ts`); não chamar fora de handler.

Aceite (Onda E):
- No perfil do aluno (aba "Plano e treino") o profissional VÊ os exercícios da sessão de hoje sem sair da página, e as escalas de monitoramento aparecem acopladas (com ou sem grupo).
- No `/gps` modo dia, o banner mostra QUAL é a sessão-alvo e seus blocos antes do fim do fluxo.
- O CTA do semáforo lê como recomendação, não obrigação, e continua indo à aba do aluno.
- `npm run check` completo verde (atenção a `check:legibilidade`, `check:menu`, `check:documentos`).

---

## Onda F — Item 9a: variabilidade (aeróbio e flexibilidade complementares em TODOS os objetivos, citados)

Arquivos: `src/data/periodizacao.ts` (interface `FaixaObjetivo` `:573-595` e mapa `FAIXAS_TREINO` `:602-699`), consumidor de UI que exibe as faixas por objetivo (Aprender "Estudar por objetivo" e/ou `/prescrever-treino`), e possivelmente `scripts/check-faixas.ts`. Esta é a onda com os guardrails críticos `check:faixas` e `check:progressao`.

Problema (CORRIGIDO pelo orquestrador; a reclamação do Filipe é sobre o PLANO GERADO, não
sobre texto): hoje `gerarPlano`/`montarSessoes` só incluem bloco aeróbio quando o objetivo é
Emagrecimento (e afins); Hipertrofia, Força e Resistência saem 100% musculação, da semana 1 à
N. Isso viola o princípio da variabilidade que o Filipe citou. A correção tem que mudar AS
SESSÕES GERADAS, não só descrever complementos.

Mudança (em ordem):
1. **Aeróbio complementar REAL em todos os objetivos**: em `src/lib/gps/periodizacao.ts`,
   onde a condição por objetivo decide se entra bloco aeróbio, TODOS os objetivos passam a
   receber componente aeróbio complementar (bloco `tipo: "aerobio"` de verdade, em 1 a 2
   sessões da semana), com DOSE MENOR que a do Emagrecimento (complemento, não foco) e ALVO
   PROGRESSIVO por semana via `alvoAerobioSemana` (mesma mecânica de rampa; ponto de partida
   e teto menores, dentro de faixa citada). O foco do objetivo não muda: força continua
   priorizando carga, resistência continua priorizando reps; o aeróbio entra como complemento
   rotulado. Emagrecimento permanece como está (aeróbio como base).
2. **Flexibilidade como fecho de sessão**: incluir alongamento/flexibilidade no plano gerado
   de todos os objetivos. Caminho de MENOR risco à escolha do executor após ler o código:
   (a) novo `tipo: "flexibilidade"` de `BlocoSessao` SE o custo de propagar (editor, PDF,
   app do aluno, assinaturaSemana, checks) for baixo; senão (b) campo textual estruturado da
   sessão ("fecho: alongamento 5 a 10 min, principais grupos da sessão") renderizado no
   editor, no PDF e no app do aluno. Nunca inventar dose sem referência.
3. **Faixas citadas**: registrar em `FAIXAS_TREINO` (ou tabela nova ao lado) a faixa do
   complemento aeróbio e de flexibilidade por objetivo, com `refIds` reais. Âncora:
   `garber-2011` (Position Stand ACSM cobre cardiorrespiratório, flexibilidade e neuromotor
   para adultos). ANTES de cravar números (frequência/duração), confirmar que garber-2011
   sustenta exatamente o citado (buscar no PubMed se preciso) e ampliar a `nota` da ref;
   se não sustentar, achar ref real que sustente ou declarar a dose como "cautela declarada".
4. **Fonte única preservada**: os novos blocos entram em `assinaturaSemana`/`agregadoSemana`
   como os aeróbios de hoje; o gráfico continua agregado dos alvos. `alvoResumo`/PDF/editor/
   app do aluno mostram o complemento (o app do aluno já renderiza bloco aeróbio).
5. **Guardrails**: `check:faixas` (pula blocos aeróbio hoje; se ganhar faixa aeróbia citada,
   estender o check para validá-la), `check:progressao` (critério do aeróbio passa a valer
   para TODOS os objetivos: alvo aeróbio não pode ser constante; ajustar o check para cobrir
   isso e manter verde), `check:regras` se novas regras entrarem no rulepack.

Guardrails críticos:
- `check:faixas` (`scripts/check-faixas.ts`): valida que nenhum bloco GERADO cai fora da faixa do objetivo e que o verificador avisa/cala corretamente. `complementos` é campo NOVO de texto, não gera bloco nem faixa numérica de series/reps/intervalo; então não deve afetar o gerador. Confirmar que `gerarPlano` NÃO passa a emitir blocos aeróbios fora de faixa por causa disso (o check já pula `bloco.tipo === "aerobio"`, `:42`). Rodar e manter verde.
- `check:progressao` (`scripts/check-progressao.ts`): garante que a prescrição gera ALVO por semana progredindo. Como esta onda só adiciona texto complementar e não muda a lógica de progressão, rodar e confirmar que segue verde. Se a UI passar a derivar algo do aeróbio, NÃO alterar o alvo agregado do gráfico (fonte única).

Aceite:
- Cada um dos 6 objetivos exibe complemento aeróbio e de flexibilidade, cada um com referência real resolvida.
- `check:faixas` e `check:progressao` verdes; `npm run build` ok; nenhuma faixa numérica nova inventada.

---

## Onda H — Item 8: fim da palavra "Reabilitação" (com migração do objetivo persistido)

SEQUENCIAL: roda ANTES da Onda I. Bumpa `pi-alunos` version 12 → 13.

Decisão de nomenclatura: substituir o objetivo `"Reabilitação/retorno"` por **`"Retorno ao treino"`** (dentro do escopo do personal, sem prometer reabilitação). Toda ocorrência VISÍVEL da palavra "Reabilitação"/"reabilitar" em texto de UI vira linguagem de retorno/conduta de saúde. Onde a palavra hoje aparece para DIZER que a ferramenta NÃO reabilita (disclaimers), reescrever para "conduta de saúde/liberação do profissional de saúde" sem usar o termo.

Arquivos a alterar (o valor do enum é chave em todo o sistema):
1. Tipo e listas: `src/lib/gps/engine.ts:18` (`GpsObjetivo`), `:387` (`OBJETIVOS`). Renomear o literal.
2. Faixas/periodização: `src/data/periodizacao.ts:672-685` (chave `"Reabilitação/retorno"` de `FAIXAS_TREINO`), `src/lib/gps/periodizacao.ts:102-103,186` (condições).
3. Gps: `src/pages/Gps.tsx:92`.
4. Wizard/opções: `src/data/opcoes-wizard.ts:14`.
5. Protocolos: `src/data/protocolos.ts:525,550-551` (e categoria "Reabilitação e retorno" `:25,579,590` se for visível; renomear o rótulo visível, ex.: "Retorno e reintrodução de carga").
6. Dados semente (não persistidos): `src/data/alunos.ts:288,379`, `src/data/casosDocumentados.ts:55,129`, `src/data/exercises*.ts` (arrays `objetivo` que citam `"Reabilitação/retorno"`: `exercises.ts`, `exercises-extra.ts`, `exercises-extra2.ts`) — todos precisam do NOVO literal para manter o tipo válido.
7. Guardrail: `scripts/check-faixas.ts:75` cita `objetivo: "Reabilitação/retorno"` — atualizar para o novo literal (senão o build do check quebra).
8. Textos didáticos do Aprender (`src/features/learning/mocks/*.ts`) que usam "Reabilitação:" como rótulo de bullet visível: reescrever para "Retorno ao treino:" ou "Retorno após lesão:" conforme o contexto. `PLAYBOOK.md:25` e comentários de código NÃO são texto de usuário (podem ficar, mas de preferência limpar o comentário de `periodizacao.ts:10` e `restricoes.ts:7`).

Migração persistida (`src/lib/store.ts`, store `pi-alunos`, `:575-577`):
- Bump `version: 12 → 13`.
- No `migrate`, mapear em TODOS os registros do usuário o valor antigo para o novo em: `Aluno.objetivo`, e em qualquer `plano.objetivo` / `prescricao.objetivo` / avaliação que carregue `objetivo` (varrer `alunos`, `planos`, `prescricoes`). Regra: `"Reabilitação/retorno" -> "Retorno ao treino"`. Preservar todo o resto (migrate por MERGE, como já é o padrão `:556`).
- Se houver `sugestoesDispensadas`/`condicoesAtencao` com strings de objetivo (não deveria), não tocar.

Guardrails: `check:faixas`, `check:progressao`, `check:regras`, `check:documentos`, `check:legibilidade`, `check:menu` todos verdes. Grep final por `[Rr]eabilita` em `src/` deve sobrar SÓ em comentários de código e em disclaimers que citam "profissional de saúde" reescritos (zero objetivo/rótulo visível "Reabilitação").

Aceite:
- Nenhum texto visível ao usuário contém "Reabilitação"/"reabilitar" como rótulo/objetivo.
- Alunos/planos já salvos (persist v12) migram para v13 sem perder dados e sem objetivo órfão.
- Build e `npm run check` verdes.

---

## Onda I — Item 6: obesidade em graus I/II/III e hipertensão em estágios 1/2, com semáforo/regras/classificador por nível + migração de slugs

SEQUENCIAL: roda DEPOIS da Onda H. Bumpa `pi-alunos` version 13 → 14.

Objetivo: hoje há UM slug `obesidade-grave` e UM slug `hipertensao`; o grau só existe como rótulo no classificador (`classificador.ts:46-51`) e a hipertensão não tem estágio. Filipe quer grupos/regras/semáforo/classificador POR NÍVEL.

Referências (regra dura de corte clínico):
- Obesidade graus: JÁ backed. `seidell-flegal-1997` (`referencias.ts:140-147`) documenta grau I (30 a 34,9), grau II (35 a 39,9), grau III (40+), com `who-imc-2004` reforçando. Usar esses ids.
- Hipertensão estágios: `sbc-2020` (`referencias.ts:52-58`) é a fonte certa (Diretrizes Brasileiras de Hipertensão 2020), MAS a `nota` atual não enumera os cortes de estágio. Antes de hardcodar números, a onda VERIFICA no PubMed/documento SBC 2020 os cortes exatos (estágio 1 = PAS 140 a 159 ou PAD 90 a 99; estágio 2 = PAS 160 a 179 ou PAD 100 a 109; estágio 3 = PAS ≥ 180 ou PAD ≥ 110) e AMPLIA a `nota` de `sbc-2020` (`referencias.ts:57`) para declarar esses cortes explicitamente. Só então usar os números. Pescatello (`pescatello-2004`) sustenta a conduta de exercício por estágio.

Decisão de escopo: Filipe pediu estágios 1/2 (não citou o 3). Modelar estágio 1 e estágio 2 como grupos; PA ≥ 180/110 (crise/estágio 3) NÃO vira grupo de treino, vira sinalização de encaminhamento no classificador (não sugere treino, recomenda liberação médica). Confirmar essa decisão de produto; a spec assume 2 grupos de HAS.

Slugs novos:
- `obesidade-grau-1`, `obesidade-grau-2`, `obesidade-grau-3` (substituem `obesidade-grave`).
- `hipertensao-estagio-1`, `hipertensao-estagio-2` (substituem `hipertensao`).

Arquivos:
1. `src/data/specialGroups.ts`: substituir a entrada `obesidade-grave` (`:163-198`) por 3 entradas (grau I/II/III) e `hipertensao` (`:278-309`) por 2 (estágio 1/2), cada uma com `nome`, `slug`, descrição honesta e `casosRelacionados`. Atualizar `ORDEM_CONDICOES` (`:977`) e o mapa `teoriaGrupo` (`:1022-1078`, hoje `obesidade-grave` e `hipertensao`) com as chaves novas. `nome` clínico continua servindo ao profissional (regra de dignidade: `rotuloAluno` para o documento do aluno).
2. `src/lib/gps/groupRules.ts`: substituir `groupGpsRules["obesidade-grave"]` (`:50-81`) e `["hipertensao"]` (`:82-112`) pelas chaves novas, com regras progressivamente mais conservadoras por nível (ex.: grau III e estágio 2 penalizam/rebaixam mais alto impacto e Valsalva, citando `pescatello-2004`/`sbc-2020`). Não inventar número: as regras são qualitativas (exclui/rebaixa), como já são.
3. `src/lib/gps/classificador.ts`: `grauObesidade` (`:46-51`) passa a devolver o SLUG por grau, e o bloco IMC (`:81-93`) emite `grupoSlug` = `obesidade-grau-{1,2,3}` conforme faixa, mantendo `rotulo` honesto e `refId: "seidell-flegal-1997"`. Novo bloco/função `estagioHipertensao(sis, dia)` que classifica PA em estágio 1/2 (com os cortes verificados) e emite `hipertensao-estagio-1|2` com `refId: "sbc-2020"`; PA ≥ 180/110 gera sugestão de encaminhamento (não treino). Manter a regra de ouro: só sugere com o dado presente.
4. `src/lib/gps/semaforoDiario.ts`: se o semáforo diário tem regras por grupo, adicionar as chaves novas por nível (limites prudentes de PA pré-sessão por estágio, citando `sbc-2020`; obesidade por grau com foco em tolerância/articulação). Verificar acoplamento com `groupRules`.
5. Casos documentados: `casosRelacionados` que apontavam para `caso-obesidade-grave-inicio` / `caso-hipertensao-monitoramento` (`specialGroups.ts:198,309`) — reapontar para o grupo/grau/estágio adequado ou manter o caso e associá-lo ao grau/estágio correspondente.

Migração persistida (`src/lib/store.ts`, `pi-alunos`, bump 13 → 14):
- No `migrate`, remapear `Aluno.grupoEspecial`, cada item de `Aluno.condicoesAtencao` e de `Aluno.sugestoesDispensadas`:
  - `"obesidade-grave"` → recalcular pelo IMC da última avaliação do aluno se disponível (grau I/II/III); se não houver IMC, cair no fallback conservador `"obesidade-grau-1"` (documentar essa escolha; não inventar grau maior sem dado).
  - `"hipertensao"` → recalcular pela última PA medida (estágio 1/2); sem PA, fallback `"hipertensao-estagio-1"`.
- Preservar o resto (merge). Nenhum registro pode ficar apontando para slug morto (senão `getSpecialGroup`/`getGroupRule` devolvem `undefined` e a UI órfã).

Guardrails:
- `check:faixas` itera `specialGroups.map(g => g.slug)` (`scripts/check-faixas.ts:32`): os slugs novos entram automaticamente no varrimento; confirmar que `gerarPlano` com cada slug novo continua dentro das faixas (verde).
- `check:regras` (`scripts/check-regras.ts`), `check:documentos`, `check:progressao` verdes.
- Grep final: zero referência a `"obesidade-grave"` ou `"hipertensao"` (slug antigo) em `src/` fora do bloco de migrate.

Aceite:
- Classificador sugere "Obesidade grau I/II/III" e "Hipertensão estágio 1/2" pelos dados medidos, cada um com o corte e a referência real; PA ≥ 180/110 recomenda encaminhamento, não treino.
- Regras de GPS e semáforo diferem por nível.
- Alunos com slug antigo migram para o grau/estágio correto (ou fallback conservador documentado) sem órfão.
- `npm run check` completo verde; `npm run build` ok.

---

## Onda G — Item 7: tabela de evolução comparativa + PDF

Arquivos: `src/pages/AlunoDetail.tsx` (aba "avaliacoes"), novo `src/lib/exportEvolucao.ts`, reuso de `src/components/app/EvolucaoMini.tsx` (dir/cores) e do cabeçalho unificado `src/lib/pdfCabecalho.ts`. Molde do PDF: `src/lib/exportPostural.ts`. Zero dado persistido novo (LER as chaves existentes, inclusive `medidas.imc` derivado no `AvaliacaoModal.tsx:131-166`); qualquer renome de shape exigiria migrate, então NÃO renomear nada.

### Tabela comparativa (tela)
Hoje a evolução é só `EvolucaoMini` (uma métrica por vez, minigráfico, `EvolucaoMini.tsx:18-144`) e a lista de avaliações mostra só peso/%gordura/cintura/dor (`AlunoDetail.tsx:456-488`). Não há tabela por datas.

Mudança:
1. Novo componente `TabelaEvolucao` (colocar junto de `EvolucaoMini` ou dentro do card "Evolução" da aba avaliações, `AlunoDetail.tsx:434-495`): linhas = métricas de `METRICAS_EVOLUCAO` (`EvolucaoMini.tsx:18-27`: peso, %gordura, cintura, quadril, massaMuscular, imc, fcRepouso, PA sistólica); colunas = avaliações em ordem CRONOLÓGICA ascendente (as avals já chegam ascendentes em `AlunoDetail.tsx:310`; fixar a ordem explicitamente para as colunas). Última coluna = delta primeiro→último, colorido reusando `corDelta`/`dir` de `EvolucaoMini` (massa muscular subir é BOM; NUNCA inverter sinal nem criar métrica invertida, proibido pelo padrão de métricas). Ler `medidas.imc` existente, não recalcular diferente.
2. A tabela deve rolar horizontalmente em telas estreitas (`overflow-x-auto`), sem quebrar o layout.

### PDF (exportEvolucao)
Não existe `exportEvolucao`; os 4 exports seguem o padrão window.open+print.

Mudança:
1. Novo `src/lib/exportEvolucao.ts` no molde de `exportPostural.ts:21-114`. Assinatura: `exportEvolucaoPDF({ aluno, avaliacoes, profissional, cref, marca })` (marca de `marcaDoUsuario(usuario)`, `store.ts:132`; `cor = marca?.corPrimaria || '#1b4b66'`). Cabeçalho unificado via `cabecalhoCss(cor)` + `cabecalhoHtml({ ..., no: 0 })` (índice 0 = avaliar, como `exportPostural`). Tabela HTML inline-styled com as mesmas métricas/colunas cronológicas da tela; `@media print` com `@page margin 16mm`; rodapé com disclaimer honesto. Cores LITERAIS (documento não tem as variáveis CSS do tema). Sem travessão.
2. Botão "Exportar evolução (PDF)" na aba avaliações, sob clique (bloqueio de popup), passando `profNome`/`cref` de `useUser` (`AlunoDetail.tsx:243`) e `marca` de `marcaDoUsuario`.
3. Dignidade do documento (risco de `check:documentos`): este PDF pode ir ao aluno; NÃO imprimir rótulo clínico do grupo (usar `rotuloAluno` se algum campo de grupo entrar). `observacoes`/`testes` digitados livres pelo profissional entram no PDF; o guardrail atual (`scripts/check-documentos.ts`) só varre o texto gerado por `gerarPlano` e NÃO cobre este export automaticamente, então o autor garante manualmente que nenhum rótulo clínico vaze e, de preferência, estende o `check:documentos` para varrer a saída de `exportEvolucao` também.

Guardrails: `check:legibilidade` (rótulo colado ao valor na tabela), `check:documentos`, `check:metricas` (nada de "%" de ativação aqui; estas são medidas antropométricas, não ativação; manter unidades corretas). `npm run build` ok.

Aceite:
- Aba "avaliacoes" mostra tabela comparativa por datas (métricas × avaliações + delta colorido correto por direção).
- Botão gera PDF no padrão unificado (marca/CREF/selo/espinha), colunas cronológicas, disclaimers, sem travessão.
- Nenhum shape persistido alterado; `medidas.imc` lido como está.

---

## Resumo de migrações persistidas
| Onda | Store | Version | Remapeamento |
|---|---|---|---|
| H (item 8) | `pi-alunos` (`store.ts:575`) | 12 → 13 | `Aluno/plano/prescricao.objetivo`: `"Reabilitação/retorno"` → `"Retorno ao treino"` |
| I (item 6) | `pi-alunos` | 13 → 14 | `grupoEspecial`/`condicoesAtencao`/`sugestoesDispensadas`: `obesidade-grave` → `obesidade-grau-{1,2,3}` (por IMC; fallback grau 1); `hipertensao` → `hipertensao-estagio-{1,2}` (por PA; fallback estágio 1) |

H e I são as ÚNICAS que migram; devem rodar em série (H antes de I) para não colidir no `version`. Todas as outras ondas são zero-migrate.

## Verificação de referência pendente antes de codar
- Onda I (HAS): confirmar no SBC 2020 / PubMed os cortes exatos de estágio 1 e 2 e ampliar a `nota` de `sbc-2020` (`referencias.ts:57`) antes de hardcodar números.
- Onda F (aeróbio/flexibilidade): confirmar que `garber-2011` sustenta as recomendações de complemento; se algum número (frequência/duração) for citado e não coberto, verificar no PubMed e ampliar a `nota` ou adicionar ref real.
- Obesidade graus (Onda I): já coberto por `seidell-flegal-1997` + `who-imc-2004`, sem verificação nova.

Nota sobre o dossiê: os "Leitor 1" e "Leitor 4" vieram vazios ("teste"); a spec se apoia nos Leitores 2, 3 e 5 e nas minhas leituras diretas dos arquivos (nav.ts, classificador.ts, groupRules.ts, referencias.ts, periodizacao.ts, Home.tsx, Consulta.tsx, check-faixas.ts, store.ts, package.json).