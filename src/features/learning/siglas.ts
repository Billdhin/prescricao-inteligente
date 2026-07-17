import type { Lesson, LessonBlock } from "./types";

/**
 * Glossário de siglas do Aprender, num lugar só.
 *
 * O feedback do Filipe: "as siglas nem têm as descrições". O texto das aulas usa VO2, FC,
 * EMG, Na⁺/K⁺-ATPase e afins sem nunca dizer o que são, e quem está aprendendo tropeça.
 *
 * A escolha aqui é derivar, não autorar: o dicionário é compartilhado e cada aula mostra
 * SÓ as siglas que de fato aparecem no seu texto. Assim nenhuma aula fica com uma sigla
 * sem descrição, nenhuma mostra uma que não usa, e não há 11 listas para manter em sincronia.
 */

export interface SiglaDef {
  sigla: string;
  significado: string;
  /** como reconhecer a sigla no texto (sensível a caixa: evita casar dentro de palavras) */
  re: RegExp;
}

// Ordem: mais específicas antes das genéricas, para a lista sair legível.
export const SIGLAS: SiglaDef[] = [
  { sigla: "VO₂máx", significado: "consumo máximo de oxigênio; o teto da capacidade aeróbia", re: /VO2máx/ },
  { sigla: "VO₂", significado: "consumo de oxigênio; reflete a demanda metabólica da tarefa", re: /\bVO2\b/ },
  { sigla: "Na⁺/K⁺-ATPase", significado: "bomba de sódio e potássio; gasta ATP para manter os gradientes iônicos", re: /ATPase/ },
  { sigla: "ATP", significado: "trifosfato de adenosina, a moeda de energia da célula", re: /\bATP\b/ },
  { sigla: "GLUT", significado: "transportador que leva glicose para dentro da célula", re: /GLUT/ },
  { sigla: "FC", significado: "frequência cardíaca (batimentos por minuto)", re: /\bFC\b/ },
  { sigla: "PA", significado: "pressão arterial", re: /\bPA\b/ },
  { sigla: "RPE", significado: "percepção de esforço, na escala de Borg", re: /\bRPE\b/ },
  { sigla: "EMG", significado: "eletromiografia; registra a atividade elétrica do músculo", re: /\bEMG\b/ },
  { sigla: "ECG", significado: "eletrocardiograma; registra a atividade elétrica do coração", re: /\bECG\b/ },
  { sigla: "1RM", significado: "uma repetição máxima; a maior carga para uma repetição", re: /\b1RM\b/ },
];

function textoDe(blocks: LessonBlock[]): string {
  // O conteúdo dos blocos é o texto visível; ids e hrefs (minúsculos) não casam com as siglas.
  return blocks.map((b) => JSON.stringify(b.content)).join(" ");
}

/** As siglas que realmente aparecem nesta aula, na ordem do dicionário. */
export function siglasDaLesson(lesson: Lesson): SiglaDef[] {
  const txt = textoDe(lesson.blocks);
  return SIGLAS.filter((s) => s.re.test(txt));
}
