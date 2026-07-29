/**
 * Ferramenta de lote da camada de imagem (temporária, não vai para o CI).
 *
 *   node scripts/_img-lote.mjs baixar  <slug> [slug...]   baixa da URL publicada do Lovable
 *   node scripts/_img-lote.mjs folha   <slug> [slug...]   monta a folha de contato para conferência
 *   node scripts/_img-lote.mjs aceitar <slug> [slug...]   converte para webp e instala em public/exercises
 *
 * A folha de contato existe por um motivo prático: conferir 58 imagens uma a uma é
 * inviável, e conferir por amostragem é justamente o que a skill proíbe. A folha põe
 * 6 numa imagem só, com o slug escrito embaixo de cada uma, e a conferência continua
 * sendo olho a olho, item a item.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const BASE = "https://pi-erros-img2img.lovable.app/img";
const TMP = "C:/Users/GABINETE/AppData/Local/Temp/claude/C--Users-GABINETE-Documents-Projeto-Filipe/f8db8fff-8e04-4935-819a-b9f805d1972a/scratchpad/imgs";
mkdirSync(TMP, { recursive: true });

const [, , cmd, ...slugs] = process.argv;

function baixar() {
  const falhas = [];
  for (const s of slugs) {
    const dest = `${TMP}/${s}.png`;
    try {
      execFileSync("curl", ["-s", "-f", "-o", dest, `${BASE}/${s}.png`]);
      const buf = readFileSync(dest);
      // O SPA devolve HTML quando o arquivo não existe. Assinatura PNG: 89 50 4E 47.
      if (!(buf[0] === 0x89 && buf[1] === 0x50)) falhas.push(`${s}: veio HTML, não PNG (deploy ou nome errado)`);
      else console.log(`ok ${s} (${(buf.length / 1024).toFixed(0)} kB)`);
    } catch {
      falhas.push(`${s}: download falhou`);
    }
  }
  if (falhas.length) {
    console.error("\nFALHAS:");
    for (const f of falhas) console.error("  - " + f);
    process.exit(1);
  }
}

async function folha() {
  const COL = 3;
  const W = 420;
  const H = 520;
  const LEG = 34;
  const linhas = Math.ceil(slugs.length / COL);
  const canvas = sharp({
    create: { width: COL * W, height: linhas * (H + LEG), channels: 3, background: "#ffffff" },
  });
  const comp = [];
  for (let i = 0; i < slugs.length; i++) {
    const s = slugs[i];
    const x = (i % COL) * W;
    const y = Math.floor(i / COL) * (H + LEG);
    const img = await sharp(`${TMP}/${s}.png`).resize(W - 8, H - 8, { fit: "contain", background: "#ffffff" }).toBuffer();
    comp.push({ input: img, left: x + 4, top: y + 4 });
    const svg = `<svg width="${W}" height="${LEG}"><rect width="${W}" height="${LEG}" fill="#111"/><text x="10" y="23" font-family="sans-serif" font-size="17" fill="#fff">${i + 1}. ${s}</text></svg>`;
    comp.push({ input: Buffer.from(svg), left: x, top: y + H });
  }
  const out = `${TMP}/folha.jpg`;
  await canvas.composite(comp).jpeg({ quality: 88 }).toFile(out);
  console.log(out);
}

async function aceitar() {
  for (const s of slugs) {
    const src = `${TMP}/${s}.png`;
    if (!existsSync(src)) {
      console.error(`sem arquivo baixado para ${s}`);
      process.exit(1);
    }
    const dest = `public/exercises/${s}.webp`;
    await sharp(src).resize(928, 1152, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toFile(dest);
    console.log(`instalado ${dest}`);
  }
  // Liga o campo `imagem` no arquivo de dados que contém o slug.
  const arquivos = ["exercises-extra3", "exercises-extra4", "exercises-extra5", "exercises-extra6", "exercises-extra7"];
  for (const s of slugs) {
    let achou = false;
    for (const a of arquivos) {
      const f = `src/data/${a}.ts`;
      let txt = readFileSync(f, "utf8");
      const marca = `slug: "${s}",`;
      if (!txt.includes(marca)) continue;
      achou = true;
      if (txt.includes(`imagem: "/exercises/${s}.webp"`)) break;
      /*
       * Insere o campo antes de `modalidade` (ou de `ativacao`, quando não há
       * modalidade), que é onde ele vive nos demais exercícios.
       *
       * AGNÓSTICO DE FIM DE LINHA de propósito: a primeira versão procurava
       * "\r\n    modalidade:" e devolvia -1 nos arquivos salvos em LF. Com alvo -1,
       * o `slice(0, -1)` colou a linha DEPOIS do fechamento do array e quebrou dois
       * arquivos de uma vez. O guardrail não pegou porque o arquivo nem compilava.
       */
      const i = txt.indexOf(marca);
      const acharCampo = (campo) => {
        const re = new RegExp(`\\r?\\n {4}${campo}:`, "g");
        re.lastIndex = i;
        const m = re.exec(txt);
        return m ? m.index : -1;
      };
      const j = acharCampo("modalidade");
      const k = acharCampo("ativacao");
      const alvo = j >= 0 && (k < 0 || j < k) ? j : k;
      if (alvo < 0) {
        console.error(`não achei onde inserir o campo imagem de ${s} em ${a}.ts`);
        process.exit(1);
      }
      const nl = txt.slice(alvo, alvo + 2) === "\r\n" ? "\r\n" : "\n";
      txt = txt.slice(0, alvo) + `${nl}    imagem: "/exercises/${s}.webp",` + txt.slice(alvo);
      writeFileSync(f, txt);
      console.log(`  campo imagem ligado em ${a}.ts`);
      break;
    }
    if (!achou) {
      console.error(`slug ${s} não existe em nenhum arquivo de dados`);
      process.exit(1);
    }
  }
}

if (cmd === "baixar") baixar();
else if (cmd === "folha") await folha();
else if (cmd === "aceitar") await aceitar();
else {
  console.error("uso: baixar | folha | aceitar <slugs...>");
  process.exit(1);
}
