/**
 * GUARDRAIL: escala de avaliação sem fonte verificada não existe.
 *
 * O fundador pediu a escala de referência ao lado do número medido ("0,82 é bom
 * ou ruim?"). O risco de uma tela dessas não é ficar vazia: é ganhar uma tabela
 * de faixas plausível e sem fonte, que o profissional lê como verdade e assina
 * embaixo. Numa ferramenta de decisão clínica isso é pior do que não ter escala.
 *
 * O que este check trava:
 *   1. FONTE: toda escala cita ao menos uma referência que EXISTE em
 *      referencias.ts e tem DOI verificado.
 *   2. CONTINUIDADE: as faixas cobrem a reta inteira, sem buraco e sem sobrepor.
 *      Buraco = valor sem veredito; sobreposição = dois vereditos para o mesmo
 *      valor, e a classificação passaria a depender da ordem do array.
 *   3. HONESTIDADE: toda escala declara o LIMITE dela, e nenhuma promete o que
 *      não pode entregar.
 *   4. VOZ: nada de travessão em texto visível.
 *   5. Autoverificação: a classificação de fato muda de faixa ao cruzar o corte,
 *      nos dois lados, e o corte é fechado à esquerda (>= de) e aberto à direita.
 *
 * Roda com `npm run check:escalas`.
 */
import {
  escalasAvaliacao,
  classificarNaEscala,
  calcularImc,
  type FaixaEscala,
} from "../src/data/escalasAvaliacao";
import { getReferencia } from "../src/data/referencias";

const problemas: string[] = [];
let faixasTotal = 0;

for (const escala of escalasAvaliacao) {
  // 1) fonte
  if (escala.refIds.length === 0) {
    problemas.push(`${escala.id}: escala sem referencia. Faixa sem fonte nao entra no produto.`);
  }
  for (const id of escala.refIds) {
    const ref = getReferencia(id);
    if (!ref) problemas.push(`${escala.id}: referencia "${id}" nao existe em referencias.ts.`);
    else if (!ref.doi) problemas.push(`${escala.id}: referencia "${id}" sem DOI verificado.`);
  }

  // 3) honestidade
  if (!escala.limite?.trim()) problemas.push(`${escala.id}: escala sem declarar o proprio limite.`);
  if (!escala.oQueMede?.trim()) problemas.push(`${escala.id}: escala sem dizer o que mede.`);

  // 4) voz
  const texto = [escala.nome, escala.oQueMede, escala.limite].join(" ");
  if (texto.includes("—")) problemas.push(`${escala.id}: travessao em texto visivel.`);

  // 2) continuidade, por conjunto de faixas
  const conjuntos: [string, FaixaEscala[] | undefined][] = [
    ["geral", escala.faixas.geral],
    ["masculino", escala.faixas.masculino],
    ["feminino", escala.faixas.feminino],
  ];
  let algum = false;
  for (const [nome, faixas] of conjuntos) {
    if (!faixas) continue;
    algum = true;
    faixasTotal += faixas.length;
    if (faixas[0].de !== -Infinity) {
      problemas.push(`${escala.id}/${nome}: a primeira faixa nao comeca em -Infinity (valor baixo ficaria sem veredito).`);
    }
    if (faixas[faixas.length - 1].ate !== Infinity) {
      problemas.push(`${escala.id}/${nome}: a ultima faixa nao termina em Infinity (valor alto ficaria sem veredito).`);
    }
    for (let i = 0; i < faixas.length; i++) {
      const f = faixas[i];
      if (!(f.de < f.ate)) problemas.push(`${escala.id}/${nome}: faixa "${f.rotulo}" com intervalo invalido.`);
      if (!f.rotulo.trim()) problemas.push(`${escala.id}/${nome}: faixa sem rotulo por extenso (estado nunca so por cor).`);
      if (i > 0 && faixas[i - 1].ate !== f.de) {
        problemas.push(
          `${escala.id}/${nome}: buraco ou sobreposicao entre "${faixas[i - 1].rotulo}" (ate ${faixas[i - 1].ate}) e "${f.rotulo}" (de ${f.de}).`,
        );
      }
    }
  }
  if (!algum) problemas.push(`${escala.id}: escala sem faixa nenhuma.`);
}

/* ----------------------------- Autoverificação ----------------------------- */
// A classificação precisa MUDAR ao cruzar o corte, e o corte precisa pertencer à
// faixa de cima (fechado à esquerda). Sem isto, um IMC exatamente 30,0 poderia
// cair em "Sobrepeso" e o classificador de obesidade nunca dispararia.
const imc = escalasAvaliacao.find((e) => e.id === "imc");
if (!imc) {
  console.error("check:escalas FALHOU: a escala de IMC sumiu, e ela e a que o classificador usa.");
  process.exit(1);
}
const abaixo = classificarNaEscala(imc, 29.9)?.rotulo;
const noCorte = classificarNaEscala(imc, 30)?.rotulo;
if (abaixo !== "Sobrepeso" || noCorte !== "Obesidade grau I") {
  console.error(
    `check:escalas FALHOU na autoverificacao: 29,9 deu "${abaixo}" e 30,0 deu "${noCorte}". O corte tem que pertencer a faixa de cima.`,
  );
  process.exit(1);
}
// O IMC calculado aceita altura em cm e em metros, sem chutar qual é qual.
const emCm = calcularImc(70, 172);
const emM = calcularImc(70, 1.72);
if (emCm !== emM || emCm == null) {
  console.error(`check:escalas FALHOU: altura em cm (${emCm}) e em metros (${emM}) precisam dar o mesmo IMC.`);
  process.exit(1);
}

if (problemas.length > 0) {
  console.error(`\ncheck:escalas FALHOU (${problemas.length} ocorrencia(s)):`);
  for (const p of problemas.slice(0, 20)) console.error("  - " + p);
  process.exit(1);
}

console.log(
  `[check:escalas] autoverificacao OK: IMC 29,9 e "${abaixo}" e 30,0 e "${noCorte}"; altura em cm e em metros dao ${emCm} kg/m².`,
);
console.log(
  `[check:escalas] ok: ${escalasAvaliacao.length} escalas e ${faixasTotal} faixas, todas continuas, com limite declarado e fonte de DOI verificado.`,
);
