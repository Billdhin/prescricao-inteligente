/**
 * A TINTA DO AVATAR QUADRADO, POR ALUNO.
 *
 * O protótipo pinta o avatar de iniciais com uma família de cor por aluno (fundo tint + texto
 * da família). A escolha é determinística pelo id: o mesmo aluno carrega a mesma tinta em
 * todas as listas, e a cor ajuda o olho a reencontrar a pessoa de uma tela para a outra.
 *
 * Duas paletas, e não uma, por causa do SEMÁFORO. Numa lista cujo assunto é verde, âmbar e
 * vermelho, um avatar âmbar ao lado de "Liberado" (ou um vermelho ao lado de "Sem semáforo
 * hoje") seria lido como estado, e o estado ali tem que vir só do texto e do ponto. Por isso a
 * paleta neutra troca as famílias semânticas por azul, turquesa e o navy do protótipo.
 */
const indice = (id: string, n: number) => [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % n;

/** Telas sem semáforo à vista (Avaliar e reavaliar). */
export const TINTAS_AVATAR = [
  "bg-primary-tint text-primary",
  "bg-analysis-tint text-analysis-text",
  "bg-warning-tint text-warning",
] as const;

/** Telas onde verde, âmbar e vermelho já querem dizer liberação (Semáforo do dia). */
export const TINTAS_AVATAR_NEUTRAS = [
  "bg-primary-tint text-primary",
  "bg-analysis-tint text-analysis-text",
  // O navy é fixo, fora do tema, como os cartões navy do produto: a tinta turquesa clara
  // só tem contraste sobre ele. O filete claro mantém o quadrado visível no tema escuro.
  "bg-[#0B1628] text-[#7FE3D8] ring-1 ring-inset ring-white/10",
] as const;

export function tintaDoAluno(id: string, paleta: readonly string[] = TINTAS_AVATAR): string {
  return paleta[indice(id, paleta.length)];
}
