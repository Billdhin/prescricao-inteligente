/**
 * conferir-publicado — o que está NO AR é o que este repositório gera?
 *
 * POR QUE ISTO EXISTE. Em 25/08/2026 a produção passou dois dias servindo um build de dois
 * dias atrás e ninguém percebeu. A causa não foi código: o workflow antigo continuou
 * publicando no GitHub Pages a cada push, enquanto o domínio já apontava para o Cloudflare.
 * Havia um caminho de publicação verde e um endereço real desatualizado, e nada no projeto
 * comparava os dois.
 *
 * A pergunta "subiu?" só tem uma resposta honesta: buscar o endereço DE VERDADE e comparar
 * com o que o build local produziu. É isso e só isso que este script faz.
 *
 * Uso:
 *   npm run publicado          confere os dois hosts contra o dist/ local
 *   npm run publicado -- --so-hosts   compara só os hosts entre si (sem build local)
 *
 * Sai com código 1 quando diverge, para poder virar portão em qualquer lugar.
 */
import fs from "node:fs";
import path from "node:path";

const HOSTS = ["https://mapadaprescricao.com.br", "https://www.mapadaprescricao.com.br"];
const DIST = path.resolve(process.cwd(), "dist/index.html");
const soHosts = process.argv.includes("--so-hosts");

/** O nome do bundle principal referenciado por um index.html. É a impressão digital do build. */
function bundleDe(html) {
  return html.match(/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0] ?? null;
}

/**
 * Busca o bundle servido, esperando a propagação quando se sabe o que esperar.
 *
 * A PRIMEIRA VERSÃO REPROVAVA O PRÓPRIO DEPLOY, e o erro foi meu: ela só repetia a busca
 * quando o host dava ERRO. Depois de um deploy o host responde 200 normalmente, só que ainda
 * com o build anterior por alguns instantes. Sem erro, não havia repetição nenhuma, e a
 * conferência reprovava na primeira tentativa. O deploy tinha funcionado; o alarme é que era
 * falso. Guardrail que grita lobo ensina a ignorar build vermelho, que é pior que não ter.
 *
 * Agora ela repete enquanto o bundle DIVERGE do esperado, e não só quando a rede falha. Sem
 * `esperado` (o modo `--so-hosts`), uma resposta boa já encerra.
 */
async function buscar(url, esperado, tentativas = 12, esperaMs = 10000) {
  let ultimoErro = "";
  let ultimoHtml = null;
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(`${url}/?cb=${Date.now()}-${i}`, { redirect: "follow" });
      if (r.ok) {
        ultimoHtml = await r.text();
        // Sem alvo, ou já batendo: pronto. Divergindo: é propagação, vale esperar.
        if (!esperado || bundleDe(ultimoHtml) === esperado) return ultimoHtml;
        ultimoErro = `ainda servindo ${bundleDe(ultimoHtml) ?? "sem bundle"}`;
      } else {
        ultimoErro = `HTTP ${r.status}`;
      }
    } catch (e) {
      ultimoErro = String(e?.message ?? e);
    }
    if (i < tentativas - 1) await new Promise((r) => setTimeout(r, esperaMs));
  }
  // Esgotou o orçamento: devolve o que veio, para a comparação lá embaixo dizer o que houve.
  if (ultimoHtml) return ultimoHtml;
  throw new Error(`${url}: ${ultimoErro}`);
}

const problemas = [];

let esperado = null;
if (!soHosts) {
  if (!fs.existsSync(DIST)) {
    console.error(
      "[publicado] não achei dist/index.html. Rode `DEPLOY_ALVO=cloudflare npm run build` antes,\n" +
        "            ou use `npm run publicado -- --so-hosts` para só comparar os hosts entre si.",
    );
    process.exit(1);
  }
  esperado = bundleDe(fs.readFileSync(DIST, "utf8"));
  if (!esperado) {
    console.error("[publicado] não achei o bundle principal em dist/index.html; o build mudou de formato?");
    process.exit(1);
  }
  console.log(`  build local        ${esperado}`);
}

const servidos = [];
for (const host of HOSTS) {
  let bundle;
  try {
    bundle = bundleDe(await buscar(host, esperado));
  } catch (e) {
    problemas.push(`${host} não respondeu: ${e.message}`);
    console.log(`  ${host.padEnd(34)} SEM RESPOSTA`);
    continue;
  }
  if (!bundle) {
    problemas.push(`${host} respondeu sem bundle reconhecível (página de erro do host?).`);
    console.log(`  ${host.padEnd(34)} SEM BUNDLE`);
    continue;
  }
  servidos.push({ host, bundle });
  const veredito = esperado ? (bundle === esperado ? "em dia" : "ATRASADO") : "";
  console.log(`  ${host.padEnd(34)} ${bundle} ${veredito}`);
  if (esperado && bundle !== esperado) problemas.push(`${host} serve ${bundle}, e o build local gera ${esperado}.`);
}

// Os dois hosts têm que servir a MESMA coisa. Divergência entre eles significa que um dos
// dois ficou para trás, que foi como o apex passou dois dias no host errado.
const distintos = new Set(servidos.map((s) => s.bundle));
if (servidos.length === HOSTS.length && distintos.size > 1)
  problemas.push(`apex e www servem builds DIFERENTES entre si: ${[...distintos].join(" x ")}.`);

if (problemas.length) {
  console.error(`\n[publicado] FALHOU: ${problemas.length} problema(s).\n`);
  for (const p of problemas) console.error("  • " + p);
  console.error(
    "\n  Publicar é: DEPLOY_ALVO=cloudflare npm run build" +
      "\n              npx wrangler pages deploy dist --project-name=mapa-da-prescricao --branch=main" +
      "\n  (com CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID no ambiente)\n",
  );
  process.exit(1);
}

console.log(
  soHosts
    ? "\n[publicado] ok: apex e www servem o mesmo build."
    : "\n[publicado] ok: apex e www servem exatamente o que este repositório gera.",
);
