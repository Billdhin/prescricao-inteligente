/**
 * Faixas etárias para a PRESCRIÇÃO GERAL (sem aluno selecionado). Servem como
 * orientação contextual prudente, não como regra do motor: a idade muda cuidados,
 * ritmo de progressão e ênfases, mas a decisão segue o profissional. Quando há um
 * aluno, a idade dele já é conhecida e este seletor não aparece.
 */

export interface FaixaEtaria {
  id: string;
  label: string;
  faixa: string;
  /** foco/ênfase da faixa */
  foco: string;
  /** orientações prudentes (o que priorizar e observar) */
  orientacoes: string[];
}

export const FAIXAS_ETARIAS: FaixaEtaria[] = [
  {
    id: "crianca-adolescente",
    label: "Criança e adolescente",
    faixa: "até 17 anos",
    foco: "Aprendizado motor, variedade e segurança antes de carga.",
    orientacoes: [
      "Priorizar aprendizado técnico, coordenação e variedade de movimentos.",
      "Cargas conservadoras; evitar treino de força máxima e progressões abruptas.",
      "Supervisão próxima e ênfase no prazer pela prática para sustentar a adesão.",
      "Ajustar volume ao contexto escolar e esportivo; recuperação adequada.",
    ],
  },
  {
    id: "adulto-jovem",
    label: "Adulto jovem",
    faixa: "18 a 39 anos",
    foco: "Maior tolerância a volume e intensidade, conforme o objetivo.",
    orientacoes: [
      "Boa tolerância a volume e intensidade quando a técnica está estável.",
      "Progressão orientada pelo objetivo (força, hipertrofia, condicionamento).",
      "Atenção à recuperação em rotinas de alta demanda de trabalho e estudo.",
    ],
  },
  {
    id: "adulto",
    label: "Adulto",
    faixa: "40 a 59 anos",
    foco: "Progressão gradual com atenção a articulações e recuperação.",
    orientacoes: [
      "Aquecimento e progressão graduais; respeitar o conforto articular.",
      "Manter estímulo de força; incluir mobilidade e trabalho aeróbio de base.",
      "Observar sono, estresse e recuperação, que influenciam a resposta ao treino.",
    ],
  },
  {
    id: "idoso",
    label: "Pessoa idosa",
    faixa: "60 anos ou mais",
    foco: "Força, equilíbrio e autonomia, com progressões pequenas e frequentes.",
    orientacoes: [
      "Priorizar força de membros inferiores, equilíbrio e padrões funcionais.",
      "Técnica antes de carga; progressões pequenas, frequentes e bem toleradas.",
      "Garantir apoio disponível e observar tontura, pressão e medicação.",
      "Considerar o Semáforo de Liberação antes de sessões mais intensas.",
    ],
  },
];

export function getFaixaEtaria(id: string) {
  return FAIXAS_ETARIAS.find((f) => f.id === id);
}
