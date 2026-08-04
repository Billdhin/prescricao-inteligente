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
const LANDING = ler("src/pages/Landing.tsx");
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
if (!/PRECO_ANUAL_FUNDADOR/.test(PLANOS) || PLANOS.length < 400)
  reprovar("F", "controle positivo: a fonte única de preço está vazia demais para o bloco F significar algo.");

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
