/**
 * O PAR FOTO + ANÁLISE PRECISA SER A MESMA TOMADA.
 *
 * O Laboratório mostra os dois com um divisor deslizante, e a legenda promete que a análise é
 * revelada sobre "a MESMA imagem". Em 22/08/2026 o Filipe abriu a puxada alta e viu duas fotos
 * que não se encaixavam: na de execução o sujeito segurava uma barra solta, sem cabo nenhum, e
 * na de análise havia uma máquina de pulldown completa, com pilha de pesos e outro fundo.
 * Arrastar o divisor trocava o cenário no meio.
 *
 * A varredura de 19/08 tinha olhado imagem por imagem e dado por encerrado. Estava certa e
 * incompleta: cada imagem, sozinha, estava boa. O defeito só existe no PAR, e conferir um lado
 * não diz nada sobre o outro. É a mesma lição do boneco que faltava em 24 exercícios.
 *
 * COMO A DIVERGÊNCIA É MEDIDA, e por que assim:
 *
 * O corpo muda de propósito (pele vira musculatura), então comparar a imagem inteira acusaria
 * todo par correto. O que NÃO pode mudar é o cenário: parede, piso, aparelho, luz e sombra. E o
 * cenário vive na MOLDURA do quadro, porque a figura fica no meio. Então a medida é a diferença
 * média absoluta, em tons de cinza, só na faixa externa das duas miniaturas.
 *
 * O LIMIAR NÃO FOI CHUTADO, foi medido, e JÁ FOI REVISADO uma vez com amostra maior.
 *
 * A primeira leitura tinha 7 pares regerados, que caíram para 1,2 a 7,3, contra 40 para cima
 * dos não regerados, e o corte saiu em 20. Com 24 pares regerados e conferidos com os olhos, a
 * distribuição ficou assim:
 *
 *   regerados e aprovados no olho (24): de 1,2 a 24,2
 *   não regerados, conferidos como iguais no olho (3): 25,9 a 26,6
 *   não regerados, cena visivelmente trocada (14): de 40,7 a 99,7
 *
 * Ou seja, o vale real está entre 26,6 e 40,7, e não em 20. O corte foi para 33, no meio dele.
 * Mexer num limiar para o próprio trabalho passar seria trapaça, então o que sustenta a
 * mudança está acima: três pares que EU aprovei olhando (clam-shell, mesa-flexora e
 * agachamento livre) ficaram em 21 a 24 depois de regerados, porque o gerador repinta o fundo
 * com pequena diferença mesmo acertando a cena. Manter 20 acusaria trabalho correto.
 *
 * O QUE ISSO CUSTA, declarado: entre 26,6 e 33 a medida deixa de opinar. Ninguém está nessa
 * faixa hoje. A regressão que este guardrail existe para pegar, análise trocada por cena
 * regerada, mora de 40 para cima, bem longe do corte.
 *
 * O QUE ESTA MEDIDA NÃO PEGA, declarado porque medir e calar seria pior que não medir:
 *
 * Ela compara o cenário pixel a pixel na moldura, então enxerga bem uma troca de fundo CLARO
 * por ESCURO, que é a assinatura da rodada que ela veio consertar. Mas duas academias escuras
 * DIFERENTES têm molduras parecidas: trocando a análise da puxada alta pela do crucifixo, as
 * duas escuras, a divergência foi só 10,9, abaixo do corte. Testei normalizar o brilho e passar
 * um filtro de borda antes de comparar, e os dois PIORARAM a separação (com filtro de borda o
 * pior par cai para 16,9 e o melhor sobe para 8,5, e o vale desaparece).
 *
 * Então este guardrail é uma rede, não uma prova: ele trava a regressão de fundo, que é a que
 * de fato aconteceu 34 vezes, e não substitui olhar par a par. A varredura visual continua
 * sendo o método; a medida é o que impede a regressão silenciosa entre uma varredura e outra.
 *
 * DUAS PORTAS DE SAÍDA, as duas declaradas:
 *
 * - `analiseOutraVista` no exercício: a análise é outra vista DE PROPÓSITO, porque o músculo
 *   alvo fica nas costas e a execução é frontal. Nesses a tela nem usa o divisor, mostra as duas
 *   lado a lado e escreve o motivo. Divergência alta ali é esperada.
 * - `PENDENTES` aqui embaixo: pares que ainda não foram regerados, cada um com o número que
 *   tinha quando entrou na lista. A lista só pode ENCOLHER, e o guardrail cobra isso: par que
 *   melhorou e saiu do limite tem que sair da lista também, senão a fila fica mentindo.
 */
import { exercises } from "../src/data/exercises";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const problemas: string[] = [];
const erro = (msg: string) => {
  problemas.push(msg);
};

/** Acima disto o par não é a mesma tomada. Medido e revisado com amostra maior (ver cabeçalho). */
const LIMITE = 33;

/**
 * Fila declarada de pares que ainda são cena regerada, com a divergência medida em 22/08/2026.
 *
 * Não é uma gaveta: cada linha é trabalho pendente de img2img a partir da própria foto de
 * execução, e a asserção do fim do arquivo impede que a lista cresça ou fique desatualizada.
 */
const PENDENTES: Record<string, number> = {
};

/**
 * SEGUNDA COISA QUE QUEBRA O DIVISOR, e é independente da primeira.
 *
 * As camadas de análise antigas foram geradas QUADRADAS (1024 x 1024) enquanto as fotos de
 * execução são 4:3 ou 4:5. Mesmo com a cena certa, o divisor sobrepõe duas imagens de formato
 * diferente: o navegador estica uma das duas, e a revelação sai desalinhada do corpo. Dá para
 * ver na tela como um "pulo" da figura quando o divisor passa.
 *
 * Não dá para consertar redimensionando: uma análise quadrada de uma cena 4:3 não é a mesma
 * cena cortada, é outro enquadramento, e esticar de volta deformaria o corpo. O conserto é
 * regerar, e por isso esta fila anda junto com a outra.
 *
 * A tolerância de 2% existe porque o recorte do gerador às vezes tira uma ou duas linhas de
 * pixel; acima disso é enquadramento diferente.
 */
const TOLERANCIA_PROPORCAO = 0.02;

const PENDENTES_PROPORCAO: Record<string, number> = {
};

const N = 96;
const BORDA = 14;

async function cinza(arq: string): Promise<Buffer> {
  const { data } = await sharp(arq).resize(N, N, { fit: "fill" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return data;
}

function divergenciaDaMoldura(a: Buffer, b: Buffer): number {
  let soma = 0;
  let n = 0;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const naBorda = x < BORDA || x >= N - BORDA || y < BORDA || y >= N - BORDA;
      if (!naBorda) continue;
      soma += Math.abs(a[y * N + x] - b[y * N + x]);
      n++;
    }
  return Number((soma / n).toFixed(1));
}

const RAIZ = path.join(process.cwd(), "public");

const pares = exercises.filter((e) => e.imagem && e.imagemAnalise);
if (pares.length < 80) erro(`CONTROLE POSITIVO: só ${pares.length} exercícios têm o par foto + análise; a varredura perdeu o sentido.`);

const medidos: { slug: string; div: number }[] = [];
for (const e of pares) {
  const fa = path.join(RAIZ, e.imagem!);
  const fb = path.join(RAIZ, e.imagemAnalise!);
  if (!fs.existsSync(fa) || !fs.existsSync(fb)) continue; // a existência é cobrada em check:catalogo
  const [a, b] = await Promise.all([cinza(fa), cinza(fb)]);
  const div = divergenciaDaMoldura(a, b);
  medidos.push({ slug: e.slug, div });

  // A análise em outra vista é decisão declarada, e ali a tela nem usa o divisor.
  if (e.analiseOutraVista && div < LIMITE)
    erro(
      `OUTRA VISTA QUE NÃO É OUTRA VISTA (${e.slug}): o exercício declara \`analiseOutraVista\` e a divergência é ${div}, ou seja, as duas SÃO a mesma tomada. Apague a declaração e deixe o divisor voltar.`,
    );

  /*
   * PROPORÇÃO: cobrada em todo par que o divisor SOBREPÕE, e não nos de outra vista.
   *
   * A primeira versão desta regra cobrava também os de `analiseOutraVista`, com o argumento de
   * que "formato igual é o sinal de que a análise saiu DAQUELA foto". O argumento se contradiz:
   * nesses pares a análise NÃO sai daquela foto, e não sair é justamente o que eles declaram.
   * Lá as duas ficam lado a lado numa grade, cada uma no seu quadro, e formato diferente é
   * questão de arrumação, não de correção. Cobrar ali era criar trabalho para satisfazer uma
   * regra que não tinha o que proteger.
   */
  if (e.analiseOutraVista) continue;

  const ma = await sharp(fa).metadata();
  const mb = await sharp(fb).metadata();
  const razaoA = ma.width! / ma.height!;
  const razaoB = mb.width! / mb.height!;
  const desvio = Math.abs(razaoA - razaoB) / razaoA;
  const pctDesvio = Number((desvio * 100).toFixed(1));
  const pendenteProp = PENDENTES_PROPORCAO[e.slug];
  if (desvio > TOLERANCIA_PROPORCAO && pendenteProp == null)
    erro(
      `PROPORÇÃO DIFERENTE (${e.slug}): a execução é ${ma.width}x${ma.height} e a análise é ${mb.width}x${mb.height}, ${pctDesvio}% de desvio. O divisor sobrepõe as duas, então o navegador estica uma e a revelação sai fora do corpo. Regere a análise no mesmo enquadramento da foto.`,
    );
  if (desvio <= TOLERANCIA_PROPORCAO && pendenteProp != null)
    erro(
      `PENDÊNCIA DE PROPORÇÃO JÁ RESOLVIDA (${e.slug}): o desvio caiu para ${pctDesvio}% e o par saiu do limite, mas ele continua na fila. Tire-o de PENDENTES_PROPORCAO.`,
    );

  const pendente = PENDENTES[e.slug];
  if (div >= LIMITE && pendente == null)
    erro(
      `PAR QUE NÃO É A MESMA TOMADA (${e.slug}): divergência de cenário ${div}, acima do limite de ${LIMITE}. O divisor promete revelar a análise sobre a MESMA imagem e trocaria o cenário no meio. Regere a análise por img2img A PARTIR da foto de execução, ou declare \`analiseOutraVista\` com o motivo.`,
    );
  if (div < LIMITE && pendente != null)
    erro(
      `PENDÊNCIA JÁ RESOLVIDA (${e.slug}): a divergência caiu para ${div} e o par saiu do limite, mas ele continua na fila de PENDENTES com ${pendente}. Tire-o da lista: fila desatualizada esconde o que já foi feito e o que falta.`,
    );
}

// A fila não pode citar exercício que não existe mais nem que perdeu o par.
const comPar = new Set(medidos.map((m) => m.slug));
for (const slug of Object.keys(PENDENTES))
  if (!comPar.has(slug)) erro(`FILA COM SLUG ÓRFÃO (${slug}): está em PENDENTES e não é mais um exercício com par de imagens.`);
for (const slug of Object.keys(PENDENTES_PROPORCAO)) {
  if (!comPar.has(slug))
    erro(`FILA DE PROPORÇÃO COM SLUG ÓRFÃO (${slug}): está em PENDENTES_PROPORCAO e não é mais um exercício com par de imagens.`);
  // Par de outra vista é ISENTO da regra de proporção, então não pode ficar na fila dela: a
  // entrada nunca seria avaliada, e a fila passaria a contar trabalho que ninguém vai fazer.
  else if (exercises.find((e) => e.slug === slug)?.analiseOutraVista)
    erro(
      `FILA DE PROPORÇÃO COM PAR ISENTO (${slug}): o exercício declara \`analiseOutraVista\`, que não é sobreposto pelo divisor e por isso não responde à regra de proporção. Tire-o da fila.`,
    );
}

if (problemas.length) {
  console.error(`\n[check:pares] REPROVOU (${problemas.length}):`);
  for (const p of problemas) console.error("  - " + p);
  console.error("");
  process.exit(1);
}

const ok = medidos.filter((m) => m.div < LIMITE).length;
const fila = Object.keys(PENDENTES).length;
const filaProp = Object.keys(PENDENTES_PROPORCAO).length;
const outraVista = pares.filter((e) => e.analiseOutraVista).length;
console.log(
  `[check:pares] ok: ${medidos.length} pares medidos, ${ok} são a MESMA tomada (divergência abaixo de ${LIMITE}), ${outraVista} são outra vista declarada e mostrada lado a lado. Fila de regeração: ${fila} por cena e ${filaProp} por proporção.`,
);
