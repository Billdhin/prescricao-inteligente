# Mapa da Prescrição — Escopo Comercial Completo

**Preparado para:** Filipe · **Data:** 5 de agosto de 2026
**Base:** auditoria do repositório (~85.700 linhas de código, 404 commits), renderização da página no ar, e pesquisa de mercado com fontes primárias (concorrentes, CONFEF/SEBRAE/ACSM, benchmarks de SaaS 2026, jurisprudência, políticas de anúncio).

---

## Sumário executivo — as 7 decisões que importam

1. **O produto está pronto e o negócio está travado.** Todos os botões "Assinar" levam para `/dashboard` sem cobrar. Não existe gateway de pagamento. Nada mais nesta análise importa até isso ser resolvido. Prazo sugerido: 15 dias.
2. **Você não está no mercado que acha que está.** Apps de treino para personal custam R$ 0 a R$ 79,90 (MFIT R$ 39,90 ilimitado, Vedius R$ 79,90, três concorrentes gratuitos com alunos ilimitados). Se você se apresentar como "app de prescrição", R$ 97 perde a comparação em 5 segundos. Seu comparável real é **iClinic (R$ 99–299/mês para médicos)** e **SimplesVet (R$ 157+)**: software de registro clínico, não de produtividade.
3. **Preço recomendado: R$ 129/mês de tabela, R$ 1.164/ano (= R$ 97/mês) como plano empurrado, R$ 690/ano para os 100 Fundadores.** O erro atual é ter R$ 97 mensal com R$ 590 anual — 49% de desconto destrói a percepção do preço mensal e deixa dinheiro na mesa.
4. **Seu maior risco não é CAC, é churn.** R$ 97/mês cai na faixa de ARPA com pior retenção do benchmark global (~6%/mês = perder 53% da base em um ano). O plano anual não é uma alavanca de receita, é o antídoto: 92% de retenção em 12 meses contra 68% no mensal.
5. **A página tem três problemas críticos e um deles é gratuito de resolver.** Zero prova social, zero screenshot real do produto, e 4.958 pixels de rolagem sem um único CTA. Além disso a `/roi` e a `/casos-rcd` — seus dois melhores ativos de conversão — não recebem um link sequer da home.
6. **O gancho jurídico é legítimo, mas o enquadramento atual erra o alvo.** Não existe resolução do CONFEF obrigando prontuário na Educação Física (a Fisioterapia tem, COFFITO 414/2012, guarda de 5 anos). O argumento honesto e mais forte não é "você vai ser processado" — é "a prescrição do personal é obrigação de meio, e nos tribunais absolve-se exatamente quem consegue provar que orientou e avaliou".
7. **Existe um playbook pronto para copiar, e é o da Nutrium + iClinic.** Conteúdo técnico + SEO construiu um exit de R$ 182,7 milhões com 23 mil clientes a ~R$ 100/mês. Parceria com faculdades de bacharelado (acesso grátis na graduação) constrói pipeline de 3 anos com CAC próximo de zero.

---

# Parte 1 — Diagnóstico

## 1.1 O que você tem nas mãos

O código conta uma história melhor que a landing page. São 97 exercícios catalogados, 23 condições de saúde com regra e fonte declaradas, 82 referências científicas conferidas no PubMed, 11 classes de fármacos com efeito sobre o instrumento de monitoramento, 20 protocolos, 5 modelos de periodização, e 24 guardrails automatizados que travam a publicação se qualquer regra ficar sem fonte. Isso não é um MVP. É um produto com rigor acima da média do setor.

Mais importante: você tem um **mecanismo nomeado e proprietário** — o Motor RCD, Raciocínio Clínico Documentado — e três diferenciais que nenhum concorrente brasileiro tem:

| Diferencial | Situação competitiva |
|---|---|
| **Semáforo de liberação diário** (4 perguntas, pior resposta define a cor, vermelho fica pendente) | Nenhum concorrente brasileiro tem readiness diário. **Lacuna real.** |
| **Justificativa + referência científica ao lado de cada escolha** (incluindo os exercícios *descartados* e o porquê) | Nenhum concorrente exibe bibliografia junto à prescrição. **Lacuna real.** |
| **Prontuário de Decisão Técnica assinável** (nome + CREF + ID do documento + versão do motor) | Só o Vedius nomeia "prontuário eletrônico", e o vende como organização, não como defesa técnica. **Lacuna real.** |

E três coisas que você acha que são diferenciais mas **são commodity — pare de vendê-las como se fossem**:

- **App do aluno com marca branca**: Treino Mestre entrega por R$ 19,90, Personal Fit por R$ 49,90, Wiki4Fit usa isso como único eixo de tier.
- **Periodização**: O Personal Digital, Treino Mestre, TreinoAI e a Plataforma Treino Inteligente já têm.
- **Avaliação postural por visão computacional**: PersonalGO tem body scan por IA, Vibe Fit tem análise postural, e o Body Move faz por **R$ 39,90 vitalício**. Mantenha como *feature de encantamento*, nunca como razão de compra.

## 1.2 Os bloqueadores

| # | Bloqueador | Impacto | Prazo |
|---|---|---|---|
| 1 | **Sem gateway de pagamento.** "Assinar" → `/dashboard` | Receita = R$ 0 | 15 dias |
| 2 | **Sem CNPJ, razão social, endereço e foro** nos Termos e no rodapé | Não pode cobrar legalmente; publicidade sem identificação | 15 dias |
| 3 | **Termos e Política sem revisão jurídica** (declarado no próprio código); enquadramento controlador/operador de dado sensível de saúde "a definir" | Você guarda pressão arterial, dor, medicação e **fotos do corpo** de terceiros | 30 dias |
| 4 | **Fotos de avaliação gravadas como dataURL dentro de JSONB** (dívida técnica declarada no README) | Risco de LGPD e de performance | 45 dias |
| 5 | **Zero framework de testes** (sem vitest/jest/playwright) | As reviews dos concorrentes mostram que se perde cliente por instabilidade, não por falta de feature. Um produto vendido como *respaldo* não pode cair. | 60 dias |
| 6 | **Catálogo com buracos visíveis**: manguito rotador inteiro = 0 exercícios, trapézio inferior = 0, kettlebell/TRX/bola = 0 | O primeiro comprador que buscar "manguito" perde a confiança | 45 dias |
| 7 | **16 das 20 disciplinas do Aprender estão vazias** (só 4 módulos e 18 aulas autorados) | Não venda o que não existe — ou preenche, ou tira do pitch | contínuo |

## 1.3 O paradoxo do preço

R$ 97/mês colocado ao lado dos concorrentes:

| Produto | Preço/mês | Público | Comparação |
|---|---:|---|---|
| Taí Personal | R$ 0 | Personal | grátis, alunos ilimitados |
| Treino Mestre (anual) | R$ 19,90 | Personal | marca branca inclusa |
| MFIT ilimitado | R$ 39,90 | Personal | ~200 mil PTs alegados |
| Personal Fit Premium | R$ 49,90 | Personal | alunos ilimitados |
| O Personal Digital (anual) | R$ 39,90 | Personal | ilimitado |
| PersonalGO PRO | R$ 79,90 | Personal | body scan por IA |
| **Vedius** | **R$ 79,90** | Personal + fisio + pilates | **único com "prontuário eletrônico" nomeado — vigie** |
| **Mapa da Prescrição** | **R$ 97** | **PEF com CREF, foco em comorbidade** | — |
| iClinic Starter | R$ 99 | Médico | prontuário eletrônico |
| iClinic Plus | R$ 129 | Médico | |
| SimplesVet Petshop Básico | R$ 157 | Veterinário | |
| Nexur Plus | R$ 199,90 | Personal avançado | até 150 alunos, app nas lojas |

Duas leituras opostas do mesmo número. Na categoria "app de treino", R$ 97 é 2,4× o líder e você perde. Na categoria "software de registro clínico profissional", R$ 97 é **mais barato que o iClinic Starter** e você ganha. **A categoria é a decisão comercial mais importante do produto — mais importante que o preço em si.**

A boa notícia é que a categoria certa também é a verdadeira. Você não construiu um gerador de treino; construiu um sistema de raciocínio documentado. A frase que está no comentário do seu próprio código já é o posicionamento inteiro: *"O ChatGPT te dá um treino. Isto é um registro que você pode assinar."*

## 1.4 O que sustenta o preço (a matemática do cliente)

- Hora-aula de personal no Brasil: **R$ 60 a R$ 190** (média nacional), acima de R$ 250 em nicho premium de capital.
- Consultoria online mensal: **R$ 150 a R$ 400**.
- Híbrido: **R$ 280 a R$ 650/mês**.

R$ 97/mês é **uma hora-aula** ou **um terço de uma consultoria online**. O enquadramento "menos que uma hora de aula por mês", que você já usa, está correto. Mas note que o concorrente entrega o argumento inverso de graça: R$ 39,90 é meia aula. Por isso o enquadramento sozinho não basta — ele precisa vir depois de o comprador ter entendido que são categorias diferentes.

A `/roi` que você já construiu resolve isso melhor que qualquer copy: profissionais especializados cobram 15% a 30% a mais por sessão, e o ganho de um mês paga oito meses do plano. **Esse cálculo precisa estar na home, não escondido numa rota órfã.**

---

# Parte 2 — Posicionamento

## 2.1 A categoria

> **Mapa da Prescrição é o sistema de decisão e prontuário para Profissionais de Educação Física.**

Não "app para personal trainer". Não "plataforma com IA". Sistema de decisão e prontuário — a mesma família de palavras que iClinic, Feegow e Ninsaúde usam, porque é a mesma natureza de produto.

Quatro consequências práticas dessa escolha:

**Primeira: o vilão nomeado deixa de ser o concorrente e passa a ser a memória.** A planilha, o WhatsApp e o "eu sempre fiz assim". Isso é confortável para o comprador (ninguém precisa admitir que escolheu mal o app anterior) e é verdade.

**Segunda: o comparativo da página vira de três colunas.** Hoje você compara só com a planilha, o que subestima o comprador — ele já conhece o MFIT. Compare com os três: planilha, app de treino, e Mapa da Prescrição.

**Terceira: "com IA" some do vocabulário.** O estudo mais recente de 250 homepages B2B (PitchKitchen, maio/2026) mostra que páginas com zero menções a IA no hero pontuam 67% no score de mensagem, e com três ou mais menções caem para 33%. Você já está do lado certo. Mantenha — e transforme em contraste ativo, já que TreinoAI, I.A.GO, Nexur, Mobitrainer e Vibe Fit estão todos correndo para o mesmo lugar saturado.

**Quarta: você fala com quem tem CREF, não com "profissionais de saúde".** SaaS verticalizado bate horizontal por 23/36 contra 16/36 no mesmo estudo, justamente porque fala a língua de um ofício. Use o vocabulário do CREF sem tradução.

## 2.2 O gancho de responsabilidade — como usar sem errar

Este é o ponto onde a maioria dos concorrentes não entra e onde você pode se machucar se entrar mal.

**O que é falso e você não pode dizer:**

- ~~"O CONFEF obriga o profissional a manter prontuário"~~ — **não obriga**. Pesquisei o Código de Ética (Res. 307/2015), a Res. 46/2002, a Res. 255/2013 e o Documento de Intervenção Profissional. Nenhum estabelece obrigatoriedade de prontuário, ficha ou guarda de documentos.
- ~~"Respaldo jurídico" / "proteção legal" / "você fica protegido de processo"~~ — você não é seguradora nem escritório de advocacia. A expressão correta e factual é **"respaldo técnico documentado"**.
- ~~"Você pode ser processado" / "pode perder seu registro"~~ — explorar o medo é publicidade abusiva pelo art. 37 §2º do CDC. Fale do benefício da documentação, não da catástrofe da ausência dela.

**O que é verdade e sustenta o discurso inteiro:**

O contraste com a Fisioterapia é o argumento mais forte que existe e ninguém está usando. A **Resolução COFFITO nº 414/2012** obriga o fisioterapeuta a manter prontuário com conteúdo mínimo — identificação, história clínica, exame físico, diagnóstico, plano terapêutico, evolução, assinatura com número de registro — e guarda mínima de cinco anos. A Educação Física simplesmente não regulou isso. Isso não é ruim para você; significa que o mercado é virgem e você pode ser quem cria o padrão.

O **Documento de Intervenção Profissional do CONFEF** contém a frase mais aproveitável de toda a pesquisa. O profissional deve *"se cercar de informações e evidências científicas para balizar as suas decisões, de modo a garantir indicações seguras, dentro dos preceitos da ética."* Isso é, literalmente, a descrição do seu produto. Use como epígrafe da seção de respaldo técnico.

E o **Código de Ética (Res. 307/2015)** dá o dever: assegurar serviço "seguro, competente e atualizado, prestado com excelência técnica" (art. 3º, III), com responsabilidade por falta cometida no exercício profissional (art. 3º, XII) e vedação a "conduta que evidencie inépcia profissional" (art. 5º, IX).

**A jurisprudência fecha o argumento.** A prescrição do personal é obrigação de meio: responsabilidade subjetiva, cabendo ao aluno provar negligência ou imprudência. E o eixo decisório dos tribunais é exatamente prova de orientação e avaliação prévia:

| Caso | Processo | Desfecho | Razão |
|---|---|---|---|
| Esteira, MG (20ª Câm. Cível TJ-MG) | 5005227-64.2023.8.13.0672 | **Absolvida** | **Houve prova de que a consumidora recebeu instruções** |
| Muay Thai, RS (10ª Câm. Cível TJ-RS) | 5000483-72.2015.8.21.2001 | Condenada | Supervisão inadequada + **falta de avaliação prévia** |
| Anilha, PR (2ª Vara Cível Toledo) | 0013763-85.2024.8.16.0170 | Condenada | Falta de supervisão e orientação inadequada |
| Esteira, DF (1ª Vara Cível Águas Claras) | 0716348-83.2024.8.07.0020 | Condenada | Ausência de orientação |

Ressalva de honestidade: os casos noticiados são majoritariamente contra **academias** (pessoa jurídica, CDC art. 14, responsabilidade objetiva), não contra o personal autônomo. Os únicos casos de personal pessoa física condenado que encontrei em 2025 foram por **uso indevido de imagem de aluno em rede social** (TJDFT, mai/2025; e um caso em Goiás, jun/2025, por um vídeo de três segundos). Isso, aliás, é um caso de uso imediato do seu prontuário assinável: **consentimento de imagem documentado**.

**A frase que sintetiza tudo, pronta para a página:**

> A Fisioterapia é obrigada a guardar prontuário por cinco anos. A Educação Física não é. Numa disputa, os dois precisam provar a mesma coisa — que houve avaliação e orientação. Só um dos dois tem o hábito de guardar a prova.

## 2.3 Mensagem principal

**Headline recomendada** (das cinco testadas contra o checklist de mensagem B2B, esta é a que carrega clareza + mecanismo + zero risco regulatório):

> **O semáforo diz se o seu aluno pode treinar hoje. O prontuário diz por quê.**

**Subheadline:**

> Sistema de decisão e prontuário para Profissionais de Educação Física. Cadastrar, avaliar, planejar, liberar e reavaliar — com a justificativa técnica e a referência ao lado de cada escolha. A decisão é sempre sua; o registro fica.

**Alternativas fortes** (para teste A/B, mantendo a voz atual):

- "Todo treino que você entrega tem um porquê. Aqui ele fica registrado." *(a atual — boa, mas conceitual demais para o primeiro contato; funciona melhor como headline da seção de problema)*
- "Se te perguntarem por que você prescreveu isso, você tem a resposta por escrito."
- "Prescrição com respaldo técnico. Não com achismo."

**Nunca use em anúncio** (mas pode usar na página): *"Você sabe se pode treinar esse aluno hoje?"* — reprova no classificador de atributos pessoais da Meta. Detalhe na seção 5.3.

---

# Parte 3 — Preço, empacotamento e cobrança

## 3.1 A estrutura recomendada

O produto tem hoje um plano único com tudo liberado e a promessa explícita "sem recurso escondido atrás de upgrade". Essa é uma posição ética e coerente com a marca, e eu **não recomendo quebrá-la criando tiers artificiais** — seria contraditório com um produto que removeu depoimentos falsos por princípio.

Mas a evidência de CRO é clara: três colunas aumentam a conversão da coluna do meio em 10% a 20%, porque reenquadram o preço como acessível. A saída honesta é ancorar por **quem usa**, não por **o que está escondido**.

| | **Profissional** | **Estúdio / Equipe** | **Institucional** |
|---|---|---|---|
| Para quem | 1 profissional com CREF | 3+ profissionais, com responsável técnico | Faculdades, assessorias, redes |
| Mensal | **R$ 129/mês** | R$ 109/prof./mês | — |
| **Anual (destaque)** | **R$ 1.164/ano** — R$ 97/mês, economize R$ 384 | **R$ 89/prof./mês** — mín. 3 | Sob consulta |
| Diferença real | — | Painel do responsável técnico, prontuário consolidado, transferência de aluno entre profissionais | Acesso gratuito durante a graduação, contrato institucional |
| Alunos | Ilimitados | Ilimitados | Ilimitados |
| Funcionalidades | **Todas** | Todas | Todas |

**Oferta de Fundador — as 100 primeiras contas:**

> **R$ 690/ano** (R$ 57,50/mês), **travado enquanto a assinatura estiver ativa**.
> Em troca: você aceita conversar comigo 20 minutos por trimestre e, se o sistema te servir, autorizar seu nome e CREF como referência.
> **Contador ao vivo: 0 de 100.**

Por que essa estrutura:

**Por que R$ 129 de tabela e não R$ 97.** O R$ 97 não sai de cena — ele vira o **preço anual efetivo**, que é onde você quer o cliente. O R$ 129 existe para que o anual pareça o que é: uma economia real de R$ 384/ano. Hoje você tem R$ 97 mensal contra R$ 590 anual, que é 49% de desconto — o mercado pratica 17% a 25%, e um desconto de 49% comunica que o preço mensal é fictício. Além disso, R$ 129 posiciona você exatamente no iClinic Plus, que é a vizinhança certa.

**Por que o anual é obrigatório e não opcional.** Retenção em 12 meses: anual 92%, mensal 68%. Churn involuntário (cartão recusado) cai até 95% com cobrança anual. Na faixa de ARPA em que você está, o churn mensal de benchmark é 6,1% — perder quase metade da base em um ano. **Meta: 50% ou mais das novas assinaturas em anual.** Abaixo de 30% significa que o desconto está fraco.

**Por que enquadrar em reais e não em porcentagem.** "Economize R$ 384 por ano" supera "economize 25%" porque ancora num valor concreto. Confira a conta antes de publicar: R$ 129 × 12 = R$ 1.548; menos R$ 1.164 = R$ 384, ou 24,8%, o equivalente a quase três mensalidades. Não escreva "2 meses grátis" com esses números — seriam 2,98, e arredondar para baixo joga contra você.

**Por que 100 fundadores e não 30.** Trinta contas a R$ 590 são R$ 17.700 e trinta fontes de depoimento. Cem contas a R$ 690 são R$ 69.000 de caixa antecipado e cem fontes — que é o volume mínimo para você ter três ou quatro depoimentos realmente bons com nome e CREF. E R$ 690 fica abaixo do Vedius anual (R$ 749,90), o que resolve o problema de partida a frio sem parecer desespero.

**Escassez precisa ser real e auditável.** Você já tem `VAGAS_FUNDADOR` como constante única. Exponha o contador na página, e **pare em 100**. Escassez com contador que reinicia é enganosa pelo art. 37 §1º do CDC — e no seu caso seria especialmente destrutiva, porque a marca inteira se apoia em honestidade demonstrável.

**Parcelamento em 12x.** É o padrão brasileiro que a Doctoralia Pro usa (R$ 429/529/679 ao ano, sempre parcelados). "12x de R$ 97" lê muito melhor que "R$ 1.164". Ofereça as duas leituras.

## 3.2 Como cobrar

**Gateway recomendado: Asaas ou Vindi.** Motivos: recorrência nativa em cartão, boleto e Pix; emissão de nota fiscal integrada (relevante — boa parte dos seus compradores é MEI e quer a NF para deduzir); régua de cobrança e retentativa automática (dunning), que é o que segura o churn involuntário; e taxas menores que as plataformas de infoproduto.

**Não use Hotmart ou Kiwify.** Elas são excelentes para curso e péssimas para SaaS: não têm gestão de entitlement por assinatura, a API de webhooks é limitada para controlar acesso, e a taxa (~9-10%) é 2,5× a de um gateway de assinatura. Você perderia quase um mês de mensalidade por ano em taxa.

**Stripe** faz sentido apenas se houver plano de internacionalizar. Para o Brasil puro, o gateway nacional ganha em boleto, Pix e nota fiscal.

**Configuração recomendada:**

| Item | Decisão |
|---|---|
| Meio padrão | Cartão recorrente (mensal e anual) |
| Anual | Cartão em 12x, **ou Pix à vista com desconto adicional de 5%** |
| Boleto | Só no anual (boleto mensal tem inadimplência alta) |
| Teste | **14 dias, sem cartão** |
| Dunning | 4 retentativas em 14 dias + e-mail + WhatsApp |
| Cancelamento | Em 2 cliques, sem ligação (você já promete isso — cumpra) |
| Nota fiscal | Automática, no ato do pagamento |
| Reembolso | 30 dias, sem perguntas |

**Sobre o trial: 14 dias sem cartão, e não 7 com cartão.** Os dados: trial de 14 dias com check-ins converte a 44,1%, contra 40,4% em 7 dias. Sem cartão, visitante→trial é 8,5%; com cartão, 2,5% — e trial→pago inverte (14% sem cartão, 44% com). A conversão líquida praticamente empata (1,19% contra 1,10%). Então a escolha não é por conversão, é por aprendizado: **sem cartão você recebe 3,4× mais gente dentro do produto, o que para um produto novo e sem prova social vale mais que a conversão marginal.**

**O dado mais acionável de toda a pesquisa:** ativação explica 60% a 75% da variação de trial→pago. Trials ativados convertem a 35-65%; não ativados, a 2-8%. Você já tem a métrica-mãe definida no código — *"Primeiro Caso Real resolvido em menos de 10 minutos"*. Transforme isso no onboarding: checklist guiado no dia 1 (cadastrar aluno → fazer o semáforo → gerar o prontuário → exportar o PDF). Só o checklist de dia 1 vale +12,3 pontos percentuais de conversão nos benchmarks. **É a maior alavanca disponível, e é mais barata que qualquer otimização de anúncio.**

## 3.3 Garantia

Com produto novo e sem depoimentos, a garantia é o substituto mais eficiente de prova social. Escreva sem letra miúda:

> **Use por 30 dias.** Se você não achar que ganhou segurança técnica no seu dia a dia, devolvemos 100%. Sem formulário e sem pergunta — um e-mail resolve.

Coloque isso **imediatamente abaixo dos cards de preço**, não no rodapé.

## 3.4 Unit economics — o modelo com que trabalhar

Premissas conservadoras, com os benchmarks reais:

| Variável | Valor | Origem |
|---|---:|---|
| Ticket médio (mix 50% anual) | R$ 105/mês | cálculo |
| Churn mensal ano 1 | 5% | benchmark ARPA <US$25 é 6,1%; anual puxa para baixo |
| Margem bruta | 78% | benchmark SaaS tradicional |
| **LTV (contribuição)** | **R$ 1.638** | R$ 105 ÷ 0,05 × 0,78 |
| **CAC-teto para LTV:CAC 3:1** | **R$ 546** | |
| **CAC-alvo de trabalho** | **R$ 350** | folga para payback ≤ 12 meses |
| Payback no CAC-alvo | ~4,3 meses | |

Funil de mídia paga estimado (valide com R$ 2-3 mil de teste real, os CPMs brasileiros por nicho são projeções de agência, não fonte primária):

| Etapa | Faixa | Resultado |
|---|---|---|
| CPM Meta (interesse EF, Reels+Feed) | R$ 20–35 | — |
| CTR | 1,2–2,0% | CPC R$ 1,20–2,90 |
| Clique → trial | 6–12% | Custo por trial **R$ 12–48** |
| Trial → pago (com ativação) | 12–18% | **CAC R$ 80–400** |

O cenário fecha — **desde que a ativação funcione**. Se trial→pago cair para 5% (o que acontece sem onboarding guiado), o CAC vai para R$ 240–960 e o negócio fica marginal. Isso é mais uma vez a mesma conclusão: ativação antes de aquisição.

**Metas de 12 meses (cenário-base):**

| Marco | Prazo | Assinantes | MRR |
|---|---|---:|---:|
| Coorte de fundadores fechada | 90 dias | 100 | ~R$ 5.750 |
| Primeiros pagantes a preço cheio | 120 dias | 150 | ~R$ 11.000 |
| Ano 1 | 12 meses | 400–600 | R$ 40–60 mil |
| Ano 3 (SOM modelado) | 36 meses | 1.500–5.000 | R$ 145–580 mil |

Para calibrar a ambição: o iClinic foi adquirido pela Afya por **R$ 182,7 milhões com 23 mil usuários a ~R$ 100/mês**. É exatamente a mesma matemática. O mercado comporta um negócio de R$ 2 a 6 milhões de ARR em três anos — não um unicórnio, mas um excelente negócio.

**Tamanho de mercado:**

| Camada | Definição | Volume |
|---|---|---:|
| TAM | Registrados CONFEF/CREF | 600–650 mil (CONFEF, 2023) |
| SAM | Atuam como PT autônomo/consultoria (39% dos registrados; 27.521 CNPJs de PT em 2024, SEBRAE) | 150–250 mil |
| SAM-nicho | Atendem aluno com comorbidade e pagam por ferramenta técnica | 20–40 mil |
| **SOM (36 meses)** | 2–5% do SAM-nicho | **1.500–5.000** |

---

# Parte 4 — A página principal

Esta é a parte com maior retorno por hora investida. A página no ar tem 7.332px no desktop e **12.624px no mobile — quinze telas** — com boa copy e nenhuma prova.

## 4.1 Os oito problemas críticos

**1. Zero prova social na página inteira.** Nenhum depoimento, nome, CREF, foto, logo, contagem de usuários ou nota. A remoção dos depoimentos inventados foi a decisão certa (e o comentário no código que documenta isso é admirável), mas deixou um buraco que precisa ser preenchido com outra coisa — e há maneiras honestas de fazer isso. Seção 4.3.

**2. Nenhum screenshot real do produto.** A página tem exatamente três tags `<img>`, todas o mesmo logo. Todas as "telas" são recriações em HTML/CSS. O visitante nunca vê o software. Hero com screenshot de produto rende +9% de conversão; hero com stock photo genérico rende −11%. Você está no meio: um mockup bonito que não prova nada.

**3. 4.958 pixels sem um único CTA.** Do hero (y=526) até "Assinar Profissional" (y=5.484). No mobile o botão de compra aparece por volta da nona de quinze telas.

**4. Sem CTA fixo no mobile.** O padrão sticky-bottom sozinho rende **+11%** de conversão — o maior ganho isolado de posicionamento de CTA que existe nos testes. É provavelmente o item de melhor relação esforço/retorno da lista inteira.

**5. Mobile sem navegação e sem login.** Medido no DOM real a 390px: todos os links de nav e o "Entrar" ficam 0×0 e **não existe botão hamburguer**. Um assinante não consegue entrar na conta pela home no celular.

**6. `/roi` e `/casos-rcd` são órfãs.** A calculadora que mostra R$ 831/mês de ganho e "8× — o ganho de um mês paga oito meses do plano", e a biblioteca de seis casos clínicos que rodam o motor real ao vivo. Seus dois melhores ativos de conversão, e a home não linka nenhum dos dois.

**7. A oferta é inconsistente entre `/` e `/pricing`.** A home vende R$ 97 mensal, R$ 49 anual fundador, 7 dias e 30 vagas. A `/pricing` mostra só R$ 97, sem anual, sem teste, sem escassez, com outro layout e outro vocabulário. Quem chega em `/pricing` por busca ou anúncio vê a pior oferta que você tem.

**8. Bundle de 791 KB comprimido / 2.903 KB descomprimido, em chunk único.** A landing carrega o app inteiro. Isso importa comercialmente, não só tecnicamente: páginas que carregam em menos de 1s convertem a 4,4%; em 4s ou mais, a 1,7%. O restante da performance está ótimo (TTFB 249ms, 14 requests, ~805 KB total) — o bundle é o único vilão.

## 4.2 Estrutura recomendada, seção por seção

A ordem segue a lógica de camadas cumulativas que aparece consistentemente nos testes de mensagem B2B: **Clareza** (o que é?) → **Relevância** (é pra mim?) → **Valor** (eu quero?) → **Diferenciação** (por que você?). O erro mais comum é pular para valor antes do comprador entender o que é a coisa.

---

### 0 · Barra de anúncio (nova)

Fina, no topo, dispensável.

> **Oferta de Fundador — 43 das 100 vagas preenchidas.** R$ 690/ano, travado enquanto a assinatura durar. → *Ver condições*

Só publique o contador se ele for real e você parar em 100.

---

### 1 · Header (corrigir)

Adicionar: menu hamburguer no mobile, "Entrar" sempre visível, e dois novos itens de nav — **Casos reais** (`/casos-rcd`) e **Calculadora** (`/roi`). Botão primário: "Testar 14 dias".

---

### 2 · Hero (reescrever)

Regra de ouro dos testes: **no máximo dois botões**. Hero com três ou mais rende −8%.

> **[rótulo de categoria]** Sistema de decisão e prontuário para Profissionais de Educação Física
>
> # O semáforo diz se o seu aluno pode treinar hoje. O prontuário diz por quê.
>
> Cadastrar, avaliar, planejar, liberar e reavaliar — com a justificativa técnica e a referência científica ao lado de cada escolha. A decisão é sempre sua; o registro fica.
>
> **[ Testar 14 dias grátis ]** · [ Ver 6 casos reais → ]
>
> ✓ Sem cartão de crédito ✓ Alunos ilimitados ✓ Cancela em 2 cliques

**Visual à direita: screenshot real do semáforo**, anotado com 2 ou 3 calls-outs. Não o mockup em HTML com dez blocos de informação. O mockup atual compete com a headline; um screenshot com três anotações reforça.

Mudanças e por quê: o rótulo de categoria resolve o "o que é isso" em 2 segundos, que hoje leva 15. "14 dias grátis, sem cartão" mata a objeção número um. "Ver 6 casos reais" tira a `/casos-rcd` do limbo e é um CTA secundário de compromisso zero.

---

### 3 · Faixa de credibilidade (nova) — a estatística única

Hero seguido de uma estatística única foi o padrão de maior ganho medido (+18%). Você tem números reais e verificáveis:

> **82 referências científicas** conferidas no PubMed · **23 condições de saúde** com regra e fonte declaradas · **100% das faixas de treino** com referência rastreável · Responsável técnico **[Nome], CREF XXXXX-G/[UF]**

O CREF visível não é só credibilidade — é **obrigação**. O art. 4º, parágrafo único do Código de Ética exige nome e número de registro em publicidade de conteúdo de Educação Física, inclusive digital.

---

### 4 · O problema (manter quase intacto)

Os quatro cards — A planilha, A dúvida, O retrabalho, A reavaliação — são a melhor parte da página atual. São específicos, reconhecíveis, e o fecho é excelente:

> *"Nada disso é falta de competência sua. É falta de um lugar onde o seu raciocínio caiba inteiro."*

Não mexa. Adicione apenas um CTA discreto ao final ("Ver como o Mapa resolve isso →").

---

### 5 · Demonstração do mecanismo (nova — a seção mais importante)

**Esta seção é o que substitui prova social no seu caso.** Você vende respaldo técnico, e respaldo é auditável. Em vez de pedir "confie em mim", mostre o motor rodando.

Traga três dos seis casos da `/casos-rcd` para a home, lado a lado, cada um com: perfil do aluno em uma linha → cor do semáforo → conduta → **a referência citada**. Exemplo:

> **Homem, 52 anos, hipertensão estágio 1, quer emagrecer**
> 🟡 Com ajuste — intensidade moderada, respiração contínua, sem Valsalva.
> *Fonte: Diretriz Brasileira de Hipertensão Arterial (SBC) + ACSM Guidelines.*
> [ Ver a decisão completa e o que foi descartado → ]

Abaixo: **demo interativa ungated** (Arcade ou Storylane são baratos e rápidos), 7 passos, ~2 minutos, mostrando exclusivamente o semáforo em três cenários. Visitantes que veem demo interativa têm chance de conversão substancialmente maior, e 71% das demos de melhor desempenho não pedem cadastro. Título do botão: **"Ver o semáforo funcionando"**.

Uma advertência sobre o vídeo: **não use vídeo com autoplay no hero** — rende −7% porque leva o LCP de 1,3s para 2,4s. Se quiser vídeo, faça como o Basecamp: um "tour de 3 minutos" clicável, mais abaixo na página.

---

### 6 · O ciclo do cuidado (manter, numerar)

As cinco etapas já estão numeradas e a copy está boa. Mantenha. Adicione um screenshot pequeno em cada etapa e um CTA ao final da seção.

---

### 7 · Por dentro do app (manter as abas, trocar o conteúdo)

O padrão de abas é bom e é o que Attio usa para mostrar cinco módulos sem alongar a página. O problema é o que está dentro: recriações em HTML. **Troque por capturas reais**, cada uma com uma legenda de uma linha dizendo o resultado, não a funcionalidade.

Corrija também o `<h1>` duplicado que existe dentro do mockup desta seção ("Avaliar e reavaliar") — prejudica SEO e leitores de tela. Vire `<div>` e marque o mockup como `aria-hidden`.

---

### 8 · O semáforo (manter)

Seletor de três cores com conduta. Bem resolvido. Mantenha o disclaimer ao final — ele aumenta credibilidade com quem tem CREF, além de ser exigência de compliance.

---

### 9 · Respaldo técnico — "as diretrizes em que isto se apoia" (reforçar)

Aqui vale copiar descaradamente a lógica da **Vanta**, que é o análogo mais próximo do seu posicionamento no mundo. A Vanta vende "prove sua conformidade" e abre a home nomeando os 35+ frameworks (SOC 2, HIPAA, ISO). Você faz o mesmo: **nomeie as diretrizes como quem nomeia normas.**

> ACSM's Guidelines for Exercise Testing and Prescription · Garber et al., 2011 (Position Stand ACSM) · Diretriz Brasileira de Hipertensão Arterial (SBC) · NSCA/Fragala 2019 · ACSM/Chodzko 2009 · classificação de obesidade da OMS

E use a citação do CONFEF como epígrafe:

> *"Se cercar de informações e evidências científicas para balizar as suas decisões, de modo a garantir indicações seguras, dentro dos preceitos da ética."*
> — Documento de Intervenção Profissional, CONFEF

Adicione também um bloco próprio para a privacidade, que hoje está enterrado numa linha do card 02: **a foto da avaliação postural nunca sai do dispositivo.** Isso é LGPD na prática e é um argumento de confiança forte.

---

### 10 · Comparativo em três colunas (expandir)

Hoje você compara só com a planilha. O comprador já conhece o MFIT — compare com os três.

| | Na planilha | Num app de treino | **No Mapa da Prescrição** |
|---|---|---|---|
| O treino | Está lá | Está lá, bonito | Está lá, com o porquê |
| A justificativa | Na sua cabeça | Não existe | Escrita, com a fonte |
| O que foi descartado | — | — | **Registrado, com o motivo** |
| A decisão do dia | Sua memória | — | Semáforo, com histórico |
| A reavaliação | Se você lembrar | Lembrete genérico | Data pelo fim do bloco |
| Se alguém perguntar | Você reconstrói de cabeça | Você mostra o treino | **Você mostra o prontuário assinado** |

Sem citar concorrentes pelo nome — o art. 10, §2º do Código de Ética veda concorrência desleal, e comparação nominal é desnecessariamente arriscada.

---

### 11 · Carta do fundador (nova)

Este é o padrão do Basecamp e é o que melhor substitui prova social quando ela não existe. Foto sua, nome, CREF, e 150-200 palavras em primeira pessoa: por que você construiu isso, qual foi o caso que te fez começar, e o que você promete. Assine.

Duas razões: humaniza um produto que é todo técnico, e cumpre o art. 4º do Código de Ética.

---

### 12 · A matemática (nova — trazer a `/roi` para dentro)

Mini-calculadora embutida, logo acima do preço, com os mesmos quatro inputs da `/roi`. Padrão de saída:

> Com 8 alunos com condição especial a R$ 120/sessão e um prêmio de especialista de 20%:
> **+R$ 831/mês · +R$ 9.976/ano**
> O ganho de **um mês** paga **oito meses** do plano.

E abaixo: *"R$ 97/mês no plano anual. Menos que uma hora de aula."*

---

### 13 · Planos (reconstruir)

Três colunas conforme a seção 3.1, com **anual pré-selecionado**, R$ 129 riscado ao lado do R$ 97, "economize R$ 384 por ano", "12x de R$ 97", e o contador real de vagas de fundador. Coluna do meio visualmente destacada por preenchimento e elevação — diferenciação visual agressiva supera badge sutil nos testes.

---

### 14 · Garantia (nova) — logo abaixo dos cards

Conforme seção 3.3. Prova social e garantia ficam abaixo dos cards de preço, não em seção separada.

---

### 15 · FAQ (expandir e abrir)

As seis perguntas atuais são boas mas todas de produto e segurança, e **todas nascem fechadas**. Abra as duas primeiras por padrão e acrescente as objeções comerciais que hoje ficam sem resposta:

- O que acontece depois dos 14 dias?
- Preciso colocar cartão para testar? *(Não.)*
- Como eu migro os alunos que estão na minha planilha?
- Quanto tempo até eu estar rodando de verdade?
- Vocês emitem nota fiscal? Serve para MEI?
- E se eu tiver só 5 alunos — vale a pena?
- Preciso ter CREF ativo? *(Sim.)*
- Isso substitui a liberação médica? *(Não — e essa resposta é compliance.)*
- Onde ficam os dados dos meus alunos? *(LGPD.)*
- Se eu cancelar, eu levo meus dados?

Vale considerar o formato do Basecamp aqui: uma lista de perguntas curtas todas respondidas com "Sim" — *"Dá para registrar aluno com hipertensão controlada? Sim. Dá para assinar o prontuário com meu CREF? Sim. Dá para exportar tudo em PDF com a minha marca? Sim."* É um matador de objeções em bloco, muito eficiente.

---

### 16 · CTA final (manter, ajustar)

A linha atual é boa. Ajuste a microcopy para a nova oferta.

---

### 17 · Rodapé (corrigir)

Manter o aviso legal em destaque — está correto e é necessário. **Adicionar CNPJ e razão social** assim que existirem.

---

### Elementos globais

- **Barra sticky de CTA** em desktop e mobile, aparecendo após o hero: preço + "Testar 14 dias". Maior ganho isolado da lista (+11%).
- **Captura de e-mail** em algum ponto — hoje a página tem `forms = 0` e 100% de quem não assina é perdido. Isca sugerida: *"Os 23 semáforos de liberação em PDF"* ou *"Modelo de prontuário de decisão técnica"*. Formulário de **um campo** (e-mail) ou dois (e-mail + CREF) — 1 campo converte a 12,4%, 6+ campos a 3,1%.
- **Unificar `/pricing`** com a seção `#planos` da home, ou redirecionar. E dar header completo a `/pricing`, `/roi` e `/casos-rcd`, que hoje são becos sem saída para quem chega de busca ou anúncio.

## 4.3 Como criar prova social sem ter clientes

Ordenado por força, e todos honestos:

**Demonstração do mecanismo.** Já detalhada na seção 5 acima. É a sua maior alavanca, porque é a versão auditável de prova.

**Conselho consultivo com credencial verificável.** Dois ou três nomes — professores de bacharelado, coordenadores de curso, especialistas em exercício clínico — que revisem tecnicamente e aceitem constar. *"Revisão técnica: [Nome], CREF XXXXX-G/SP, Doutor em Fisiologia do Exercício."* No seu nicho vale mais que cinquenta depoimentos genéricos. Custo: acesso vitalício e crédito na página.

**Prova social emprestada — a base científica.** ACSM, SBC, NSCA, OMS. Esses nomes fazem o trabalho que logos de clientes fariam.

**Beta fechado com número real publicado.** "37 profissionais testando na versão fechada" converte melhor que silêncio.

**Depoimentos de fato, não de sentimento.** Quando os fundadores começarem, peça citações sobre um acontecimento, não sobre uma emoção. Ruim: *"Ferramenta incrível!"*. Bom: *"Usei com uma aluna de 62 anos com hipertensão. O sistema travou a progressão de carga e me deu a referência da diretriz. Foi a primeira vez que eu tinha por escrito por que decidi aquilo."* — Nome, CREF, cidade. Depoimento com rosto e nome rende +14%.

**Dados do próprio produto**, assim que houver volume: *"1.284 prescrições geradas com justificativa técnica nos últimos 30 dias."* Você controla essa métrica desde o dia um, e ela é a ponte entre zero prova e prova de clientes. Use precisão em vez de arredondamento — "1.284" é mais credível que "mais de mil".

**Build in public no Instagram e LinkedIn, não na landing.** Funciona para atrair os primeiros usuários, mas na página atrai audiência de fundadores, não de compradores. Na LP, uma linha basta.

## 4.4 Correções técnicas e de acessibilidade

| Prioridade | Correção |
|---|---|
| Crítico | **Code splitting por rota** (`React.lazy`). Meta: <200 KB para a landing. Hoje: 791 KB comprimido, 2,9 MB descomprimido, chunk único. |
| Crítico | Menu hamburguer no mobile + "Entrar" visível |
| Alto | **Contraste WCAG AA reprovado**: `rgb(138,151,166)` a 11–13,5px dá ~2,7–3,0:1; teal `rgb(18,181,168)` bold a 11,5px dá 2,45:1. Escurecer os cinzas para ≥4,5:1 e subir o corpo mínimo de 11px para 13px. |
| Alto | **27 de 37 elementos interativos abaixo de 44px** no mobile. Header CTA 122×36, abas 107–135×32–39, links do rodapé 17px de altura. Mínimo 44×44px. |
| Alto | `<h1>` duplicado dentro do mockup da seção "Por dentro" |
| Médio | Hero mobile tem 1.451px (1,7 tela). Reduzir H1 mobile de 42px para 32–34px e encurtar o parágrafo. |
| Médio | `alt` descritivo nas imagens e `aria-label` nos 44 SVGs inline |

---

# Parte 5 — Aquisição

## 5.1 A sequência de canais

Não faça tudo ao mesmo tempo. A ordem importa porque cada fase paga a seguinte.

### Fase 0 · Fundação (dias 0–30) — antes de qualquer anúncio

Gateway, CNPJ, revisão jurídica dos Termos, onboarding de dia 1, página reconstruída, e a `/casos-rcd` e a `/roi` linkadas. Rodar anúncio antes disso é queimar dinheiro num funil que não converte e num checkout que não existe.

### Fase 1 · Coorte de fundadores (dias 30–90) — meta: 100 assinantes, CAC próximo de zero

Nada de mídia paga. Cem contas se conseguem à mão:

**Rede direta e WhatsApp.** Você e o time têm rede no CREF. Cem pessoas é um número de conversas, não de anúncios. Faça as vinte primeiras por videochamada, com onboarding assistido — cada uma dessas conversas vale mais que qualquer relatório de analytics.

**Grupos e comunidades de Educação Física.** A conversa do personal brasileiro acontece em WhatsApp e Instagram, não em fóruns indexáveis. Isso significa que ela é invisível para os concorrentes e acessível para quem já está dentro.

**Perfis voltados ao profissional** (não ao aluno): `@drpaulogentil` (PhD, 200+ artigos publicados, *a* referência técnica brasileira para o público profissional), `@antonioarruda` (Treinamento & Ciência), e `@clubeeducacaofisica` — este último é o melhor candidato a parceria de mídia, porque é mídia de nicho dedicada ao profissional. O podcast **Exercício Físico e Ciência** (Fábio Dominski) é o principal do gênero em português.

Evite os grandes de fisiculturismo (Muzy 8,1M, Toguro 8,1M, Cariani 7,5M). Alcance enorme, público leigo, conversão irrelevante para SaaS profissional.

**Fitness Brasil Expo 2026 — 27 a 29 de agosto, Transamerica Expo Center, SP.** São 40 mil visitantes em 38 mil m², com trilha própria de Personal Training e Certificações. **Isso é daqui a três semanas.** Mesmo sem estande, três dias de conversas com demo no notebook provavelmente é o CAC mais baixo disponível no seu nicho o ano inteiro. Se der para conseguir um espaço pequeno, consiga.

Guardar para abril: **Arnold South America**, 110 mil pessoas e R$ 1,2 bilhão em negócios, com trilha de Gestão de Academias.

### Fase 2 · Motor orgânico (dias 60–270) — o playbook iClinic

Este é o canal que constrói o negócio, e ele leva de 4 a 9 meses para dar retorno. Comece cedo.

**SEO programático a partir da `/casos-rcd`.** Você já tem seis casos públicos que rodam o motor real. Isso é, nas palavras do seu próprio código, *"prova de mecanismo e porta de entrada de aquisição orgânica — difícil de copiar porque nasce do próprio motor de raciocínio"*. Está absolutamente certo. **Leve de 6 para 60+ casos**, ancorados em buscas reais: "treino para hipertenso", "exercício para diabético tipo 2", "treino para idoso com osteoartrite", "musculação na gestação", "exercício com betabloqueador", "treino para obesidade grau III". Cada caso é uma página que ranqueia, prova o mecanismo e não pede cadastro.

Cuidado com a URL: `mapadaprescricao.com.br/hipertensao` é convite a ser classificado como domínio de saúde sensível pela Meta (detalhe na 5.3). Prefira `/casos/prescricao-hipertensao-estagio-1`.

**Conteúdo técnico para o profissional.** O iClinic construiu um exit de nove dígitos sobre um blog para médicos. O equivalente aqui: um artigo por semana sobre decisão clínica em Educação Física, cada um terminando num caso do motor.

### Fase 3 · Mídia paga (dias 90+) — só depois que o funil converter

**Meta Ads** é o canal com melhor conversão no Brasil em 2026 (3,91%, contra Google 3,41% e orgânico 2,39%). Mas o CPM projetado para SaaS B2B é o mais caro do mercado (R$ 45, faixa R$ 35–75), contra R$ 18 em serviços. **Segmente por interesse em Educação Física e fitness, não por cargo** — isso te coloca na faixa de R$ 18–25 de CPM em vez de R$ 45.

**Google Ads** para fundo de funil, onde o CPC brasileiro em nicho de baixa concorrência deve ficar em R$ 1,50–4,00: "app para personal trainer", "prontuário personal trainer", "sistema de prescrição de exercício", "software avaliação física". Nota relevante: pela primeira vez em cinco anos o CPL médio caiu, e Educação teve a maior queda de CPC do ano (−22,79%).

Comece com R$ 2.000 a R$ 3.000 de teste real. Todos os CPMs brasileiros por nicho que circulam são projeções de agência, sem metodologia declarada — o seu teste vale mais que o benchmark.

### Fase 4 · Parcerias institucionais (paralelo, retorno em 12–36 meses)

**Copie o playbook da Nutrium**, que é o mais copiável de toda a pesquisa. Eles dão acesso **gratuito ao software durante todo o período acadêmico** e **50% de desconto** na assinatura para estudantes de instituições parceiras. Já fecharam oito parcerias brasileiras (São Camilo, UNIDESC, UNIDAVI, UNITAU, UNISINOS, Estácio Pantanal, IIESAU, Faculdade São Luís).

O segmento "recém-formado que atende aluno com comorbidade" — que a sua própria FAQ já identifica como o público ideal — é exatamente quem sai dessas faculdades. Dez a vinte cursos de bacharelado em Educação Física constroem pipeline de três a cinco anos com CAC próximo de zero.

**CREFs regionais.** O CREF3/SC comprou e distribuiu vagas do Congresso FIEPS 2026 para seus registrados. Os conselhos patrocinam formação — é um canal institucional de co-marketing que nenhum concorrente está usando.

## 5.2 Estrutura de anúncio

**Funil de duas etapas, não de uma.** Landing page de venda de SaaS converte a ~1,8% no Brasil; landing de isca converte a ~20%. Com produto novo e sem prova social, mande o tráfego frio para uma isca e o tráfego morno para a página de venda.

| Etapa | Público | Criativo | Destino | Meta |
|---|---|---|---|---|
| **Topo** | Interesse em Educação Física, musculação, CREF, 24–45 anos | Carrossel ou Reels de 20s: um caso do motor rodando, sem falar de preço | `/casos-rcd` (ungated) | Custo por visita <R$ 1,50 |
| **Meio** | Retargeting de quem visitou `/casos-rcd` | Demonstração do semáforo em 3 cores | Isca: "Os 23 semáforos em PDF" | CPL <R$ 12 |
| **Fundo** | Retargeting de lead + visitantes de `#planos` | Carta do fundador / garantia / oferta de fundador | `/` com CTA de trial | Custo por trial <R$ 48 |
| **Busca** | Google, intenção comercial | — | `/` | CPC R$ 1,50–4,00 |

**Ângulos criativos que valem testar** (todos livres de risco regulatório — ver 5.3):

1. **O contraste com a Fisioterapia.** "A Fisioterapia guarda prontuário por 5 anos por obrigação. A Educação Física não. Adivinha quem tem a prova quando alguém pergunta."
2. **O anti-IA.** "Todo mundo está lançando gerador de treino com IA. Nós fizemos o contrário: um sistema que te obriga a justificar."
3. **O caso rodando.** Só a tela: aluno hipertenso → semáforo amarelo → conduta → a diretriz citada. Sem narração.
4. **A pergunta que o médico faz.** "O médico do seu aluno pediu para ver o que você prescreveu. O que você manda?"
5. **O que foi descartado.** Nenhum concorrente registra os exercícios *não* escolhidos e o motivo. É o detalhe que mais impressiona quem entende.

## 5.3 Compliance de anúncio — dois sistemas independentes da Meta

Isso é pouco conhecido e vai te custar tempo se você descobrir depois.

**Sistema 1 — Política de Atributos Pessoais.** A Meta proíbe anúncios que afirmem ou insinuem conhecimento de um atributo pessoal do usuário, incluindo condição médica. Pergunta não é exceção. O teste é: a frase descreve o serviço, ou afirma um fato sobre o leitor?

No seu caso, "seu aluno hipertenso" tecnicamente não afirma que *você* é hipertenso, e na leitura estrita é permitido. Mas a revisão automatizada é literal e tende a reprovar. Reformule:

| Alto risco de reprovação | Reformulação segura |
|---|---|
| "Seu aluno é hipertenso e você não sabe se pode treinar?" | "Sistema de prescrição com triagem de liberação para alunos com comorbidade." |
| "Você tem medo de treinar aluno com problema cardíaco?" | "Prescrição documentada com justificativa técnica para Profissionais de Educação Física." |
| "Está inseguro na hora de prescrever?" | "Sistema de apoio à decisão técnica para prescrição de exercício." |

Guarde a copy emocional para a landing page e o e-mail. **Mantenha o criativo descritivo.** E revise as cinco superfícies: copy, headline, texto na imagem, formulário de lead e a própria landing page.

**Sistema 2 — Categoria sensível (o problema maior).** Desde setembro de 2025 a Meta bloqueia públicos personalizados e conversões cujos nomes ou metadados sugiram condição de saúde, e classifica como sensíveis domínios associados a condições médicas. O efeito: eventos de fundo de funil (Purchase, Add to Cart) ficam restritos e a Conversions API não consegue enviá-los.

**Aprovar o anúncio não libera o dado.** São dois sistemas, duas correções. Providências:

- Nomeie eventos e públicos de forma neutra: `lead_fundador`, `trial_iniciado`. **Nunca** `hipertensao`, `comorbidade`, `avaliacao_cardiaca`.
- Deixe óbvio no hero que o cliente é o **profissional**, não o paciente. Isso é verdade e reduz a chance de o domínio ser classificado como sensível.
- Cuide das URLs e dos títulos de página.
- Planeje com **campanhas de Leads com formulário nativo** ou otimização por lead simples, e faça a atribuição de lucro fora da Meta.
- Boa notícia: saúde **não** é "Special Ad Category" (essa lista é moradia, emprego, crédito e questões sociais). Você não perde segmentação por idade, gênero ou raio — perde otimização por conversão.

## 5.4 O que a publicidade não pode prometer

Além do já dito sobre CDC art. 37 e Código de Ética, nunca prometa:

- Resultado de saúde do aluno final ("seu aluno vai baixar a pressão")
- Proteção jurídica ou imunidade — use "respaldo técnico documentado", nunca "respaldo legal"
- Diagnóstico ou liberação médica
- Aval do CONFEF/CREF que você não tenha
- Escassez que você não vá honrar

E lembre que **publicidade vincula** (CDC art. 30): tudo que a página promete integra o contrato e é exigível.

---

# Parte 6 — Roadmap de produto voltado a vendas

## Bloco A · Destravar a receita (0–30 dias)

| # | Item | Por quê |
|---|---|---|
| A1 | **Gateway de assinatura** (Asaas ou Vindi), cartão + Pix + boleto anual, com dunning | Sem isso, receita = R$ 0 |
| A2 | **CNPJ, razão social, endereço e foro** nos Termos e no rodapé | Não pode cobrar nem anunciar sem |
| A3 | **Revisão jurídica** dos Termos e da Política, com enquadramento LGPD de dado sensível | Você guarda pressão arterial, dor, medicação e fotos do corpo de terceiros |
| A4 | **Emissão automática de nota fiscal** | Grande parte dos compradores é MEI e quer a NF |
| A5 | **Cancelamento em 2 cliques** funcionando de verdade | Você já promete na página |
| A6 | **Página reconstruída** conforme Parte 4 | Maior retorno por hora |

## Bloco B · Fazer o trial converter (30–60 dias)

| # | Item | Por quê |
|---|---|---|
| B1 | **Onboarding guiado de dia 1**: cadastrar aluno → semáforo → prontuário → PDF | Ativação explica 60-75% da variação de trial→pago. Checklist de dia 1 vale +12,3 p.p. |
| B2 | **Trial de 14 dias sem cartão**, com e-mails nos dias 1, 3, 7, 12 e 14 | 14 dias com check-ins é o formato de melhor desempenho |
| B3 | **Importar de planilha** (CSV do Excel/Sheets) | Mata a objeção "e os meus 30 alunos que já estão na planilha?" |
| B4 | **Aluno de demonstração** pré-carregado na conta nova | Ninguém avalia o motor com a base vazia |
| B5 | **Demo interativa ungated** (Arcade), 7 passos, no site | Substitui prova social por "veja você mesmo" |

## Bloco C · Sustentar a promessa (60–120 dias)

| # | Item | Por quê |
|---|---|---|
| C1 | **Framework de testes** (Vitest + Playwright) no CI, ao lado dos 24 guardrails | As reviews dos concorrentes mostram perda de cliente por instabilidade. Um produto vendido como respaldo não pode cair. |
| C2 | **Fotos para o Supabase Storage** em bucket privado, saindo do JSONB | Dívida de LGPD que você mesmo documentou |
| C3 | **Fechar os buracos do catálogo**: manguito rotador (0 exercícios hoje), trapézio inferior, deltoide posterior, quadrado lombar, kettlebell, TRX, bola | O primeiro comprador que buscar "manguito" perde a confiança |
| C4 | **Assinatura do prontuário com carimbo de tempo e hash verificável** (e caminho para ICP-Brasil) | "Assinável" precisa significar algo |
| C5 | **Exportar todos os dados** em um clique (portabilidade LGPD) | Vira o argumento "seus dados são seus", que você já promete |
| C6 | **Consentimento de imagem do aluno** com registro | Único tipo de caso em que personal pessoa física foi condenado em 2025 |

## Bloco D · Escalar (120 dias+)

| # | Item |
|---|---|
| D1 | `/casos-rcd` de 6 para 60+ casos, com URLs de busca |
| D2 | Painel do responsável técnico (viabiliza o plano Estúdio) |
| D3 | Preencher as 16 disciplinas vazias do Aprender, ou reduzir a promessa ao que existe |
| D4 | Programa de parcerias acadêmicas (playbook Nutrium) |
| D5 | Dashboard interno de ativação, churn e coorte |

---

# Parte 7 — Os primeiros 30 dias

| Semana | Foco | Entregas |
|---|---|---|
| **1** | Destravar | Contratar gateway · abrir/regularizar CNPJ · briefar advogado · escrever a carta do fundador |
| **2** | Página | Reconstruir hero, faixa de credibilidade, demonstração do mecanismo, comparativo de 3 colunas · code splitting · menu mobile · sticky CTA · capturar screenshots reais |
| **3** | Oferta e trial | Nova tabela de preços no `planos.ts` · contador de fundadores · trial de 14 dias · onboarding de dia 1 · unificar `/pricing` · linkar `/roi` e `/casos-rcd` |
| **4** | Primeiras vendas | Abrir a coorte de fundadores · 20 conversas por videochamada · presença no Fitness Brasil Expo (27–29/ago) · primeiros 3 depoimentos reais |

**As três métricas para acompanhar desde o dia 1:**

1. **Ativação** — % de trials que resolvem o Primeiro Caso Real em menos de 10 minutos. É a métrica que mais explica tudo o resto. Meta: >50%.
2. **Mix anual** — % das novas assinaturas em plano anual. É o antídoto do churn. Meta: >50%.
3. **Trial → pago.** Meta: >14%.

---

## Ressalvas de honestidade

Coisas que a pesquisa **não** conseguiu fechar, e que você deve verificar antes de publicar qualquer número:

- **Número oficial e atual de registrados no CONFEF.** A página de registrados bloqueia acesso automatizado. A melhor evidência é 600 mil (CONFEF, mai/2023) e "mais de 650 mil" em declaração pública. Vale pedir por e-mail ao CONFEF — é dado público.
- **CPM e CPC brasileiros por nicho.** Não existe fonte primária pública com metodologia declarada. Os números que circulam são projeções de agência. Valide com teste real.
- **Os benchmarks de demo interativa** (+32%, 6×) vêm de fornecedores de demo interativa. A direção é corroborada por Forrester e Gartner, mas trate as magnitudes como teto otimista.
- **Não existe estudo controlado** comparando frameworks de copy (PAS vs. BAB vs. JTBD). O que existe é convergência sobre a sequência Clareza → Relevância → Valor → Diferenciação.
- **Os sites oficiais do CONFEF retornaram 404** nas resoluções durante a pesquisa; usei espelhos de CREFs regionais. Confirme a redação vigente do Código de Ética com o CREF da sua região antes de publicar — especialmente o art. 4º, que exige nome e número de registro na publicidade.
- **Números de "tempo economizado"** que circulam em blogs do setor (3h/semana, 65% de redução) não têm fonte primária nem metodologia. Não use em material de venda.

---

## Fontes

**Concorrentes e preços** — [MFIT](https://www.mfitpersonal.com.br/pages/assinaturas.html) · [Treino Mestre](https://treinomestre.app/) · [Personal Fit](https://apppersonalfit.com.br/) · [O Personal Digital](https://opersonaldigital.com.br/) · [PersonalGO](https://www.personalgo.com.br/para-personal-trainer/) · [Vedius](https://vedius.com.br/precos/) · [TreinoAI](https://www.treinoai.com.br/precos) · [Nexur](https://aplicativonexur.com.br/assinatura/plano-plus/) · [Taí Personal](https://www.taipersonal.com.br/) · [Plataforma Treino Inteligente](https://www.planilhaspersonaltrainer.com.br/) · [iClinic](https://iclinic.com.br/precos/) · [SimplesVet](https://simples.vet/precos/) · [Doctoralia Pro](https://pro.doctoralia.com.br/preco) · [HexFit BR](https://www.myhexfit.com/pt-br/software-para-personal-trainer/)

**Mercado** — [SEBRAE/PR — Condicionamento Físico](https://sebraepr.com.br/comunidade/artigo/meu-negocio-em-numeros-panorama-do-mercado-de-atividades-de-condicionamento-fisico) · [ACSM Fitness Trends Brazil 2024](https://cdn-links.lww.com/permalink/fit/a/fit_2023_10_27_newsome_fit-d-23-00088_sdc2.pdf) · [ACSM Fitness Trends Brazil 2025](https://cdn-links.lww.com/permalink/fit/a/fit_2024_08_30_newsome_fit-d-24-00065_sdc3.pdf) · [Panorama Setorial Fitness Brasil](https://www.fitnessbrasil.com.br/panorama-setorial-2025-4a-edicao/) · [Fecomercio-SP](https://fecomercio.com.br/noticia/o-novo-folego-do-mercado-fitness)

**Benchmarks SaaS** — [ChartMogul SaaS Conversion Report](https://chartmogul.com/reports/saas-conversion-report/) · [ChartMogul — churn](https://chartmogul.com/blog/good-customer-churn-rate/) · [GrowthSpree — trial-to-paid 2026](https://www.growthspreeofficial.com/blogs/b2b-saas-trial-to-paid-conversion-rate-benchmarks-2026-by-trial-type-acv-length-credit-card) · [Amra&Elma — free trial stats](https://www.amraandelma.com/free-trial-conversion-statistics/) · [Baremetrics — anual vs mensal](https://baremetrics.com/blog/annual-vs-monthly-pricing-better-retention) · [Stripo — SaaS Pricing Trends 2026](https://research.stripo.email/saas-pricing-trends-2026) · [Digital Applied — unit economics 2026](https://www.digitalapplied.com/blog/saas-unit-economics-2026-cac-ltv-payback-reference)

**CRO e copy** — [DigitalApplied — 2.000 páginas testadas](https://www.digitalapplied.com/blog/landing-page-conversion-study-2000-pages-tested-2026) · [PitchKitchen — State of B2B Homepage Messaging 2026](https://www.pitchkitchen.com/2026-state-of-b2b-homepage-messaging) · [Wynter — B2B Message Layers](https://wynter.com/post/b2b-message-layers-framework-wynter) · [Navattic — Interactive Demo 2025](https://www.navattic.com/report/state-of-the-interactive-product-demo-2025) · [Leadster — Panorama de Geração de Leads 2026](https://leadster.com.br/panorama-geracao-de-leads/) · [Mida — A/B testing pricing pages](https://www.mida.so/blog/ab-testing-pricing-pages) · [eMarketer/TrustRadius — transparência de preço](https://www.emarketer.com/content/b2b-tech-buyers-crave-pricing-transparency)

**Mídia** — [WordStream — Google Ads Benchmarks 2026](https://www.wordstream.com/blog/2026-google-ads-benchmarks) · [Trafius — CPM Brasil por nicho](https://trafius.com.br/blog/benchmark-de-cpm-no-brasil-em-2026-por-nicho) · [Meta — Personal Attributes Policy](https://www.zappush.com/blog/meta-personal-attributes-policy-health-wellness-ads) · [Foxwell — Special vs Sensitive Ad Category](https://www.foxwelldigital.com/blog/meta-special-ad-category-vs-sensitive-ad-category-whats-the-difference)

**Legal e conselhos** — [Código de Ética do PEF (CREF22)](https://cref22.org.br/codigo-de-etica/) · [Documento de Intervenção Profissional — CONFEF](https://www.confef.org.br/confef/comunicacao/publicacoes/arquivos/INTERVENCAO_DOCUMENTO_FINAL.pdf) · [COFFITO 414/2012 — prontuário na Fisioterapia](https://www.coffito.gov.br/nsite/?p=3177) · [ConJur — responsabilidade civil do personal trainer](https://www.conjur.com.br/2013-mai-10/wanderson-oliveira-responsabilidade-civil-personal-trainer-depende-contrato/) · [Debate Jurídico — casos com nº de processo](https://debatejuridico.com.br/acidente-durante-o-treino-justica-reconhece-responsabilidade-de-academias-por-lesoes/) · [TJDFT — uso indevido de imagem por personal](https://www.tjdft.jus.br/institucional/imprensa/noticias/2025/maio/personal-trainer-deve-indenizar-aluno-por-uso-indevido-de-imagem-em-rede-social) · [CDC art. 37](https://www.legjur.com/legislacao/art/lei_00080781990-37)

**Aquisição** — [Nutrium — parcerias acadêmicas no Brasil](https://nutrium.com/blog/pt-br/parcerias-academicas-e-institucionais-no-brasil/) · [Exame — Afya adquire iClinic por R$ 182,7 mi](https://exame.com/negocios/de-olho-no-setor-de-telemedicina-afya-compra-iclinic-por-r-182-7-milhoes/) · [Fitness Brasil Expo 2026](https://www.fitnessbrasil.com.br/fitness-brasil-expo-2026/) · [Arnold South America](https://arnold.savagetgroup.com.br/conference/)
