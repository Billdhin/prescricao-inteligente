import type { Track } from "./types";

export const tracks: Track[] = [
  {
    id: "t1",
    slug: "fundamentos-da-prescricao",
    nome: "Fundamentos da prescrição",
    descricao: "Como decidir e justificar antes de montar qualquer treino.",
    nivel: "Iniciante",
    concluidas: 5,
    lessons: [
      { id: "l1", titulo: "O que é decidir na prescrição", tipo: "conceito", duracao: "4 min" },
      { id: "l2", titulo: "Objetivo orienta a escolha", tipo: "conceito", duracao: "5 min" },
      { id: "l3", titulo: "Ler a execução: Leg press 45°", tipo: "lab", ref: "leg-press-45", duracao: "6 min" },
      { id: "l4", titulo: "Nível técnico e progressão", tipo: "conceito", duracao: "5 min" },
      { id: "l5", titulo: "Restrições e cautela", tipo: "conceito", duracao: "5 min" },
      { id: "l6", titulo: "Caso: iniciante com dor lombar", tipo: "caso", ref: "caso-lombar-iniciante", duracao: "7 min" },
      { id: "l7", titulo: "Equipamento disponível na decisão", tipo: "conceito", duracao: "4 min" },
      { id: "l8", titulo: "Fechando o raciocínio", tipo: "conceito", duracao: "5 min" },
    ],
  },
  {
    id: "t2",
    slug: "membros-inferiores-em-profundidade",
    nome: "Membros inferiores em profundidade",
    descricao: "Do leg press ao agachamento livre: quando escolher cada um.",
    nivel: "Intermediário",
    concluidas: 2,
    lessons: [
      { id: "l1", titulo: "Mapa dos padrões de perna", tipo: "conceito", duracao: "5 min" },
      { id: "l2", titulo: "Análise: Leg press 45°", tipo: "lab", ref: "leg-press-45", duracao: "6 min" },
      { id: "l3", titulo: "Análise: Agachamento livre", tipo: "lab", ref: "agachamento-livre", duracao: "7 min" },
      { id: "l4", titulo: "Dobradiça de quadril: Stiff", tipo: "lab", ref: "levantamento-terra-romeno", duracao: "6 min" },
      { id: "l5", titulo: "Caso: força funcional no idoso", tipo: "caso", ref: "caso-idoso-forca", duracao: "6 min" },
      { id: "l6", titulo: "Quando guiar, quando soltar", tipo: "conceito", duracao: "5 min" },
    ],
  },
  {
    id: "t3",
    slug: "ombro-seguro",
    nome: "Ombro seguro e forte",
    descricao: "Empurrar e puxar respeitando a articulação mais móvel do corpo.",
    nivel: "Intermediário",
    concluidas: 0,
    lessons: [
      { id: "l1", titulo: "Por que o ombro é sensível", tipo: "conceito", duracao: "5 min" },
      { id: "l2", titulo: "Análise: Supino reto com barra", tipo: "lab", ref: "supino-reto-barra", duracao: "6 min" },
      { id: "l3", titulo: "Controle escapular", tipo: "conceito", duracao: "5 min" },
      { id: "l4", titulo: "Análise: Desenvolvimento de ombros", tipo: "lab", ref: "desenvolvimento-ombros", duracao: "6 min" },
      { id: "l5", titulo: "Caso: ombro sensível pedindo peito", tipo: "caso", ref: "caso-ombro-supino", duracao: "7 min" },
    ],
  },
];

export function getTrack(slug: string) {
  return tracks.find((t) => t.slug === slug);
}
