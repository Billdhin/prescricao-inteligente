/**
 * Gera `dist/_headers` para o Cloudflare Pages, com a CSP calculada a partir do
 * HTML que ACABOU de ser construído.
 *
 * POR QUE GERADO, E NÃO UM ARQUIVO ESTÁTICO EM public/
 *
 * O `index.html` carrega scripts INLINE (o anti-flash do tema escuro, que precisa rodar
 * antes do primeiro paint). Uma CSP séria não pode liberar `'unsafe-inline'` em script-src,
 * senão ela deixa de proteger contra exatamente o que existe para bloquear. A alternativa é
 * autorizar cada script inline pelo HASH do conteúdo dele.
 *
 * Hash escrito à mão em arquivo estático é uma bomba-relógio: alguém ajusta uma linha do
 * anti-flash, o hash muda, e o tema escuro para de funcionar em produção sem ninguém
 * entender por quê. Calculando no build, o hash acompanha o código por construção.
 *
 * A CSP SAI EM MODO RELATÓRIO, DE PROPÓSITO
 *
 * A avaliação postural usa TensorFlow.js e baixa o modelo MoveNet em tempo de execução
 * (a FOTO continua no aparelho, só o modelo vem da rede). Esse caminho está atrás de login
 * e eu não consegui exercitá-lo para verificar a política contra ele. Publicar uma CSP
 * bloqueante sem ter testado esse caminho arrisca quebrar a avaliação postural de um
 * profissional pagante para ganhar uma proteção que ainda não foi conferida.
 *
 * Então a CSP vai como `Content-Security-Policy-Report-Only`: ela reporta no console e não
 * bloqueia nada. Os outros cabeçalhos, que não têm esse risco, vão valendo de verdade.
 *
 * PARA LIGAR A CSP DE VERDADE, depois de conferir:
 *   1. Abra o site, faça login, rode UMA avaliação postural com foto.
 *   2. Console do navegador: se não houver nenhuma linha "Content Security Policy",
 *      a política está limpa.
 *   3. Troque `CSP_MODO` abaixo de "report" para "bloquear" e publique.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const raiz = join(import.meta.dirname, "..");
const dist = join(raiz, "dist");

/** "report" (só avisa no console) ou "bloquear" (aplica de verdade). Ver o cabeçalho. */
const CSP_MODO = "report";

if (!existsSync(join(dist, "index.html"))) {
  console.error("[headers] dist/index.html não existe. Rode o build antes.");
  process.exit(1);
}

/** sha256 em base64 de cada <script> inline do HTML, no formato que a CSP espera. */
function hashesDosScriptsInline(html) {
  const hashes = [];
  for (const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const conteudo = m[1];
    if (!conteudo.trim()) continue;
    hashes.push(`'sha256-${createHash("sha256").update(conteudo, "utf8").digest("base64")}'`);
  }
  return [...new Set(hashes)];
}

const htmls = ["index.html", "404.html"]
  .map((f) => join(dist, f))
  .filter((p) => existsSync(p))
  .map((p) => readFileSync(p, "utf8"));

const hashes = [...new Set(htmls.flatMap(hashesDosScriptsInline))];
// Zero script inline NÃO é erro: seria uma CSP mais estrita e igualmente correta (o dia em
// que o anti-flash do tema virar arquivo externo, por exemplo). Este script roda dentro do
// `npm run build`, que é o caminho crítico da publicação: abortar aqui derrubaria o deploy
// por uma mudança legítima. Avisa e segue.
if (!hashes.length) {
  console.warn("[headers] nenhum script inline no HTML. A CSP sai só com 'self' em script-src.");
}

/**
 * As origens que o app precisa alcançar, cada uma com o motivo. Origem sem motivo escrito
 * é origem que ninguém sabe se ainda é necessária daqui a seis meses.
 */
const CONEXOES = [
  "'self'",
  "https://*.supabase.co", // banco, autenticação e storage
  "wss://*.supabase.co", // realtime do Supabase
  "https://storage.googleapis.com", // pesos do modelo MoveNet (TensorFlow.js)
  "https://tfhub.dev", // catálogo do modelo; redireciona para o storage acima
  "https://www.kaggle.com", // o TFHub passou a resolver por aqui
];

const CSP = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(" ")}`,
  // O protótipo da landing é todo estilo inline (76 KB de atributos style), então
  // 'unsafe-inline' em style-src é estrutural aqui. Estilo inline não executa código.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src ${CONEXOES.join(" ")}`,
  // O app não embute ninguém e ninguém deve embutir o app: trava clickjacking.
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Só no modo bloqueante: em report-only o navegador IGNORA esta diretiva e ainda
  // imprime um erro no console por causa dela. Ruído num canal cujo valor inteiro é
  // "se apareceu alguma coisa aqui, é violação de verdade".
  ...(CSP_MODO === "bloquear" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nomeCsp = CSP_MODO === "bloquear" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";

const conteudo = `# GERADO POR scripts/gerar-headers.mjs. Não edite à mão: o hash da CSP é
# calculado a partir do index.html construído, e uma edição manual sai do ar
# no próximo build.
#
# CSP em modo ${CSP_MODO === "bloquear" ? "BLOQUEANTE" : "RELATÓRIO (só avisa no console)"}.
# Ver o cabeçalho de scripts/gerar-headers.mjs para o porquê e para como trocar.

/*
  ${nomeCsp}: ${CSP}
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin

# Os arquivos com hash no nome nunca mudam de conteúdo: cache eterno e imutável.
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# O HTML precisa ser revalidado sempre, senão um deploy novo não chega a quem já
# visitou o site.
/index.html
  Cache-Control: no-cache
`;

writeFileSync(join(dist, "_headers"), conteudo, "utf8");
console.log(
  `[headers] dist/_headers escrito · CSP em modo ${CSP_MODO} · ${hashes.length} script(s) inline autorizado(s) por hash.`,
);
