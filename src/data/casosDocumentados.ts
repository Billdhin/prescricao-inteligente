import type { GpsAnswers } from "@/lib/gps/engine";

/**
 * BIBLIOTECA DE CASOS DOCUMENTADOS — páginas públicas que rodam o MOTOR REAL
 * ao vivo (não são mockups): cada caso é um perfil típico buscado pelo público
 * ("treino para hipertenso", "dor lombar em idoso"...) cujo resultado é gerado
 * pelo mesmo rankExercises + regras de grupo do produto. Prova de mecanismo e
 * porta de entrada de aquisição orgânica — difícil de copiar porque nasce do
 * próprio motor de raciocínio.
 */

export interface CasoDocumentado {
  slug: string;
  titulo: string;
  /** a busca típica que este caso responde */
  buscaTipica: string;
  /** narrativa curta e realista do caso (o aluno que chegou hoje) */
  contexto: string;
  grupoSlug?: string;
  fase?: number;
  answers: GpsAnswers;
  /** o que o profissional precisa decidir aqui (enquadra a leitura) */
  decisao: string;
}

export const casosDocumentados: CasoDocumentado[] = [
  {
    slug: "treino-para-hipertenso",
    titulo: "Hipertenso, 52 anos, começando do zero",
    buscaTipica: "treino para hipertenso",
    contexto:
      "Chegou com encaminhamento: hipertensão controlada com medicação, liberado pelo cardiologista para exercício. Sedentário há 10 anos, quer 'ganhar saúde' e tem medo de passar mal treinando.",
    grupoSlug: "hipertensao",
    fase: 1,
    answers: {
      objetivo: "Resistência muscular",
      grupoMuscular: "Corpo todo",
      nivel: "Iniciante",
      restricao: "Nenhuma",
      equipamentos: ["Máquina", "Peso corporal", "Elástico"],
    },
    decisao:
      "Quais estímulos entram na primeira fase — e o que fica explicitamente de fora por causa da resposta pressórica?",
  },
  {
    slug: "dor-lombar-idoso",
    titulo: "Dor lombar em idoso de 67 anos",
    buscaTipica: "exercício para dor lombar em idoso",
    contexto:
      "Lombalgia inespecífica há 4 meses (avaliada, sem red flags). Anda menos por medo da dor, perdeu força de pernas. A família quer que ele 'faça alguma coisa antes que pare de vez'.",
    grupoSlug: "dor-lombar-inespecifica",
    fase: 1,
    answers: {
      objetivo: "Reabilitação/retorno",
      grupoMuscular: "Core (tronco)",
      nivel: "Iniciante",
      restricao: "Dor lombar",
      equipamentos: ["Peso corporal", "Máquina"],
    },
    decisao:
      "Como treinar SEM provocar a dor — e por que movimento (e não repouso) é o caminho apontado pelas diretrizes?",
  },
  {
    slug: "obesidade-grave-joelho",
    titulo: "Obesidade grave + joelho sensível, 38 anos",
    buscaTipica: "treino para obeso com dor no joelho",
    contexto:
      "IMC 42, cansa ao subir um lance de escada, joelhos reclamam na caminhada. Já desistiu de academia duas vezes porque 'o treino era pra outra pessoa'. A meta real da fase 1 é ele VOLTAR.",
    grupoSlug: "obesidade-grave",
    fase: 1,
    answers: {
      objetivo: "Emagrecimento",
      grupoMuscular: "Corpo todo",
      prioridade: "Condicionamento cardiorrespiratório",
      nivel: "Iniciante",
      restricao: "Dor no joelho",
      equipamentos: ["Máquina", "Piscina", "Peso corporal"],
    },
    decisao:
      "Por que a porta de entrada NÃO é a musculação tradicional — e o que o joelho dele decide sobre a modalidade?",
  },
  {
    slug: "diabetes-tipo-2-iniciante",
    titulo: "Diabetes tipo 2, 45 anos, destreinado",
    buscaTipica: "exercício para diabético tipo 2",
    contexto:
      "Diagnóstico há 2 anos, usa metformina, glicemia razoavelmente controlada. O médico insistiu no exercício. Ele topa, mas trabalha 10h/dia e já avisou: 'se for complicado, eu largo'.",
    grupoSlug: "diabetes-tipo-2",
    fase: 1,
    answers: {
      objetivo: "Emagrecimento",
      grupoMuscular: "Corpo todo",
      prioridade: "Cardio + força (misto)",
      nivel: "Iniciante",
      restricao: "Nenhuma",
      equipamentos: ["Máquina", "Peso corporal", "Elástico"],
    },
    decisao:
      "Como montar a semana MÍNIMA que move a glicemia — e quais sinais de segurança checar antes de cada sessão?",
  },
  {
    slug: "osteoartrite-joelho-60",
    titulo: "Osteoartrite de joelho, 60 anos, ativa",
    buscaTipica: "musculação com artrose no joelho",
    contexto:
      "Caminhava todos os dias até a dor no joelho aumentar. A ortopedista disse para FORTALECER, não parar. Ela chega desconfiada: 'como assim agachar se o joelho é o problema?'",
    grupoSlug: "osteoartrite-joelho",
    fase: 2,
    answers: {
      objetivo: "Força",
      grupoMuscular: "Membros inferiores",
      nivel: "Iniciante",
      restricao: "Dor no joelho",
      equipamentos: ["Máquina", "Peso corporal"],
    },
    decisao:
      "Quais exercícios de força protegem (e quais irritam) um joelho com OA — e como a dor do dia calibra a sessão?",
  },
  {
    slug: "idoso-destreinado-forca",
    titulo: "68 anos, destreinado, perdendo autonomia",
    buscaTipica: "treino de força para idoso iniciante",
    contexto:
      "Levantar da cadeira virou esforço. Nunca pisou numa academia. Os filhos contrataram o personal 'para ele não cair'. Ele acha que exercício de idoso é só alongamento.",
    grupoSlug: "idoso-destreinado",
    fase: 1,
    answers: {
      objetivo: "Reabilitação/retorno",
      grupoMuscular: "Membros inferiores",
      nivel: "Iniciante",
      restricao: "Mobilidade limitada",
      equipamentos: ["Peso corporal", "Máquina", "Elástico"],
    },
    decisao:
      "Por que FORÇA (não alongamento) é a prioridade da autonomia — e como progredir sem assustar quem nunca treinou?",
  },
];

export function getCasoDocumentado(slug: string) {
  return casosDocumentados.find((c) => c.slug === slug);
}
