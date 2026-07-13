import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** LEITURA CRÍTICA DE EVIDÊNCIAS, disciplina autorada em profundidade. */

const DISC = "leitura-critica-de-evidencias";
const DISC_ID = "d-evidencias";
const K = "Leitura crítica de evidências";

const hierarquia = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-niveis-evidencia`, moduleSlug: "niveis-evidencia",
  slug: `${DISC}--hierarquia`, title: "Níveis de evidência: pesar a força da recomendação",
  figure: { id: "piramide-evidencias" },
  subtitle: "Níveis de evidência", description: "Situar um estudo na hierarquia da evidência ajuda a ponderar quanta confiança dar a uma recomendação.",
  level: "intermediario", minutes: 11, type: "conceito", kicker: K, tags: ["níveis de evidência", "hierarquia", "diretrizes"],
  hero: "Nem toda afirmação tem o mesmo peso. Um relato isolado e uma revisão sistemática de vários estudos não merecem a mesma confiança. Situar a fonte na hierarquia orienta quanto acreditar.",
  question: "Um influenciador cita um estudo pequeno para defender um método. Como pesar isso frente a uma diretriz baseada em muitos estudos?",
  concepts: [
    { term: "Níveis de evidência", definition: "Ordenação da confiabilidade das fontes, da opinião e do relato de caso, passando por estudos observacionais e ensaios, até revisões sistemáticas, meta-análises e diretrizes." },
    { term: "Força da recomendação", definition: "Quanto uma orientação deve pesar na prática, considerando a qualidade e a consistência da evidência que a sustenta." },
  ],
  chart: {
    title: "Confiabilidade relativa das fontes (ilustrativo)",
    points: [
      { label: "Opinião / relato", value: 25 },
      { label: "Estudo observacional", value: 55 },
      { label: "Ensaio clínico", value: 75 },
      { label: "Revisão / meta-análise", value: 92 },
      { label: "Diretriz robusta", value: 95 },
    ],
    explanation: "Fontes mais altas na hierarquia, quando bem conduzidas, dão mais confiança. Não é regra absoluta (um ensaio bem-feito pode valer mais que uma revisão fraca), mas orienta o peso a dar. Valores ilustrativos.",
  },
  apply: "Ao encontrar uma afirmação, pergunte de onde ela vem e onde se situa na hierarquia. Recomendações de revisões sistemáticas e diretrizes robustas pesam mais do que um estudo isolado ou uma opinião. Responder à abertura: um estudo pequeno é uma peça; uma diretriz baseada em muitos estudos costuma pesar mais na decisão.",
  special: [
    "Prescrição para grupos especiais: priorize diretrizes e consensos de entidades reconhecidas, pela robustez.",
    "Novidades virais: desconfie de conclusões fortes baseadas em uma única fonte pequena.",
    "Contexto individual: mesmo a melhor evidência é média populacional; ela orienta, o caso ajusta.",
  ],
  mistake: {
    mistake: "Dar o mesmo peso a um relato isolado e a uma revisão sistemática, ou mudar a conduta a cada estudo novo que aparece.",
    instead: "Pondere pela hierarquia e pela consistência. Uma recomendação robusta muda pouco com um único estudo discordante; revisões e diretrizes orientam melhor.",
  },
  professionalCase: {
    prompt: "Aluno traz um post citando um estudo pequeno para justificar abandonar um método bem sustentado por diretrizes. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar a hierarquia de evidência, manter o que é sustentado por revisões e diretrizes e acompanhar novas evidências robustas.", tone: "recomendada", feedback: "Coerente. Um estudo pequeno não derruba uma recomendação robusta; a hierarquia orienta o peso." },
      { id: "c2", label: "Mudar a conduta imediatamente com base no estudo do post.", tone: "cautela", feedback: "Reagir a uma fonte isolada, contra evidência robusta, é precipitado." },
      { id: "c3", label: "Ignorar completamente qualquer evidência nova.", tone: "aceitavel", feedback: "Novas evidências robustas merecem atenção; o erro é dar peso demais a uma fonte fraca isolada." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Qual fonte, em geral bem conduzida, dá mais confiança a uma recomendação?", [
      { id: "a", label: "Revisão sistemática ou diretriz robusta." },
      { id: "b", label: "Opinião ou relato de caso isolado." },
    ], "a", "Fontes mais altas na hierarquia, bem conduzidas, sustentam recomendações com mais confiança."),
    q("q2", "verdadeiro-falso", "Um único estudo pequeno deve, por si só, derrubar uma recomendação sustentada por diretrizes robustas.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Recomendações robustas mudam pouco com uma fonte isolada; é preciso evidência consistente para revê-las."),
  ],
  uncertainty: "A hierarquia é um guia, não uma regra rígida: um ensaio bem-feito pode valer mais que uma revisão fraca. Pondere qualidade e consistência, não só o rótulo da fonte.",
  related: [
    { title: "Vieses", href: `/aprender/conteudos/${DISC}--vieses`, type: "conceito" },
    { title: "Individualizar a evidência", href: `/aprender/conteudos/${DISC}--individualizar`, type: "mecanismo" },
    { title: "Incerteza científica", href: `/aprender/conteudos/${DISC}--incerteza`, type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Pese as afirmações pela hierarquia e pela consistência: revisões sistemáticas e diretrizes robustas orientam mais do que fontes isoladas. Acompanhe novas evidências robustas sem reagir a cada estudo isolado.",
});

const vieses = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-niveis-evidencia`, moduleSlug: "niveis-evidencia",
  slug: `${DISC}--vieses`, title: "Vieses: o que distorce um resultado",
  subtitle: "Níveis de evidência", description: "Reconhecer fatores que distorcem estudos ajuda a ler com senso crítico antes de generalizar.",
  level: "intermediario", minutes: 10, type: "conceito", kicker: K, tags: ["viés", "senso crítico", "generalização"],
  hero: "Um resultado pode estar certo no papel e errado na conclusão, por causa de vieses: amostras enviesadas, conflitos de interesse, desfechos escolhidos a dedo. Reconhecê-los evita generalizar demais.",
  question: "Um suplemento mostra resultado 'incrível' num estudo pago pelo fabricante, em poucas pessoas muito treinadas. O que olhar antes de recomendar?",
  concepts: [
    { term: "Viés", definition: "Fator que distorce sistematicamente o resultado ou a interpretação de um estudo, como seleção da amostra, conflito de interesse, desfechos escolhidos ou falta de grupo de comparação." },
    { term: "Generalização", definition: "O grau em que um resultado se aplica a pessoas diferentes das estudadas. Amostras muito específicas limitam a extrapolação para o aluno comum." },
  ],
  apply: "Antes de aplicar um achado, pergunte: em quem foi estudado, quem financiou, havia comparação, o desfecho é relevante para o meu aluno. Responder à abertura: um resultado em poucos atletas, financiado pelo fabricante, com desfecho escolhido, pede cautela antes de generalizar para o aluno comum.",
  special: [
    "Suplementos e métodos comerciais: conflitos de interesse e amostras específicas são comuns; leia com atenção redobrada.",
    "Estudos em atletas de elite: nem sempre se aplicam ao aluno iniciante ou de saúde.",
    "Grupos especiais: a segurança e a conduta seguem as diretrizes, não um estudo isolado com viés.",
  ],
  mistake: {
    mistake: "Aceitar uma conclusão forte sem checar amostra, comparação, financiamento e relevância do desfecho.",
    instead: "Leia com senso crítico: identifique possíveis vieses e pergunte se o resultado se aplica ao seu aluno antes de mudar a conduta.",
  },
  professionalCase: {
    prompt: "Fabricante divulga que seu equipamento 'dobra os resultados' com base em estudo próprio, em poucos usuários selecionados. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Considerar o conflito de interesse e a amostra limitada, buscar evidência independente e não generalizar a conclusão.", tone: "recomendada", feedback: "Coerente. Vieses de financiamento e seleção pedem cautela; evidência independente pesa mais." },
      { id: "c2", label: "Adotar o equipamento como superior com base no estudo do fabricante.", tone: "cautela", feedback: "Estudo próprio com amostra selecionada e conflito de interesse não sustenta uma conclusão forte." },
      { id: "c3", label: "Descartar toda evidência do fabricante sem análise.", tone: "aceitavel", feedback: "Nem toda evidência de fabricante é inválida; o certo é analisar os vieses, não descartar sem ler." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Antes de aplicar um achado 'impressionante', o essencial é checar:", [
      { id: "a", label: "Amostra, comparação, financiamento e relevância do desfecho." },
      { id: "b", label: "Apenas o tamanho do efeito relatado." },
    ], "a", "Esses fatores revelam vieses e o quanto o resultado se generaliza; o tamanho do efeito sozinho engana."),
    q("q2", "verdadeiro-falso", "Um resultado válido em atletas de elite se aplica automaticamente a qualquer iniciante.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Amostras específicas limitam a generalização; o contexto do aluno precisa ser considerado."),
  ],
  uncertainty: "Identificar vieses exige julgamento e nem sempre é simples; nenhum estudo é perfeito. Leia com senso crítico e pondere no conjunto das evidências.",
  related: [
    { title: "Hierarquia", href: `/aprender/conteudos/${DISC}--hierarquia`, type: "conceito" },
    { title: "Individualizar a evidência", href: `/aprender/conteudos/${DISC}--individualizar`, type: "mecanismo" },
    { title: "Incerteza científica", href: `/aprender/conteudos/${DISC}--incerteza`, type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Antes de aplicar um achado, cheque amostra, comparação, financiamento e relevância do desfecho; identifique possíveis vieses e avalie se o resultado se aplica ao seu aluno antes de mudar a conduta.",
});

const individualizar = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-aplicar-evidencia`, moduleSlug: "aplicar-evidencia",
  slug: `${DISC}--individualizar`, title: "Individualizar: da média ao aluno à frente",
  subtitle: "Aplicar a evidência", description: "A média de um estudo nem sempre descreve o indivíduo. Usar a evidência como ponto de partida e ajustar ao contexto é a arte da prescrição.",
  level: "avancado", minutes: 10, type: "mecanismo", kicker: K, tags: ["individualização", "média", "contexto"],
  hero: "A ciência descreve médias; você atende pessoas. A melhor evidência orienta a direção, mas quem está à sua frente pode responder diferente. Aplicar bem é ajustar a média ao indivíduo.",
  question: "Uma meta-análise diz que certo volume é ótimo em média. Seu aluno não recupera bem nesse volume. O que fazer?",
  concepts: [
    { term: "Aplicação individual", definition: "Usar a evidência como ponto de partida e ajustar ao objetivo, à resposta e ao contexto do aluno, que pode diferir da média estudada." },
    { term: "Resposta individual", definition: "A variação entre pessoas na resposta ao mesmo estímulo. Explica por que a recomendação média nem sempre serve ao aluno específico." },
  ],
  mechanism: {
    title: "Da evidência à conduta individual",
    steps: [
      { label: "Partir da melhor evidência", detail: "A recomendação robusta dá a direção inicial da prescrição." },
      { label: "Aplicar ao aluno", detail: "Considerar objetivo, nível, restrições e contexto ao traduzir a média em plano." },
      { label: "Observar a resposta", detail: "Acompanhar como o aluno responde, que pode diferir do esperado pela média." },
      { label: "Ajustar", detail: "Modificar a dose conforme a resposta, sem abandonar a lógica da evidência." },
    ],
  },
  apply: "Use a evidência para definir o ponto de partida e ajuste pela resposta do aluno. A média informa a direção; a resposta individual afina a dose. Responder à abertura: se o aluno não recupera no volume 'ótimo' da média, reduza para o que ele tolera e progrida a partir daí, sem contrariar a lógica geral.",
  special: [
    "Grupos especiais: a evidência orienta cuidados médios; a resposta e a condição individual ajustam a conduta.",
    "Iniciantes e avançados: respondem a doses diferentes; a mesma média não serve a ambos igualmente.",
    "Alta variabilidade de recuperação: individualizar o volume evita aplicar a média a quem não a tolera.",
  ],
  mistake: {
    mistake: "Aplicar a recomendação média rigidamente, ignorando que o aluno à frente pode responder de forma diferente.",
    instead: "Parta da evidência e ajuste pela resposta individual. A média é a bússola; o aluno específico determina a dose final.",
  },
  professionalCase: {
    prompt: "Aluno não recupera bem no volume que a literatura aponta como ótimo em média e vive fatigado. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Reduzir para um volume que ele tolera bem e progredir a partir da resposta dele, mantendo a lógica geral.", tone: "recomendada", feedback: "Coerente. A média orienta, mas a resposta individual manda; ajustar ao aluno respeita a evidência sem aplicá-la cegamente." },
      { id: "c2", label: "Manter o volume da média, assumindo que ele vai se adaptar.", tone: "cautela", feedback: "Insistir na média contra a resposta do aluno tende a manter a fadiga e a estagnação." },
      { id: "c3", label: "Abandonar a evidência e treinar por intuição.", tone: "aceitavel", feedback: "Não é preciso descartar a evidência; individualizar é ajustá-la, não ignorá-la." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Quando o aluno não tolera a dose 'ótima' média da literatura, o mais coerente é:", [
      { id: "a", label: "Ajustar para o que ele tolera e progredir pela resposta dele." },
      { id: "b", label: "Manter a dose da média a qualquer custo." },
    ], "a", "A média orienta, mas a resposta individual determina a dose; ajustar respeita a evidência sem aplicá-la cegamente."),
    q("q2", "verdadeiro-falso", "A média de um estudo descreve com precisão a resposta de todo indivíduo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Há variação entre pessoas; a média orienta a direção, mas o indivíduo pode responder diferente."),
  ],
  uncertainty: "O grau de variação individual e os motivos dela nem sempre são conhecidos. Use a evidência como ponto de partida e a resposta do aluno como ajuste fino.",
  related: [
    { title: "Incerteza científica", href: `/aprender/conteudos/${DISC}--incerteza`, type: "conceito" },
    { title: "Critérios de decisão", href: "/aprender/conteudos/raciocinio-de-prescricao--criterios-decisao", type: "mecanismo" },
    { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-schoenfeld-volume-2017", "ref-acsm-progressao-2009"],
  applyRx: "Use a evidência para o ponto de partida e ajuste pela resposta do aluno. A média é a bússola; a resposta individual afina a dose, sem abandonar a lógica geral.",
});

const incerteza = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-aplicar-evidencia`, moduleSlug: "aplicar-evidencia",
  slug: `${DISC}--incerteza`, title: "Incerteza científica: comunicar tendência, não certeza",
  subtitle: "Aplicar a evidência", description: "Reconhecer o que ainda não está estabelecido e comunicar em linguagem prudente é parte da boa prática.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["incerteza", "prudência", "comunicação"],
  hero: "Boa parte do que sabemos em ciência do exercício são tendências, não leis. Reconhecer a incerteza e comunicá-la com prudência protege o aluno de promessas e a você de afirmações que não se sustentam.",
  question: "Um aluno pergunta se determinado método 'garante' o resultado. Como responder com honestidade científica?",
  concepts: [
    { term: "Incerteza científica", definition: "O reconhecimento de que muitas questões ainda não estão estabelecidas e de que o conhecimento evolui. Tendências fortes convivem com margens de dúvida." },
    { term: "Linguagem prudente", definition: "Comunicar com termos que refletem a evidência: 'tende a', 'em geral', 'pode favorecer', em vez de garantias absolutas." },
  ],
  apply: "Comunique tendências, não certezas: use linguagem prudente e explique que a resposta varia. Isso constrói confiança de longo prazo e evita promessas que decepcionam. Responder à abertura: nenhum método 'garante' resultado; explique o que a evidência sugere, com que força, e que a resposta depende de vários fatores.",
  special: [
    "Emagrecimento e estética: campo cheio de promessas; a prudência diferencia o profissional sério.",
    "Grupos especiais: comunicar incerteza com segurança evita tanto o alarme quanto a falsa garantia.",
    "Novidades e modismos: reconhecer o que ainda é incerto protege o aluno de decisões precipitadas.",
  ],
  mistake: {
    mistake: "Prometer resultados garantidos ou afirmar como certo o que a evidência apenas sugere.",
    instead: "Comunique tendência e força da evidência com linguagem prudente. Honestidade sobre a incerteza gera mais confiança do que promessas.",
  },
  professionalCase: {
    prompt: "Aluno quer saber se um protocolo 'com certeza' vai lhe dar o corpo que deseja em três meses. Qual resposta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar o que a evidência sugere, com que força, e que a resposta varia, alinhando expectativa realista.", tone: "recomendada", feedback: "Coerente. Comunicar tendência e incerteza com honestidade constrói confiança e evita frustração." },
      { id: "c2", label: "Garantir o resultado no prazo para engajar.", tone: "cautela", feedback: "Garantia irreal é desonesta e leva a decepção e abandono." },
      { id: "c3", label: "Dizer que não dá para saber nada e mudar de assunto.", tone: "aceitavel", feedback: "Há tendências úteis a comunicar; o certo é ser prudente, não omisso." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Ao ser perguntado se um método 'garante' resultado, o mais coerente é:", [
      { id: "a", label: "Comunicar a tendência e a força da evidência, explicando que a resposta varia." },
      { id: "b", label: "Garantir o resultado para engajar o aluno." },
    ], "a", "Comunicar tendência e incerteza com prudência é honesto e constrói confiança; garantias irreais decepcionam."),
    q("q2", "verdadeiro-falso", "Usar linguagem prudente ('tende a', 'em geral') reflete melhor a evidência do que garantias absolutas.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A maior parte do conhecimento são tendências; a linguagem prudente comunica a evidência com honestidade."),
  ],
  uncertainty: "A própria fronteira entre o que está e o que não está estabelecido muda com o tempo. Mantenha-se atualizado e comunique com a humildade que a ciência pede.",
  related: [
    { title: "Individualizar a evidência", href: `/aprender/conteudos/${DISC}--individualizar`, type: "mecanismo" },
    { title: "Alinhamento de expectativa", href: "/aprender/conteudos/comunicacao-e-adesao--expectativa", type: "conceito" },
    { title: "Vieses", href: `/aprender/conteudos/${DISC}--vieses`, type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Comunique tendências e a força da evidência com linguagem prudente, explicando que a resposta varia. Honestidade sobre a incerteza constrói confiança de longo prazo e evita promessas que decepcionam.",
});

export const evidenciasModules: Module[] = [
  deepModule({ id: `m-${DISC}-niveis-evidencia`, disciplineId: DISC_ID, slug: "niveis-evidencia", title: "Níveis de evidência", objective: "Situar um estudo na hierarquia e reconhecer vieses.", order: 1, level: "intermediario", lessons: [hierarquia, vieses], applications: ["Pesar a força de uma recomendação pela fonte e pelos vieses"] }),
  deepModule({ id: `m-${DISC}-aplicar-evidencia`, disciplineId: DISC_ID, slug: "aplicar-evidencia", title: "Aplicar a evidência", objective: "Levar a evidência ao caso individual com prudência.", order: 2, level: "avancado", prerequisites: [`m-${DISC}-niveis-evidencia`], lessons: [individualizar, incerteza], applications: ["Individualizar a evidência e comunicar tendência, não certeza"] }),
];

export const evidenciasLessons: Lesson[] = [hierarquia, vieses, individualizar, incerteza];
