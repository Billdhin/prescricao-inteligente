/**
 * Descrições curtas das opções do fluxo Prescrever (e do cadastro de aluno).
 * Pedido do Filipe: toda opção clicável precisa explicar o que significa, com
 * exemplos práticos ("Mobilidade limitada" sozinho não diz nada).
 * Mapa plano: a chave é o rótulo exato da opção como aparece na UI.
 */
export const DESCRICAO_OPCAO: Record<string, string> = {
  // Objetivos
  Emagrecimento:
    "Reduzir gordura corporal: prioriza gasto energético com grandes grupos musculares e base aeróbica.",
  Hipertrofia: "Aumentar massa muscular: volume e tensão progressiva no músculo-alvo.",
  Força: "Elevar a força máxima: cargas mais altas, menos repetições e técnica sólida.",
  "Resistência muscular": "Sustentar o esforço por mais tempo: mais repetições com carga leve a moderada.",
  "Reabilitação/retorno": "Retomar após lesão ou pausa longa: baixo impacto e progressão conservadora.",
  "Aprendizado técnico": "Dominar o padrão de movimento antes de progredir carga.",

  // Prioridades (Emagrecimento)
  "Condicionamento cardiorrespiratório": "Foco no fôlego: caminhada, bike e elíptico como base da semana.",
  "Força geral (corpo todo)": "Foco em músculo: multiarticulares que gastam mais energia por série.",
  "Cardio + força (misto)": "Combina os dois; em geral é a opção mais sustentável para aderência.",

  // Grupos musculares
  "Corpo todo": "Padrões multiarticulares que envolvem várias regiões de uma vez.",
  "Membros inferiores": "Quadríceps, posteriores de coxa, glúteos e panturrilhas.",
  Peitorais: "Peitoral maior e sinergistas de empurrar (deltoide anterior, tríceps).",
  Costas: "Dorsais, romboides e trapézio: padrões de puxar.",
  "Core (tronco)": "Abdômen, oblíquos e estabilizadores profundos da coluna.",
  Ombros: "Deltoides e estabilizadores da escápula.",
  Braços: "Bíceps, tríceps e antebraços.",

  // Níveis
  Iniciante: "Menos de 6 meses de treino consistente, ou retorno após pausa longa: técnica antes de carga.",
  Intermediário: "De 6 meses a 2 anos de treino regular; domina os padrões básicos com carga.",
  Avançado: "Mais de 2 anos de treino estruturado; tolera variações complexas e cargas altas.",

  // Restrições
  Nenhuma: "Sem dor ou limitação relevante no momento.",
  "Dor lombar":
    "Dor ou sensibilidade na região lombar: o motor evita alta demanda de coluna (ex.: flexionar o tronco com carga).",
  "Dor no joelho":
    "Dor ao agachar, subir escada ou correr: o motor reduz carga e amplitude exigidas do joelho.",
  "Ombro sensível":
    "Dor ao elevar o braço ou empurrar acima da cabeça: o motor evita alta demanda de ombro.",
  "Mobilidade limitada":
    "Dificuldade de alcançar amplitudes (agachar fundo, elevar os braços, alcançar os pés): prioriza exercícios guiados e de amplitude ajustável.",

  // Equipamentos
  Máquina: "Aparelhos guiados de musculação (leg press, cadeira extensora, mesa flexora).",
  Barra: "Barra livre com anilhas (agachamento, supino, levantamento terra).",
  Halter: "Halteres e pesos livres de mão.",
  Polia: "Cabo com polia ajustável (puxada, remada, tríceps na polia).",
  "Peso corporal": "Sem equipamento: usa o próprio corpo (prancha, ponte, sentar e levantar).",
  Elástico: "Faixas elásticas ou mini bands.",
  Esteira: "Esteira para caminhada ou corrida.",
  "Bicicleta ergométrica": "Bike estacionária, vertical ou horizontal.",
  Elíptico: "Aparelho elíptico, com baixo impacto articular.",
  Piscina: "Acesso a piscina para exercícios aquáticos.",
};

/** Descrição de uma opção do wizard (ou undefined se não mapeada). */
export function descricaoOpcao(rotulo: string): string | undefined {
  return DESCRICAO_OPCAO[rotulo];
}
