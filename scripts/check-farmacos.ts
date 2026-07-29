/**
 * Guardrail da camada de fármacos: o catálogo pode mudar o TREINO, nunca falar da medicação.
 *
 * Roda com `npm run check:farmacos`. O molde é scripts/check-regras.ts, e as quatro primeiras
 * verificações são herdadas dele, porque uma consequência de treino é uma regra versionada como
 * qualquer outra. O que este check acrescenta é a fronteira de ESCOPO, que é o item mais valioso
 * daqui: o produto se recusa a orientar medicação, e essa recusa precisa estar no CI, não só na
 * boa intenção de quem escreve o próximo texto.
 *
 * As 11 travas:
 *  1. Herda check:regras. Todo refId aponta para uma referência real; consequência "aprovada"
 *     tem ao menos um refId; versao >= 1; confiança válida; "aprovada" com confiança "fraca" é
 *     proibido (evidência fraca é DECLARADA como pendente, nunca vendida como aprovada).
 *  2. Denylist de escopo nos textos do catálogo: unidade de medida, apresentação, esquema de
 *     uso, verbo imperativo dirigido à medicação, causal fechado com o fármaco como sujeito, e
 *     travessão (a casa não usa). O campo naoAfirmar fica FORA da trava de causal fechado, e só
 *     dela: ele existe exatamente para nomear a afirmação proibida.
 *  3. Whitelist positiva de princípios ativos: exemplos[] só aceita item de
 *     PRINCIPIOS_ATIVOS_PERMITIDOS, nenhum item da lista fica órfão, e qualquer palavra com cara
 *     de princípio ativo em qualquer texto precisa estar na lista. Impede colar nome comercial
 *     por descuido.
 *  4. Toda cautela devolve a conduta: item.devolucao é uma das frases de DEVOLUCOES, e toda
 *     frase de DEVOLUCOES termina na sentença canônica.
 *  5. Integridade do monitoramento: todo id existe em monitoringParameters; invalidam não vazio
 *     obriga substituem não vazio; nenhum id nos dois ao mesmo tempo; e p-fc, que carrega a prosa
 *     mais precisa do produto sobre betabloqueador, cita as duas referências que a sustentam.
 *  6. naoAfirmar obrigatório e não vazio em toda classe.
 *  7. Monotonicidade: fármaco só APERTA. Teto de esforço e passo de carga, quando existirem, só
 *     podem restringir; e a fusão de monitoramento nunca devolve um instrumento que outra classe
 *     invalidou, nunca perde um invalidado ao somar classes, e é comutativa e associativa.
 *  8. Consequência "pendente" não crava nada: sem teto, sem passo de carga e sem invalidar
 *     parâmetro. ("número" aqui é o campo de decisão, não a descrição do ensaio.)
 *  9. Sem inferência reversa: nenhum id de classe coincide com slug de grupo especial nem com
 *     chave de groupGpsRules, e todo slug citado em gruposRelevantes existe de verdade.
 * 10. Recusa catálogo vazio e se AUTOVERIFICA: casos sintéticos que devem passar e casos que
 *     devem falhar, um por trava. Um verificador que não sabe reprovar não protege nada.
 * 11. O checklist do dia MONTADO: prefixo obrigatório e id único nos itens de medicação, sem
 *     colisão com id de item de grupo, aluno sem medicação recebendo o MESMO checklist de
 *     antes (identidade de objeto), pergunta que o grupo já faz não repetida, escopo mudando
 *     de fato (obesidade com insulina ganha o gate glicêmico), item novo falhando fechado
 *     quando fica em branco, e gate de fármaco proibido de mandar mexer na carga enquanto
 *     nenhuma classe declarar passo de carga.
 *
 * EXCEÇÃO DELIBERADA: src/data/referencias.ts fica fora da trava de unidade e de esquema de uso,
 * porque a nota transcreve o protocolo do ensaio e "atorvastatina em dose alta por 6 meses" é
 * descrição científica legítima. As notas das referências desta camada continuam sujeitas à
 * trava de imperativo, que é a que protege o escopo.
 */
import {
  CATALOGO_FARMACOS,
  DEVOLUCOES,
  GRUPOS_FARMACO,
  PRINCIPIOS_ATIVOS_PERMITIDOS,
  criarFarmaco,
  fundirMonitoramento,
  type ConsequenciaTreino,
  type EfeitoMonitoramento,
  type FarmacoCatalogoItem,
  type FarmacoClasseId,
} from "../src/data/farmacos";
import {
  GATE_JA_COBERTO_POR,
  ITENS_SEMAFORO_POR_FARMACO,
  avaliarSemaforo,
  montarChecklist,
  semaforos,
} from "../src/data/semaforo";
import { getReferencia } from "../src/data/referencias";
import { monitoringParameters, type ParamMonitorId } from "../src/data/monitoringParameters";
import { specialGroups } from "../src/data/specialGroups";
import { groupGpsRules } from "../src/lib/gps/groupRules";

const CONFIANCAS = ["forte", "moderada", "fraca"];
const APROVACOES = ["aprovada", "pendente"];
const PARAM_IDS = monitoringParameters.map((p) => p.id) as string[];
const SLUGS_GRUPO = new Set<string>([
  ...specialGroups.map((g) => g.slug),
  ...Object.keys(groupGpsRules),
]);
const DEVOLUCAO_FINAL = DEVOLUCOES.conduta;
const REFS_BETABLOQ = ["mitchell-betabloq-2019", "wonisch-betabloq-2003"];

/* ----------------------------- Trava 2: denylist ---------------------------- */

interface Padrao {
  rotulo: string;
  re: RegExp;
}

/** Unidade, apresentação e esquema de uso: nada disso cabe num catálogo de treino. */
const DENY_ESCOPO: Padrao[] = [
  { rotulo: "unidade de medida", re: /\b(mg|mcg|ml|mmol|UI)\b/i },
  {
    rotulo: "apresentação ou quantidade de medicação",
    re: /\b(dose|doses|dosagem|posologia|comprimido|comprimidos|c[aá]psula|c[aá]psulas|ampola|frasco|seringa|gotas)\b/i,
  },
  { rotulo: "esquema de uso", re: /\b\d+\s*(x|vezes)\s*(ao|por)\s*dia\b/i },
  { rotulo: "esquema de uso", re: /\bde\s+\d+\s+em\s+\d+\s+horas\b/i },
  { rotulo: "esquema de uso", re: /\b(em jejum|antes de dormir|ao deitar|ap[oó]s as refei[cç][oõ]es)\b/i },
  { rotulo: "travessão ou meia-risca (a casa não usa)", re: /[–—]/ },
];

/** Verbo imperativo dirigido à medicação: a fronteira de escopo em uma linha. */
const DENY_IMPERATIVO: Padrao[] = [
  { rotulo: "imperativo sobre medicação", re: /\btome\b/i },
  { rotulo: "imperativo sobre medicação", re: /\bn[aã]o tome\b/i },
  { rotulo: "imperativo sobre medicação", re: /\bpare de tomar\b/i },
  { rotulo: "imperativo sobre medicação", re: /\bsuspend(a|er)\s+(a|o|as|os)?\s*(medica|rem[eé]dio|f[aá]rmaco|tratamento)/i },
  { rotulo: "imperativo sobre medicação", re: /\binterromp(a|er)\s+(a|o|as|os)?\s*(medica|rem[eé]dio|f[aá]rmaco|tratamento)/i },
  { rotulo: "imperativo sobre medicação", re: /\bpule\b/i },
  { rotulo: "imperativo sobre medicação", re: /\bdesmam(e|ar)\b/i },
  { rotulo: "imperativo sobre medicação", re: /\b(reduza|aumente|ajuste|troque)\s+(a|o)\s+(dose|medica|rem[eé]dio|f[aá]rmaco)/i },
];

/** Causal fechado: o sujeito da frase nunca é o fármaco. */
const SUJEITOS_FARMACO = [
  "f[aá]rmaco",
  "medica[cç][aã]o",
  "medicamento",
  "rem[eé]dio",
  "betabloqueador",
  "estatina",
  "insulina",
  "metformina",
  "diur[eé]tico",
  "anti-inflamat[oó]rio",
  "a classe",
  ...PRINCIPIOS_ATIVOS_PERMITIDOS,
];
const VERBOS_CAUSAIS = [
  "causa",
  "causam",
  "provoca",
  "provocam",
  "bloqueia",
  "bloqueiam",
  "derruba",
  "derrubam",
  "impede",
  "impedem",
  "atrapalha",
  "atrapalham",
  "reduz",
  "reduzem",
  "diminui",
  "diminuem",
];
const RE_CAUSAL = new RegExp(
  `\\b(${SUJEITOS_FARMACO.join("|")})\\b(\\s+\\S+){0,3}\\s+\\b(${VERBOS_CAUSAIS.join("|")})\\b`,
  "i",
);

/** Palavra com cara de princípio ativo (trava 3): se parece, tem que estar na whitelist. */
const RE_PRINCIPIO = /\b\w{3,}(olol|statina|glutida|formina|profeno|tazida|sartana|pril|dipino)\b/gi;

/* ---------------------- Coleta dos textos de um item ------------------------ */

interface Texto {
  campo: string;
  valor: string;
  /** false apenas em naoAfirmar, que existe para nomear a afirmação proibida */
  causal: boolean;
}

function textosDoItem(item: FarmacoCatalogoItem): Texto[] {
  const out: Texto[] = [
    { campo: "titulo", valor: item.titulo, causal: true },
    { campo: "descricao", valor: item.descricao, causal: true },
    { campo: "devolucao", valor: item.devolucao, causal: true },
  ];
  item.efeitos.forEach((t, i) => out.push({ campo: `efeitos[${i}]`, valor: t, causal: true }));
  item.exemplos.forEach((t, i) => out.push({ campo: `exemplos[${i}]`, valor: t, causal: true }));
  item.naoAfirmar.forEach((t, i) => out.push({ campo: `naoAfirmar[${i}]`, valor: t, causal: false }));
  for (const c of item.consequencias) {
    const p = `consequencia "${c.id}"`;
    out.push({ campo: `${p}.descricao`, valor: c.descricao, causal: true });
    if (c.observacao) out.push({ campo: `${p}.observacao`, valor: c.observacao, causal: true });
    if (c.monitoramento) out.push({ campo: `${p}.monitoramento.motivo`, valor: c.monitoramento.motivo, causal: true });
    if (c.gate) {
      out.push({ campo: `${p}.gate.pergunta`, valor: c.gate.pergunta, causal: true });
      out.push({ campo: `${p}.gate.porque`, valor: c.gate.porque, causal: true });
      out.push({ campo: `${p}.gate.acao`, valor: c.gate.acao, causal: true });
    }
  }
  return out;
}

/* -------------------------- Validação de um item --------------------------- */

function validarConsequencia(item: FarmacoCatalogoItem, c: ConsequenciaTreino): string[] {
  const e: string[] = [];
  const onde = `[${item.classe}] consequência "${c.id}"`;

  // 1. herdado de check:regras
  for (const id of c.refId) {
    if (!getReferencia(id)) e.push(`${onde}: refId inexistente "${id}" (não está em referencias.ts).`);
  }
  if (c.aprovacao === "aprovada" && c.refId.length === 0) {
    e.push(`${onde}: está "aprovada" mas não cita nenhum refId.`);
  }
  if (!(c.versao >= 1)) e.push(`${onde}: versao ${c.versao} inválida (esperado >= 1).`);
  if (!CONFIANCAS.includes(c.confianca)) e.push(`${onde}: confianca "${c.confianca}" inválida.`);
  if (!APROVACOES.includes(c.aprovacao)) e.push(`${onde}: aprovacao "${c.aprovacao}" inválida.`);
  if (c.aprovacao === "aprovada" && c.confianca === "fraca") {
    e.push(`${onde}: "aprovada" com confiança "fraca". Evidência fraca é declarada como "pendente".`);
  }

  // o campo do próprio tipo tem que existir
  if (c.tipo === "monitoramento" && !c.monitoramento) e.push(`${onde}: tipo "monitoramento" sem o campo monitoramento.`);
  if (c.tipo === "gate-pre-sessao" && !c.gate) e.push(`${onde}: tipo "gate-pre-sessao" sem o campo gate.`);
  if (c.tipo === "vigilancia" && !c.vigilancia) e.push(`${onde}: tipo "vigilancia" sem o campo vigilancia.`);

  // 5. integridade do monitoramento
  const idsUsados: { id: string; campo: string }[] = [];
  if (c.monitoramento) {
    const m = c.monitoramento;
    m.invalidam.forEach((id) => idsUsados.push({ id, campo: "invalidam" }));
    m.substituem.forEach((id) => idsUsados.push({ id, campo: "substituem" }));
    (m.reforcam ?? []).forEach((id) => idsUsados.push({ id, campo: "reforcam" }));
    if (m.invalidam.length > 0 && m.substituem.length === 0) {
      e.push(`${onde}: invalida ${m.invalidam.join(", ")} sem oferecer substituto. Tirar o instrumento sem devolver outro deixa o profissional sem como dosar.`);
    }
    for (const id of m.substituem) {
      if (m.invalidam.includes(id)) e.push(`${onde}: "${id}" está em invalidam e em substituem ao mesmo tempo.`);
    }
    for (const id of m.reforcam ?? []) {
      if (m.invalidam.includes(id)) e.push(`${onde}: "${id}" está em invalidam e em reforcam ao mesmo tempo.`);
    }
    if (!m.motivo?.trim()) e.push(`${onde}: monitoramento sem motivo.`);
    for (const id of m.refId ?? []) {
      if (!getReferencia(id)) e.push(`${onde}: monitoramento cita refId inexistente "${id}".`);
    }
  }
  if (c.vigilancia) {
    c.vigilancia.reforcam.forEach((id) => idsUsados.push({ id, campo: "vigilancia.reforcam" }));
    (c.vigilancia.confiabilidadeReduzida ?? []).forEach((id) =>
      idsUsados.push({ id, campo: "vigilancia.confiabilidadeReduzida" }),
    );
  }
  for (const { id, campo } of idsUsados) {
    if (!PARAM_IDS.includes(id)) e.push(`${onde}: ${campo} cita "${id}", que não existe em monitoringParameters.`);
  }
  if (c.gate) {
    if (!c.gate.id.trim()) e.push(`${onde}: gate sem id.`);
    for (const id of c.gate.refs ?? []) {
      if (!getReferencia(id)) e.push(`${onde}: gate cita refId inexistente "${id}".`);
    }
  }

  // 7. monotonicidade: teto e passo de carga só podem APERTAR
  if (c.tetoEsforco !== null) {
    if (c.aprovacao !== "aprovada" || c.refId.length === 0) {
      e.push(`${onde}: tetoEsforco cravado sem ser consequência aprovada com referência.`);
    }
    if (!(c.tetoEsforco > 0 && c.tetoEsforco <= 10)) {
      e.push(`${onde}: tetoEsforco ${c.tetoEsforco} fora da escala de esforço (0 a 10).`);
    }
  }
  if (c.passoCarga !== null) {
    if (c.aprovacao !== "aprovada" || c.refId.length === 0) {
      e.push(`${onde}: passoCarga cravado sem ser consequência aprovada com referência.`);
    }
    if (!(c.passoCarga > 0 && c.passoCarga <= 1)) {
      e.push(`${onde}: passoCarga ${c.passoCarga} fora de (0, 1]. Fármaco só encurta o passo, nunca alarga.`);
    }
  }

  // 8. pendente não crava nada
  if (c.aprovacao === "pendente") {
    if (c.tetoEsforco !== null) e.push(`${onde}: "pendente" com tetoEsforco cravado.`);
    if (c.passoCarga !== null) e.push(`${onde}: "pendente" com passoCarga cravado.`);
    if (c.monitoramento && c.monitoramento.invalidam.length > 0) {
      e.push(`${onde}: "pendente" invalidando parâmetro. Evidência declarada não tira instrumento de ninguém.`);
    }
  }

  // regra de segurança do plano: expectativa de adaptação nunca sai da teoria
  if (c.tipo === "expectativa-adaptacao" && !c.somenteTeoria) {
    e.push(`${onde}: tipo "expectativa-adaptacao" precisa de somenteTeoria: true (nunca vira card, Prontuário ou tela de sessão).`);
  }

  return e;
}

function validarItem(item: FarmacoCatalogoItem): string[] {
  const e: string[] = [];
  const onde = `[${item.classe}]`;

  // 2. denylist de escopo
  for (const t of textosDoItem(item)) {
    for (const p of [...DENY_ESCOPO, ...DENY_IMPERATIVO]) {
      const m = t.valor.match(p.re);
      if (m) e.push(`${onde} ${t.campo}: ${p.rotulo} em "${m[0]}". Fora do escopo de um catálogo de treino.`);
    }
    if (t.causal) {
      const m = t.valor.match(RE_CAUSAL);
      if (m) e.push(`${onde} ${t.campo}: causal fechado com o fármaco como sujeito em "${m[0]}". Reescreva com a resposta, o parâmetro, o aluno ou o profissional como sujeito.`);
    }
    // 3. palavra com cara de princípio ativo fora da whitelist
    for (const achado of t.valor.match(RE_PRINCIPIO) ?? []) {
      if (!PRINCIPIOS_ATIVOS_PERMITIDOS.includes(achado.toLowerCase())) {
        e.push(`${onde} ${t.campo}: "${achado}" parece princípio ativo e não está em PRINCIPIOS_ATIVOS_PERMITIDOS.`);
      }
    }
  }

  // 3. whitelist positiva nos exemplos
  if (item.exemplos.length === 0) e.push(`${onde}: sem exemplos de princípio ativo (o profissional precisa reconhecer a classe).`);
  for (const ex of item.exemplos) {
    if (!PRINCIPIOS_ATIVOS_PERMITIDOS.includes(ex)) {
      e.push(`${onde} exemplos: "${ex}" não está em PRINCIPIOS_ATIVOS_PERMITIDOS (nome comercial ou princípio não curado).`);
    }
  }

  // 4. devolução canônica
  if (!Object.values(DEVOLUCOES).includes(item.devolucao as (typeof DEVOLUCOES)[keyof typeof DEVOLUCOES])) {
    e.push(`${onde}: devolucao não é uma das frases canônicas de DEVOLUCOES.`);
  }

  // 6. naoAfirmar obrigatório
  if (item.naoAfirmar.length === 0) {
    e.push(`${onde}: naoAfirmar vazio. Sem a lista do que NUNCA se afirma, a próxima pessoa completa o catálogo com número que ninguém verificou.`);
  }
  for (const n of item.naoAfirmar) {
    if (!n.trim()) e.push(`${onde}: naoAfirmar com entrada em branco.`);
  }

  // 9. sem inferência reversa
  if (SLUGS_GRUPO.has(item.classe as string)) {
    e.push(`${onde}: o id da classe coincide com um grupo clínico. Declarar medicação NUNCA pode inferir condição no aluno.`);
  }
  for (const slug of item.gruposRelevantes) {
    if (!SLUGS_GRUPO.has(slug)) e.push(`${onde} gruposRelevantes: "${slug}" não existe em specialGroups.ts.`);
  }

  // estrutura mínima
  if (item.consequencias.length === 0) e.push(`${onde}: classe sem nenhuma consequência declarada.`);
  if (!GRUPOS_FARMACO.some((g) => g.id === item.grupo)) e.push(`${onde}: grupo "${item.grupo}" não está em GRUPOS_FARMACO.`);

  for (const c of item.consequencias) e.push(...validarConsequencia(item, c));
  return e;
}

/* --------------------------- Validação do conjunto -------------------------- */

const chave = (m: EfeitoMonitoramento | undefined) =>
  m
    ? JSON.stringify({
        invalidam: m.invalidam,
        substituem: m.substituem,
        reforcam: m.reforcam ?? [],
        motivo: m.motivo,
        refId: m.refId ?? [],
      })
    : "undefined";

/** Trava 7 aplicada à fusão: só aperta, nunca devolve instrumento invalidado, é comutativa e associativa. */
function validarFusao(efeitos: EfeitoMonitoramento[]): string[] {
  const e: string[] = [];
  for (let i = 0; i < efeitos.length; i++) {
    for (let j = 0; j < efeitos.length; j++) {
      if (i === j) continue;
      const a = efeitos[i];
      const b = efeitos[j];
      const ab = fundirMonitoramento([a, b]);
      const ba = fundirMonitoramento([b, a]);
      if (chave(ab) !== chave(ba)) e.push(`fundirMonitoramento não é comutativa para o par ${i}/${j}.`);
      const so = fundirMonitoramento([a])!;
      for (const id of so.invalidam) {
        if (!ab!.invalidam.includes(id)) e.push(`fundirMonitoramento AFROUXOU: "${id}" era invalidado sozinho e sumiu ao somar outra classe.`);
      }
      for (const id of ab!.substituem) {
        if (ab!.invalidam.includes(id)) e.push(`fundirMonitoramento devolveu como substituto "${id}", que outra classe invalidou.`);
      }
      for (const id of ab!.reforcam ?? []) {
        if (ab!.invalidam.includes(id)) e.push(`fundirMonitoramento reforçou "${id}", que outra classe invalidou.`);
      }
      for (let k = 0; k < efeitos.length; k++) {
        if (k === i || k === j) continue;
        const c = efeitos[k];
        const esq = fundirMonitoramento([fundirMonitoramento([a, b])!, c]);
        const dir = fundirMonitoramento([a, fundirMonitoramento([b, c])!]);
        if (chave(esq) !== chave(dir)) e.push(`fundirMonitoramento não é associativa para ${i}/${j}/${k}.`);
      }
    }
  }
  return e;
}

function validarGlobal(catalogo: FarmacoCatalogoItem[]): string[] {
  const e: string[] = [];

  // 10. catálogo vazio
  if (catalogo.length === 0) {
    e.push("catálogo vazio: sem classe, todas as travas acima passariam por vazio e a proteção sumiria inteira.");
    return e;
  }

  // ids únicos
  const vistosClasse = new Set<string>();
  const vistosConseq = new Set<string>();
  for (const item of catalogo) {
    if (vistosClasse.has(item.classe)) e.push(`classe duplicada no catálogo: "${item.classe}".`);
    vistosClasse.add(item.classe);
    for (const c of item.consequencias) {
      if (vistosConseq.has(c.id)) e.push(`id de consequência duplicado: "${c.id}".`);
      vistosConseq.add(c.id);
    }
  }

  // 3. nenhum princípio ativo órfão na whitelist
  const usados = new Set(catalogo.flatMap((i) => i.exemplos));
  for (const p of PRINCIPIOS_ATIVOS_PERMITIDOS) {
    if (!usados.has(p)) e.push(`princípio ativo órfão na whitelist: "${p}" não é citado por nenhuma classe. Lista fechada não guarda item morto.`);
  }

  // 4. as frases canônicas devolvem mesmo a conduta
  for (const [k, frase] of Object.entries(DEVOLUCOES)) {
    if (!frase.endsWith(DEVOLUCAO_FINAL)) {
      e.push(`DEVOLUCOES.${k} não termina na sentença canônica de devolução da conduta.`);
    }
  }

  // 5. p-fc precisa citar as referências que sustentam a prosa sobre betabloqueador
  const pfc = monitoringParameters.find((p) => p.id === "p-fc");
  for (const id of REFS_BETABLOQ) {
    if (!pfc?.refIds?.includes(id)) {
      e.push(`p-fc não cita "${id}": a prosa do parâmetro afirma que a FC é pouco confiável com betabloqueador e precisa da referência que sustenta isso.`);
    }
  }

  // 7. monotonicidade da fusão sobre os efeitos reais do catálogo
  const efeitos = catalogo.flatMap((i) =>
    i.consequencias.map((c) => c.monitoramento).filter((m): m is EfeitoMonitoramento => Boolean(m)),
  );
  e.push(...validarFusao(efeitos));

  return e;
}

/* ------------------------------ Autoverificação ----------------------------- */

const conseqOk = (over: Partial<ConsequenciaTreino> = {}): ConsequenciaTreino => ({
  id: "sintetica-ok",
  tipo: "monitoramento",
  descricao: "A intensidade passa a ser guiada pela percepção de esforço.",
  monitoramento: {
    invalidam: ["p-fc"],
    substituem: ["p-rpe"],
    motivo: "A leitura da frequência cardíaca deixa de acompanhar a intensidade neste contexto.",
    refId: ["mitchell-betabloq-2019"],
  },
  tetoEsforco: null,
  passoCarga: null,
  aprovacao: "aprovada",
  confianca: "moderada",
  refId: ["mitchell-betabloq-2019"],
  ano: 2026,
  versao: 1,
  ...over,
});

const itemOk = (over: Partial<FarmacoCatalogoItem> = {}): FarmacoCatalogoItem => ({
  classe: "betabloqueador",
  grupo: "cardiovascular",
  titulo: "Classe sintética",
  descricao: "Com a classe em uso, a leitura da intensidade muda.",
  exemplos: ["metoprolol"],
  efeitos: ["A percepção de esforço passa a guiar a intensidade"],
  naoAfirmar: ["qualquer percentual de mudança na frequência cardíaca"],
  devolucao: DEVOLUCOES.conduta,
  gruposRelevantes: ["hipertensao-estagio-1"],
  consequencias: [conseqOk()],
  ...over,
});

interface CasoNegativo {
  rotulo: string;
  item: FarmacoCatalogoItem;
}

const CASOS_NEGATIVOS: CasoNegativo[] = [
  {
    rotulo: "unidade de medida no texto",
    item: itemOk({ descricao: "Ajuste a leitura quando o aluno usa 50 mg por manhã." }),
  },
  {
    rotulo: "apresentação de medicação no texto",
    item: itemOk({ efeitos: ["Confira a dose antes da sessão"] }),
  },
  {
    rotulo: "esquema de uso no texto",
    item: itemOk({ descricao: "Classe usada 2x ao dia pelo aluno." }),
  },
  {
    rotulo: "imperativo sobre medicação",
    item: itemOk({ efeitos: ["Suspenda a medicação antes de treinar"] }),
  },
  {
    rotulo: "causal fechado com o fármaco como sujeito",
    item: itemOk({ descricao: "A estatina provoca dor muscular no aluno." }),
  },
  {
    rotulo: "travessão no texto",
    item: itemOk({ titulo: "Classe sintética — betabloqueio" }),
  },
  {
    rotulo: "princípio ativo fora da whitelist",
    item: itemOk({ exemplos: ["timolol"] }),
  },
  { rotulo: "devolução fora das frases canônicas", item: itemOk({ devolucao: "Converse com o médico." }) },
  { rotulo: "naoAfirmar vazio", item: itemOk({ naoAfirmar: [] }) },
  { rotulo: "refId inexistente", item: itemOk({ consequencias: [conseqOk({ refId: ["estudo-que-nao-existe"] })] }) },
  {
    rotulo: "aprovada sem referência",
    item: itemOk({ consequencias: [conseqOk({ refId: [], aprovacao: "aprovada" })] }),
  },
  {
    rotulo: "aprovada com confiança fraca",
    item: itemOk({ consequencias: [conseqOk({ confianca: "fraca" })] }),
  },
  { rotulo: "versao inválida", item: itemOk({ consequencias: [conseqOk({ versao: 0 })] }) },
  {
    rotulo: "invalida sem oferecer substituto",
    item: itemOk({
      consequencias: [
        conseqOk({
          monitoramento: { invalidam: ["p-fc"], substituem: [], motivo: "sem substituto", refId: [] },
        }),
      ],
    }),
  },
  {
    rotulo: "mesmo parâmetro invalidado e substituto",
    item: itemOk({
      consequencias: [
        conseqOk({
          monitoramento: { invalidam: ["p-fc"], substituem: ["p-fc"], motivo: "contraditório", refId: [] },
        }),
      ],
    }),
  },
  {
    rotulo: "parâmetro inexistente",
    item: itemOk({
      consequencias: [
        conseqOk({
          monitoramento: {
            invalidam: ["p-inventado" as ParamMonitorId],
            substituem: ["p-rpe"],
            motivo: "id inventado",
            refId: [],
          },
        }),
      ],
    }),
  },
  {
    rotulo: "pendente cravando teto de esforço",
    item: itemOk({
      consequencias: [conseqOk({ aprovacao: "pendente", confianca: "fraca", tetoEsforco: 6 })],
    }),
  },
  {
    rotulo: "pendente invalidando parâmetro",
    item: itemOk({ consequencias: [conseqOk({ aprovacao: "pendente", confianca: "fraca" })] }),
  },
  {
    rotulo: "passo de carga que AFROUXA",
    item: itemOk({ consequencias: [conseqOk({ passoCarga: 1.4 })] }),
  },
  {
    rotulo: "expectativa de adaptação fora da teoria",
    item: itemOk({
      consequencias: [
        conseqOk({ tipo: "expectativa-adaptacao", monitoramento: undefined, somenteTeoria: false }),
      ],
    }),
  },
  {
    rotulo: "id de classe colidindo com grupo clínico",
    item: itemOk({ classe: "diabetes-tipo-2" as FarmacoClasseId }),
  },
  {
    rotulo: "grupo relevante inexistente",
    item: itemOk({ gruposRelevantes: ["hipertensao-estagio-9"] }),
  },
];

function autoverificar(): string[] {
  const problemas: string[] = [];

  const errosDoBom = validarItem(itemOk());
  if (errosDoBom.length) {
    problemas.push(`o item sintético VÁLIDO deveria passar, mas reprovou: ${errosDoBom.join(" | ")}`);
  }

  for (const caso of CASOS_NEGATIVOS) {
    if (validarItem(caso.item).length === 0) {
      problemas.push(`o caso "${caso.rotulo}" deveria REPROVAR, mas passou.`);
    }
  }

  if (validarGlobal([]).length === 0) problemas.push("catálogo vazio deveria reprovar, mas passou.");

  /* Fusão de monitoramento: as propriedades que a onda F3 vai depender. */
  const bb: EfeitoMonitoramento = {
    invalidam: ["p-fc"],
    substituem: ["p-rpe", "p-fala"],
    motivo: "A frequência cardíaca deixa de acompanhar a intensidade.",
    refId: ["mitchell-betabloq-2019"],
  };
  const hipotetico: EfeitoMonitoramento = {
    invalidam: ["p-rpe"],
    substituem: ["p-fc", "p-dispneia"],
    reforcam: ["p-fala"],
    motivo: "Cenário sintético de teste do verificador.",
    refId: [],
  };
  const fundido = fundirMonitoramento([bb, hipotetico])!;
  if (!fundido.invalidam.includes("p-fc") || !fundido.invalidam.includes("p-rpe")) {
    problemas.push("a fusão deveria invalidar a UNIÃO dos parâmetros das duas classes.");
  }
  if (fundido.substituem.includes("p-fc") || fundido.substituem.includes("p-rpe")) {
    problemas.push("a fusão devolveu como substituto um parâmetro que a outra classe invalidou.");
  }
  if (!fundido.substituem.includes("p-fala") || !fundido.substituem.includes("p-dispneia")) {
    problemas.push("a fusão perdeu um substituto que nenhuma classe invalidou.");
  }
  if (fundido.reforcam?.includes("p-rpe")) {
    problemas.push("a fusão reforçou um parâmetro invalidado.");
  }
  if (fundirMonitoramento([]) !== undefined) problemas.push("a fusão de lista vazia deveria ser undefined.");
  problemas.push(...validarFusao([bb, hipotetico]));

  return problemas;
}

/* ------- 11. O checklist montado: item novo só pode APERTAR o gate do dia ------- */

const PREFIXO = "farmaco:";
/** Ações que um gate de fármaco não pode dar enquanto nenhuma classe declarar passo de carga. */
const MEXE_NA_CARGA = /\b(reduz(a|ir)|diminu(a|ir)|baix(e|ar))\b[^.]{0,40}\b(carga|volume|intensidade|s[ée]ries|repeti[cç][õo]es)\b/i;

/**
 * O checklist do dia é o gate de segurança de MAIOR consequência do produto: é o que decide se
 * a sessão acontece. Acrescentar item por medicação só é seguro se três coisas valerem sempre:
 * o aluno sem medicação não vê diferença nenhuma, o item novo não repete uma pergunta que o
 * grupo já faz, e o item novo nunca pode tornar um resultado mais permissivo.
 */
function validarChecklist(): string[] {
  const e: string[] = [];
  const itens = ITENS_SEMAFORO_POR_FARMACO.flatMap((x) => x.itens);

  // 11.1 prefixo obrigatório e id único: é o prefixo que dá rastreabilidade dentro de
  // Liberacao.respostas sem coluna nova, e que impede um item de medicação de se passar por
  // item de grupo.
  const vistos = new Set<string>();
  for (const { classe, itens: doClasse } of ITENS_SEMAFORO_POR_FARMACO) {
    for (const item of doClasse) {
      if (!item.id.startsWith(`${PREFIXO}${classe}:`)) {
        e.push(`checklist: item "${item.id}" não tem o prefixo obrigatório "${PREFIXO}${classe}:".`);
      }
      if (vistos.has(item.id)) e.push(`checklist: id de item repetido "${item.id}".`);
      vistos.add(item.id);
      if (!item.opcoes.some((o) => o.cor === "vermelho")) {
        e.push(`checklist: item "${item.id}" não tem opção vermelha; um gate que nunca barra não é gate.`);
      }
      for (const o of item.opcoes) {
        if (o.cor !== "verde" && !o.acao) e.push(`checklist: item "${item.id}" pinta ${o.cor} sem dizer o que fazer.`);
        if (o.acao && MEXE_NA_CARGA.test(o.acao)) {
          e.push(
            `checklist: item "${item.id}" manda mexer na carga ("${o.acao}"), mas nenhuma classe declara passo de carga nesta versão.`,
          );
        }
      }
    }
  }

  // 11.2 nenhum id de item de fármaco colide com id de item de grupo (colisão silenciosa
  // sobrescreveria a resposta de um pelo outro dentro de respostas).
  const idsDeGrupo = new Set(semaforos.flatMap((s) => s.itens.map((i) => i.id)));
  for (const item of itens) {
    if (idsDeGrupo.has(item.id)) e.push(`checklist: id "${item.id}" colide com um item de checklist de grupo.`);
  }

  // 11.3 aluno SEM medicação declarada não vê diferença nenhuma: mesma instância do checklist.
  for (const base of semaforos) {
    if (montarChecklist(base.grupoSlug) !== base || montarChecklist(base.grupoSlug, []) !== base) {
      e.push(`checklist: "${base.grupoSlug}" sem fármaco deveria devolver o MESMO checklist de antes.`);
    }
  }

  // 11.4 o mapa de cobertura aponta para itens que EXISTEM (senão o dedup nunca dispara e
  // ninguém percebe), e a pergunta que o grupo já faz não é feita de novo.
  const idsDeItemDeGrupo = new Set(semaforos.flatMap((s) => s.itens.map((i) => i.id)));
  const sufixosDeGate = new Set(itens.map((i) => i.id.split(":").slice(2).join(":")));
  for (const [gate, cobrem] of Object.entries(GATE_JA_COBERTO_POR)) {
    if (!sufixosDeGate.has(gate)) e.push(`checklist: o mapa de cobertura cita o gate inexistente "${gate}".`);
    for (const id of cobrem) {
      if (!idsDeItemDeGrupo.has(id)) e.push(`checklist: o gate "${gate}" diz ser coberto pelo item inexistente "${id}".`);
    }
  }

  const insulina = [criarFarmaco("insulina-secretagogo")];
  const doDiabetes = montarChecklist("diabetes-tipo-2", insulina);
  if (doDiabetes !== getSemaforoBase("diabetes-tipo-2")) {
    e.push(
      "checklist: diabetes com insulina ganhou item, mas o checklist do grupo já pergunta hipoglicemia e alimentação. Perguntar duas vezes ensina a passar batido.",
    );
  }

  // 11.5 o ESCOPO de fato muda: o MESMO aluno, cadastrado por obesidade, ganha o gate glicêmico.
  const daObesidade = montarChecklist("obesidade-grau-1", insulina);
  const baseObesidade = getSemaforoBase("obesidade-grau-1");
  const ganhou = (daObesidade?.itens.length ?? 0) - (baseObesidade?.itens.length ?? 0);
  if (ganhou !== 1) {
    e.push(`checklist: obesidade com insulina deveria ganhar exatamente 1 gate glicêmico, ganhou ${ganhou}.`);
  }

  // 11.6 item novo só APERTA: responder tudo do grupo e deixar o item da classe em branco NUNCA
  // pode liberar (o avaliarSemaforo já falha fechado, e é isso que se prova aqui), e a resposta
  // vermelha do item novo pinta vermelho.
  if (daObesidade) {
    const soDoGrupo: Record<string, string> = {};
    for (const item of getSemaforoBase("obesidade-grau-1")?.itens ?? []) {
      const verde = item.opcoes.find((o) => o.cor === "verde");
      if (verde) soDoGrupo[item.id] = verde.valor;
    }
    if (avaliarSemaforo(daObesidade, soDoGrupo).cor === "verde") {
      e.push("checklist: com o item de medicação em branco, o resultado liberou. O gate tem que falhar fechado.");
    }
    const tudo = { ...soDoGrupo };
    for (const item of daObesidade.itens) {
      if (tudo[item.id]) continue;
      const vermelha = item.opcoes.find((o) => o.cor === "vermelho");
      if (vermelha) tudo[item.id] = vermelha.valor;
    }
    if (avaliarSemaforo(daObesidade, tudo).cor !== "vermelho") {
      e.push("checklist: a resposta vermelha do item de medicação não pintou vermelho.");
    }
  }

  return e;
}

/** O checklist do grupo antes de qualquer fármaco (o de verdade, sem cair no geral). */
function getSemaforoBase(slug: string) {
  return semaforos.find((s) => s.grupoSlug === slug);
}

/* --------------------------------- Execução --------------------------------- */

const falhaAuto = autoverificar();
if (falhaAuto.length) {
  console.error("\n[check:farmacos] LÓGICA DO VERIFICADOR QUEBRADA (a autoverificação falhou):\n");
  for (const p of falhaAuto) console.error(`  - ${p}`);
  console.error("\n  Um verificador que não sabe reprovar não protege nada. Corrija o checker.\n");
  process.exit(1);
}

const erros: string[] = [...validarGlobal(CATALOGO_FARMACOS)];
for (const item of CATALOGO_FARMACOS) erros.push(...validarItem(item));
erros.push(...validarChecklist());

if (erros.length) {
  console.error(`\n[check:farmacos] ${erros.length} problema(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

const consequencias = CATALOGO_FARMACOS.flatMap((i) => i.consequencias);
const aprovadas = consequencias.filter((c) => c.aprovacao === "aprovada").length;
const agem = CATALOGO_FARMACOS.filter((i) => i.consequencias.some((c) => c.aprovacao === "aprovada")).length;

console.log(
  `\n[check:farmacos] autoverificação OK: o item válido passa e os ${CASOS_NEGATIVOS.length} casos fora de escopo reprovam.`,
);
console.log(
  `[check:farmacos] checklist do dia OK: ${ITENS_SEMAFORO_POR_FARMACO.flatMap((x) => x.itens).length} gates de medicação, ` +
    `aluno sem medicação recebe o checklist idêntico e o item novo só aperta.`,
);
console.log(
  `[check:farmacos] ok: ${CATALOGO_FARMACOS.length} classes (${agem} agem, ${CATALOGO_FARMACOS.length - agem} declaradas), ` +
    `${consequencias.length} consequências (${aprovadas} aprovadas, ${consequencias.length - aprovadas} pendentes), ` +
    `todas com referência real e dentro do escopo.\n`,
);
