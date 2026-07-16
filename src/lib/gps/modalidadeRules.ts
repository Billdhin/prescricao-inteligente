/**
 * Recomendação de MODALIDADES para compor o plano (a camada acima dos
 * exercícios isolados): com grupo especial usa as modalidades da fase da
 * jornada; no Emagrecimento sem grupo, monta a base da semana pela prioridade
 * física + restrição + nível. Determinístico, com motivo educacional por item.
 */

import { getModalidade, type Modalidade } from "@/data/modalities";
import type { JourneyPhase, SpecialGroup } from "@/data/specialGroups";
import type { GpsAnswers } from "./engine";

export interface ModalidadeRec {
  modalidade: Modalidade;
  motivo: string;
  /** primeira da lista = base da semana */
  principal: boolean;
}

// Motivos no contexto de emagrecimento (linguagem prudente, sem promessa clínica).
const MOTIVO_EMAGRECIMENTO: Record<string, string> = {
  "m-caminhada":
    "Aeróbio acessível e fácil de progredir: bom volume semanal com boa adesão.",
  "m-bike":
    "Baixo impacto articular com intensidade fácil de dosar: permite volume sem dor.",
  "m-eliptico": "Baixo impacto envolvendo o corpo todo: gasto maior que a bicicleta.",
  "m-hidro": "Baixo impacto com boa adesão quando o solo incomoda as articulações.",
  "m-musculacao":
    "Preserva e desenvolve massa magra: sustenta o metabolismo ao longo do processo.",
  "m-combinado": "Une força e aeróbio na semana: eficiência de tempo quando já há base.",
  "m-mobilidade": "Suporte de conforto e amplitude: ajuda a manter a consistência.",
};

const rec = (id: string, principal: boolean, motivo?: string): ModalidadeRec | null => {
  const m = getModalidade(id);
  return m ? { modalidade: m, motivo: motivo ?? MOTIVO_EMAGRECIMENTO[id] ?? m.resumo, principal } : null;
};

export function recommendModalidades({
  answers,
  grupo,
  faseObj,
}: {
  answers: GpsAnswers;
  grupo?: SpecialGroup;
  faseObj?: JourneyPhase;
}): ModalidadeRec[] {
  // 1) Com grupo especial: a fase da jornada manda (ex.: obesidade grave fase 1
  //    começa no baixo impacto — não na musculação).
  if (grupo && faseObj) {
    return faseObj.modalidades
      .map((id, i) => {
        const m = getModalidade(id);
        return m
          ? {
              modalidade: m,
              // sem o rótulo clínico do grupo: este motivo chega ao documento do aluno
              motivo: `Prioritária na fase ${faseObj.numero} do programa. ${m.quandoInicio}`,
              principal: i === 0,
            }
          : null;
      })
      .filter(Boolean)
      .slice(0, 3) as ModalidadeRec[];
  }

  // 2) Sem grupo: só compomos modalidades quando o objetivo é Emagrecimento.
  if (answers.objetivo !== "Emagrecimento") return [];

  const joelho = answers.restricoes.some((r) => r.tag === "joelho_dor");
  const lombar = answers.restricoes.some((r) => r.tag === "lombar_sensivel");
  const iniciante = answers.nivel === "Iniciante";
  // aeróbio de entrada respeitando a restrição articular
  const aerobio = joelho ? "m-bike" : lombar ? "m-caminhada" : "m-caminhada";
  const aerobio2 = joelho ? "m-hidro" : "m-bike";

  let ids: string[];
  switch (answers.prioridade) {
    case "Condicionamento cardiorrespiratório":
      ids = [aerobio, aerobio2, "m-eliptico"];
      break;
    case "Força geral (corpo todo)":
      ids = ["m-musculacao", aerobio, "m-mobilidade"];
      break;
    default: // misto (também quando prioridade não informada)
      ids = iniciante ? [aerobio, "m-musculacao", "m-mobilidade"] : ["m-combinado", aerobio, "m-musculacao"];
  }

  return ids
    .filter((id, i) => ids.indexOf(id) === i)
    .map((id, i) => rec(id, i === 0))
    .filter(Boolean) as ModalidadeRec[];
}
