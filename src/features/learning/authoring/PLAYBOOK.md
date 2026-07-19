# Fábrica de conteúdo do Aprender — Playbook

Este é o **padrão único** que todo conteúdo do Aprender segue. A skill
`aprender-conteudo` orquestra os agentes especialistas (`.claude/agents/aprender-*.md`);
todos leem este arquivo antes de trabalhar. O objetivo do Filipe: conteúdo **profissional,
cientificamente correto, completo e diferente do mercado** — não um resumo de curso, e sim
o copiloto de estudo que sustenta a decisão do profissional de Educação Física.

O teto de qualidade é a **[RUBRICA de excelência](./RUBRICA.md)**, não uma disciplina
específica. Nenhum conteúdo é bom por já existir: tudo, **inclusive a Fisiologia humana**, é
auditado contra a rubrica e só sobe quando atinge o nível "Excepcional" nas seis dimensões
(rigor, aplicação, pedagogia, **legibilidade**, imagem, voz). A Fisiologia é um bom ponto de
partida a ser superado, não o padrão intocável. Todo o conteúdo é autorado/revisado a partir
da **literatura**, não só do material que o Filipe já tem.

---

## 1. Princípios inegociáveis (valem para todos os agentes)

1. **Nunca inventar ciência.** Nenhum número (séries, %1RM, %FCmáx, VO2, prevalência),
   nenhuma referência, nenhum DOI, nenhum autor sai da cabeça. Tudo vem de fonte real,
   verificada. Onde a evidência é fraca ou divergente, **declare** ("evidência limitada",
   "achado de estudos pequenos"). Ver [[referencias-verificadas]] e a regra do PubMed.
2. **Prudente e não diagnóstica.** A ferramenta **apoia a decisão do profissional
   habilitado (CREF)**; não prescreve para o leigo, não reabilita, não diagnostica. Linguagem
   de apoio, não de ordem. Ver [[posicionamento-copiloto-decisao]].
3. **Sem travessão (—) em texto visível.** O fundador considera "cara de IA". Use vírgula,
   dois-pontos ou ponto. Vale também para respostas ao Filipe. Ver [[filipe-sem-travessoes]].
   O guardrail `npm run check:aprender` trava travessão.
4. **Aplicado à prescrição.** Cada aula responde a uma **pergunta de prescrição real** e
   termina dizendo o que muda no atendimento. Ciência que não vira decisão é enciclopédia,
   não este produto.
5. **Métricas com significado.** Ativação/força etc. sempre com faixa e unidade, via os
   componentes de métrica; nunca "%". Ver [[metricas-significado]] (`check:metricas` trava).
6. **Imagem certa pelo meio certo** (seção 4). SVG para o que fica bom em SVG; Lovable para
   o que não fica. Rótulo exato sempre por cima da imagem, nunca dentro dela.

---

## 2. Anatomia de uma aula (o molde `deepLesson`)

Toda aula é montada por `deepLesson(spec)` em `mocks/authoring.ts`, que gera a sequência de
blocos na ordem pedagógica. O agente redator preenche a `DeepLessonSpec`; não monta blocos à
mão. Campos (ordem de leitura na tela):

| Campo | O que é | Obrigatório |
|---|---|---|
| `hero` | frase de abertura que enquadra a relevância | sim |
| `question` | a pergunta de prescrição que a aula responde | forte recomendação |
| `concepts[]` | 1 ou 2 conceitos-chave (termo + definição) | sim |
| `figure` | id de uma figura da biblioteca (SVG ou webp) | quando ajuda o mecanismo |
| `mechanism` | passos do mecanismo. **Se seguir o padrão de núcleo do manual** (descrição, `Sequência: (1)…(4)`, `Relação:`, `Aplicação ao exercício:`, `Como medir:`, `Erro frequente:`) vira prancha de atlas automática (`nucleos.ts`) | 1 recurso visual principal |
| `comparison` / `chart` / `timeline` / `decisionTree` | recursos alternativos ao mechanism | escolher o que serve |
| `apply` | aplicação à prescrição | sim |
| `special[]` + `specialTitle` | "Medida e interpretação" ou "Em populações especiais" | quando cabe |
| `mistake` | erro frequente + o que fazer no lugar | sim |
| `professionalCase` | mini caso com 3 escolhas comentadas (tom recomendada/aceitável/cautela) | sim |
| `quiz[]` | 3 a 5 questões comentadas (helper `q`) | sim |
| `uncertainty` | o que ainda é incerto / limite da atuação | forte recomendação |
| `related[]` | conexões com outras aulas/disciplinas | sim |
| `refs[]` | ids de `references.ts` (verificadas) | sim, ≥ 3 reais |
| `applyRx` | resumo "aplicar no atendimento" | sim |

Um **módulo** agrupa aulas por `deepModule({ objective, lessons, … })`. Uma **disciplina**
é um arquivo `mocks/<slug>.ts` que exporta `<x>Modules` e `<x>Lessons`, registrado em
`mocks/index.ts`, com os metadados em `disciplines.ts`.

### O que diferencia do mercado (padrão de profundidade)
Uma aula "completa" deste produto tem, além do texto: **o mecanismo** (por que acontece), **a
medida** (o que a variável informa e onde ela cala), **a decisão** (o que muda na prescrição),
**o caso** (aplicação a um aluno real), **o erro frequente**, **o limite honesto** (incerteza)
e **a conexão** com o resto do sistema (exercícios, grupos especiais, avaliação). Curso comum
para no "o que é"; aqui vai até "o que eu faço com isso amanhã, e por quê".

---

## 3. Rigor científico (agente cientista)

- Buscar em **PubMed** (`mcp__plugin_bio-research_pubmed__*`), **Consensus**
  (`mcp__plugin_bio-research_consensus__search`) e, quando fizer sentido, bioRxiv/medRxiv.
  Preferir revisões sistemáticas, position stands (ACSM, OMS) e diretrizes.
- Toda referência entra em `mocks/references.ts` como `ScientificReference`, com
  `validationStatus: "validada"` **só depois** de confirmar título, autores, ano e periódico
  na fonte. Sem confirmação, `validationStatus: "a-validar"` (placeholder honesto, sem DOI
  inventado, exibido como "Referência a ser validada").
- **Faixas, não pontos.** Séries, repetições, %1RM, %FCmáx, durações, zonas: sempre como
  faixa citada, com o `refId` que a sustenta. Evidência fraca é declarada, não maquiada.
- Cada afirmação forte da aula tem uma referência que a sustenta. O revisor confere um a um.

---

## 4. Matriz de decisão de imagem (agente ilustrador)

Regra do Filipe: **o que fica bom em SVG faz em SVG; o que não fica bom em SVG, gera imagem no
Lovable.** Ver [[lovable-geracao-de-imagens]].

| Tipo de figura | Meio | Onde vive |
|---|---|---|
| Fluxograma, circuito de controle, rede de sistemas, eixo de feedback | **SVG** | componente em `figures/scientific.tsx` (`FigureDef.Comp`) |
| Gráfico de dados (curva de dissociação, potencial de ação, pressão-volume, comprimento-tensão) | **SVG** (preciso, plotado) | idem |
| Tabela, linha do tempo, pirâmide, barra de composição | **SVG** | idem |
| Ilustração anatômica realista (músculo, órgão, corte histológico, corpo em posição) | **Lovable** (img2img) | webp em `public/figuras/`, referenciado por `FigureDef.img.src` |
| Foto/boneco de execução, erro, variação de exercício | **Lovable** | seguir a skill `imagens-lovable` (workspace da Ellen, img2img, comparação lado a lado) |

**Rótulos:** IA erra texto e inventa rótulo. Toda figura Lovable nasce **sem texto**; o rótulo
exato entra por cima, no app (padrão da camada de marcadores do mapa muscular). Nunca aceitar
letra/número dentro da imagem gerada.

Verificação obrigatória de imagem: baixar da URL **publicada** do Lovable (não do preview),
conferir com os próprios olhos (Read no scratchpad), só então converter para webp e integrar.
A skill `imagens-lovable` tem o pipeline completo e os erros já cometidos.

---

## 5. Pipeline (o que a skill `aprender-conteudo` executa)

Para cada disciplina (ou módulo, ou aula) que o Filipe pedir:

1. **Blueprint** — `aprender-arquiteto` desenha o mapa: módulos, aulas, objetivos,
   pré-requisitos, sequência, a pergunta de prescrição de cada aula, e onde cada aula precisa
   de figura/caso/comparação. Marca o que torna a disciplina diferente do mercado. Saída: um
   plano em `authoring/planos/<slug>.md`.
2. **Dossiê de evidências** — `aprender-cientista` levanta, por aula, as referências reais
   verificadas e as faixas citáveis; declara onde a evidência é fraca. Alimenta `references.ts`.
3. **Redação** — `aprender-redator` preenche as `DeepLessonSpec` (TS) no arquivo
   `mocks/<slug>.ts`, na voz da casa, aplicando a ciência à prescrição.
4. **Ilustração** — `aprender-ilustrador` decide SVG vs Lovable por figura, autora as SVG e
   gera/integra as webp, garante rótulo honesto.
5. **Design de leitura** — `aprender-designer-leitura` transforma prosa em texto fácil de
   ler e absorver: negrito no que decide, quebras de parágrafo, blocos estruturados no lugar
   de listas em prosa, figura onde ajuda. Usa a camada `richtext` e o guardrail
   `check:legibilidade`. É a dimensão 4 da rubrica.
6. **Revisão crítica** — `aprender-revisor` confere cada afirmação contra a referência,
   linguagem, pedagogia, **legibilidade** e guardrails; devolve lista de correções; volta ao
   passo pertinente até zerar.
7. **Integração + validação** — `aprender-integrador` registra em `index.ts` e ajusta as
   contagens em `disciplines.ts`, roda `tsc`, `npm run build`, `check:metricas`,
   `check:nucleos`, `check:aprender`, e faz o QA no navegador. Publica por onda.

Cada passo é um agente separado, com contexto próprio; a skill costura a ordem e passa o
blueprint adiante. O arquiteto e o revisor podem rodar em paralelo com leituras; redação e
ilustração de aulas diferentes também paralelizam.

---

## 6. Definição de pronto (o portão)

Uma disciplina só é "pronta" quando:

- [ ] Todas as aulas têm os campos obrigatórios da seção 2 preenchidos (0 placeholder).
- [ ] Toda afirmação forte tem referência real; **0 referência `a-validar`** numa disciplina
      declarada pronta; DOIs conferidos.
- [ ] Toda figura referenciada existe (SVG registrada ou webp integrada e conferida a olho).
- [ ] `disciplines.ts` reflete as contagens reais (`moduleCount`, `lessonCount`, `caseCount`,
      `status`, `reviewedAt`, `reviewedBy`).
- [ ] **Legibilidade no teto** (dimensão 4 da rubrica): nada de parede de texto; negrito no
      que decide, quebras, blocos estruturados. `check:legibilidade` sem parede extrema e com
      o backlog de paredes advisórias tratado na disciplina entregue.
- [ ] `npx tsc --noEmit`, `npm run build`, `check:metricas`, `check:nucleos`,
      `check:aprender` e `check:legibilidade` verdes.
- [ ] Navegador (1440 e 390): abre, sem erro de console, sem overflow, teclado e foco ok.
- [ ] Sem travessão em texto visível. Linguagem prudente e aplicada.

`check:aprender` automatiza travessão, figura/ref inexistente e placeholder; `check:legibilidade`
mede as paredes de texto. O julgamento científico e pedagógico é do revisor.

---

## 7. Backlog

O estado e o alvo de cada uma das 20 disciplinas ficam em
[`curriculo.md`](./curriculo.md). O molde de um arquivo de disciplina novo está em
[`TEMPLATE-disciplina.md`](./TEMPLATE-disciplina.md).
