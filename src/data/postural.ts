/**
 * Avaliação postural: RASTREIO VISUAL assistido, não medição automática.
 *
 * Honestidade acima de tudo: o app NÃO mede ângulos por foto nem "diagnostica"
 * pela imagem. Ele guia a captura por vista, organiza as observações que o
 * PROFISSIONAL marca num roteiro padronizado e monta um rascunho de laudo em
 * linguagem prudente para ele revisar e assinar. Nenhum número é inventado; o
 * laudo só afirma o que o profissional observou. É um apoio ao olhar clínico,
 * dentro do escopo do CREF.
 */

export type VistaPostural = "anterior" | "lateral" | "posterior";

export const ROTULO_VISTA: Record<VistaPostural, string> = {
  anterior: "Vista anterior (de frente)",
  lateral: "Vista lateral (de lado)",
  posterior: "Vista posterior (de costas)",
};

export interface CheckpointPostural {
  id: string;
  vista: VistaPostural;
  regiao: string;
  /** a primeira opção é sempre o padrão de referência ("neutro") */
  opcoes: string[];
}

/**
 * Roteiro de rastreio. Cada ponto tem o padrão de referência como primeira
 * opção e os desvios mais comuns descritos em linguagem observacional
 * ("aparente"), nunca como diagnóstico fechado.
 */
export const CHECKPOINTS_POSTURAIS: CheckpointPostural[] = [
  // Anterior
  { id: "ant-cabeca", vista: "anterior", regiao: "Cabeça", opcoes: ["Alinhada", "Inclinada à direita", "Inclinada à esquerda", "Rodada"] },
  { id: "ant-ombros", vista: "anterior", regiao: "Ombros", opcoes: ["Nivelados", "Direito mais alto", "Esquerdo mais alto"] },
  { id: "ant-pelve", vista: "anterior", regiao: "Pelve (cristas ilíacas)", opcoes: ["Nivelada", "Elevada à direita", "Elevada à esquerda"] },
  { id: "ant-joelhos", vista: "anterior", regiao: "Joelhos", opcoes: ["Alinhados", "Valgo aparente (para dentro)", "Varo aparente (para fora)"] },
  { id: "ant-pes", vista: "anterior", regiao: "Pés", opcoes: ["Neutros", "Rotação externa", "Rotação interna", "Queda do arco aparente"] },
  // Lateral
  { id: "lat-cabeca", vista: "lateral", regiao: "Cabeça", opcoes: ["Alinhada", "Anteriorização aparente"] },
  { id: "lat-ombros", vista: "lateral", regiao: "Ombros", opcoes: ["Alinhados", "Protração aparente (à frente)"] },
  { id: "lat-toracica", vista: "lateral", regiao: "Coluna torácica", opcoes: ["Curva usual", "Cifose acentuada aparente", "Retificação aparente"] },
  { id: "lat-lombar", vista: "lateral", regiao: "Coluna lombar", opcoes: ["Curva usual", "Lordose acentuada aparente", "Retificação aparente"] },
  { id: "lat-pelve", vista: "lateral", regiao: "Pelve", opcoes: ["Neutra", "Báscula anterior aparente", "Báscula posterior aparente"] },
  { id: "lat-joelhos", vista: "lateral", regiao: "Joelhos", opcoes: ["Neutros", "Hiperextensão aparente (recurvatum)", "Flexão mantida aparente"] },
  // Posterior
  { id: "post-escapulas", vista: "posterior", regiao: "Escápulas", opcoes: ["Niveladas", "Direita mais elevada", "Esquerda mais elevada", "Alada aparente"] },
  { id: "post-coluna", vista: "posterior", regiao: "Coluna (alinhamento)", opcoes: ["Alinhada", "Desvio lateral aparente à direita", "Desvio lateral aparente à esquerda"] },
  { id: "post-pelve", vista: "posterior", regiao: "Pelve", opcoes: ["Nivelada", "Elevada à direita", "Elevada à esquerda"] },
  { id: "post-calcaneo", vista: "posterior", regiao: "Calcâneos", opcoes: ["Neutros", "Eversão aparente (para dentro)", "Inversão aparente (para fora)"] },
];

export interface ObservacaoPostural {
  checkpointId: string;
  /** a opção escolhida (uma das do checkpoint) */
  achado: string;
  nota?: string;
}

/** Um marco do corpo detectado (posição normalizada 0..1 + confiança). */
export interface MarcoSalvo {
  nome: string;
  x: number;
  y: number;
  score: number;
}

/** Uma medida geométrica calculada e salva (para reabrir e para o laudo). */
export interface MedidaSalva {
  checkpointId: string;
  rotulo: string;
  valor: string;
  classificacao: string | null;
  confianca: number;
}

/** Análise por visão computacional de uma vista: marcos ajustados + medidas. */
export interface AnalisePosturalVista {
  marcos: MarcoSalvo[];
  medidas: MedidaSalva[];
}

export interface AvaliacaoPostural {
  id: string;
  alunoId: string;
  data: number;
  /** fotos por vista, em data URL (opcional; ficam locais, não vão para a nuvem) */
  fotos?: Partial<Record<VistaPostural, string>>;
  observacoes: ObservacaoPostural[];
  /** análise automática (marcos + medidas) por vista, quando houve detecção */
  analises?: Partial<Record<VistaPostural, AnalisePosturalVista>>;
  /** laudo em texto: gerado a partir dos achados e editável pelo profissional */
  resumo?: string;
}

/** É um achado de referência (padrão), ou seja, a primeira opção do checkpoint? */
export function ehReferencia(cp: CheckpointPostural, achado: string): boolean {
  return cp.opcoes[0] === achado;
}

/**
 * Monta um rascunho de laudo a partir SÓ do que foi observado. Lista os achados
 * fora do padrão por vista; se nada foge do padrão, registra isso. Linguagem
 * prudente e não diagnóstica. O profissional revisa, ajusta e assina.
 */
export function montarLaudo(av: AvaliacaoPostural, nomeAluno: string): string {
  const porId = new Map(CHECKPOINTS_POSTURAIS.map((c) => [c.id, c]));
  const desvios = av.observacoes
    .map((o) => ({ cp: porId.get(o.checkpointId), o }))
    .filter((x): x is { cp: CheckpointPostural; o: ObservacaoPostural } => !!x.cp && !ehReferencia(x.cp, x.o.achado));

  const linhas: string[] = [];
  linhas.push(`Rastreio postural visual de ${nomeAluno}.`);

  if (desvios.length === 0) {
    linhas.push("Nas vistas observadas, os pontos avaliados ficaram dentro do padrão de referência. Sem achados a destacar neste rastreio.");
  } else {
    const vistas: VistaPostural[] = ["anterior", "lateral", "posterior"];
    for (const v of vistas) {
      const daVista = desvios.filter((d) => d.cp.vista === v);
      if (daVista.length === 0) continue;
      linhas.push("");
      linhas.push(`${ROTULO_VISTA[v]}:`);
      for (const d of daVista) {
        const nota = d.o.nota ? ` (${d.o.nota})` : "";
        linhas.push(`- ${d.cp.regiao}: ${d.o.achado}${nota}.`);
      }
    }
    linhas.push("");
    linhas.push(
      "Achados de rastreio visual, sem medição instrumental. Servem para orientar a observação e a conduta do profissional; não constituem diagnóstico.",
    );
  }

  // Medidas estimadas por visão computacional, quando houve análise.
  const vistasComAnalise = (["anterior", "lateral", "posterior"] as VistaPostural[]).filter(
    (v) => av.analises?.[v]?.medidas?.length,
  );
  if (vistasComAnalise.length) {
    linhas.push("");
    linhas.push("Medidas estimadas (visão computacional, 2D sem calibração):");
    for (const v of vistasComAnalise) {
      for (const med of av.analises![v]!.medidas) {
        const cls = med.classificacao ?? "inconclusivo, ajustar manualmente";
        linhas.push(`- ${med.rotulo}: ${med.valor} (${cls}).`);
      }
    }
    linhas.push("");
    linhas.push(
      "As medidas vêm de detecção automática de marcos numa foto única, sem calibração nem plano de referência. São estimativas de triagem, revisadas pelo profissional, e não medição clínica.",
    );
  }
  return linhas.join("\n");
}
