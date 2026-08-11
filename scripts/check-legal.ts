/**
 * Guardrail de conformidade e honestidade comercial.
 *
 * Roda com `npm run check:legal`. Cobre a classe de defeito que a varredura por
 * agentes encontrou e que nenhum outro guardrail alcançava: **o produto afirmando
 * ao usuário algo que o próprio código desmente**, em assunto que gera obrigação
 * legal. Não é estilo, é risco: promessa de privacidade falsa, prova social
 * fabricada, identificação inventada e preço divergente entre telas.
 *
 * O que ele NÃO faz: não avalia se os Termos e a Política estão juridicamente
 * corretos. Isso é trabalho de advogado e nenhum script substitui. Ele garante que
 * os documentos EXISTEM, ABREM, estão LINKADOS e são ACEITOS no cadastro, e que as
 * frases já corrigidas não voltam.
 */
import { readFileSync } from "node:fs";

/**
 * Lê o arquivo SEM comentários. É essencial: as correções deste guardrail deixaram
 * comentários que CITAM o texto errado ("o CNPJ que estava aqui era 00.000.000/0001-00"),
 * e sem esta limpeza o script reprovaria a própria explicação de por que corrigiu.
 * O que interessa aqui é o que chega à tela do usuário, não a prosa do código.
 */
const ler = (p: string) =>
  readFileSync(p, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");

/** Cru, com comentários, para as asserções sobre a existência de código. */
const lerCru = (p: string) => readFileSync(p, "utf8");
const falhas: string[] = [];
const reprovar = (bloco: string, msg: string) => falhas.push(`[${bloco}] ${msg}`);

const APP = lerCru("src/App.tsx");
/*
 * A landing passou a ser um PORTE FIEL do protótipo: a marcação vive em
 * `src/pages/landing/prototipo.html` e o Landing.tsx só a injeta e liga o
 * comportamento. Ler apenas o .tsx faria este guardrail perder de vista todo o texto que
 * chega ao visitante, que é exatamente o que ele existe para vigiar. Ele leu por um
 * instante, e reprovou de imediato: o rodapé do protótipo não linkava Termos nem
 * Política, uma regressão de obrigação legal que teria ido ao ar em silêncio.
 */
const LANDING = ler("src/pages/Landing.tsx") + "\n" + ler("src/pages/landing/prototipo.html");
const GATE = lerCru("src/components/app/CloudAuthGate.tsx");
const DOC = lerCru("src/pages/DocumentoLegal.tsx");
const PLANOS = lerCru("src/data/planos.ts");
const PRICING = ler("src/pages/Pricing.tsx");
const ROI = ler("src/pages/Roi.tsx");
const AVALIACAO = ler("src/components/app/AvaliacaoModal.tsx");
const SUPPORT = ler("src/pages/Support.tsx");

/* --- A. Os documentos existem, têm rota própria e são páginas públicas ----- */

for (const [rota, componente] of [
  ["/termos", "Termos"],
  ["/privacidade", "Privacidade"],
] as const) {
  if (!APP.includes(`path="${rota}"`))
    reprovar("A", `a rota ${rota} não está registrada em App.tsx: o link vai cair no curinga e voltar para a home.`);
  if (!new RegExp(`export function ${componente}\\b`).test(DOC))
    reprovar("A", `DocumentoLegal.tsx não exporta ${componente}.`);
}
// Públicas de propósito: quem ainda não tem conta precisa ler antes de aceitar.
// Se a rota entrar debaixo do <Route element={<AppLayout />}>, ela passa a exigir
// login e o aceite do cadastro vira um link que o visitante não consegue abrir.
const antesDoLayout = APP.indexOf("AppLayout />}");
const posTermos = APP.indexOf('path="/termos"');
if (antesDoLayout >= 0 && posTermos > antesDoLayout)
  reprovar("A", "/termos está DENTRO da área logada: o visitante não consegue ler antes de aceitar.");

/* --- B. Estão linkados onde o usuário procura ----------------------------- */

for (const rota of ["/termos", "/privacidade"])
  if (!LANDING.includes(`"${rota}"`)) reprovar("B", `o rodapé da landing não linka ${rota}.`);

/* --- C. O cadastro exige aceite explícito, e ele não nasce marcado -------- */

if (!/useState\(false\)/.test(GATE.slice(GATE.indexOf("aceite") - 200, GATE.indexOf("aceite") + 200)))
  reprovar("C", "o estado de aceite no cadastro não nasce falso: aceite pré-marcado não é consentimento válido.");
// A trava tem que estar na SUBMISSÃO, não só no `disabled` do botão. A primeira
// versão desta asserção só exigia a expressão em algum lugar do arquivo, e a
// falsificação mostrou o buraco: removendo a validação e deixando apenas o botão
// desabilitado, o guardrail continuava verde. Botão desabilitado é aparência; a
// checagem dentro de `submeter` é o que de fato impede criar conta sem aceite.
if (!/aba === "criar" && !aceite\)\s*\{\s*setErro/.test(GATE))
  reprovar("C", "a criação de conta não é BARRADA na submissão quando o aceite falta (só o botão desabilitado não basta).");
if (!/disabled=\{[^}]*!aceite/.test(GATE))
  reprovar("C", "o botão de criar conta não fica desabilitado enquanto o aceite não é marcado.");
for (const rota of ["/termos", "/privacidade"])
  if (!GATE.includes(rota)) reprovar("C", `o cadastro não oferece o link para ${rota}.`);

/* --- D. Identificação e prova social inventadas não voltam ---------------- */

/*
 * PLACEHOLDER LITERAL NÃO VAI AO AR.
 *
 * O protótipo trazia "[Razão Social Ltda.] · CNPJ [XX.XXX.XXX/0001-XX]" no rodapé e
 * "Filipe [Sobrenome]" na assinatura. São lembretes de quem desenhou, e iriam à página
 * exatamente assim, entre colchetes. Colchete com maiúscula dentro é a forma que todos
 * eles têm, e nenhuma copy real do produto usa isso.
 */
if (/\[[A-ZÀ-Ú][^\]\n]{2,40}\]/.test(LANDING))
  reprovar("D", `placeholder literal na landing: ${LANDING.match(/\[[A-ZÀ-Ú][^\]\n]{2,40}\]/)?.[0]}`);

/*
 * O CREF É DO ASSINANTE, NUNCA DA CASA.
 *
 * Duas vezes um CREF falso chegou perto de ir ao ar: "Nome do profissional · CREF 000000"
 * nos depoimentos inventados, e "Responsável técnico Filipe · CREF 000000-G/UF" no rodapé
 * do protótipo. O Filipe NÃO tem CREF, e credencial profissional inventada numa página que
 * vende apoio à decisão clínica é o pior tipo de afirmação falsa que este produto poderia
 * fazer.
 *
 * A regra não bane a palavra: o produto fala do CREF DO PROFISSIONAL que assina o
 * prontuário, e isso é correto. Bane a casa se ATRIBUIR um, que é o que "responsável
 * técnico" seguido de CREF faz.
 */
if (/respons[áa]vel t[ée]cnico[^<>]{0,60}CREF/i.test(LANDING))
  reprovar("D", 'a landing declara um "responsável técnico" com CREF: a casa não tem CREF para atribuir.');

const PLACEHOLDERS: [RegExp, string][] = [
  [/00\.000\.000\/0001-00/, "CNPJ placeholder (00.000.000/0001-00) apresentado como identificação real"],
  [/CREF\s*000000/i, "CREF placeholder (000000) assinando conteúdo"],
  [/Nome do profissional/, "depoimento assinado por 'Nome do profissional', ou seja, prova social fabricada"],
];
for (const [re, oque] of PLACEHOLDERS)
  if (re.test(LANDING)) reprovar("D", `${oque} na landing.`);

/* --- E. Promessa de privacidade tem que bater com o que o código faz ------ */

// As fotos da avaliação vão para `avaliacoes.fotos` no Supabase. Enquanto isso for
// verdade, nenhuma tela pode prometer que elas ficam só no aparelho.
const FOTOS_SINCRONIZAM = lerCru("src/lib/backend/supabaseRepo.ts").includes("fotos");
if (FOTOS_SINCRONIZAM) {
  if (/fotos ficam privadas neste (dispositivo|aparelho)/i.test(AVALIACAO))
    reprovar("E", "AvaliacaoModal promete que as fotos ficam no dispositivo, mas elas sobem para o Supabase.");
  if (/sincroniza(ção|cao) na nuvem est[áa] no roadmap/i.test(SUPPORT))
    reprovar("E", "a FAQ do suporte diz que a nuvem está no roadmap, mas a sincronização já está no ar.");
}
// A Política precisa declarar o que é o dado mais sensível que o produto guarda.
if (!/FOTOS do corpo/i.test(DOC))
  reprovar("E", "a Política de Privacidade não declara as fotos do corpo do aluno no inventário.");
if (!/art\. 11/.test(DOC))
  reprovar("E", "a Política não cita a base legal de dado sensível (LGPD art. 11).");

/**
 * INVENTÁRIO: o que o código PERSISTE, a Política DECLARA.
 *
 * A Política se apresenta como "a descrição honesta do que o sistema de fato faz hoje". Uma
 * frase dessas envelhece mal sozinha: em 11/08/2026 o código já gravava três categorias que
 * o documento não listava (telefone do aluno, controle de mensalidade e plano da conta),
 * todas acrescentadas ao código depois que o texto foi escrito, nenhuma por má fé. Omitir
 * categoria de dado numa Política de Privacidade não é lapso de redação, é descrever um
 * produto diferente do que está no ar.
 *
 * Por isso a checagem parte do CÓDIGO e cobra o TEXTO, e não o contrário: cada linha abaixo
 * só é exigida enquanto a evidência de persistência existir. Se um campo deixar de ser
 * gravado, a exigência cai sozinha, sem ninguém precisar lembrar de afrouxar o guardrail.
 *
 * Detalhe que decide se isto funciona ou é teatro: a conferência usa DOC_VISIVEL, o arquivo
 * SEM comentários. O docstring do DocumentoLegal.tsx explica por extenso que o telefone e a
 * cobrança passaram a ser declarados, e com `lerCru` essa própria explicação satisfaria o
 * teste. Só vale o que chega à tela.
 */
const DOC_VISIVEL = ler("src/pages/DocumentoLegal.tsx");
const REPO = lerCru("src/lib/backend/supabaseRepo.ts");

const INVENTARIO: { oque: string; gravado: boolean; declarado: RegExp; onde: string }[] = [
  {
    oque: "o telefone do aluno",
    gravado: /telefone:\s*a\.telefone/.test(REPO),
    declarado: /telefone/i,
    onde: "supabaseRepo grava `telefone` no blob `jornada` da tabela alunos",
  },
  {
    oque: "o controle de mensalidade do aluno (valor, vencimento, situação e meio de pagamento)",
    gravado: /cobranca:\s*a\.cobranca/.test(REPO),
    // "mensalidade", e NÃO "cobrança": a segunda palavra aparece nos Termos falando da
    // assinatura da plataforma, assunto diferente, e com ela no padrão este teste passava
    // liso mesmo com o inventário do aluno apagado. Foi assim que a falsificação o pegou.
    declarado: /mensalidade/i,
    onde: "supabaseRepo grava `cobranca` no blob `jornada` da tabela alunos",
  },
  {
    oque: "as classes de medicação declaradas",
    gravado: /farmacos:\s*a\.farmacos/.test(REPO),
    declarado: /medica[çc][ãa]o/i,
    onde: "supabaseRepo grava `farmacos` no blob `jornada` da tabela alunos",
  },
];
for (const item of INVENTARIO) {
  if (item.gravado && !item.declarado.test(DOC_VISIVEL))
    reprovar("E", `a Política não declara ${item.oque}, mas o código guarda: ${item.onde}.`);
}

/**
 * TRANSFERÊNCIA INTERNACIONAL.
 *
 * O banco fica na região us-east-2 da AWS, nos Estados Unidos. Isso foi APURADO, não
 * suposto: o IPv6 de `db.<ref>.supabase.co` cai em prefixo da lista oficial da Amazon
 * marcado `us-east-2`. Um script de CI não resolve DNS de forma confiável, então o guardrail
 * não reapura a região; ele garante que, enquanto o backend for o provedor hospedado, a
 * Política continue dizendo ao usuário que o dado sai do país. A regressão que ele impede é
 * alguém "limpar" o parágrafo por achá-lo feio, que é exatamente como esse tipo de
 * informação some.
 */
const BACKEND_HOSPEDADO = /supabase/i.test(REPO);
if (BACKEND_HOSPEDADO) {
  if (!/Estados Unidos/i.test(DOC_VISIVEL))
    reprovar("E", "a Política não diz que os servidores ficam nos Estados Unidos, e ficam (AWS us-east-2).");
  if (!/transfer[êe]ncia internacional/i.test(DOC_VISIVEL))
    reprovar("E", "a Política não trata a hospedagem fora do país como transferência internacional (LGPD, Capítulo V).");
  if (/Localiza[çc][ãa]o dos servidores:\s*a definir/i.test(DOC_VISIVEL))
    reprovar("E", 'a Política voltou a dizer "localização dos servidores: a definir", e a localização é conhecida.');
}

/* --- E2. Ligar a cobrança exige a pendência jurídica resolvida ------------ */

/**
 * O tripwire. Hoje ninguém é cobrado, e por isso é aceitável publicar um documento com
 * lacunas à vista e um selo de versão preliminar: é honesto sobre o próprio estado.
 *
 * No dia em que a cobrança ligar, esse mesmo documento passa a reger uma relação de
 * consumo, e aí "razão social a definir" deixa de ser franqueza e vira fornecedor não
 * identificado, contra o art. 6º, III do Código de Defesa do Consumidor, e encarregado não
 * indicado, contra o art. 41 da LGPD.
 *
 * Ninguém vai lembrar dessa lista na semana de faturar. O build lembra.
 */
const COBRANCA_ATIVA = /COBRANCA_ATIVA\s*=\s*true/.test(PLANOS);
if (COBRANCA_ATIVA) {
  const pendencias = DOC_VISIVEL.match(/[^".]*a definir[^".]*/gi) ?? [];
  for (const p of pendencias)
    reprovar("E2", `a cobrança está ligada e o documento ainda tem lacuna à vista: "${p.trim()}".`);
  if (/Vers[ãa]o preliminar/i.test(DOC_VISIVEL))
    reprovar("E2", "a cobrança está ligada e os documentos ainda se anunciam como versão preliminar, sem revisão jurídica.");
}

// Controle positivo: se o interruptor sumir de planos.ts, o bloco E2 vira decoração.
if (!/COBRANCA_ATIVA/.test(PLANOS))
  reprovar("E2", "controle positivo: planos.ts não define COBRANCA_ATIVA, então o tripwire da cobrança não protege nada.");

/* --- F. Preço tem UMA fonte ---------------------------------------------- */

for (const [arq, nome] of [
  [LANDING, "Landing"],
  [PRICING, "Pricing"],
  [ROI, "Roi"],
] as const) {
  if (!arq.includes("@/data/planos"))
    reprovar("F", `${nome} não lê o preço de @/data/planos: volta a divergir das outras telas.`);
  // Literal de preço escrito à mão é exatamente como as três tabelas divergiram.
  const literal = arq.match(/R\$\s?\d{2,3}/);
  if (literal) reprovar("F", `${nome} tem preço literal "${literal[0]}" no código, fora da fonte única.`);
}
const precoNaFonte = PLANOS.match(/PRECO_MENSAL = (\d+)/);
if (!precoNaFonte) reprovar("F", "planos.ts não define PRECO_MENSAL.");

// Controle positivo: se a fonte única sumir ou ficar vazia, os testes acima passam
// a validar nada. Esta asserção garante que há substância para conferir.
if (!/PRECO_ANUAL\b/.test(PLANOS) || !/PRECO_ESTUDIO/.test(PLANOS) || PLANOS.length < 400)
  reprovar("F", "controle positivo: a fonte única de preço está vazia demais para o bloco F significar algo.");


/* --- G. Nenhum link de caso aponta para um destino que não existe --------- */

// Os grupos especiais e as trilhas montam o cartão do caso com o título vindo de
// `@/data/cases` e mandavam o clique para /aprender/casos, que é OUTRO catálogo.
// A interseção entre os dois conjuntos de slugs era ZERO: onze links, onze
// "Caso não encontrado". Esta asserção trava a volta disso, de qualquer origem.
{
  const CASES = lerCru("src/data/cases.ts");
  const APRENDER = lerCru("src/features/learning/mocks/cases.ts");
  const slugs = (t: string) => new Set([...t.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));
  const praticos = slugs(CASES);
  const doAprender = slugs(APRENDER);

  if (praticos.size < 5)
    reprovar("G", "controle positivo: o catálogo de casos práticos está pequeno demais para o bloco G significar algo.");

  const refs: [string, string][] = [];
  for (const m of lerCru("src/data/specialGroups.ts").matchAll(/casosRelacionados:\s*\[([^\]]*)\]/g))
    for (const s2 of m[1].matchAll(/"([^"]+)"/g)) refs.push(["specialGroups", s2[1]]);
  for (const m of lerCru("src/data/tracks.ts").matchAll(/tipo:\s*"caso"[^}]*?ref:\s*"([^"]+)"/g))
    refs.push(["tracks", m[1]]);

  if (refs.length < 5)
    reprovar("G", "controle positivo: quase nenhuma referência de caso foi encontrada; o bloco G não está lendo os dados.");

  if (!/path="\/casos-praticos\/:slug"/.test(APP))
    reprovar("G", "a rota /casos-praticos/:slug não existe: os casos práticos voltam a não ter destino.");

  for (const [origem, slug] of refs) {
    if (praticos.has(slug) || doAprender.has(slug)) continue;
    reprovar("G", `${origem} referencia o caso "${slug}", que não existe em nenhum dos dois catálogos.`);
  }

  // E o construtor de link tem que mandar para a rota certa.
  if (!lerCru("src/pages/TrackDetail.tsx").includes("/casos-praticos/"))
    reprovar("G", "TrackDetail monta o link de caso para uma rota que não conhece os slugs de @/data/cases.");
  if (!lerCru("src/pages/SpecialGroupDetail.tsx").includes("/casos-praticos/"))
    reprovar("G", "SpecialGroupDetail monta o link de caso para uma rota que não conhece os slugs de @/data/cases.");
}

/* --- H. Nenhuma contagem de acervo científico exposta ao público ---------- */

/*
 * A faixa de credibilidade anunciava "82 referências científicas conferidas no PubMed",
 * "23 condições de saúde cobertas" e "100% das recomendações com fonte rastreável". Os
 * três números eram LITERAIS na marcação: nenhum vinha de `referencias.length`, então a
 * 83ª referência quebraria a frase em silêncio, do mesmo jeito que as três tabelas de
 * preço divergiram antes do bloco F.
 *
 * Mas o motivo de banir, e não de amarrar à fonte única como se fez com o preço, é outro
 * e é do fundador: contagem exposta é contagem contestável. Um acervo anunciado em voz
 * alta convida a pergunta "só isso?", e a resposta honesta naquele momento era
 * constrangedora, porque 12 das 82 entradas não tinham DOI nem PMID, ou seja, a palavra
 * "conferidas" não se sustentava para elas.
 *
 * Então a regra é: a landing afirma a base científica sem nada mensurável ao lado. Anos
 * de publicação (4 dígitos) continuam permitidos, porque citar "Garber e colegas, 2011"
 * é o oposto de um placar: é rastreabilidade.
 */
{
  const publico = LANDING.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

  /*
   * A forma de uma alegação de acervo é NÚMERO SEGUIDO DO SUBSTANTIVO: "82 referências",
   * "23 condições de saúde", "100% das recomendações". A primeira versão desta asserção
   * procurava qualquer número numa janela em volta da palavra e reprovou oito vezes por
   * engano, em "garantia de 14 dias", "Homem, 52 anos" e nas estatísticas de mercado do
   * documento comercial. Proximidade não era o sinal; a ordem é.
   */
  const ALEGACAO =
    /(?<!\d)(\d{1,4}\s?%|\d{1,3}\+?)\s+(?:mil\s+)?(?:d[aeo]s?\s+)?(refer[êe]ncias?|artigos?|estudos?|evid[êe]ncias?|recomenda[çc][õo]es|condi[çc][õo]es de sa[úu]de)/gi;

  for (const m of publico.matchAll(ALEGACAO)) {
    const i = m.index ?? 0;
    reprovar(
      "H",
      `Landing anuncia "${m[0].trim()}": "...${publico.slice(Math.max(0, i - 60), i + 80).trim()}...". ` +
        `Contagem de acervo científico não vai à página pública.`,
    );
  }

  // Controle positivo: se a afirmação científica sumir por inteiro da landing, o varredor
  // acima não teria o que varrer e o bloco H passaria por vazio.
  const mencoes = (publico.match(/(refer[êe]ncia|evid[êe]ncia|cient[íi]fic|diretriz)/gi) ?? []).length;
  if (mencoes < 4)
    reprovar("H", `controle positivo: só ${mencoes} menção(ões) a evidência na landing; o bloco H não está lendo o texto público.`);

  /*
   * O documento comercial circula fora do produto e repetia as mesmas duas frases. Ele
   * está cheio de estatística de mercado legítima ("250 homepages", "600 mil no CONFEF"),
   * então aqui a asserção é nominal em vez de varredura, para não brigar com o resto.
   */
  const COMERCIAL = ler("docs/escopo-comercial-mapa-da-prescricao.md");
  for (const frase of ["referências científicas conferidas no PubMed", "das faixas de treino** com referência rastreável"])
    if (COMERCIAL.includes(frase))
      reprovar("H", `o escopo comercial voltou a trazer "${frase}", que é a mesma alegação contável já retirada da landing.`);
}

/* ------------------------------- resultado ------------------------------- */

if (falhas.length) {
  console.error(`\n✗ check:legal reprovou com ${falhas.length} problema(s):\n`);
  for (const f of falhas) console.error("  " + f);
  console.error(
    "\nEste guardrail cobre afirmação ao usuário que o código desmente, em assunto que gera\n" +
      "obrigação legal. Corrija a AFIRMAÇÃO ou o CÓDIGO, nunca desligue a asserção.\n",
  );
  process.exit(1);
}

console.log("✓ check:legal: documentos publicados e linkados, aceite exigido no cadastro,");
console.log("  sem identificação nem depoimento inventado, promessa de privacidade batendo");
console.log("  com o que o código faz, e preço com fonte única.");
