/**
 * CAMPO NUMÉRICO NÃO ACEITA LETRA, E NÚMERO INVÁLIDO NÃO VIRA MEDIDA.
 *
 * O Filipe: "está sendo possível inserir letras nos campos que deveriam ser aceitos somente
 * números". Estava, e o estrago não era de digitação: `Number("abc")` é NaN, NaN NÃO é null,
 * então ele atravessava todo teste `!= null` do produto e ia gravado dentro de `medidas`, no
 * registro clínico do aluno. O sintoma que ele viu foi "NaNmmHg" na coluna de pressão da
 * tabela comparativa. E o pior nem era a tela: na travessia por JSON até o Supabase, NaN
 * vira null, ou seja o profissional digita, o campo aceita, e a medida some sem aviso.
 *
 * ESTE GUARDRAIL COBRA AS DUAS BARREIRAS, e as duas precisam existir:
 *
 *   1. FILTRO NA DIGITAÇÃO. Todo input de medida passa o que foi digitado por um filtro antes
 *      de guardar. `inputMode="decimal"` NÃO é filtro: é dica de teclado no celular, e no
 *      computador o campo engole "abc" inteiro. Foi por confiar nele que isto passou.
 *   2. BARREIRA NA CONVERSÃO. Toda tela que recebe digitação precisa devolver ausência para o
 *      que não é número finito. O filtro cobre o teclado; a barreira cobre o colar, o
 *      preenchimento automático e o dado que chega de fora.
 */
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const falhas: string[] = [];
const rel = (f: string) => path.relative(RAIZ, f).split(path.sep).join("/");

function arquivos(dir: string, achados: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const cheio = path.join(dir, e.name);
    if (e.isDirectory()) arquivos(cheio, achados);
    else if (e.name.endsWith(".tsx")) achados.push(cheio);
  }
  return achados;
}

/*
 * A landing e o Aprender ficam de fora: a landing é HTML injetado e não grava medida, e os
 * campos do Aprender são sandbox de aula, que não escrevem no prontuário de ninguém.
 */
const FORA = ["src/pages/landing", "src/components/landing", "src/features/learning"];
const todos = arquivos(path.join(RAIZ, "src")).filter((f) => !FORA.some((d) => rel(f).startsWith(d)));

/* ------------------------ 1. filtro na digitação ------------------------ */

/**
 * Um input é NUMÉRICO quando se declara assim. O que ele faz no onChange precisa mostrar que
 * filtra: ou chama um filtro nomeado da casa, ou traz o próprio recorte de não-dígitos ali.
 */
/*
 * O campo se declara numerico de mais de um jeito, e a primeira versao so enxergava o
 * literal (inputMode="numeric"). O campo de medida da avaliacao, que e exatamente o do
 * defeito, escreve inputMode={max10 ? "numeric" : "decimal"}: ficava de fora da varredura,
 * e o guardrail dava verde sem nunca ter olhado para ele.
 */
const DECLARA_NUMERICO = /inputMode=(?:"(?:numeric|decimal)"|\{[^}]*(?:numeric|decimal)[^}]*\})|type="number"/;
/*
 * O QUE CONTA COMO PROTEGIDO, e por que a primeira versão deste guardrail NÃO servia.
 *
 * A primeira versão procurava um filtro EM QUALQUER LUGAR da tag. Com ela, o código exato
 * que deixou o Filipe digitar letra passava verde, porque ele TINHA um filtro, só que
 * condicional:
 *
 *     let v = e.target.value;
 *     if (max10) v = v.replace(/[^0-9]/g, "");   <- só a escala de 0 a 10 filtrava
 *     setM(mkey, v);                             <- peso, pressão e gordura passavam cru
 *
 * Guardrail que codifica a regra errada congela o defeito com cara de segurança. Então a
 * regra passou a olhar o CAMINHO DO VALOR, e não a presença de um filtro em algum canto:
 *
 *   (a) TODA aparição de `target.value` na tag está embrulhada por um filtro, seja como
 *       argumento de uma chamada (`soNumero(e.target.value)`) seja com o recorte colado
 *       nela (`e.target.value.replace(...)`); ou
 *   (b) a tag tem uma PORTA de número finito, entregando ao estado só o que passou por
 *       `Number.isFinite`.
 *
 * O que não vale é o texto cru subir e alguém consertar lá na frente: o campo continua
 * mostrando a letra digitada, e a gravação vira silêncio, sem valor e sem aviso, que foi o
 * que acontecia na mensalidade.
 */
const PORTA_FINITA = /Number\.isFinite/;
const ABRE_FILTRO = /(soNumero|EntradaNumero|paraCentavos)\($/;
const RECORTE_COLADO = /^\.replace\(/;

/** Toda aparição de `target.value` na tag passa por filtro? */
function valorSempreFiltrado(tag: string): boolean {
  const casos = [...tag.matchAll(/(?:e|ev|evt|event)\.target\.value/g)];
  if (casos.length === 0) return true; // não lê o digitado; não é o caso deste guardrail
  return casos.every((m) => {
    const antes = tag.slice(Math.max(0, m.index - 40), m.index);
    const depois = tag.slice(m.index + m[0].length, m.index + m[0].length + 20);
    return ABRE_FILTRO.test(antes) || RECORTE_COLADO.test(depois);
  });
}

for (const f of todos) {
  const texto = fs.readFileSync(f, "utf8");
  /*
   * A tag vai de "<input" ate o "/>" que a fecha, e NAO ate o primeiro ">": arrow function
   * no onChange tem ">" dentro dela, e parar ali cortava a tag no meio, escondendo justamente
   * o filtro que este guardrail procura. "/>" e "=>" sao sequencias distintas, entao fechar
   * pelo autofechamento e seguro em JSX.
   */
  for (const m of texto.matchAll(/<input\b[\s\S]*?\/>/g)) {
    const tag = m[0];
    if (!DECLARA_NUMERICO.test(tag)) continue;
    if (!/onChange=/.test(tag)) continue; // só leitura, ou controlado fora da tag
    if (valorSempreFiltrado(tag) || PORTA_FINITA.test(tag)) continue;
    const linha = texto.slice(0, m.index).split("\n").length;
    falhas.push(
      `${rel(f)}:${linha}: campo numérico sem filtro de digitação. inputMode não filtra nada, ` +
        `é só dica de teclado. Use soNumero() no onChange, ou o componente EntradaNumero.`,
    );
  }
}

/* ------------------------ 2. barreira na conversão ------------------------ */

/*
 * Varrer TODA conversão do código daria ruído (há dezenas legítimas sobre valor já validado).
 * O alvo aqui são as telas que recebem TEXTO LIVRE e o transformam em número clínico.
 */
const DE_DIGITACAO = [
  "src/components/app/AvaliacaoModal.tsx",
  "src/components/avaliacao/CalculadoraEstimativa.tsx",
  "src/components/student/blocoRegistro.tsx",
];

for (const alvo of DE_DIGITACAO) {
  const f = path.join(RAIZ, alvo);
  if (!fs.existsSync(f)) {
    falhas.push(`${alvo}: arquivo de digitação sumiu; o guardrail ficaria sem alvo.`);
    continue;
  }
  if (!/Number\.isFinite|numeroOuAusente/.test(fs.readFileSync(f, "utf8")))
    falhas.push(
      `${alvo}: nenhuma barreira Number.isFinite. Texto que não é número finito tem de virar ` +
        `ausência, nunca NaN dentro de uma medida.`,
    );
}

if (falhas.length) {
  console.error("[check:numeros] FALHOU\n");
  for (const f of falhas) console.error("  - " + f);
  console.error(`\n${falhas.length} campo(s) ou arquivo(s) sem proteção.`);
  process.exit(1);
}

console.log(
  "[check:numeros] ok: todo campo numérico filtra a digitação e toda tela de digitação tem barreira contra NaN.",
);
