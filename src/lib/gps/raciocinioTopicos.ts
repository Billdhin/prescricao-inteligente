/**
 * O RACIOCÍNIO LIDO COMO LISTA DE ASSUNTOS, e não como parágrafo único.
 *
 * O gerador (`periodizacao.ts`) monta o raciocínio como uma lista de partes independentes e
 * as junta com uma linha em branco. Cada parte já nasce anunciando o próprio assunto
 * ("Sobre o cardio:", "Sobre a duração:", "Modelo principal:"), então o título do tópico
 * não precisa ser inventado aqui: ele já está escrito no texto.
 *
 * Por que a leitura vive numa função e não em cada tela: o mesmo raciocínio é impresso na
 * aba "Na prática", no PDF do plano e no prontuário. Se cada superfície fatiasse do seu
 * jeito, a mesma frase apareceria com título numa e sem título noutra.
 *
 * E por que ler do TEXTO em vez de o gerador devolver a lista pronta: o raciocínio é
 * persistido como string (Supabase, exportações, guardrails que o varrem). Um plano salvo
 * antes desta mudança continua legível, só que como um tópico só, sem quebrar nada.
 */

export interface TopicoRaciocinio {
  /** o assunto, quando a parte o anuncia; ausente quando ela começa direto no conteúdo */
  titulo?: string;
  texto: string;
}

/**
 * O título só é reconhecido quando o texto de fato ABRE anunciando o assunto: dois pontos
 * cedo na frase e sem ponto final antes deles. O limite existe para não transformar dois
 * pontos que aparecem no meio de uma explicação longa em título de seção.
 */
const LIMITE_TITULO = 60;

export function topicosDoRaciocinio(raciocinio: string): TopicoRaciocinio[] {
  return raciocinio
    .split(/\n{2,}/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => {
      const i = parte.indexOf(": ");
      if (i < 0 || i > LIMITE_TITULO) return { texto: parte };
      const cabeca = parte.slice(0, i);
      if (/[.!?]/.test(cabeca)) return { texto: parte };
      const corpo = parte.slice(i + 2).trim();
      if (!corpo) return { texto: parte };
      // A primeira letra do corpo sobe: a parte foi escrita para ser lida em sequência com o
      // título, e sem isso o tópico começaria em minúscula debaixo do próprio assunto.
      return { titulo: cabeca, texto: corpo.charAt(0).toUpperCase() + corpo.slice(1) };
    });
}
