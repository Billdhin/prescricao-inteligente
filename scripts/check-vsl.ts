/**
 * check:vsl · o player de VSL (modelo VTurb) faz o que promete, e só vai ao ar com a cobrança.
 *
 * A. As regras puras (src/vsl/regras.ts): barra fictícia, "continuar assistindo", pixels a
 *    cada 5%, mini-ganchos, teste A/B e origem da visita.
 * B. A configuração do vídeo (src/vsl/videos.ts) é coerente: pitch dentro do vídeo, botões
 *    clicáveis dentro do quadro e do tempo, mídia versionada, links para rotas que existem.
 * C. O PORTÃO. O vídeo promete sete dias para testar e reembolso. Sem cobrança não há o que
 *    devolver (check:legal bloco I), então a landing só mostra o player com COBRANCA_ATIVA e
 *    a página /apresentacao só abre com ela ou com o link de prévia.
 * D. O contrato da VTurb (player:ready + displayHiddenElements) e a ausência de barra de busca.
 * E. O deploy leva a mídia e o CSP deixa o vídeo tocar.
 */
import { readFileSync } from "node:fs";
import { barraExibida, podeRetomar, textoGancho, degrauPixel, aplicarVariante, origemDaVisita, tipoAparelho } from "../src/vsl/regras";
import { VSL_APRESENTACAO as V } from "../src/vsl/videos";

const falhas: string[] = [];
const reprovar = (bloco: string, msg: string) => falhas.push(`[${bloco}] ${msg}`);
const ler = (p: string) => readFileSync(p, "utf8");

/* --- A. Regras ------------------------------------------------------------ */

let anterior = -1;
for (let i = 0; i <= 1000; i++) {
  const x = i / 1000;
  const f = barraExibida(x, "ficticia", V.barra.forca);
  if (f < anterior - 1e-12) reprovar("A", `a barra fictícia VOLTA em ${x}: a barra de progresso andaria para trás.`);
  if (f + 1e-12 < x) reprovar("A", `a barra fictícia fica ATRÁS do real em ${x}: ela existe para parecer mais curta, não mais longa.`);
  anterior = f;
}
if (Math.abs(barraExibida(1, "ficticia", V.barra.forca) - 1) > 1e-9) reprovar("A", "a barra fictícia não termina em 100%.");
if (barraExibida(0, "ficticia") !== 0) reprovar("A", "a barra fictícia não começa em 0%.");
// Controle positivo: se a curva virar a real por engano, o modo "fictícia" vira decoração.
if (barraExibida(0.5, "ficticia", 1.8) - 0.5 < 0.15) reprovar("A", "controle positivo: a barra fictícia na metade do vídeo não está adiantada.");
if (barraExibida(0.37, "real") !== 0.37 || barraExibida(0.37, "oculta") !== 0) reprovar("A", "os modos real/oculta não fazem o que o nome diz.");

const cont = { duracao: 466, continuar: { ...V.continuar, ativo: true, minimo: 20 } };
if (podeRetomar(null, cont)) reprovar("A", "oferece continuar sem nada salvo.");
if (podeRetomar(5, cont)) reprovar("A", "oferece continuar antes do mínimo (pouco assistido não vale a pergunta).");
if (!podeRetomar(200, cont)) reprovar("A", "não oferece continuar para quem parou no meio.");
if (podeRetomar(460, cont)) reprovar("A", "oferece continuar para quem já estava no fim.");
if (podeRetomar(200, { ...cont, continuar: { ...cont.continuar, ativo: false } })) reprovar("A", "continuar desligado ainda pergunta.");

if (textoGancho("Em {mm:ss} eu te mostro", 10, 75) !== "Em 01:05 eu te mostro") reprovar("A", "a contagem {mm:ss} do mini-gancho está errada.");
if (textoGancho("Em {mm:ss}", 90, 75) !== "Em 00:00") reprovar("A", "a contagem do mini-gancho fica negativa depois do alvo.");

if (degrauPixel(0, 466) !== 0 || degrauPixel(466 * 0.12, 466) !== 10 || degrauPixel(466, 466) !== 100 || degrauPixel(999, 466) !== 100)
  reprovar("A", "os degraus de 5% do pixel estão errados.");

if (!V.variantes || V.variantes.length < 2) reprovar("A", "o teste A/B do VSL precisa de ao menos duas variantes.");
else {
  const a = aplicarVariante(V, 0.1), b = aplicarVariante(V, 0.9);
  if (a.variante === b.variante) reprovar("A", "sorteios opostos caem na mesma variante: o teste A/B não divide o tráfego.");
  if (aplicarVariante(V, 0.1).variante !== a.variante) reprovar("A", "a mesma pessoa troca de variante: o sorteio não é estável.");
  if (a.cfg.pitch !== V.pitch || a.cfg.hotspots !== V.hotspots) reprovar("A", "a variante mexe no pitch ou no botão: o teste A/B só pode trocar autoplay, turbo e barra.");
}
if (aplicarVariante({ ...V, variantes: undefined }, 0.5).variante !== "base") reprovar("A", "sem variantes, a sessão deveria ser 'base'.");

const o1 = origemDaVisita("?utm_source=instagram&utm_campaign=lancamento", "https://www.google.com/x", "mapadaprescricao.com.br");
if (o1.origem !== "instagram" || o1.campanha !== "lancamento") reprovar("A", "o utm_source não tem prioridade na origem da visita.");
if (origemDaVisita("", "https://www.google.com/search?q=cpf+123", "mapadaprescricao.com.br").origem !== "google.com")
  reprovar("A", "a origem guarda mais que o domínio de quem indicou (o endereço completo pode ter dado pessoal).");
if (origemDaVisita("", "https://mapadaprescricao.com.br/pricing", "www.mapadaprescricao.com.br").origem !== "direto")
  reprovar("A", "navegação interna conta como origem externa.");
if (tipoAparelho("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)", 390) !== "celular" || tipoAparelho("Mozilla/5.0 (Windows NT 10.0)", 1440) !== "computador")
  reprovar("A", "a classificação de aparelho está errada.");

/* --- B. Configuração -------------------------------------------------------- */

if (!(V.pitch > 0 && V.pitch < V.duracao)) reprovar("B", `o pitch (${V.pitch}s) está fora do vídeo (${V.duracao}s).`);
if (!(V.turbo >= 1 && V.turbo <= 1.5)) reprovar("B", `turbo ${V.turbo} fora de 1,0 a 1,5 (o limite da VTurb e o que ainda soa natural).`);
const pasta = V.src.match(/^\/vsl\/([^/]+)\/master\.m3u8$/)?.[1];
if (!pasta) reprovar("B", "o vídeo não aponta para /vsl/<versão>/master.m3u8: o cache eterno exige pasta por versão.");
if (pasta && !V.capa.startsWith(`/vsl/${pasta}/`)) reprovar("B", "a capa não está na mesma pasta de versão do vídeo.");
const APP = ler("src/App.tsx");
const rotaExiste = (href: string) => APP.includes(`path="${href.split("?")[0]}"`);
for (const h of V.hotspots) {
  if (!(h.de >= 0 && h.ate <= V.duracao + 0.01 && h.de < h.ate)) reprovar("B", `botão "${h.rotulo}" fora do tempo do vídeo.`);
  if (!(h.x >= 0 && h.y >= 0 && h.x + h.w <= 100 && h.y + h.h <= 100)) reprovar("B", `botão "${h.rotulo}" sai do quadro.`);
  if (!rotaExiste(h.href)) reprovar("B", `botão "${h.rotulo}" leva a ${h.href}, rota que o App não tem.`);
}
if (!rotaExiste(V.fim.href)) reprovar("B", `a tela final leva a ${V.fim.href}, rota que o App não tem.`);
for (const g of V.ganchos) if (!(g.de < g.ate && g.ate <= V.duracao)) reprovar("B", `mini-gancho "${g.texto}" fora do tempo do vídeo.`);
if (!/new URLSearchParams\(location\.search\)\.has\("criar"\)/.test(ler("src/components/app/CloudAuthGate.tsx")))
  reprovar("B", "o botão do VSL manda para ?criar, mas o login não abre a aba de cadastro com ele.");

/* --- C. O portão da cobrança ---------------------------------------------- */

const LANDING = ler("src/pages/Landing.tsx");
const TEMPLATE = ler("src/pages/landing/prototipo.html");
const PAGINA = ler("src/pages/Apresentacao.tsx");
if (!/const VSL_NA_LANDING = COBRANCA_ATIVA;/.test(LANDING))
  reprovar("C", "o VSL da landing não está preso a COBRANCA_ATIVA: iria ao ar prometendo reembolso sem cobrança.");
if (!/vslNoAr: VSL_NA_LANDING/.test(LANDING)) reprovar("C", "a landing não liga vslNoAr ao VSL_NA_LANDING.");
if (!/<sc-if value="\{\{ vslNoAr \}\}"><div data-ilha="vsl"/.test(TEMPLATE))
  reprovar("C", "o buraco do player (data-ilha=\"vsl\") não está atrás de <sc-if vslNoAr>.");
if (/data-ilha="vsl"/.test(TEMPLATE.replace(/<sc-if value="\{\{ vslNoAr \}\}">[\s\S]*?<\/sc-if>/g, "")))
  reprovar("C", "há um player na landing fora do portão vslNoAr.");
if (!/const liberada = COBRANCA_ATIVA \|\| previa;/.test(PAGINA) || !/if \(!liberada\) return <Navigate to="\/" replace \/>/.test(PAGINA))
  reprovar("C", "a página /apresentacao abre sem cobrança e sem o link de prévia.");
if (!/\{COBRANCA_ATIVA && <p className="vsl-garantia">/.test(PAGINA))
  reprovar("C", "a garantia escrita na página do VSL está fora do portão da cobrança.");
if (!/noindex/.test(PAGINA)) reprovar("C", "a página do VSL pode ser indexada por buscador (a prévia não é pública).");

/* --- D. Contrato do player -------------------------------------------------- */

const PLAYER = ler("src/vsl/player.ts");
if (!/displayHiddenElements\(segundos: number, seletores: string\[\] = \["\.esconder"\]/.test(PLAYER))
  reprovar("D", "o player perdeu o displayHiddenElements no formato da VTurb (seletor padrão .esconder).");
if (!/"player:ready"/.test(PLAYER)) reprovar("D", "o player não dispara player:ready: o código de delay da VTurb não teria onde se ligar.");
if (/<video[^>]*\scontrols[\s>]/.test(PLAYER)) reprovar("D", "o <video> ganhou controles nativos: com eles vem a barra de busca e dá para pular para o preço.");
if (!/memoria\.marcarRevelado\(this\.cfg\.id, o\.segundos\)/.test(PLAYER)) reprovar("D", "o persist do conteúdo oculto não grava: quem volta esperaria o pitch de novo.");
if (!/naoRastrear\(\)/.test(ler("src/vsl/metricas.ts"))) reprovar("D", "as métricas não respeitam Do Not Track / Global Privacy Control.");

/* --- E. Deploy ------------------------------------------------------------ */

if (!/node scripts\/vsl-midia\.mjs dist\/vsl/.test(ler(".github/workflows/deploy-cloudflare.yml")))
  reprovar("E", "o deploy não traz a mídia do VSL (ramo vsl-midia) para o dist: o player iria ao ar sem vídeo.");
const HEADERS = ler("scripts/gerar-headers.mjs");
if (!/media-src 'self' blob:/.test(HEADERS)) reprovar("E", "o CSP não libera media-src blob:, e o hls.js entrega o vídeo por blob:.");
if (!/\/vsl\/\*\n  Cache-Control: public, max-age=31536000, immutable/.test(HEADERS)) reprovar("E", "a mídia do VSL não tem cache longo: cada visita baixaria o vídeo de novo.");

if (falhas.length) {
  console.error(`\n✗ check:vsl reprovou com ${falhas.length} problema(s):\n`);
  for (const f of falhas) console.error("  " + f);
  process.exit(1);
}
console.log("✓ check:vsl: regras do player, configuração do vídeo, portão da cobrança, contrato da VTurb e deploy da mídia.");
