# Rubrica de excelência do Aprender — o teto de qualidade

**O teto NÃO é "a Fisiologia humana".** O teto é esta rubrica. Nenhum conteúdo é considerado
bom por já existir: tudo, inclusive a Fisiologia, é auditado contra os critérios abaixo e só
sobe quando atinge o nível **Excepcional** em todas as dimensões. O alvo do Filipe é
excepcional, não "aceitável".

Cada aula é avaliada em seis dimensões, em três níveis. "Bom" reprova; a meta é "Excepcional".

## 1. Rigor científico
- **Insuficiente:** afirmação sem fonte; número solto; referência genérica ou não conferida.
- **Bom:** referências reais; faixas citadas.
- **Excepcional:** cada afirmação forte rastreável à referência que a sustenta; números como
  faixas com o `refId`; divergências e limites de evidência **declarados**; fontes recentes e
  de alto nível (revisão sistemática, position stand, diretriz), conferidas no PubMed.

## 2. Aplicação à decisão
- **Insuficiente:** descreve "o que é" e para aí.
- **Bom:** tem uma seção de aplicação.
- **Excepcional:** a aula nasce de uma **pergunta de prescrição real** e responde a ela; o
  profissional sai sabendo o que muda no atendimento amanhã e por quê; conecta ao motor, à
  avaliação, ao semáforo e a outras aulas.

## 3. Estrutura pedagógica
- **Insuficiente:** texto único sem progressão.
- **Bom:** tem conceito, mecanismo e quiz.
- **Excepcional:** conceito → mecanismo → medida (o que informa e onde cala) → decisão → caso
  real → erro frequente → limite honesto → conexão; quiz e caso que **ensinam**, não só
  cobram; nada de placeholder.

## 4. Legibilidade e visualização (a "estrutura de leitura")
- **Insuficiente:** parágrafo gigante corrido; nada em negrito; sem quebra; sem imagem onde
  ela ajudaria.
- **Bom:** parágrafos separados.
- **Excepcional:** o olho encontra o que decide em segundos. Ver o padrão de leitura abaixo.

## 5. Imagem
- **Insuficiente:** sem figura onde o mecanismo pede; ou figura que ensina o contrário do texto.
- **Bom:** figura correta.
- **Excepcional:** meio certo (SVG para esquema/dado, Lovable para anatomia realista), rótulo
  exato por cima e nunca dentro da imagem, legenda que fecha o raciocínio.

## 6. Voz e linguagem
- **Insuficiente:** tom de ordem ou de diagnóstico; jargão sem tradução; travessão.
- **Bom:** linguagem clara.
- **Excepcional:** prudente e não diagnóstica (apoia o CREF), respeitosa com o aluno, siglas
  explicadas, zero travessão, cada palavra a serviço da compreensão.

---

## Padrão de leitura (dimensão 4, detalhado)

O texto é material de design, não parede. Ferramentas disponíveis (camada
`features/learning/richtext`):

- **Negrito** com `**...**` para ancorar o que **decide** (a ação, o número que importa, o
  limite). Regra: 1 a 3 âncoras por parágrafo, nunca uma frase inteira em negrito.
- **Quebra de parágrafo** com linha em branco (`\n\n`): nenhum trecho de prosa passa de ~2 a 3
  frases sem respiro. Um parágrafo de "aplicação" que junta o princípio e a resposta ao caso
  vira dois.
- **Blocos estruturados** em vez de prosa quando o conteúdo é lista, comparação, sequência,
  linha do tempo ou tabela: use os blocos próprios (`comparison`, `chart`, `timeline`,
  `short_text`, prancha de núcleos), não um parágrafo que descreve a lista.
- **Figura** onde o mecanismo é espacial ou o dado é uma curva.
- **Ritmo:** título de seção, conceito em cartão, mecanismo em prancha, medida em cartões,
  caso, quiz. O leitor nunca encara mais de um bloco de texto denso seguido.

O guardrail `npm run check:legibilidade` mede isto: aponta "paredes" (prosa longa sem quebra e
sem negrito) para o agente de leitura tratar, e reprova paredes extremas.

---

## Revisão crítica da Fisiologia humana (honesta)

O Filipe questionou se esse conteúdo é de fato bom. Auditando contra a rubrica:

- **Forte:** rigor (digitalização do manual, referências reais), estrutura de núcleos
  mecanísticos (agora em prancha de atlas), e a seção "medida e interpretação" (o que a
  variável informa e onde cala) é um diferencial real de mercado.
- **Abaixo do teto:** **legibilidade**. Vários campos de "Aplicação à prescrição" e de
  "incerteza" eram parágrafos únicos e longos (medido: 21 paredes só na Fisiologia), sem
  negrito e sem quebra. A camada de leitura foi construída e o capítulo do sistema nervoso foi
  levado ao teto como referência; os demais capítulos passam pelo mesmo tratamento via a
  fábrica (agente de leitura).
- **A revisar pela fábrica:** confirmar que cada número ainda bate com a fonte citada e que
  cada aula tem caso e limite à altura; a Fisiologia entra na fila de auditoria como qualquer
  outra disciplina, não como padrão intocável.

Conclusão: a Fisiologia é um bom ponto de partida, não o teto. O teto é esta rubrica.
