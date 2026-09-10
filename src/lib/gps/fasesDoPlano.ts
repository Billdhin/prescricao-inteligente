import { rotuloMeso, type Mesociclo } from "@/data/periodizacao";

/**
 * A FASE DE UM BLOCO, para quem precisa pintar ou agrupar o plano por fase: o gráfico e o
 * calendário da tela, e o gráfico do documento impresso.
 *
 * Vive aqui, e não num componente, porque o documento em PDF também precisa dela, e um
 * gerador de papel não deve importar um arquivo de tela. Uma regra só nos dois lugares é o
 * que impede o papel de pintar a Fase 4 de um jeito e a tela de outro.
 *
 * Bloco nascido de uma fase da jornada clínica (`faseJornada`) pertence a ela, e as
 * continuações dessa fase também. Bloco genérico, sem fase, é a própria fase dele.
 */
export function chaveDaFase(meso: Mesociclo): string {
  return meso.faseJornada ? `fase-${meso.faseJornada}` : meso.id;
}

/** O nome da fase, sem o "(continuação)": é assim que ela aparece em legenda e faixa. */
export function nomeDaFase(meso: Mesociclo): string {
  return rotuloMeso(meso).replace(/\s*\(continuação\)\s*$/i, "");
}

/** Índice de cor de cada fase, na ordem em que as fases aparecem no plano. */
export function indicesDeCorDasFases(mesos: Mesociclo[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const meso of mesos) {
    const k = chaveDaFase(meso);
    if (!m.has(k)) m.set(k, m.size);
  }
  return m;
}
