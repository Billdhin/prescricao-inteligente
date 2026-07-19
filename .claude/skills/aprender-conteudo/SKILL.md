---
name: aprender-conteudo
description: Fábrica de conteúdo do Aprender do Prescrição Inteligente. Use SEMPRE que o Filipe pedir para criar, completar ou reescrever o conteúdo de uma disciplina, módulo ou aula do Aprender. Orquestra os agentes especialistas (arquiteto, cientista, redator, ilustrador, revisor, integrador) no padrão profissional, cientificamente correto e completo, com as imagens certas (SVG ou Lovable).
---

# Fábrica de conteúdo do Aprender

Isto é acionado quando o Filipe diz algo como "crie o conteúdo da disciplina X", "complete o
módulo Y do Aprender" ou "reescreva a aula Z no padrão". O objetivo dele: conteúdo
**profissional, cientificamente correto, completo e diferente do mercado**, no teto de
qualidade da disciplina Fisiologia humana.

## Antes de tudo, leia
1. `src/features/learning/authoring/RUBRICA.md` — **o teto de qualidade** (seis dimensões,
   nível Excepcional). O padrão NÃO é a Fisiologia; é a rubrica. Tudo é auditado contra ela.
2. `src/features/learning/authoring/PLAYBOOK.md` — o padrão operacional (voz, molde da aula,
   rigor científico, matriz de imagem, padrão de leitura, definição de pronto). **Manda em tudo.**
3. `src/features/learning/authoring/curriculo.md` — o backlog: estado e alvo das 20 disciplinas.
4. `src/features/learning/authoring/TEMPLATE-disciplina.md` — o molde de um arquivo de disciplina.

## Como decidir o escopo
- Se o Filipe nomeou uma **disciplina**, rode o pipeline inteiro para ela.
- Se nomeou um **módulo** ou **aula**, rode só os passos pertinentes (o blueprint pode já
  existir no plano da disciplina).
- Se não nomeou nada, mostre o backlog de `curriculo.md` e pergunte por qual começar.

## Pipeline (os seis agentes, em `.claude/agents/aprender-*.md`)
Acione cada um pela ferramenta Agent com o `subagent_type` correspondente. Passe adiante o que
o anterior produziu.

1. **`aprender-arquiteto`** → blueprint da disciplina em `authoring/planos/<slug>.md` (módulos,
   aulas, pergunta de prescrição de cada aula, onde entra figura/caso, o que a diferencia).
2. **`aprender-cientista`** → dossiê de evidências por aula + referências reais verificadas em
   `references.ts`. Nunca inventa DOI/número.
3. **`aprender-redator`** → as aulas em `mocks/<slug>.ts` com `deepLesson`, na voz da casa,
   aplicadas à prescrição. Só usa o que o cientista verificou.
4. **`aprender-ilustrador`** → figuras: SVG para o que fica bom em SVG, Lovable (img2img, skill
   `imagens-lovable`) para anatomia realista; rótulo exato por cima, nunca dentro da imagem.
5. **`aprender-designer-leitura`** → transforma prosa em texto fácil de ler: negrito no que
   decide, quebras de parágrafo, blocos estruturados no lugar de listas em prosa (camada
   `richtext` + `check:legibilidade`). Zera as paredes de texto.
6. **`aprender-revisor`** → revisão adversarial (ciência × referência, linguagem, pedagogia,
   legibilidade, guardrails). Devolve correções e **bloqueia** até zerar; volte e repita.
7. **`aprender-integrador`** → registra em `index.ts`/`disciplines.ts`, roda `tsc` + `build` +
   `check:aprender`/`check:nucleos`/`check:metricas`/`check:legibilidade`, faz o QA no navegador
   (mover `.env` de lado e restaurar) e publica por onda.

Paralelize onde não há dependência (ex.: redação e ilustração de aulas diferentes; leituras do
arquiteto e do cientista). Não pule o revisor: ele é o portão de qualidade.

## Regras que nenhum agente pode quebrar
- **Nunca inventar ciência** (número, referência, DOI, autor). Sem fonte, declarar a lacuna.
- **Prudente e não diagnóstica:** apoia o profissional (CREF), não manda no leigo.
- **Sem travessão (—)** em texto visível. `npm run check:aprender` trava.
- **Imagem certa pelo meio certo;** rótulo honesto por cima, nunca dentro da imagem gerada.
- **Definição de pronto** da seção 6 do playbook cumprida antes de publicar.

## Ao terminar uma disciplina
Marque-a como feita em `curriculo.md`, atualize `disciplines.ts` e relate ao Filipe o que
subiu, com o marcador do bundle no ar.
