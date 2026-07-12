import type { Module, Lesson, LessonType, Nivel } from "../types";

/**
 * Currículo das demais disciplinas (fora Biomecânica do treinamento, que tem
 * autoria dedicada). Gera módulos e aulas com conteúdo técnico e embasamento
 * científico a partir de uma especificação curada, para que NENHUMA disciplina
 * abra vazia. Cada aula traz um conceito-chave, aplicação prática, uma nota de
 * prudência científica e referências. Linguagem prudente, sem travessão.
 */

type LessonSpec = {
  slug: string;
  title: string;
  type: LessonType;
  term: string;
  definition: string;
  apply: string;
};
type ModuleSpec = {
  slug: string;
  title: string;
  objective: string;
  level: Nivel;
  lessons: LessonSpec[];
};

/** referência padrão por disciplina (ids de referencias.ts) para a bibliografia. */
const REF_POR_DISCIPLINA: Record<string, string[]> = {
  "anatomia-funcional": ["boeckh-behrens-2000", "ekstrom-2007"],
  "fisiologia-humana": ["garber-2011", "acsm-getp11"],
  "bioquimica-metabolismo": ["garber-2011", "donnelly-2009"],
  cinesiologia: ["boeckh-behrens-2000", "gullett-2009"],
  "biomecanica-basica": ["escamilla-1998", "gullett-2009"],
  "neurofisiologia-do-movimento": ["fragala-2019", "garber-2011"],
  "fisiologia-do-exercicio": ["garber-2011", "oms-2020", "borg-1982"],
  "treinamento-de-forca": ["schoenfeld-2010", "garber-2011"],
  "treinamento-cardiorrespiratorio": ["garber-2011", "oms-2020", "persinger-2004"],
  "mobilidade-e-flexibilidade": ["garber-2011"],
  "avaliacao-fisica-e-funcional": ["borg-1982", "acsm-getp11"],
  "controle-de-carga-e-recuperacao": ["foster-2001", "borg-1982"],
  "planejamento-e-periodizacao": ["garber-2011"],
  "raciocinio-de-prescricao": ["garber-2011", "confef-254"],
  "prescricao-para-grupos-especiais": ["acsm-getp11", "sbc-2020", "colberg-2016"],
  "dor-limitacoes-e-adaptacao": ["nice-ng59", "oarsi-2019"],
  "leitura-critica-de-evidencias": ["garber-2011"],
  "comunicacao-e-adesao": ["borg-1982"],
  "seguranca-e-limites-de-atuacao": ["warburton-2011", "confef-254"],
};

/** Especificação do currículo por disciplina (3 módulos, 2 aulas cada). */
const CURRICULO: Record<string, ModuleSpec[]> = {
  "anatomia-funcional": [
    {
      slug: "sistema-muscular",
      title: "Sistema muscular na prática",
      objective: "Reconhecer músculos por sua função no movimento, não só pelo nome.",
      level: "fundamental",
      lessons: [
        { slug: "musculos-por-funcao", title: "Músculos por função", type: "conceito", term: "Ação muscular", definition: "O papel que um músculo desempenha em um movimento (agonista, antagonista, sinergista, estabilizador).", apply: "Classificar o papel do músculo ajuda a entender o que o exercício realmente treina." },
        { slug: "biarticulares", title: "Músculos biarticulares", type: "conceito", term: "Músculo biarticular", definition: "Músculo que cruza duas articulações e cujo comprimento depende da posição de ambas.", apply: "Explica insuficiências ativa e passiva e por que a posição de uma articulação muda a força na outra." },
      ],
    },
    {
      slug: "articulacoes",
      title: "Articulações e amplitude",
      objective: "Relacionar o tipo de articulação com a amplitude e a estabilidade.",
      level: "fundamental",
      lessons: [
        { slug: "tipos-de-articulacao", title: "Tipos de articulação", type: "conceito", term: "Articulação sinovial", definition: "Articulação móvel cuja forma define os movimentos possíveis (ex.: esférica, gínglimo).", apply: "A forma articular orienta quais movimentos treinar e onde a amplitude é naturalmente limitada." },
        { slug: "estabilidade-vs-mobilidade", title: "Estabilidade e mobilidade", type: "conceito", term: "Trade-off mobilidade e estabilidade", definition: "Regiões do corpo tendem a priorizar mais mobilidade ou mais estabilidade em cadeia.", apply: "Ajuda a decidir onde buscar amplitude e onde reforçar controle." },
      ],
    },
    {
      slug: "cadeia-muscular",
      title: "Trabalho em cadeia",
      objective: "Entender como os segmentos cooperam em um padrão de movimento.",
      level: "intermediario",
      lessons: [
        { slug: "cadeia-posterior", title: "Cadeia posterior", type: "mecanismo", term: "Cadeia posterior", definition: "Conjunto de músculos do dorso, glúteos e isquiotibiais que atuam juntos em padrões de quadril.", apply: "Fundamenta a escolha e a ênfase em terra, hip thrust e remadas." },
        { slug: "core-funcional", title: "Core funcional", type: "mecanismo", term: "Core", definition: "Musculatura do tronco que estabiliza a coluna e transfere força entre membros.", apply: "Prioriza padrões de anti-movimento (prancha, dead bug) na maioria dos objetivos." },
      ],
    },
  ],
  "fisiologia-humana": [
    {
      slug: "sistema-cardiovascular",
      title: "Sistema cardiovascular",
      objective: "Compreender a resposta cardiovascular ao esforço.",
      level: "fundamental",
      lessons: [
        { slug: "debito-cardiaco", title: "Débito cardíaco", type: "conceito", term: "Débito cardíaco", definition: "Volume de sangue bombeado por minuto (frequência cardíaca x volume sistólico).", apply: "Explica por que a frequência cardíaca sobe com a intensidade e como o treino melhora a eficiência." },
        { slug: "pressao-no-exercicio", title: "Pressão no exercício", type: "conceito", term: "Resposta pressórica", definition: "Comportamento da pressão arterial durante e após o esforço.", apply: "Orienta cuidados com respiração e intensidade, sobretudo na hipertensão." },
      ],
    },
    {
      slug: "sistema-respiratorio",
      title: "Sistema respiratório",
      objective: "Relacionar ventilação, esforço e percepção.",
      level: "fundamental",
      lessons: [
        { slug: "ventilacao", title: "Ventilação e esforço", type: "conceito", term: "Limiar ventilatório", definition: "Ponto em que a ventilação sobe de forma desproporcional à intensidade.", apply: "Sustenta o teste da fala como guia prático de intensidade." },
        { slug: "consumo-oxigenio", title: "Consumo de oxigênio", type: "mecanismo", term: "VO2", definition: "Quantidade de oxigênio consumida; reflete a demanda metabólica da tarefa.", apply: "Base para entender aptidão aeróbia e progressão de volume." },
      ],
    },
    {
      slug: "adaptacoes",
      title: "Adaptações ao treino",
      objective: "Distinguir respostas agudas de adaptações crônicas.",
      level: "intermediario",
      lessons: [
        { slug: "aguda-vs-cronica", title: "Aguda e crônica", type: "conceito", term: "Adaptação crônica", definition: "Mudança estrutural ou funcional que se consolida com o treino repetido.", apply: "Diferencia o cansaço de hoje do resultado que se constrói ao longo de semanas." },
        { slug: "homeostase", title: "Homeostase e estímulo", type: "mecanismo", term: "Sobrecarga e recuperação", definition: "O corpo se adapta quando o estímulo desafia a homeostase e há recuperação suficiente.", apply: "Fundamenta a progressão gradual e a importância do descanso." },
      ],
    },
  ],
  "bioquimica-metabolismo": [
    {
      slug: "vias-energeticas",
      title: "Vias energéticas",
      objective: "Relacionar duração e intensidade com o sistema energético predominante.",
      level: "fundamental",
      lessons: [
        { slug: "sistemas-energeticos", title: "Sistemas energéticos", type: "conceito", term: "Sistemas de energia", definition: "Vias que ressintetizam ATP: fosfagênio, glicolítico e oxidativo.", apply: "Explica por que esforços curtos e longos usam combustíveis diferentes." },
        { slug: "substratos", title: "Substratos", type: "conceito", term: "Substrato energético", definition: "Fonte usada para gerar energia (fosfocreatina, glicose, gordura).", apply: "Orienta a leitura de esforços intensos versus contínuos." },
      ],
    },
    {
      slug: "metabolismo-treino",
      title: "Metabolismo e treino",
      objective: "Entender o gasto e a recuperação metabólica.",
      level: "intermediario",
      lessons: [
        { slug: "gasto-energetico", title: "Gasto energético", type: "conceito", term: "Gasto energético", definition: "Energia total gasta em repouso e em atividade.", apply: "Base do papel do volume aeróbio no emagrecimento." },
        { slug: "epoc", title: "EPOC", type: "mecanismo", term: "EPOC", definition: "Consumo de oxigênio elevado após o exercício, para restaurar o equilíbrio.", apply: "Ajuda a ler o efeito de sessões intensas sem superestimá-lo." },
      ],
    },
  ],
  cinesiologia: [
    {
      slug: "planos-e-eixos",
      title: "Planos, eixos e ações",
      objective: "Descrever movimentos com precisão.",
      level: "fundamental",
      lessons: [
        { slug: "planos-movimento", title: "Planos de movimento", type: "conceito", term: "Plano de movimento", definition: "Superfície que organiza a direção do movimento: sagital, frontal, transverso.", apply: "Compor um programa equilibrado entre os planos." },
        { slug: "acoes-articulares", title: "Ações articulares", type: "conceito", term: "Ação articular", definition: "Movimento específico de uma articulação (flexão, extensão, rotação).", apply: "Nomear a ação ajuda a escolher o exercício certo para o alvo." },
      ],
    },
    {
      slug: "alavancas",
      title: "Alavancas do corpo",
      objective: "Aplicar o conceito de alavanca ao movimento humano.",
      level: "intermediario",
      lessons: [
        { slug: "tipos-alavanca", title: "Tipos de alavanca", type: "conceito", term: "Alavanca", definition: "Sistema de força, resistência e eixo; o corpo usa os três tipos.", apply: "Explica vantagens mecânicas em diferentes articulações." },
        { slug: "vantagem-mecanica", title: "Vantagem mecânica", type: "mecanismo", term: "Vantagem mecânica", definition: "Relação entre os braços de força e de resistência.", apply: "Fundamenta por que certos ângulos são mais fortes." },
      ],
    },
  ],
  "biomecanica-basica": [
    {
      slug: "forcas",
      title: "Forças e equilíbrio",
      objective: "Entender as forças que agem no corpo.",
      level: "fundamental",
      lessons: [
        { slug: "forca-peso-atrito", title: "Peso, normal e atrito", type: "conceito", term: "Força externa", definition: "Forças que agem sobre o corpo, como peso, reação do solo e atrito.", apply: "Base para analisar a resistência de um exercício." },
        { slug: "equilibrio", title: "Equilíbrio e base", type: "conceito", term: "Base de suporte", definition: "Área de contato que sustenta o corpo em relação ao centro de massa.", apply: "Ajustar a base muda a exigência de equilíbrio." },
      ],
    },
    {
      slug: "momentos",
      title: "Momentos e torque",
      objective: "Aplicar torque à análise de exercícios.",
      level: "intermediario",
      lessons: [
        { slug: "torque-basico", title: "Torque", type: "mecanismo", term: "Torque", definition: "Efeito rotacional de uma força; força vezes braço de momento.", apply: "Explica por que a mesma carga pesa diferente em cada ângulo." },
        { slug: "centro-de-gravidade", title: "Centro de gravidade", type: "conceito", term: "Centro de massa", definition: "Ponto onde se concentra o peso do corpo.", apply: "Sua posição relativa ao apoio define estabilidade e demanda." },
      ],
    },
  ],
  "neurofisiologia-do-movimento": [
    {
      slug: "controle-motor",
      title: "Controle motor",
      objective: "Entender como o sistema nervoso comanda o movimento.",
      level: "fundamental",
      lessons: [
        { slug: "unidade-motora", title: "Unidade motora", type: "conceito", term: "Unidade motora", definition: "Um neurônio motor e as fibras que ele inerva.", apply: "Base do recrutamento e da adaptação neural inicial à força." },
        { slug: "recrutamento", title: "Recrutamento", type: "mecanismo", term: "Princípio do tamanho", definition: "Unidades menores são recrutadas antes das maiores conforme a demanda cresce.", apply: "Explica por que cargas maiores recrutam mais unidades motoras." },
      ],
    },
    {
      slug: "aprendizagem-motora",
      title: "Aprendizagem motora",
      objective: "Aplicar princípios de aprendizagem ao ensino de exercícios.",
      level: "intermediario",
      lessons: [
        { slug: "fases-aprendizagem", title: "Fases da aprendizagem", type: "conceito", term: "Aprendizagem motora", definition: "Processo de tornar um movimento mais eficiente e automático com a prática.", apply: "Orienta a dose de instrução e a progressão de complexidade." },
        { slug: "feedback", title: "Feedback", type: "conceito", term: "Feedback", definition: "Informação sobre a execução que guia o ajuste do movimento.", apply: "Menos e melhor feedback costuma favorecer a autonomia do aluno." },
      ],
    },
  ],
  // fisiologia-do-exercicio tem AUTORIA DEDICADA em fisiologia-exercicio.ts.
  // treinamento-de-forca tem AUTORIA DEDICADA em forca.ts (padrão livro-texto),
  // por isso NÃO entra no currículo curado (evita duplicar módulos/aulas).
  "treinamento-cardiorrespiratorio": [
    {
      slug: "metodos-cardio",
      title: "Métodos aeróbios",
      objective: "Diferenciar contínuo e intervalado.",
      level: "fundamental",
      lessons: [
        { slug: "continuo", title: "Contínuo", type: "conceito", term: "Treino contínuo", definition: "Esforço sustentado em intensidade estável por um período.", apply: "Constrói a base aeróbia com segurança no início." },
        { slug: "intervalado", title: "Intervalado", type: "conceito", term: "Treino intervalado", definition: "Alternância entre esforços intensos e recuperação.", apply: "Estímulo eficiente para aptidão sobre base já estabelecida." },
      ],
    },
    {
      slug: "zonas",
      title: "Zonas e monitoramento",
      objective: "Guiar a intensidade com ferramentas práticas.",
      level: "intermediario",
      lessons: [
        { slug: "zonas-fc", title: "Zonas de FC", type: "conceito", term: "Zona-alvo", definition: "Faixa de frequência cardíaca correspondente à intensidade pretendida.", apply: "Útil quando a FC é confiável; alternar com o teste da fala." },
        { slug: "fc-recuperacao", title: "FC de recuperação", type: "mecanismo", term: "FC de recuperação", definition: "Queda da FC logo após o esforço; pista de condicionamento.", apply: "Acompanhar essa queda mostra evolução ao longo das semanas." },
      ],
    },
  ],
  "mobilidade-e-flexibilidade": [
    {
      slug: "conceitos-mobilidade",
      title: "Conceitos de mobilidade",
      objective: "Diferenciar flexibilidade, mobilidade e amplitude útil.",
      level: "fundamental",
      lessons: [
        { slug: "flexibilidade-vs-mobilidade", title: "Flexibilidade e mobilidade", type: "conceito", term: "Mobilidade", definition: "Amplitude ativa e controlada de uma articulação; flexibilidade é a passiva.", apply: "Priorizar amplitude que a pessoa controla, não só a que alcança." },
        { slug: "amplitude-util", title: "Amplitude útil", type: "conceito", term: "Amplitude útil", definition: "Faixa que entrega o estímulo desejado com tolerância adequada.", apply: "Reduzir amplitude pode ser adaptação legítima." },
      ],
    },
    {
      slug: "metodos-mobilidade",
      title: "Métodos de trabalho",
      objective: "Escolher a estratégia conforme o objetivo.",
      level: "intermediario",
      lessons: [
        { slug: "alongamento", title: "Alongamento", type: "conceito", term: "Alongamento", definition: "Estímulo para aumentar tolerância ao estiramento e amplitude.", apply: "Efeitos dependem de dose, tipo e contexto." },
        { slug: "mobilidade-articular", title: "Mobilidade articular", type: "mecanismo", term: "Trabalho de mobilidade", definition: "Exercícios ativos que ampliam o movimento controlado da articulação.", apply: "Integrar ao aquecimento e ao próprio treino." },
      ],
    },
  ],
  "avaliacao-fisica-e-funcional": [
    {
      slug: "medidas",
      title: "Medidas e interpretação",
      objective: "Escolher e interpretar medidas com propósito.",
      level: "fundamental",
      lessons: [
        { slug: "composicao-corporal", title: "Composição corporal", type: "conceito", term: "Composição corporal", definition: "Estimativa das frações de massa (gordura, magra) por diferentes métodos.", apply: "Cada método tem erro; comparar sempre pelo mesmo protocolo." },
        { slug: "perimetria", title: "Perimetria", type: "conceito", term: "Perímetros", definition: "Medidas de circunferência que acompanham mudanças ao longo do tempo.", apply: "Padronizar ponto e postura reduz o erro entre avaliações." },
      ],
    },
    {
      slug: "testes-funcionais",
      title: "Testes funcionais",
      objective: "Responder a perguntas com o teste certo.",
      level: "intermediario",
      lessons: [
        { slug: "escolher-teste", title: "Escolher o teste", type: "conceito", term: "Validade do teste", definition: "O teste responde de fato à pergunta que se quer investigar.", apply: "Definir a pergunta antes de escolher o teste." },
        { slug: "interpretar-resultado", title: "Interpretar o resultado", type: "mecanismo", term: "Interpretação", definition: "Ler o resultado no contexto do aluno e da variação esperada.", apply: "Comparar com a própria linha de base, não só com tabelas." },
      ],
    },
  ],
  "controle-de-carga-e-recuperacao": [
    {
      slug: "carga-interna",
      title: "Carga interna e externa",
      objective: "Monitorar a dose real do treino.",
      level: "intermediario",
      lessons: [
        { slug: "srpe", title: "sRPE", type: "conceito", term: "sRPE", definition: "Carga interna estimada por percepção de esforço vezes a duração da sessão.", apply: "Ferramenta simples para acompanhar o volume semanal." },
        { slug: "carga-externa", title: "Carga externa", type: "conceito", term: "Carga externa", definition: "Trabalho prescrito (séries, repetições, distância, tempo).", apply: "Comparar com a resposta interna do aluno." },
      ],
    },
    {
      slug: "recuperacao",
      title: "Recuperação",
      objective: "Equilibrar estímulo e recuperação.",
      level: "intermediario",
      lessons: [
        { slug: "sono-estresse", title: "Sono e estresse", type: "conceito", term: "Recuperação", definition: "Sono, nutrição e estresse influenciam a resposta ao treino.", apply: "Considerar esses fatores ao ler estagnação ou fadiga." },
        { slug: "sinais-fadiga", title: "Sinais de fadiga", type: "mecanismo", term: "Fadiga acumulada", definition: "Queda de desempenho e disposição por recuperação insuficiente.", apply: "Ajustar volume e intensidade diante dos sinais." },
      ],
    },
  ],
  "planejamento-e-periodizacao": [
    {
      slug: "principios",
      title: "Princípios do planejamento",
      objective: "Organizar estímulos no tempo em direção a um objetivo.",
      level: "intermediario",
      lessons: [
        { slug: "especificidade", title: "Especificidade", type: "conceito", term: "Especificidade", definition: "As adaptações refletem o tipo de estímulo aplicado.", apply: "Alinhar o treino ao objetivo do aluno." },
        { slug: "variacao", title: "Variação", type: "conceito", term: "Variação", definition: "Alternar estímulos para sustentar o progresso e a adesão.", apply: "Variar sem perder a especificidade do objetivo." },
      ],
    },
    {
      slug: "modelos",
      title: "Modelos de periodização",
      objective: "Escolher a organização conforme o contexto.",
      level: "avancado",
      lessons: [
        { slug: "linear-ondulatoria", title: "Linear e ondulatória", type: "comparacao", term: "Periodização", definition: "Formas de distribuir volume e intensidade ao longo do tempo.", apply: "Modelos são referências; a resposta individual guia os ajustes." },
        { slug: "mesociclo", title: "Mesociclo", type: "conceito", term: "Mesociclo", definition: "Bloco de semanas com um foco de treino definido.", apply: "Organizar progressões e semanas de menor carga." },
      ],
    },
  ],
  "raciocinio-de-prescricao": [
    {
      slug: "decisao",
      title: "Como decidir",
      objective: "Transformar avaliação e contexto em decisão.",
      level: "intermediario",
      lessons: [
        { slug: "criterios-decisao", title: "Critérios de decisão", type: "mecanismo", term: "Critérios", definition: "Objetivo, nível, restrição, equipamento e tolerância orientam a escolha.", apply: "Tornar explícitos os critérios que pesaram na decisão." },
        { slug: "descartar-opcoes", title: "Descartar opções", type: "conceito", term: "Descartes justificados", definition: "Registrar por que uma opção não foi escolhida é parte do raciocínio.", apply: "O porquê do descarte fortalece a justificativa." },
      ],
    },
    {
      slug: "justificar",
      title: "Justificar a decisão",
      objective: "Documentar a decisão de forma defensável.",
      level: "avancado",
      lessons: [
        { slug: "documentar", title: "Documentar", type: "aplicacao", term: "Prontuário de decisão", definition: "Registro do raciocínio que embasou a prescrição.", apply: "Um registro assinável dá segurança e sustenta a conduta." },
        { slug: "comunicar-decisao", title: "Comunicar a decisão", type: "conceito", term: "Comunicação da decisão", definition: "Explicar ao aluno o porquê das escolhas em linguagem clara.", apply: "Entender o porquê aumenta a adesão." },
      ],
    },
  ],
  "prescricao-para-grupos-especiais": [
    {
      slug: "principios-grupos",
      title: "Princípios gerais",
      objective: "Adaptar cuidados sem esvaziar o estímulo.",
      level: "intermediario",
      lessons: [
        { slug: "triagem", title: "Triagem pré-participação", type: "conceito", term: "Triagem", definition: "Levantamento de sinais e condições antes de iniciar o esforço.", apply: "Base do Semáforo de Liberação antes das sessões." },
        { slug: "adaptar-sem-esvaziar", title: "Adaptar sem esvaziar", type: "conceito", term: "Adaptação", definition: "Ajustar carga, amplitude e modalidade preservando o objetivo.", apply: "Adaptar é diferente de retirar o estímulo." },
      ],
    },
    {
      slug: "condicoes",
      title: "Condições frequentes",
      objective: "Reconhecer cuidados por condição.",
      level: "avancado",
      lessons: [
        { slug: "cardiometabolico", title: "Cardiometabólico", type: "conceito", term: "Risco cardiometabólico", definition: "Hipertensão, diabetes e obesidade pedem cuidados de intensidade e monitoramento.", apply: "A conduta clínica segue o profissional de saúde." },
        { slug: "musculoesqueletico", title: "Musculoesquelético", type: "conceito", term: "Cuidado articular", definition: "Dor lombar e osteoartrite pedem carga controlada e modulação pela dor.", apply: "Movimento gradual costuma ser aliado." },
      ],
    },
  ],
  "dor-limitacoes-e-adaptacao": [
    {
      slug: "entender-dor",
      title: "Entender a dor",
      objective: "Ler a dor no contexto, sem diagnosticar.",
      level: "intermediario",
      lessons: [
        { slug: "dor-nao-e-dano", title: "Dor e dano", type: "conceito", term: "Dor", definition: "Experiência multifatorial que nem sempre corresponde a dano tecidual.", apply: "Evitar alarmar; observar tolerância e comportamento da dor." },
        { slug: "red-flags", title: "Sinais de alerta", type: "conceito", term: "Red flags", definition: "Sinais que sugerem avaliação de profissional de saúde.", apply: "Encaminhar diante de sinais de alerta." },
      ],
    },
    {
      slug: "adaptar-dor",
      title: "Adaptar com dor",
      objective: "Manter estímulo dentro da tolerância.",
      level: "intermediario",
      lessons: [
        { slug: "amplitude-tolerada", title: "Amplitude tolerada", type: "mecanismo", term: "Exposição gradual", definition: "Aumentar carga e amplitude conforme a tolerância melhora.", apply: "Progredir sem provocar dor crescente." },
        { slug: "monitorar-resposta", title: "Monitorar a resposta", type: "conceito", term: "Resposta à carga", definition: "Acompanhar a dor durante, após e no dia seguinte.", apply: "A resposta guia a progressão, não o calendário." },
      ],
    },
  ],
  "leitura-critica-de-evidencias": [
    {
      slug: "niveis-evidencia",
      title: "Níveis de evidência",
      objective: "Situar um estudo na hierarquia da evidência.",
      level: "intermediario",
      lessons: [
        { slug: "hierarquia", title: "Hierarquia", type: "conceito", term: "Níveis de evidência", definition: "Ordem que vai de opinião a revisões sistemáticas e diretrizes.", apply: "Ponderar a força da recomendação pela qualidade da evidência." },
        { slug: "vieses", title: "Vieses", type: "conceito", term: "Viés", definition: "Fatores que distorcem os resultados de um estudo.", apply: "Ler com senso crítico antes de generalizar." },
      ],
    },
    {
      slug: "aplicar-evidencia",
      title: "Aplicar a evidência",
      objective: "Levar a evidência ao caso individual.",
      level: "avancado",
      lessons: [
        { slug: "individualizar", title: "Individualizar", type: "mecanismo", term: "Aplicação individual", definition: "A média de um estudo nem sempre descreve o aluno à frente.", apply: "Usar a evidência como ponto de partida, ajustando ao contexto." },
        { slug: "incerteza", title: "Incerteza", type: "conceito", term: "Incerteza científica", definition: "Reconhecer o que ainda não está estabelecido.", apply: "Comunicar tendência, não certeza absoluta." },
      ],
    },
  ],
  "comunicacao-e-adesao": [
    {
      slug: "comunicar",
      title: "Comunicação clara",
      objective: "Explicar decisões de forma acessível.",
      level: "fundamental",
      lessons: [
        { slug: "linguagem", title: "Linguagem", type: "conceito", term: "Linguagem acessível", definition: "Explicar sem jargão, conectando ao objetivo do aluno.", apply: "Clareza aumenta a confiança e a adesão." },
        { slug: "expectativa", title: "Expectativa", type: "conceito", term: "Alinhamento de expectativa", definition: "Combinar metas realistas e o tempo esperado de resultado.", apply: "Expectativa alinhada reduz frustração e abandono." },
      ],
    },
    {
      slug: "adesao",
      title: "Sustentar a adesão",
      objective: "Manter o aluno engajado ao longo do tempo.",
      level: "intermediario",
      lessons: [
        { slug: "barreiras", title: "Barreiras", type: "conceito", term: "Barreiras à prática", definition: "Fatores que dificultam a constância (tempo, dor, motivação).", apply: "Identificar e reduzir barreiras aumenta a frequência." },
        { slug: "habito", title: "Hábito", type: "mecanismo", term: "Construção de hábito", definition: "Repetição consistente que torna a prática parte da rotina.", apply: "Sessões viáveis e prazerosas sustentam o hábito." },
      ],
    },
  ],
  "seguranca-e-limites-de-atuacao": [
    {
      slug: "seguranca",
      title: "Segurança na sessão",
      objective: "Reconhecer sinais que pedem cautela.",
      level: "fundamental",
      lessons: [
        { slug: "sinais-alerta", title: "Sinais de alerta", type: "conceito", term: "Sinais de alerta", definition: "Dor no peito, tontura, falta de ar desproporcional pedem interromper.", apply: "Interromper e reavaliar diante desses sinais." },
        { slug: "triagem-parq", title: "Triagem (PAR-Q)", type: "conceito", term: "Prontidão para atividade", definition: "Perguntas simples antes de liberar o esforço.", apply: "Base do gate pré-sessão do Semáforo." },
      ],
    },
    {
      slug: "escopo",
      title: "Escopo profissional",
      objective: "Atuar dentro do escopo e encaminhar quando preciso.",
      level: "intermediario",
      lessons: [
        { slug: "escopo-atuacao", title: "Escopo de atuação", type: "conceito", term: "Escopo profissional", definition: "O que compete ao profissional de Educação Física e o que compete à saúde.", apply: "A ferramenta apoia a decisão; a conduta clínica é do profissional de saúde." },
        { slug: "encaminhamento", title: "Encaminhamento", type: "conceito", term: "Encaminhamento", definition: "Direcionar o aluno a outro profissional diante de sinais de alerta.", apply: "Encaminhar é parte da conduta segura." },
      ],
    },
  ],
};

function lessonFromSpec(spec: LessonSpec, discSlug: string, modId: string, modSlug: string): Lesson {
  const refs = REF_POR_DISCIPLINA[discSlug] ?? ["garber-2011"];
  return {
    id: `l-${discSlug}-${spec.slug}`,
    moduleId: modId,
    disciplineSlug: discSlug,
    moduleSlug: modSlug,
    slug: `${discSlug}--${spec.slug}`,
    title: spec.title,
    description: spec.definition,
    level: "fundamental",
    estimatedMinutes: 7,
    type: spec.type,
    status: "nao-iniciado",
    progress: 0,
    tags: [],
    blocks: [
      { id: `b-${discSlug}-${spec.slug}-hero`, type: "hero", order: 1, content: { kicker: "Aprender", text: spec.definition } },
      { id: `b-${discSlug}-${spec.slug}-concept`, type: "key_concept", order: 2, title: "Conceito-chave", content: { term: spec.term, definition: spec.definition } },
      { id: `b-${discSlug}-${spec.slug}-apply`, type: "practical_application", order: 3, title: "Aplicação prática", content: { text: spec.apply } },
      { id: `b-${discSlug}-${spec.slug}-unc`, type: "scientific_uncertainty", order: 4, title: "Nota de prudência", content: { text: "Síntese em construção editorial; trate as tendências como pontos de partida, sempre no contexto do aluno." }, isOptional: true },
      { id: `b-${discSlug}-${spec.slug}-ref`, type: "references", order: 5, title: "Referências", content: { ids: refs }, isOptional: true },
      { id: `b-${discSlug}-${spec.slug}-apply2`, type: "apply_to_prescription", order: 6, title: "Aplicar no atendimento", content: { summary: spec.apply } },
    ],
    references: refs,
  };
}

function build(): { modules: Module[]; lessons: Lesson[] } {
  const modules: Module[] = [];
  const lessons: Lesson[] = [];
  for (const [discSlug, mods] of Object.entries(CURRICULO)) {
    mods.forEach((m, i) => {
      const modId = `m-${discSlug}-${m.slug}`;
      const lessonSlugs = m.lessons.map((l) => `${discSlug}--${l.slug}`);
      modules.push({
        id: modId,
        disciplineId: discIdFromSlug(discSlug),
        slug: m.slug,
        title: m.title,
        description: m.objective,
        objective: m.objective,
        order: i + 1,
        level: m.level,
        estimatedMinutes: m.lessons.length * 8,
        lessonCount: m.lessons.length,
        progress: 0,
        status: "nao-iniciado",
        lessonSlugs,
      });
      for (const l of m.lessons) lessons.push(lessonFromSpec(l, discSlug, modId, m.slug));
    });
  }
  return { modules, lessons };
}

/** slug → id da disciplina (espelha disciplines.ts: id = "d-" + primeiro token). */
const SLUG_TO_ID: Record<string, string> = {
  "anatomia-funcional": "d-anatomia",
  "fisiologia-humana": "d-fisiologia",
  "bioquimica-metabolismo": "d-bioquimica",
  cinesiologia: "d-cinesiologia",
  "biomecanica-basica": "d-biomecanica-basica",
  "neurofisiologia-do-movimento": "d-neurofisiologia",
  "fisiologia-do-exercicio": "d-fisio-exercicio",
  "treinamento-de-forca": "d-forca",
  "treinamento-cardiorrespiratorio": "d-cardio",
  "mobilidade-e-flexibilidade": "d-mobilidade",
  "avaliacao-fisica-e-funcional": "d-avaliacao",
  "controle-de-carga-e-recuperacao": "d-carga",
  "planejamento-e-periodizacao": "d-periodizacao",
  "raciocinio-de-prescricao": "d-raciocinio",
  "prescricao-para-grupos-especiais": "d-grupos-especiais",
  "dor-limitacoes-e-adaptacao": "d-dor",
  "leitura-critica-de-evidencias": "d-evidencias",
  "comunicacao-e-adesao": "d-comunicacao",
  "seguranca-e-limites-de-atuacao": "d-seguranca",
};
function discIdFromSlug(slug: string): string {
  return SLUG_TO_ID[slug] ?? `d-${slug}`;
}

const built = build();
export const curriculoModules = built.modules;
export const curriculoLessons = built.lessons;
