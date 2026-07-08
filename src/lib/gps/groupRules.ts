/**
 * Regras do GPS por grupo/condição: quando um grupo especial está no contexto
 * da prescrição, ele já "traz" as próprias cautelas — restrição musculoesquelética
 * pré-selecionada (quando faz sentido) + cuidados automáticos exibidos na etapa
 * de restrições + penalizações determinísticas no ranqueamento (transparentes
 * no breakdown da justificativa). Conteúdo educacional e prudente — não é
 * conduta clínica.
 */

import type { GpsRestricao, GroupRuleInput } from "./engine";

export interface GroupGpsRule extends GroupRuleInput {
  slug: string;
  /** pré-seleciona a etapa "Alguma restrição?" (o usuário pode trocar) */
  restricaoSugerida?: GpsRestricao;
  /** cuidados exibidos como "já considerados pelo grupo" */
  cuidados: string[];
}

export const groupGpsRules: Record<string, GroupGpsRule> = {
  "obesidade-grave": {
    slug: "obesidade-grave",
    nome: "Obesidade grave / mórbida",
    cuidados: [
      "Impacto e volume altos tendem a sobrecarregar joelhos e lombar — a base da semana são modalidades de baixo impacto; a musculação entra como complemento guiado.",
      "Dispneia e baixa tolerância inicial: sessões curtas, esforço leve, guiado por PSE e teste da fala.",
      "Nas primeiras semanas, a adesão é a principal métrica de sucesso.",
    ],
    penalidades: [
      {
        metrica: "Demanda de joelho",
        limite: 60,
        motivo: "Alta demanda de joelho — em obesidade grave tende a gerar desconforto articular.",
      },
      {
        metrica: "Demanda lombar",
        limite: 60,
        motivo: "Alta demanda lombar — cautela com sobrecarga axial neste perfil.",
      },
    ],
    complexidadeMax: 55,
  },

  hipertensao: {
    slug: "hipertensao",
    nome: "Hipertensão arterial",
    cuidados: [
      "Evitar apneia (manobra de Valsalva) e isometrias pesadas — respiração contínua em todas as séries.",
      "Preferir cargas leves a moderadas com progressão gradual; evitar esforços máximos.",
      "Alguns anti-hipertensivos alteram a resposta da FC — PSE e teste da fala tendem a ser guias mais confiáveis.",
    ],
    penalidades: [
      {
        metrica: "Demanda lombar",
        limite: 65,
        motivo: "Carga axial elevada favorece apneia/Valsalva — cautela em hipertensão.",
      },
      {
        metrica: "Complexidade técnica",
        limite: 75,
        motivo: "Exercícios de alta exigência técnica tendem a elevar a resposta pressórica sob carga.",
      },
    ],
  },

  "diabetes-tipo-2": {
    slug: "diabetes-tipo-2",
    nome: "Diabetes tipo 2",
    cuidados: [
      "Atenção a sinais compatíveis com hipoglicemia (tontura, sudorese fria, confusão) — pausar e reavaliar.",
      "Cuidado com os pés: calçado adequado e inspeção regular, especialmente com volume de caminhada.",
      "Consistência semanal tende a valer mais que picos de intensidade.",
    ],
    penalidades: [],
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
        motivo: "Alto requisito de mobilidade — adapte a amplitude para este perfil.",
      },
    ],
    complexidadeMax: 50,
  },

  "dor-lombar-inespecifica": {
    slug: "dor-lombar-inespecifica",
    nome: "Dor lombar inespecífica",
    restricaoSugerida: "Dor lombar",
    cuidados: [
      "A restrição “Dor lombar” foi pré-selecionada — exercícios com alta demanda lombar são penalizados no ranking.",
      "Dor leve que não piora ao longo da sessão costuma ser tolerável; dor crescente pede ajuste de amplitude/carga.",
    ],
    // a penalização vem da restrição pré-selecionada (evita punir duas vezes)
    penalidades: [],
  },

  "osteoartrite-joelho": {
    slug: "osteoartrite-joelho",
    nome: "Osteoartrite de joelho",
    restricaoSugerida: "Dor no joelho",
    cuidados: [
      "A restrição “Dor no joelho” foi pré-selecionada — alta demanda de joelho é penalizada no ranking.",
      "Amplitude confortável; progrida guiado pela resposta de dor nas 24–48h seguintes.",
    ],
    penalidades: [],
  },
};

export function getGroupRule(slug?: string) {
  return slug ? groupGpsRules[slug] : undefined;
}
