/**
 * Gera os ícones do produto a partir de UMA fonte: public/brand/marca-pino.svg.
 *
 * Existe porque eles eram três arquivos soltos, cada um recortado à mão de um PNG diferente:
 * mexer na marca pedia refazer os três e lembrar do tratamento de cada um. Agora o vetor manda,
 * e o que muda entre eles é só o que TEM que mudar: o ícone de aba é transparente (o navegador
 * põe o próprio fundo) e o da tela de início do iPhone é opaco (o iOS compõe sobre preto, e uma
 * marca transparente vira um borrão escuro na mão do usuário).
 *
 * Fora do `npm run check` de propósito: roda quando a marca muda, não a cada commit.
 *   node scripts/gerar-icones-marca.mjs
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";

const SVG = readFileSync("public/brand/marca-pino.svg");

/** Renderiza o vetor com folga e centraliza num quadrado. */
async function icone({ saida, lado, folga, fundo }) {
  const util = Math.round(lado * (1 - 2 * folga));
  const arte = await sharp(SVG, { density: 400 }).resize(util, util, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const base = sharp({ create: { width: lado, height: lado, channels: 4, background: fundo } });
  await base.composite([{ input: arte, gravity: "center" }]).png().toFile(saida);
  const { width, height } = await sharp(saida).metadata();
  console.log(`  ${saida}  ${width}x${height}  folga ${Math.round(folga * 100)}%  fundo ${fundo.alpha ? "branco" : "transparente"}`);
}

const transparente = { r: 255, g: 255, b: 255, alpha: 0 };
const branco = { r: 255, g: 255, b: 255, alpha: 1 };

console.log("[marca] gerando ícones a partir de public/brand/marca-pino.svg");
await icone({ saida: "public/favicon.png", lado: 64, folga: 0.03, fundo: transparente });
await icone({ saida: "public/apple-touch-icon.png", lado: 180, folga: 0.12, fundo: branco });
console.log("[marca] pronto.");
