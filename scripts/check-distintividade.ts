/**
 * Guardrail da rodada de evidência por condição.
 *
 * A queixa que originou isto, nas palavras do fundador: o segundo cérebro "pegou uma
 * diretriz e usou ela para responder por diferentes realidades". A auditoria mediu e
 * confirmou: `acsm-getp11`, que não tem DOI nem PMID, sustentava 19 das 23 condições, e
 * sete condições citavam APENAS referência genérica.
 *
 * O que este script trava, e o que ele deliberadamente NÃO trava.
 *
 * TRAVA: condição sustentada só por diretriz geral. É o defeito exato da queixa, e é
 * verificável sem opinião.
 *
 * NÃO TRAVA: condição que não modula dose. Isso foi tentação e teria sido erro. A revisão
 * Cochrane de asma (osadnik-asma-2022) mostra melhora de capacidade e de qualidade de vida
 * e efeito pequeno e incerto sobre o CONTROLE da asma. Ou seja, a evidência daquela
 * condição sustenta uma promessa distinta, não uma dose distinta. Exigir que toda condição
 * mexesse num parâmetro obrigaria a inventar número onde ninguém mediu, que é o mesmo
 * pecado da queixa, só que de cabeça para baixo.
 *
 * O DÉBITO É EXPLÍCITO E SÓ PODE ENCOLHER. As condições que ainda não têm evidência própria
 * estão nomeadas em `SEM_EVIDENCIA_PROPRIA`. Acrescentar nome nessa lista é regressão e o
 * script recusa; tirar nome é o trabalho. Sem essa lista, o guardrail só poderia nascer
 * depois que a última condição estivesse pronta, e até lá nada estaria protegido.
 */
import { groupGpsRules } from "@/lib/gps/groupRules";
import { specialGroups } from "@/data/specialGroups";
import { referencias } from "@/data/referencias";

const falhas: string[] = [];
const reprovar = (m: string) => falhas.push(m);

/**
 * Diretrizes e posicionamentos que valem para QUALQUER adulto. Citar só isto numa condição
 * é dizer "o geral responde pelo particular", que é a queixa.
 */
const GENERICAS = new Set([
  "acsm-getp11",
  "acsm-progressao-2009",
  "garber-2011",
  "oms-2020",
  // `donnelly-2009` NÃO entra aqui, e a primeira versão desta lista errou ao incluí-lo. É o
  // posicionamento da ACSM sobre estratégias de atividade física para perda e manutenção de
  // peso: para as condições de obesidade ele é evidência do próprio tema, não diretriz
  // geral. O critério desta lista é "vale para qualquer adulto", e ele não vale.
  "chodzko-2009",
  "confef-254",
  "warburton-2011",
  "who-imc-2004",
  "seidell-flegal-1997",
]);

/**
 * Débito conhecido em 06/08/2026. Cada nome aqui é uma condição que ainda responde por
 * diretriz geral. A lista nasceu com 14 e só pode encolher.
 */
const SEM_EVIDENCIA_PROPRIA = new Set<string>([]);

/* --- A. Toda condição cita ao menos uma referência específica dela ---------- */

const semProprias: string[] = [];
for (const [slug, regra] of Object.entries(groupGpsRules)) {
  const refs = new Set<string>(regra.refs ?? []);
  for (const r of regra.modProgressao?.refId ?? []) refs.add(r);
  for (const r of regra.modDose?.refId ?? []) refs.add(r);
  for (const r of regra.modAerobio?.refId ?? []) refs.add(r);

  const proprias = [...refs].filter((r) => !GENERICAS.has(r));
  if (proprias.length === 0) semProprias.push(slug);
}

for (const slug of semProprias)
  if (!SEM_EVIDENCIA_PROPRIA.has(slug))
    reprovar(
      `[A] "${slug}" é sustentada apenas por diretriz genérica. É o defeito que abriu esta rodada: ` +
        `o geral respondendo pelo particular. Ou entra evidência específica da condição, ou o nome entra ` +
        `em SEM_EVIDENCIA_PROPRIA com a justificativa, e nesse caso vira débito declarado.`,
    );

// A lista de débito não pode crescer, e também não pode guardar nome que já foi resolvido:
// débito quitado que fica na lista esconde progresso e afrouxa o guardrail em silêncio.
for (const slug of SEM_EVIDENCIA_PROPRIA)
  if (!semProprias.includes(slug))
    reprovar(`[A] "${slug}" já tem evidência própria e continua listada em SEM_EVIDENCIA_PROPRIA. Tire o nome da lista.`);

/* --- B. Nenhum campo clínico declarado e não consumido --------------------- */

/*
 * A classe de defeito mais cara deste motor, nas palavras do cabeçalho de `alvo.ts`: a
 * cautela declarada e não aplicada. Três campos estavam assim quando a rodada começou.
 * `descargaCadaSemanas` não era lido por ninguém e a cadência real era uma constante;
 * `rirMinimo` estava encanado de ponta a ponta e nenhuma condição preenchia; e o teto de
 * carga da hipertensão, único número publicado específico de condição do motor, nunca
 * mordia porque só uma faixa do produto expressa %1RM.
 */
import { readFileSync } from "node:fs";
const MOTOR = ["src/lib/gps/alvo.ts", "src/lib/gps/periodizacao.ts", "src/lib/gps/engine.ts"]
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

const CAMPOS_CLINICOS = [
  "pseTeto",
  "fatorIncremento",
  "descargaCadaSemanas",
  "cargaRelativaMax",
  "rirMinimo",
  "intervaloFolgado",
  "partirDoPiso",
  "intervaladoIndicado",
  "intervaladoEvitar",
  "horizonteMinimoSemanas",
  "complexidadeMax",
];

for (const campo of CAMPOS_CLINICOS) {
  const declarado = Object.values(groupGpsRules).some((r) =>
    JSON.stringify(r).includes(`"${campo}"`),
  );
  if (declarado && !MOTOR.includes(campo))
    reprovar(
      `[B] "${campo}" é declarado por alguma condição e NENHUM arquivo do motor o lê. ` +
        `Cautela declarada e não aplicada é o defeito mais comum deste motor.`,
    );
}

/* --- C. Controles positivos ------------------------------------------------ */

if (Object.keys(groupGpsRules).length !== specialGroups.length)
  reprovar(`[C] ${Object.keys(groupGpsRules).length} regras para ${specialGroups.length} condições do catálogo.`);

if (GENERICAS.size < 5 || CAMPOS_CLINICOS.length < 8)
  reprovar("[C] controle positivo: as listas deste script ficaram pequenas demais para ele significar algo.");

// Se as genéricas deixassem de existir em referencias.ts, o bloco A passaria por vazio.
const idsReais = new Set(referencias.map((r) => r.id));
for (const g of GENERICAS)
  if (!idsReais.has(g)) reprovar(`[C] a referência genérica "${g}" não existe mais em referencias.ts; a lista está desatualizada.`);

/* ------------------------------- resultado -------------------------------- */

const comProprias = Object.keys(groupGpsRules).length - semProprias.length;

if (falhas.length) {
  console.error(`\n✗ check:distintividade reprovou com ${falhas.length} problema(s):\n`);
  for (const f of falhas) console.error(`  ${f}`);
  console.error("");
  process.exit(1);
}

console.log(
  `[check:distintividade] ok: ${comProprias} de ${Object.keys(groupGpsRules).length} condições com evidência própria, ` +
    `${SEM_EVIDENCIA_PROPRIA.size} em débito declarado, e nenhum campo clínico declarado sem consumidor.`,
);
