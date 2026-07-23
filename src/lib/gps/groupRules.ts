/**
 * Regras do GPS por grupo/condição: quando um grupo especial está no contexto
 * da prescrição, ele já "traz" as próprias cautelas — restrição musculoesquelética
 * pré-selecionada (quando faz sentido) + cuidados automáticos exibidos na etapa
 * de restrições + penalizações determinísticas no ranqueamento (transparentes
 * no breakdown da justificativa). Conteúdo educacional e prudente — não é
 * conduta clínica.
 */

import type { GroupRuleInput } from "./engine";
import type { RestricaoTag } from "./restricoes";

export interface GroupGpsRule extends GroupRuleInput {
  slug: string;
  /** pré-seleciona a etapa "Alguma restrição?" (o usuário pode trocar) */
  restricaoSugerida?: RestricaoTag;
  /** cuidados exibidos como "já considerados pelo grupo" */
  cuidados: string[];
  /** ids de referencias.ts que fundamentam as regras deste grupo (bibliografia do Prontuário) */
  refs?: string[];
}

export const groupGpsRules: Record<string, GroupGpsRule> = {
  "obesidade-grave": {
    slug: "obesidade-grave",
    nome: "Obesidade grave / mórbida",
    cuidados: [
      "Impacto e volume altos tendem a sobrecarregar joelhos e lombar: a base da semana são modalidades de baixo impacto; a musculação entra como complemento guiado.",
      "Dispneia e baixa tolerância inicial: sessões curtas, esforço leve, guiado por PSE e teste da fala.",
      "Nas primeiras semanas, a adesão é a principal métrica de sucesso.",
    ],
    penalidades: [
      {
        metrica: "Demanda de joelho",
        limite: 60,
        motivo: "Alta demanda de joelho: em obesidade grave tende a gerar desconforto articular.",
      },
      {
        metrica: "Demanda lombar",
        limite: 60,
        motivo: "Alta demanda lombar: cautela com sobrecarga axial neste perfil.",
      },
    ],
    complexidadeMax: 55,
    refs: ["donnelly-2009", "acsm-getp11", "oms-2020", "seidell-flegal-1997"],
  },

  hipertensao: {
    slug: "hipertensao",
    nome: "Hipertensão arterial",
    cuidados: [
      "Evitar apneia (manobra de Valsalva) e isometrias pesadas: respiração contínua em todas as séries.",
      "Preferir cargas leves a moderadas com progressão gradual; evitar esforços máximos.",
      "Alguns anti-hipertensivos alteram a resposta da FC: PSE e teste da fala tendem a ser guias mais confiáveis.",
    ],
    penalidades: [
      {
        metrica: "Demanda lombar",
        limite: 65,
        motivo: "Carga axial elevada favorece apneia/Valsalva: cautela em hipertensão.",
      },
      {
        metrica: "Complexidade técnica",
        limite: 75,
        motivo: "Exercícios de alta exigência técnica tendem a elevar a resposta pressórica sob carga.",
      },
    ],
    refs: ["sbc-2020", "pescatello-2004", "acsm-getp11"],
  },

  "diabetes-tipo-2": {
    slug: "diabetes-tipo-2",
    nome: "Diabetes tipo 2",
    cuidados: [
      "Atenção a sinais compatíveis com hipoglicemia (tontura, sudorese fria, confusão): pausar e reavaliar.",
      "Cuidado com os pés: calçado adequado e inspeção regular, especialmente com volume de caminhada.",
      "Consistência semanal tende a valer mais que picos de intensidade.",
    ],
    penalidades: [],
    refs: ["colberg-2016", "sbd-2023"],
  },

  "idoso-destreinado": {
    slug: "idoso-destreinado",
    nome: "Idoso destreinado",
    cuidados: [
      "Equilíbrio e segurança primeiro: apoio disponível e ambiente livre de obstáculos.",
      "Técnica antes de carga; progressões pequenas e frequentes.",
    ],
    penalidades: [
      {
        metrica: "Requisito de mobilidade",
        limite: 60,
        motivo: "Alto requisito de mobilidade: adapte a amplitude para este perfil.",
      },
    ],
    complexidadeMax: 50,
    refs: ["chodzko-2009", "fragala-2019"],
  },

  "dor-lombar-inespecifica": {
    slug: "dor-lombar-inespecifica",
    nome: "Dor lombar inespecífica",
    restricaoSugerida: "lombar_sensivel",
    cuidados: [
      "A restrição “Dor lombar” foi pré-selecionada: exercícios com alta demanda lombar são penalizados no ranking.",
      "Dor leve que não piora ao longo da sessão costuma ser tolerável; dor crescente pede ajuste de amplitude/carga.",
    ],
    // a penalização vem da restrição pré-selecionada (evita punir duas vezes)
    penalidades: [],
    refs: ["nice-ng59"],
  },

  "osteoartrite-joelho": {
    slug: "osteoartrite-joelho",
    nome: "Osteoartrite de joelho",
    restricaoSugerida: "joelho_dor",
    cuidados: [
      "A restrição “Dor no joelho” foi pré-selecionada: alta demanda de joelho é penalizada no ranking.",
      "Amplitude confortável; progrida guiado pela resposta de dor nas 24–48h seguintes.",
    ],
    penalidades: [],
    refs: ["oarsi-2019", "acr-2019"],
  },

  /* --------- Condições adicionais (cuidados + adaptações do motor) --------- */

  "iniciante-sedentario": {
    slug: "iniciante-sedentario",
    nome: "Iniciante / sedentário",
    cuidados: [
      "Poucos exercícios simples e esforço leve a moderado: a adesão e a técnica vêm antes da carga.",
      "Progrida uma variável por vez; a dor tardia inicial é esperada, a lesão pela pressa não.",
    ],
    penalidades: [
      { metrica: "Complexidade técnica", limite: 65, motivo: "Exercícios muito técnicos cedo demais atrapalham a técnica e a adesão do iniciante." },
    ],
    complexidadeMax: 55,
    refs: ["acsm-getp11", "oms-2020"],
  },
  "retorno-inatividade": {
    slug: "retorno-inatividade",
    nome: "Retorno após inatividade",
    cuidados: [
      "Recomece com cerca de metade do volume e da carga anteriores e progrida ao longo de poucas semanas.",
      "Respeite a recuperação: a dor muscular tardia inicial é esperada.",
    ],
    penalidades: [],
    complexidadeMax: 60,
    refs: ["acsm-getp11", "oms-2020"],
  },
  "pre-diabetes": {
    slug: "pre-diabetes",
    nome: "Pré-diabetes",
    cuidados: [
      "A regularidade semanal (aeróbio quase diário + força 2 a 3x) melhora a sensibilidade à insulina mais que picos de intensidade.",
      "Atenção a sinais compatíveis com hipoglicemia (tontura, sudorese fria, confusão): pausar e reavaliar.",
    ],
    penalidades: [],
    refs: ["colberg-2016", "acsm-getp11"],
  },
  "sindrome-metabolica": {
    slug: "sindrome-metabolica",
    nome: "Síndrome metabólica",
    cuidados: [
      "Vários fatores de risco somados pedem respiração contínua (evitar apneia), progressão gradual e monitoramento.",
      "Combine aeróbio moderado frequente com força; atenção à pressão e a sinais de hipoglicemia.",
    ],
    penalidades: [
      { metrica: "Demanda lombar", limite: 65, motivo: "Carga axial elevada favorece apneia/Valsalva: cautela no perfil cardiometabólico." },
    ],
    refs: ["colberg-2016", "pescatello-2004", "acsm-getp11"],
  },
  dislipidemia: {
    slug: "dislipidemia",
    nome: "Dislipidemia",
    cuidados: [
      "O efeito no perfil lipídico vem do volume aeróbio regular ao longo das semanas, não de poucas sessões.",
      "Some força para composição e metabolismo; a conduta medicamentosa é do profissional de saúde.",
    ],
    penalidades: [],
    refs: ["acsm-getp11", "oms-2020"],
  },
  "esteatose-hepatica": {
    slug: "esteatose-hepatica",
    nome: "Esteatose hepática metabólica",
    cuidados: [
      "Aeróbio regular + força reduzem a gordura hepática junto da perda de peso gradual (encaminhar nutrição).",
      "Perda de peso agressiva não é o alvo do treino; priorize a consistência.",
    ],
    penalidades: [],
    refs: ["donnelly-2009", "acsm-getp11"],
  },
  sarcopenia: {
    slug: "sarcopenia",
    nome: "Sarcopenia / baixa força muscular",
    cuidados: [
      "A força é o principal estímulo: máquinas guiadas 2 a 3x/semana com progressão pequena e frequente.",
      "Técnica antes de carga; recuperação pode ser mais lenta. Encaminhe para avaliação nutricional (proteína).",
    ],
    penalidades: [
      { metrica: "Requisito de mobilidade", limite: 60, motivo: "Alto requisito de mobilidade: adapte a amplitude para o perfil de baixa força." },
    ],
    complexidadeMax: 55,
    refs: ["fragala-2019", "chodzko-2009"],
  },
  osteoporose: {
    slug: "osteoporose",
    nome: "Osteopenia / osteoporose",
    cuidados: [
      "Força e impacto controlado estimulam o osso; evite flexão brusca da coluna e movimentos de alto risco de queda.",
      "Priorize equilíbrio e apoio; liberação médica recomendada antes de progredir o impacto.",
    ],
    penalidades: [
      { metrica: "Demanda lombar", limite: 60, motivo: "Alta demanda lombar sugere flexão/carga axial da coluna: cautela na osteoporose." },
    ],
    complexidadeMax: 55,
    refs: ["chodzko-2009", "acsm-getp11"],
  },
  gestante: {
    slug: "gestante",
    nome: "Gestante sem contraindicação",
    cuidados: [
      "Com liberação obstétrica: intensidade moderada pelo teste da fala, evitar esforço máximo, superaquecimento e decúbito dorsal prolongado após o 1º trimestre.",
      "Reduza atividades com risco de queda; sinais de alerta obstétricos pedem interrupção e encaminhamento imediato.",
    ],
    penalidades: [
      { metrica: "Complexidade técnica", limite: 65, motivo: "Exercícios de alta exigência técnica/equilíbrio aumentam o risco de queda na gestação." },
    ],
    complexidadeMax: 55,
    refs: ["acsm-getp11"],
  },
  "pos-parto": {
    slug: "pos-parto",
    nome: "Pós-parto com liberação",
    cuidados: [
      "Com liberação: retomada gradual com atenção ao assoalho pélvico e ao core; sinais de perdas ou peso pedem encaminhamento.",
      "Ajuste à recuperação e ao sono fragmentado; evite carga alta cedo demais.",
    ],
    penalidades: [],
    complexidadeMax: 60,
    refs: ["acsm-getp11"],
  },
  climaterio: {
    slug: "climaterio",
    nome: "Climatério / menopausa",
    cuidados: [
      "A força 2 a 3x/semana é prioridade (preserva músculo e osso); some aeróbio moderado.",
      "Ajuste ao sono e aos sintomas do dia; atenção ao risco cardiometabólico da transição.",
    ],
    penalidades: [],
    refs: ["chodzko-2009", "acsm-getp11"],
  },
  "apneia-sono": {
    slug: "apneia-sono",
    nome: "Apneia obstrutiva do sono",
    cuidados: [
      "Sonolência e fadiga diurna afetam a segurança: ajuste horário e intensidade ao dia.",
      "Aeróbio + força apoiam a perda de peso, que reduz a gravidade; o tratamento é do profissional de saúde.",
    ],
    penalidades: [],
    refs: ["donnelly-2009", "acsm-getp11"],
  },
  "asma-controlada": {
    slug: "asma-controlada",
    nome: "Asma controlada",
    cuidados: [
      "Aquecimento gradual e ambientes sem ar muito frio ou seco reduzem o broncoespasmo induzido pelo esforço.",
      "Medicação de resgate disponível conforme o médico; sintomas que não cedem com a pausa pedem interrupção.",
    ],
    penalidades: [],
    refs: ["acsm-getp11", "oms-2020"],
  },
  "ansiedade-depressao": {
    slug: "ansiedade-depressao",
    nome: "Ansiedade / sintomas depressivos",
    cuidados: [
      "A constância vale mais que a intensidade: metas pequenas e alcançáveis sustentam a adesão.",
      "O treino apoia o humor, mas não substitui o acompanhamento de saúde do aluno.",
    ],
    penalidades: [],
    refs: ["oms-2020", "acsm-getp11"],
  },
};

export function getGroupRule(slug?: string) {
  return slug ? groupGpsRules[slug] : undefined;
}

/**
 * Combina os cuidados/adaptações de VÁRIAS condições numa regra só. Assim uma
 * prescrição para, por exemplo, idoso + diabetes + osteoporose aplica ao mesmo
 * tempo as cautelas e penalizações das três, em vez de escolher uma categoria.
 * Para a mesma métrica, mantém a penalização mais estrita (menor limite);
 * complexidadeMax = a mais baixa; cuidados e refs sem duplicar.
 */
export function combineRules(slugs: string[]): GroupGpsRule | undefined {
  const rules = slugs.map((s) => groupGpsRules[s]).filter((r): r is GroupGpsRule => Boolean(r));
  if (rules.length === 0) return undefined;
  if (rules.length === 1) return rules[0];

  const cuidados: string[] = [];
  for (const r of rules) for (const c of r.cuidados) if (!cuidados.includes(c)) cuidados.push(c);

  // por métrica, mantém a penalidade de MENOR limite (mais rigorosa)
  const penMap = new Map<string, { metrica: string; limite: number; motivo: string }>();
  for (const r of rules) {
    for (const p of r.penalidades) {
      const cur = penMap.get(p.metrica);
      if (!cur || p.limite < cur.limite) penMap.set(p.metrica, p);
    }
  }

  const maxes = rules.map((r) => r.complexidadeMax).filter((n): n is number => typeof n === "number");
  const refs: string[] = [];
  for (const r of rules) for (const ref of r.refs ?? []) if (!refs.includes(ref)) refs.push(ref);

  return {
    slug: rules.map((r) => r.slug).join("+"),
    nome: rules.map((r) => r.nome).join(" + "),
    cuidados,
    penalidades: [...penMap.values()],
    complexidadeMax: maxes.length ? Math.min(...maxes) : undefined,
    restricaoSugerida: rules.find((r) => r.restricaoSugerida)?.restricaoSugerida,
    refs,
  };
}
