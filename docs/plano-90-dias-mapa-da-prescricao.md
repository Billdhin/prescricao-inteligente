# Mapa da Prescrição — Plano operacional de 90 dias

**Calibrado para:** assinatura SaaS pura (sem produto de entrada) · verba de mídia de R$ 1.000 a R$ 3.000/mês · Filipe como rosto e autoridade técnica (CREF) · audiência própria no Instagram/TikTok e rede pessoal, mas zero clientes pagantes hoje.
**Data:** 5 de agosto de 2026 · **Meta do trimestre:** 100 assinantes fundadores e MRR de ~R$ 5.750.

---

## A consequência das suas respostas

Três escolhas mudam o plano de forma concreta.

**Você escolheu SaaS puro, sem produto de entrada.** Isso é a decisão certa para o valuation e para o foco, mas tem um custo de caixa que precisa ser dito: você não terá um produto de R$ 297 pagando o tráfego nos primeiros meses. A verba de mídia sai do seu bolso e só se paga por volta do mês 4 ou 5. Com R$ 2.000/mês, são R$ 6.000 no trimestre, e a matemática realista devolve entre 8 e 35 assinantes vindos de anúncio. **Os outros 65 a 90 têm que vir de graça.** Por isso o plano abaixo coloca o orgânico e a rede como canal principal e o anúncio como canal de apoio — o inverso do que a maioria faz.

**Filipe é o rosto, e ele tem CREF.** Este é, de longe, o seu ativo mais subaproveitado. Um profissional registrado que mostra o motor decidindo em casos reais resolve, de uma vez, três problemas: a ausência de prova social, a exigência do art. 4º do Código de Ética (nome e registro na publicidade) e o custo de aquisição. Nenhum concorrente tem isso — MFIT, Vedius e Treino Mestre são marcas sem rosto técnico. **O conteúdo do Filipe é o canal, não o apoio ao canal.**

**Você tem audiência mas não tem clientes.** Audiência que não converte geralmente é audiência de aluno, não de profissional. A primeira coisa a fazer é descobrir qual é a sua: publique dois ou três conteúdos abertamente técnicos, dirigidos a quem prescreve, e veja quem responde. Se a audiência for de aluno final, ela serve de alcance mas não de pipeline, e o plano se apoia mais na rede pessoal e no SEO.

---

## Divisão de verba

Com R$ 2.000/mês (ponto médio da sua faixa), a alocação que faz sentido:

| Item | Mês 1 | Mês 2 | Mês 3 | Por quê |
|---|---:|---:|---:|---|
| Ferramentas fixas (gateway, e-mail, Arcade/demo) | R$ 400 | R$ 400 | R$ 400 | Gateway ~2-4% por transação, não custo fixo alto |
| Mídia paga | **R$ 0** | **R$ 800** | **R$ 1.600** | Não anuncie antes do checkout existir e do funil converter |
| Produção de conteúdo (edição, design) | R$ 600 | R$ 500 | R$ 400 | Cai conforme o Filipe pega ritmo |
| Reserva / evento (Fitness Brasil Expo) | R$ 1.000 | R$ 300 | — | 27–29 de agosto, São Paulo |

O mês 1 sem anúncio nenhum não é economia — é sequência. Rodar mídia para uma página que não tem checkout, não tem prova social e não tem onboarding é comprar visita para um funil furado.

---

## Mês 1 (agosto) — destravar e provar que alguém paga

**Meta: checkout funcionando, página nova no ar, 15 assinantes fundadores vindos da rede.**

### Semana 1 — o que só você pode fazer

Contratar o gateway (Asaas ou Vindi), abrir ou regularizar o CNPJ, e mandar os Termos e a Política para um advogado. Esses três itens têm prazo de terceiros e por isso começam no dia 1, não no dia 20.

Em paralelo, **o Filipe grava a carta do fundador em vídeo e escreve a versão em texto.** Cento e cinquenta a duzentas palavras em primeira pessoa: o caso concreto que fez isso começar — o aluno, a dúvida, o momento em que ficou claro que não havia nada por escrito. Isso vira a seção da página, o vídeo de apresentação e o primeiro post.

E monte a **lista dos 60**. Sessenta nomes de profissionais de Educação Física que vocês dois conhecem pessoalmente ou por dois graus de separação. Não é lista de e-mail marketing — é lista de conversa. Coluna com nome, como conhece, se atende aluno com comorbidade, e status.

### Semana 2 — a página

Reconstruir na ordem de impacto: barra sticky de CTA (o maior ganho isolado que existe, +11%), menu mobile e "Entrar" visível (hoje simplesmente não existem a 390px), hero novo com rótulo de categoria, faixa de credibilidade com o CREF do Filipe, seção de demonstração do mecanismo trazendo os casos da `/casos-rcd`, e comparativo em três colunas.

Duas coisas técnicas que valem o mesmo que copy: **code splitting** (o bundle único de 2,9 MB está segurando o LCP no celular, e páginas acima de 4 segundos convertem a 1,7% contra 4,4% abaixo de 1 segundo) e **capturas reais do produto** substituindo os mockups em HTML.

O protótipo que te entreguei já tem a copy pronta e as especificações anotadas — ele serve como briefing direto de implementação.

### Semana 3 — a oferta e o trial

Atualizar `planos.ts` para a nova tabela (R$ 129 mensal, R$ 1.164 anual, R$ 690 fundador, 100 vagas), ligar o contador real de vagas, unificar `/pricing` com a seção de planos da home, e linkar `/roi` e `/casos-rcd` na navegação.

E construir o **onboarding de dia 1**, que é a peça de maior retorno do mês inteiro: cadastrar aluno → fazer o semáforo → gerar o prontuário → exportar o PDF. Ativação explica de 60% a 75% da variação entre trial e pagamento; trials ativados convertem entre 35% e 65%, os não ativados entre 2% e 8%. Você já tem a métrica definida no código — "Primeiro Caso Real resolvido em menos de 10 minutos". Transforme em checklist visível na conta nova, com um aluno de demonstração já carregado.

### Semana 4 — as primeiras vendas, à mão

Abrir a coorte de fundadores e **conversar com as 60 pessoas da lista, uma por uma**. As vinte primeiras por videochamada, com onboarding assistido ao vivo. Isso não escala e é exatamente por isso que funciona: cada conversa dessas vale mais que qualquer relatório de analytics, porque você ouve a objeção antes de ela virar churn.

**Fitness Brasil Expo, 27 a 29 de agosto, Transamerica Expo Center, São Paulo.** Quarenta mil visitantes, trilha própria de Personal Training. Mesmo sem estande, três dias com o notebook aberto e a demo rodando provavelmente é o menor custo de aquisição disponível no seu nicho o ano inteiro. Se der para conseguir um espaço pequeno, consiga. Leve um QR code que vá direto para a oferta de fundador.

**Marco do mês: 15 assinantes e três depoimentos reais** — com nome, CREF e cidade, sobre um fato, não sobre um sentimento.

---

## Mês 2 (setembro) — o motor de conteúdo do Filipe

**Meta: 45 assinantes acumulados, ritmo de publicação estabelecido, primeiro teste de anúncio.**

### O formato que resolve tudo de uma vez

Um caso por semana, sempre a mesma estrutura, sempre com o Filipe na tela:

> "Aluno de 58 anos, hipertensão estágio 1, tomando betabloqueador, quer emagrecer. Você monta o treino como? *(mostra o semáforo rodando)* Olha o que o sistema faz: como ele toma betabloqueador, a frequência cardíaca deixa de guiar a intensidade e entra a percepção de esforço. E aqui está a diretriz que sustenta isso."

Isso funciona porque não é anúncio, é aula. Quem entende reconhece imediatamente que há rigor por trás, e quem não entende aprende algo útil. O produto aparece como consequência, não como pedido.

**Ritmo sustentável:** um vídeo longo por semana (Reels de 60-90s e a versão de 3-4 minutos para YouTube), três cortes por semana, e dois carrosséis técnicos. O ponto não é volume, é constância e consistência de formato.

**Cinco ângulos que valem rodar** (todos livres de risco regulatório):

O contraste com a Fisioterapia — a Fisioterapia guarda prontuário por cinco anos por obrigação, a Educação Física não, e nos tribunais absolve-se quem consegue provar orientação e avaliação prévia. O anti-IA — todo mundo está lançando gerador de treino com IA, e vocês fizeram o contrário, um sistema que obriga a justificar. O que foi descartado — nenhum concorrente registra os exercícios *não* escolhidos e o motivo, e é o detalhe que mais impressiona quem entende. A pergunta do médico — o médico do seu aluno pediu para ver o que você prescreveu, o que você manda? E o caso rodando puro, só a tela, sem narração.

### O primeiro anúncio: R$ 800, só retargeting e topo barato

Com essa verba não dá para testar tudo. Duas campanhas apenas:

**Retargeting** de quem viu 50% de um vídeo do Filipe ou visitou `/casos-rcd` (R$ 400/mês). É o público mais barato e mais quente que você terá. Criativo: a carta do fundador e a garantia.

**Topo de funil** com o melhor vídeo orgânico do mês, impulsionado (R$ 400/mês), segmentado por **interesse em Educação Física e musculação, não por cargo** — isso te coloca em CPM de R$ 18-25 em vez dos R$ 45 da segmentação B2B. Destino: `/casos-rcd`, sem cadastro, para construir público de retargeting.

Duas armadilhas da Meta que vão te custar tempo se descobrir depois. A primeira: nunca escreva "seu aluno hipertenso" no criativo — o classificador de atributos pessoais reprova. Descreva o serviço ("sistema de prescrição com triagem de liberação para alunos com comorbidade") e guarde a copy emocional para a landing page. A segunda, menos conhecida: **nomeie eventos e públicos de forma neutra** — `lead_fundador`, `trial_iniciado`, jamais `hipertensao` ou `comorbidade`. Desde setembro de 2025 a Meta bloqueia públicos e conversões cujos metadados sugiram condição de saúde, e aprovar o anúncio não desbloqueia o dado. São dois sistemas independentes.

### E o SEO começa agora

Levar a `/casos-rcd` de 6 para 20 casos neste mês, ancorados em buscas reais: "treino para hipertenso", "exercício para diabético tipo 2", "musculação para idoso com osteoartrite", "exercício com betabloqueador", "treino para obesidade grau III". Cada caso roda o motor de verdade, prova o mecanismo, não pede cadastro e ranqueia. Foi assim que o iClinic construiu um exit de R$ 182,7 milhões com 23 mil clientes a ~R$ 100/mês.

Cuidado com a URL: `/hipertensao` é convite a ser classificado como domínio de saúde sensível pela Meta. Use `/casos/prescricao-hipertensao-estagio-1`.

**Marco do mês: 45 assinantes, 20 casos publicados, primeiro CAC medido de verdade.**

---

## Mês 3 (outubro) — escalar o que funcionou

**Meta: 100 assinantes fundadores, coorte fechada, CAC conhecido.**

Com R$ 1.600 de mídia, dobre no criativo que teve melhor custo por trial no mês 2 e acrescente **Google Ads de fundo de funil** (R$ 400): "app para personal trainer", "prontuário personal trainer", "sistema de prescrição de exercício", "software avaliação física". O CPC brasileiro nesses termos deve ficar entre R$ 1,50 e R$ 4,00 — e vale saber que, pela primeira vez em cinco anos, o CPL médio caiu, com Educação registrando a maior queda de CPC do ano.

Este é também o mês de **abrir as parcerias acadêmicas**, que rendem em 2027 mas precisam começar agora. O playbook é o da Nutrium, que dá acesso gratuito ao software durante toda a graduação e 50% de desconto no primeiro ano após a formatura, e já fechou oito instituições brasileiras. O seu público declarado — recém-formado que atende aluno com comorbidade — é literalmente quem sai desses cursos. Dez a vinte coordenações de bacharelado em Educação Física constroem pipeline de três a cinco anos com custo de aquisição próximo de zero. Comece pelas faculdades onde o Filipe tem contato.

E **feche a coorte em 100**. Pare de verdade. A escassez que você anunciou é a primeira promessa que o mercado vai testar, e uma marca inteiramente construída sobre honestidade demonstrável não sobrevive a um contador que reinicia.

---

## O que acompanhar

Três números, semanalmente, e nada mais até haver volume:

**Ativação** — percentual de trials que resolvem o Primeiro Caso Real em menos de dez minutos. Meta acima de 50%. É a métrica que explica quase todo o resto, e a única que você pode consertar sem gastar dinheiro.

**Mix anual** — percentual das novas assinaturas em plano anual. Meta acima de 50%. É o antídoto contra o churn de ~6% ao mês típico da sua faixa de ticket: retenção em doze meses vai de 68% no mensal para 92% no anual.

**Trial para pago** — meta acima de 14%, que é a mediana de trial sem cartão. Se cair para 5%, o problema é ativação, não anúncio.

---

## O maior risco deste plano

Não é o CAC nem a concorrência. É o Filipe parar de publicar no mês 2.

O plano inteiro se apoia num motor de conteúdo que depende de uma pessoa gravar toda semana, sem retorno visível nas primeiras seis a oito semanas, enquanto o gráfico de assinantes anda devagar. É exatamente aí que quase todo mundo desiste e migra a verba para anúncio — que, com R$ 2.000/mês e sem produto de entrada, não sustenta o negócio sozinho.

Duas defesas práticas. Grave em lote: uma tarde de gravação por mês rende quatro casos, e o Filipe nunca fica na posição de "preciso gravar hoje". E fixe um compromisso público de doze semanas, porque o SEO e o conteúdo começam a devolver entre o quarto e o nono mês, não no segundo.

---

## Sequência de decisões, em uma linha cada

Semana 1: gateway contratado, CNPJ encaminhado, advogado briefado, carta do fundador escrita, lista dos 60 montada.
Semana 2: página nova no ar com sticky CTA, menu mobile, casos na home e code splitting.
Semana 3: nova tabela de preços, contador de fundadores, trial de 14 dias e onboarding de dia 1.
Semana 4: coorte aberta, 60 conversas iniciadas, Fitness Brasil Expo.
Mês 2: um caso por semana com o Filipe, R$ 800 em retargeting e topo barato, `/casos-rcd` de 6 para 20.
Mês 3: dobrar no criativo vencedor, Google Ads de fundo de funil, parcerias acadêmicas abertas, coorte fechada em 100.
